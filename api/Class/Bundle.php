<?php

namespace APP\plugins\generic\compilatio\api\Class;

use APP\plugins\generic\compilatio\api\DTO\CompilatioManagedBundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioDetection;
use APP\plugins\generic\compilatio\api\DTO\CompilatioUser;

class Bundle
{
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

    public CompilatioManagedBundle $managedBundle;

    /**
     * Class constructor
     *
     * @param CompilatioUser $compilatioUser User from Compilatio.
     */
    public function __construct(CompilatioUser $compilatioUser)
    {
        $this->managedBundle = $compilatioUser->managedBundle;
    }

    /**
     * Retrieve bundle detections.
     *
     * @return list<CompilatioDetection> Return allowed detections for the bundle.
     */
    public function getBundleDetections(object $reviewSettings): array
    {
        $detections = $this->getDetections();

        $savedDetections = [];
        if (isset($reviewSettings->bundleDetections) && (is_array($reviewSettings->bundleDetections) || is_object($reviewSettings->bundleDetections))) {
            foreach ((array) $reviewSettings->bundleDetections as $process => $value) {
                if (!is_array($value) && !is_object($value)) {
                    continue;
                }

                $savedValue = (array) $value;
                $savedDetections[(string) $process] = [
                    'enabled' => filter_var($savedValue['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ];
            }
        }

        foreach ($detections as $key => $detection) {
            if (!in_array($detection->process, self::DETECTIONSTYPE, true)) {
                unset($detections[$key]);
                continue;
            }

            // If API says this detection is not enabled and not configurable, force disabled.
            if (!$detection->enabled && !$detection->configurable) {
                $detection->enabled = false;
                continue;
            }

            // Re-apply saved value only for configurable detections.
            if (
                isset($savedDetections[$detection->process])
                && $detection->configurable
            ) {
                $detection->enabled = $savedDetections[$detection->process]['enabled'];
            }
        }

        return array_values($detections);
    }

    /**
     * Build detections payloads for local storage and folder API updates.
     *
     * @return array{
     *     api: list<array{process: string, enabled: bool, configurable: bool}>,
     *     stored: array<string, array{enabled: bool, configurable: bool}>
     * } Return detections for Compilatio API and normalized storage.
     */
    public function getFolderDetectionsPayload(object $reviewSettings): array
    {
        $normalizedDetections = [];
        $recipeDetections = [];

        foreach ($this->getBundleDetections($reviewSettings) as $detection) {
            if (!in_array($detection->process, self::DETECTIONSTYPE, true)) {
                continue;
            }

            $enabled = $detection->enabled;
            $configurable = $detection->configurable;

            $normalizedDetections[$detection->process] = [
                'enabled' => $enabled,
                'configurable' => $configurable,
            ];

            if ('similarity' === $detection->process || (!$enabled && !$configurable)) {
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
    public function isBundleAuthorizedTo(string $feature): bool
    {
        return in_array($feature, $this->getAuthorizedFeatures(), true);
    }

    /**
     * @return list<CompilatioDetection>
     */
    private function getDetections(): array
    {
        foreach ($this->managedBundle->accesses as $access) {
            if (null !== $access->detections) {
                return $access->detections;
            }
        }

        return [];
    }

    /**
     * Retrieve bundle authorized features.
     *
     * @return list<string> Return authorized features for the bundle.
     */
    private function getAuthorizedFeatures(): array
    {
        foreach ($this->managedBundle->accesses as $access) {
            if (null !== $access->authorizedFeatures) {
                return $access->authorizedFeatures;
            }
        }

        return [];
    }
}
