<?php

namespace APP\plugins\generic\compilatio\api;

use APP\plugins\generic\compilatio\api\CompilatioSettingsRequest;
use APP\plugins\generic\compilatio\api\DTO\CompilatioFolderConfiguration;
use APP\plugins\generic\compilatio\api\Factory\CompilatioFolderRepositoryFactory;
use APP\plugins\generic\compilatio\api\Repository\CompilatioConfigRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioUserRepository;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioBundleSettingsResolver;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioLocaleResolver;
use APP\plugins\generic\compilatio\api\Services\Initializer\CompilatioPrimaryUserInitializer;
use APP\plugins\generic\compilatio\api\Services\Synchronizer\CompilatioFolderSynchronizer;
use APP\plugins\generic\compilatio\api\Services\Synchronizer\CompilatioUserSynchronizer;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioThresholdsResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PKP\plugins\PluginSettingsController;

class CompilatioSettingsController extends PluginSettingsController
{
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
        $apiKey = $this->plugin->getSetting($contextId, 'apiKey');

        if (!is_string($apiKey) || '' === $apiKey) {
            return response()->json([]);
        }

        $response = [
            'apiKey' => $apiKey,
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

        $compilatioUserRepository = new CompilatioUserRepository($apiKey);

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

        if (!is_array($settingsFromForm)) {
            throw new \RuntimeException('The validated settings are invalid.');
        }

        $settings = [];
        $thresholdsFromForm = $settingsFromForm['thresholds'] ?? null;

        if (!is_array($thresholdsFromForm)) {
            throw new \RuntimeException('The thresholds settings are invalid.');
        }

        $thresholds = [
            'warning' => $this->normalizeThreshold(
                $thresholdsFromForm['warning'] ?? null,
                'warning'
            ),
            'critical' => $this->normalizeThreshold(
                $thresholdsFromForm['critical'] ?? null,
                'critical'
            ),
        ];

        $apiKey = $settingsFromForm['apiKey'] ?? null;

        if (null !== $apiKey && !is_string($apiKey)) {
            throw new \RuntimeException('The API key setting is invalid.');
        }

        if (null !== $apiKey && '' !== $apiKey) {
            $compilatioUserRepository = new CompilatioUserRepository($apiKey);

            try {
                $apiKeyOwnerUser = $compilatioUserRepository
                    ->getApiKeyOwnerUser();
                $settings[] = ['name' => 'apiKey', 'value' => $apiKey, 'type' => 'string'];
            } catch (\RuntimeException $exception) {
                if (401 === $exception->getCode()) {
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

            $requestedDetections = $this->normalizeRequestedDetections(
                $settingsFromForm['bundleDetections'] ?? null
            );

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

            if (null === $actualCompilatioUserId || '' === $actualCompilatioUserId) {
                $currentUser = $this->getRequest()->getUser();

                if (null === $currentUser) {
                    return response()->json([
                        'error' => 'unauthenticated',
                        'errorMessage' => 'The OJS user is not authenticated.',
                    ], 401);
                }

                $primaryUserInitializer = new CompilatioPrimaryUserInitializer(
                    $this->plugin,
                    new CompilatioUserSynchronizer(
                        new CompilatioLocaleResolver(
                            new CompilatioConfigRepository(
                                $apiKey
                            )
                        ),
                        $compilatioUserRepository,
                    )
                );

                $primaryUserInitializer->initializeIfMissing(
                    $contextId,
                    $currentUser,
                );
            }

            $folderConfiguration = new CompilatioFolderConfiguration(
                warningThreshold: $thresholds['warning'],
                criticalThreshold: $thresholds['critical'],
                defaultIndexing: (bool) $settingsFromForm['automaticIndexingEnabled'],
                autoAnalysis: 'automatic' === $settingsFromForm['analysisLaunchMode'],
                scheduledAnalysisEnabled: 'scheduled' === $settingsFromForm['analysisLaunchMode'],
            );

            $compilatioUserId = $this->plugin->getSetting(
                $contextId,
                'compilatioUserId'
            );

            if (!is_string($compilatioUserId) || '' === $compilatioUserId) {
                throw new \RuntimeException(
                    'Unable to retrieve the Compilatio user ID.'
                );
            }

            $folderRepository = (new CompilatioFolderRepositoryFactory())->create(
                $apiKey,
                $compilatioUserId,
            );

            $folderSynchronizer = new CompilatioFolderSynchronizer(
                $folderRepository
            );

            $context = $this->getRequest()->getContext();

            if (null === $context) {
                throw new \RuntimeException('The OJS context is unavailable.');
            }

            $folderId = $folderSynchronizer->synchronize(
                $context->getLocalizedName(),
                $folderConfiguration,
            );

            $this->plugin->updateSetting(
                $contextId,
                'compilatioFolderId',
                $folderId,
                'string'
            );
        }

        $settings[] = ['name' => 'automaticIndexingEnabled', 'value' => $settingsFromForm['automaticIndexingEnabled'], 'type' => 'bool'];
        $settings[] = ['name' => 'analysisLaunchMode', 'value' => $settingsFromForm['analysisLaunchMode'], 'type' => 'string'];
        $settings[] = ['name' => 'scheduledAnalysisAt', 'value' => 'scheduled' ===  $settingsFromForm['analysisLaunchMode'] ? $settingsFromForm['scheduledAnalysisAt'] : '', 'type' => 'string'];
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
        $context = $this->getRequest()->getContext();

        if (null === $context) {
            throw new \RuntimeException('The OJS context is unavailable.');
        }

        $contextId = $context->getId();

        if (null === $contextId) {
            throw new \RuntimeException('Unable to retrieve the OJS context ID.');
        }

        return $contextId;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function normalizeRequestedDetections(mixed $value): ?array
    {
        if (!is_array($value)) {
            return null;
        }

        $detections = [];

        foreach ($value as $process => $configuration) {
            if (!is_string($process)) {
                continue;
            }

            $detections[$process] = $configuration;
        }

        return $detections;
    }

    private function normalizeThreshold(mixed $value, string $name): int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        throw new \RuntimeException(sprintf(
            'The %s threshold setting is invalid.',
            $name
        ));
    }

    private function getReviewSettings(): object
    {
        $settings = [];

        foreach (self::SETTINGS as $settingName => $settingType) {
            $value = $this->plugin->getSetting($this->getContextId(), $settingName);
            if (null !== $value) {
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
        return (new CompilatioThresholdsResolver())->resolve(
            $this->plugin->getSetting($contextId, 'thresholds'),
        );
    }
}
