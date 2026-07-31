<?php

namespace APP\plugins\generic\compilatio\api\Services\Resolver;

use APP\plugins\generic\compilatio\api\Class\Bundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioBundleSettings;
use RuntimeException;

final class CompilatioBundleSettingsResolver
{
    /**
     * @param array<string, mixed>|null $requestedDetections
     */
    public function resolve(
        object $compilatioUser,
        object $reviewSettings,
        ?array $requestedDetections = null,
    ): CompilatioBundleSettings {
        $bundle = new Bundle($compilatioUser);
        $hasFolderRecipeParameters = $bundle->isBundleAuthorizedTo(
            'folder-recipe-parameters'
        );

        if (!$hasFolderRecipeParameters) {
            return new CompilatioBundleSettings(false, null);
        }

        $effectiveSettings = get_object_vars($reviewSettings);

        if ($requestedDetections !== null) {
            $effectiveSettings['bundleDetections'] = $requestedDetections;
        }

        $effectiveReviewSettings = (object) $effectiveSettings;

        $payload = $bundle->getFolderDetectionsPayload($effectiveReviewSettings);
        $storedDetections = $payload['stored'] ?? null;

        if (!is_array($storedDetections)) {
            throw new RuntimeException(
                'Unable to resolve Compilatio bundle detections.'
            );
        }

        return new CompilatioBundleSettings(true, $storedDetections);
    }
}
