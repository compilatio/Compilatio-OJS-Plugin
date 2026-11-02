<?php

/**
 * @file plugins/generic/compilatio/api/DTO/CompilatioResponse.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioResponse
 * @brief Represents a Compilatio API response.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class CompilatioResponse
{
    public function __construct(
        public int $statusCode,
        public object $body,
    ) {}
}
