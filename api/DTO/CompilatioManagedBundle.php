<?php

/**
 * @file plugins/generic/compilatio/api/DTO/CompilatioManagedBundle.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioManagedBundle
 * @brief Represents a managed Compilatio subscription bundle.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioManagedBundle
{
    /**
     * @param list<CompilatioBundleAccess> $accesses
     */
    public function __construct(
        public readonly string $name,
        public readonly array $accesses,
    ) {
    }
}
