<?php

namespace APP\plugins\generic\compilatio\api\Services\Resolver;

use APP\plugins\generic\compilatio\api\Class\Bundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioBundleSettings;
use APP\plugins\generic\compilatio\api\DTO\CompilatioUser;

final class CompilatioBundleSettingsResolver
{
    /**
     * @param array<string, mixed>|null $requestedDetections
     */
    public function resolve(
        CompilatioUser $compilatioUser,
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

        if (null !== $requestedDetections) {
            $effectiveSettings['bundleDetections'] = $requestedDetections;
        }

        $effectiveReviewSettings = (object) $effectiveSettings;

        $payload = $bundle->getFolderDetectionsPayload($effectiveReviewSettings);

        return new CompilatioBundleSettings(true, $payload['stored']);
    }
}
