<?php

/**
 * @file plugins/generic/compilatio/api/DTO/CompilatioBundleAccess.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioBundleAccess
 * @brief Represents access to a Compilatio subscription bundle.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioBundleAccess
{
    /**
     * @param list<string>|null $authorizedFeatures
     * @param list<CompilatioDetection>|null $detections
     */
    public function __construct(
        public readonly ?array $authorizedFeatures,
        public readonly ?array $detections,
    ) {
    }
}
