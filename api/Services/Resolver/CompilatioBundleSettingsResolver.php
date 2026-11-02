<?php

/**
 * @file plugins/generic/compilatio/api/Services/Resolver/CompilatioBundleSettingsResolver.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioBundleSettingsResolver
 * @brief Resolves available subscription detection settings.
 */

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

        return new CompilatioBundleSettings(true, $payload['stored'], $payload['api']);
    }
}
