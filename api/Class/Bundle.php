<?php
namespace APP\plugins\generic\compilatio\api\Class;

class Bundle {
    /**
     * Contain differents detections types.
     */
    public const DETECTIONSTYPE = [
        "similarity",
        "unrecognized_text_language",
        "ai_detection",
        "spellchecker",
        "rewording",
    ];

    /**
     * @var object $currentBundle User managed bundle.
     */
    public object $currentBundle;

    /**
     * Class constructor
     *
     * @param object $compilatioUser User from compilatio to retrieve managed bundle information.
     */
    public function __construct(object $compilatioUser) {
        if (!isset($compilatioUser)) {
            throw new \Exception('No user.');
        }
        $this->currentBundle = $compilatioUser->current_bundle;
    }

    /**
     * Retrieve bundle detections.
     *
     * @return array Return allowed detections for the bundle.
     */
    public function getBundleDetections(object $reviewSettings): array {
        $detectionsAccess = $this->getAccess('detections');

        if (!$detectionsAccess || !isset($detectionsAccess->detections) || !is_array($detectionsAccess->detections)) {
            return [];
        }

        $savedDetections = [];
        if (isset($reviewSettings->bundleDetections) && (is_array($reviewSettings->bundleDetections) || is_object($reviewSettings->bundleDetections))) {
            foreach ((array) $reviewSettings->bundleDetections as $process => $value) {
                if (!is_array($value) && !is_object($value)) {
                    continue;
                }

                $savedDetections[(string) $process] = [
                    'enabled' => filter_var($value['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ];
            }
        }

        foreach ($detectionsAccess->detections as $key => $detection) {
            if (!is_object($detection) || !isset($detection->process) || !isset($detection->enabled)) {
                continue;
            }

            if (!in_array($detection->process, self::DETECTIONSTYPE)) {
                unset($detectionsAccess->detections[$key]);
                continue;
            }

            $enabled = filter_var($detection->enabled, FILTER_VALIDATE_BOOLEAN);
            $configurable = filter_var($detection->configurable ?? false, FILTER_VALIDATE_BOOLEAN);

            // If API says this detection is not enabled and not configurable, force disabled.
            if (!$enabled && !$configurable) {
                $detection->enabled = false;
                $detectionsAccess->detections[$key] = $detection;
                continue;
            }

            // Re-apply saved value only for configurable detections.
            if (
                isset($savedDetections[$detection->process])
                && $configurable
            ) {
                $detection->enabled = $savedDetections[$detection->process]['enabled'];
            }

            $detectionsAccess->detections[$key] = $detection;
        }

        return $detectionsAccess->detections;
    }

    /**
     * Build detections payloads for local storage and folder API updates.
     *
     * @return array Return detections for Compilatio API and normalized storage.
     */
    public function getFolderDetectionsPayload(object $reviewSettings): array {
        $normalizedDetections = [];
        $recipeDetections = [];

        foreach ($this->getBundleDetections($reviewSettings) as $detection) {
            if (!is_object($detection) ||
                !isset($detection->process) ||
                !in_array($detection->process, self::DETECTIONSTYPE)
            ) {
                continue;
            }

            $enabled = filter_var($detection->enabled ?? false, FILTER_VALIDATE_BOOLEAN);
            $configurable = filter_var($detection->configurable ?? true, FILTER_VALIDATE_BOOLEAN);

            $normalizedDetections[$detection->process] = [
                'enabled' => $enabled,
                'configurable' => $configurable,
            ];

            if ($detection->process === 'similarity' || (!$enabled && !$configurable)) {
                continue;
            }

            $recipeDetections[] = [
                'process' => $detection->process,
                'enabled' => $enabled,
                'configurable' => $configurable,
            ];
        }

        return ['api' => $recipeDetections, 'stored' => $normalizedDetections];
    }

    /**
     * Check if the bundle has the specified feature.
     *
     * @param string $feature Name of the feature to check.
     * @return bool Return true if the bundle has this feature, false otherwise.
     */
    public function isBundleAuthorizedTo(string $feature): bool {
        return in_array($feature, $this->getAuthorizedFeatures());
    }

    /**
     * Check if the current recipe is an Anasim recipe.
     *
     * @return bool True if recipe is an Anasim recipe, false otherwise.
     */
    public function isAnasimRecipe(): bool {
        return $this->currentBundle->name === 'magister-premium' ? true : false;
    }

    /**
     * Retrieve the searched access in the managed bundle.
     *
     * @param string $searchedAccess Searched access
     * @return object|false Return the access if exist, false otherwise.
     */
    private function getAccess(string $searchedAccess) {

        foreach ($this->currentBundle->accesses as $access) {
            if (isset($access->{$searchedAccess})) {
                return $access;
            }
        }
        return false;
    }

    /**
     * Retrieve bundle authorized features.
     *
     * @return array Return authorized features for the bundle.
     */
    private function getAuthorizedFeatures(): array {
        $authorizedFeaturesAccess = $this->getAccess('authorized_features');

        if (!$authorizedFeaturesAccess) {
            return [];
        }

        return $authorizedFeaturesAccess->authorized_features;
    }
}
