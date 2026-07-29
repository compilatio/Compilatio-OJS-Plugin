<?php

namespace APP\plugins\generic\compilatio\api;

use APP\plugins\generic\compilatio\api\CompilatioSettingsRequest;
use APP\plugins\generic\compilatio\api\Manager\CompilatioApiKeyManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PKP\plugins\PluginSettingsController;

class CompilatioSettingsController extends PluginSettingsController
{
    public function getHandlerPath(): string
    {
        return 'plugins/compilatio/settings';
    }

    public function get(Request $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();

        return response()->json([
            'apiKey' => $this->plugin->getSetting($contextId, 'apiKey'),
            'automaticIndexingEnabled' => (bool) $this->plugin->getSetting(
                $contextId,
                'automaticIndexingEnabled'
            ),
            'analysisLaunchMode' => $this->plugin->getSetting($contextId, 'analysisLaunchMode')
                ?: 'manual',
            'scheduledAnalysisAt' => $this->plugin->getSetting($contextId, 'scheduledAnalysisAt')
                ?: null,
        ]);
    }

    public function edit(CompilatioSettingsRequest $illuminateRequest): JsonResponse
    {
        $contextId = $this->getContextId();
        $settings = $illuminateRequest->validated();

        if (!empty($settings['apiKey'])) {
            $compilatioApiKeyManager = new CompilatioApiKeyManager();

            try {
                $currentUser = $compilatioApiKeyManager
                    ->validateApiKey($settings['apiKey']);
            } catch (\RuntimeException $exception) {
                return response()->json([
                    'error' => 'compilatioUnavailable',
                    'errorMessage' =>
                        'Impossible de contacter Compilatio.',
                ], 503);
            }
            if (!$currentUser) {
                return response()->json([
                    'errors' => [
                        'apiKey' => [
                            'La clé API Compilatio est invalide.',
                        ],
                    ],
                ], 422);
            }

            $recipe = $currentUser['data']['user']['managed_bundle']['name'];

            $this->plugin->updateSetting(
                $contextId,
                'apiKey',
                $settings['apiKey'],
                'string'
            );

            $this->plugin->updateSetting(
                $contextId,
                'recipe',
                $recipe,
                'string'
            );
        }

        $this->plugin->updateSetting(
            $contextId,
            'automaticIndexingEnabled',
            $settings['automaticIndexingEnabled'],
            'bool'
        );
        $this->plugin->updateSetting(
            $contextId,
            'analysisLaunchMode',
            $settings['analysisLaunchMode'],
            'string'
        );
        $this->plugin->updateSetting(
            $contextId,
            'scheduledAnalysisAt',
            $settings['analysisLaunchMode'] === 'scheduled'
                ? $settings['scheduledAnalysisAt']
                : '',
            'string'
        );

        return response()->json([
            'apiKey' => $this->plugin->getSetting($contextId, 'apiKey'),
            'recipe' => $this->plugin->getSetting($contextId, 'recipe'),
            'automaticIndexingEnabled' => $this->plugin->getSetting($contextId, 'automaticIndexingEnabled'),
            'analysisLaunchMode' => $this->plugin->getSetting($contextId, 'analysisLaunchMode'),
            'scheduledAnalysisAt' => 'scheduled' === $this->plugin->getSetting($contextId, 'analysisLaunchMode')
                ? $this->plugin->getSetting($contextId, 'scheduledAnalysisAt')
                : null,
        ]);
    }

    private function getContextId(): int
    {
        return $this->getRequest()->getContext()->getId();
    }
}
