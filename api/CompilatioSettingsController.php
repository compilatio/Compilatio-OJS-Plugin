<?php

namespace APP\plugins\generic\compilatio\api;

use APP\plugins\generic\compilatio\api\CompilatioSettingsRequest;
use APP\plugins\generic\compilatio\api\Repository\CompilatioConfigRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioFolderRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioUserRepository;
use APP\plugins\generic\compilatio\api\Services\CompilatioBundleSettingsResolver;
use APP\plugins\generic\compilatio\api\Services\CompilatioLocaleResolver;
use APP\plugins\generic\compilatio\api\Services\CompilatioUserSynchronizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PKP\plugins\PluginSettingsController;

class CompilatioSettingsController extends PluginSettingsController
{
    private const DEFAULT_WARNING_THRESHOLD = 10;
    private const DEFAULT_CRITICAL_THRESHOLD = 20;

    private const SETTINGS = [
        'apiKey' => 'string',
        'automaticIndexingEnabled' => 'bool',
        'analysisLaunchMode' => 'string',
        'scheduledAnalysisAt' => 'string',
        'hasFolderRecipeParameters' => 'bool',
        'bundleDetections' => 'array',
        'thresholds' => 'array',
    ];

    public function getHandlerPath(): string
    {
        return 'plugins/compilatio/settings';
    }

    public function get(Request $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();
        if (!($this->plugin->getSetting($contextId, 'apiKey'))) {
            return response()->json([]);
        }

        $response = [
            'apiKey' => $this->plugin->getSetting($contextId, 'apiKey'),
            'automaticIndexingEnabled' => (bool) $this->plugin->getSetting(
                $contextId,
                'automaticIndexingEnabled'
            ),
            'analysisLaunchMode' => $this->plugin->getSetting($contextId, 'analysisLaunchMode')
                ?: 'manual',
            'scheduledAnalysisAt' => $this->plugin->getSetting($contextId, 'scheduledAnalysisAt')
                ?: null,
            'compilatioUserId' => $this->plugin->getSetting($contextId, 'compilatioUserId') ?: null,
            'primaryOjsUserId' => $this->plugin->getSetting($contextId, 'primaryOjsUserId') ?: null,
            'thresholds' => $this->getThresholds($contextId),
        ];

        $compilatioUserRepository = new CompilatioUserRepository($this->plugin->getSetting($contextId, 'apiKey'));

        $apiKeyOwnerUser = $compilatioUserRepository->getApiKeyOwnerUser();

        $bundleSettings = (new CompilatioBundleSettingsResolver())->resolve(
            $apiKeyOwnerUser,
            $this->getReviewSettings()
        );

        $response['hasFolderRecipeParameters'] = $bundleSettings->hasFolderRecipeParameters;
        
        if ($bundleSettings->hasFolderRecipeParameters) {
            $response['bundleDetections'] = $bundleSettings->detections ?? null;
            $this->plugin->updateSetting($contextId, 'bundleDetections', $bundleSettings->detections ?? null, 'array');
        }

        return response()->json($response);
    }

    public function edit(CompilatioSettingsRequest $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();
        $settingsFromForm = $illuminateRequest->validated();
        $settings = [];
        $thresholdsFromForm = $settingsFromForm['thresholds'] ?? null;

        if (!is_array($thresholdsFromForm)) {
            throw new \RuntimeException('The thresholds settings are invalid.');
        }

        $thresholds = [
            'warning' => (int) ($thresholdsFromForm['warning'] ?? 0),
            'critical' => (int) ($thresholdsFromForm['critical'] ?? 0),
        ];

        if (!empty($settingsFromForm['apiKey'])) {
            $compilatioUserRepository = new CompilatioUserRepository($settingsFromForm['apiKey']);

            try {
                $apiKeyOwnerUser = $compilatioUserRepository
                    ->getApiKeyOwnerUser();
                $settings[] = ['name' => 'apiKey', 'value' => $settingsFromForm['apiKey'], 'type' => 'string'];
                
            } catch (\RuntimeException $exception) {
                if ($exception->getCode() === 401) {
                    return response()->json([
                        'error' => 'invalidApiKey',
                        'errorMessage' =>
                            'The provided API key is invalid.',
                    ], 400);
                }
                return response()->json([
                    'error' => 'compilatioUnavailable',
                    'errorMessage' =>
                        'Unable to contact Compilatio.',
                ], 503);
            }

            $requestedDetections = $settingsFromForm['bundleDetections'] ?? null;

            if (!is_array($requestedDetections)) {
                $requestedDetections = null;
            }

            $bundleSettings = (new CompilatioBundleSettingsResolver())->resolve(
                $apiKeyOwnerUser,
                $this->getReviewSettings(),
                $requestedDetections,
            );

            $settings[] = [
                'name' => 'hasFolderRecipeParameters',
                'value' => $bundleSettings->hasFolderRecipeParameters,
                'type' => 'bool',
            ];

            $settings[] = [
                'name' => 'bundleDetections',
                'value' => $bundleSettings->detections ?? null,
                'type' => 'array',
            ];

            $actualCompilatioUserId = $this->plugin->getSetting(
                $contextId,
                'compilatioUserId'
            );

            if ($actualCompilatioUserId === null || $actualCompilatioUserId === '') {
                $currentUser = $this->getRequest()->getUser();

                if ($currentUser === null) {
                    return response()->json([
                        'error' => 'unauthenticated',
                        'errorMessage' => 'The OJS user is not authenticated.',
                    ], 401);
                }

                $currentUserId = $currentUser->getId();

                if ($currentUserId === null) {
                    return response()->json([
                        'error' => 'invalidOjsUser',
                        'errorMessage' => 'Unable to retrieve the OJS user ID.',
                    ], 500);
                }

                $compilatioUserSynchronizer = new CompilatioUserSynchronizer(
                    new CompilatioLocaleResolver(
                        new CompilatioConfigRepository($settingsFromForm['apiKey'])
                    ),
                    $compilatioUserRepository,
                );

                $compilatioUserId = $compilatioUserSynchronizer->syncUser(
                    $currentUser
                );

                $this->plugin->updateSetting($contextId, 'compilatioUserId', $compilatioUserId, 'string');
                $this->plugin->updateSetting($contextId, 'primaryOjsUserId', $currentUserId, 'int');
            }

            $compilatioFolderRepository = new CompilatioFolderRepository($settingsFromForm['apiKey'], $this->plugin->getSetting($contextId, 'compilatioUserId'));
            $compilatioFolder = $compilatioFolderRepository->get();
            $reviewName = $this->getRequest()->getContext()->getLocalizedName();
            $hasOJSFolder = false;
            foreach ($compilatioFolder as $folder) {

                if ($folder->origin !== 'OJS' || $folder->name !== $reviewName) {
                    continue;
                }

                $hasOJSFolder = true;
                $this->plugin->updateSetting($contextId, 'compilatioFolderId', $folder->id, 'string');
                $compilatioFolderRepository->update(
                    (string) $folder->id,
                    $reviewName,
                    $thresholds['warning'],
                    $thresholds['critical'],
                    $settingsFromForm['defaultIndexing'] ?? false,
                    $settingsFromForm['autoAnalysis'] ?? false,
                    $settingsFromForm['scheduledAnalysisEnabled'] ?? false
                );
            }

            if (!$hasOJSFolder) {
                $folder = $compilatioFolderRepository->create($reviewName,
                    $thresholds['warning'],
                    $thresholds['critical'],
                    $settingsFromForm['defaultIndexing'] ?? false,
                    $settingsFromForm['autoAnalysis'] ?? false,
                    $settingsFromForm['scheduledAnalysisEnabled'] ?? false
                );
                $this->plugin->updateSetting($contextId, 'compilatioFolderId', $folder->id, 'string');
            }
        }

        $settings[] = ['name' => 'automaticIndexingEnabled', 'value' => $settingsFromForm['automaticIndexingEnabled'], 'type' => 'bool'];
        $settings[] = ['name' => 'analysisLaunchMode', 'value' => $settingsFromForm['analysisLaunchMode'], 'type' => 'string'];
        $settings[] = ['name' => 'scheduledAnalysisAt', 'value' => $settingsFromForm['analysisLaunchMode'] === 'scheduled' ? $settingsFromForm['scheduledAnalysisAt'] : '', 'type' => 'string'];
        $settings[] = ['name' => 'thresholds', 'value' => $thresholds, 'type' => 'array'];

        foreach ($settings as $setting) {
            $this->plugin->updateSetting(
                $contextId,
                $setting['name'],
                $setting['value'],
                $setting['type']
            );
        }

        $return = [];
        foreach ($settings as $setting) {
            $return[$setting['name']] = $setting['value'];
        }

        $return['compilatioUserId'] = $this->plugin->getSetting($contextId, 'compilatioUserId') ?: null;
        $return['primaryOjsUserId'] = $this->plugin->getSetting($contextId, 'primaryOjsUserId') ?: null;
        return response()->json($return);
    }

    private function getContextId(): int
    {
        return $this->getRequest()->getContext()->getId();
    }

    private function getReviewSettings(): object
    {
        $settings = [];

        foreach (self::SETTINGS as $settingName => $settingType) {
            $value = $this->plugin->getSetting($this->getContextId(), $settingName);
            if ($value !== null) {
                settype($value, $settingType);
                $settings[$settingName] = $value;
            }
        }

        return (object) $settings;
    }

    /**
     * @return array{warning: int, critical: int}
     */
    private function getThresholds(int $contextId): array
    {
        $thresholds = $this->plugin->getSetting($contextId, 'thresholds');
        $thresholds = is_array($thresholds) ? $thresholds : (array) $thresholds;

        return [
                'warning' => isset($thresholds['warning'])
                ? (int) $thresholds['warning']
                : self::DEFAULT_WARNING_THRESHOLD,
            'critical' => isset($thresholds['critical'])
                ? (int) $thresholds['critical']
                : self::DEFAULT_CRITICAL_THRESHOLD,
        ];
    }
}
