<?php

/**
 * @file plugins/generic/compilatio/api/DTO/CompilatioBundleSettings.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioBundleSettings
 * @brief Represents subscription bundle settings.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioBundleSettings
{
    /**
     * @param array<string, mixed>|null $detections
     * @param list<array{process: string, enabled: bool, configurable: bool}>|null $recipeDetections
     */
    public function __construct(
        public bool $hasFolderRecipeParameters,
        public ?array $detections,
        public ?array $recipeDetections = null,
    ) {
    }
}
