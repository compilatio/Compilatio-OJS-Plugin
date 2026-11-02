<?php

/**
 * @file plugins/generic/compilatio/api/DTO/CompilatioFolderConfiguration.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioFolderConfiguration
 * @brief Represents the configuration of a Compilatio folder.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioFolderConfiguration
{
    /** @param list<array{process: string, enabled: bool, configurable: bool}>|null $recipeDetections */
    public function __construct(
        public int $warningThreshold,
        public int $criticalThreshold,
        public bool $defaultIndexing,
        public bool $autoAnalysis,
        public bool $scheduledAnalysisEnabled,
        public ?string $scheduledAnalysisAt = null,
        public ?array $recipeDetections = null,
    ) {
    }
}
