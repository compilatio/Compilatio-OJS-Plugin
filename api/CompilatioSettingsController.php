<?php

namespace APP\plugins\generic\compilatio\api;

use APP\plugins\generic\compilatio\api\CompilatioSettingsRequest;
use APP\plugins\generic\compilatio\api\Manager\CompilatioUserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PKP\plugins\PluginSettingsController;
use APP\plugins\generic\compilatio\api\Class\Bundle;

class CompilatioSettingsController extends PluginSettingsController
{
    private const SETTINGS = [
        'apiKey' => 'string',
        'automaticIndexingEnabled' => 'bool',
        'analysisLaunchMode' => 'string',
        'scheduledAnalysisAt' => 'string',
        'hasFolderRecipeParameters' => 'bool',
        'bundleDetections' => 'array',
    ];

    public function getHandlerPath(): string
    {
        return 'plugins/compilatio/settings';
    }

    public function get(Request $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();
        $hasFolderRecipeParameters = $this->plugin->getSetting($contextId, 'hasFolderRecipeParameters') ?: null;
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
            'hasFolderRecipeParameters' => $hasFolderRecipeParameters,
        ];

        if ($hasFolderRecipeParameters) {
            $response['bundleDetections'] = $this->plugin->getSetting($contextId, 'bundleDetections') ?: null;
        }
        return response()->json($response);
    }

    public function edit(CompilatioSettingsRequest $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();
        $settingsFromForm = $illuminateRequest->validated();
        $settings = [];

        if (!empty($settingsFromForm['apiKey'])) {
            $compilatioUserRepository = new CompilatioUserRepository();

            try {
                $currentUser = $compilatioUserRepository
                    ->getCurrentUser($settingsFromForm['apiKey']);
                $settings[] = ['name' => 'apiKey', 'value' => $settingsFromForm['apiKey'], 'type' => 'string'];
                
            } catch (\RuntimeException $exception) {
                if ($exception->getCode() === 401) {
                    return response()->json([
                        'error' => 'invalidApiKey',
                        'errorMessage' =>
                            'La clé API fournie est invalide.',
                    ], 400);
                }
                return response()->json([
                    'error' => 'compilatioUnavailable',
                    'errorMessage' =>
                        'Impossible de contacter Compilatio.',
                ], 503);
            }

            $bundle = new Bundle($currentUser);
            $hasFolderRecipeParameters = $bundle->isBundleAuthorizedTo('folder-recipe-parameters');
            $settings[] = ['name' => 'hasFolderRecipeParameters', 'value' => $hasFolderRecipeParameters, 'type' => 'bool'];

            if ($hasFolderRecipeParameters) {
                $bundleDetections = $bundle->getFolderDetectionsPayload($this->getReviewSettings());
                $settings[] = ['name' => 'bundleDetections', 'value' => $bundleDetections['stored'], 'type' => 'array'];
            }
        }

        $settings[] = ['name' => 'automaticIndexingEnabled', 'value' => $settingsFromForm['automaticIndexingEnabled'], 'type' => 'bool'];
        $settings[] = ['name' => 'analysisLaunchMode', 'value' => $settingsFromForm['analysisLaunchMode'], 'type' => 'string'];
        $settings[] = ['name' => 'scheduledAnalysisAt', 'value' => $settingsFromForm['analysisLaunchMode'] === 'scheduled' ? $settingsFromForm['scheduledAnalysisAt'] : '', 'type' => 'string'];

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
}
