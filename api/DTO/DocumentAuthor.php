<?php

/**
 * @file plugins/generic/compilatio/api/DTO/DocumentAuthor.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class DocumentAuthor
 * @brief Represents a document author.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentAuthor
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
    ) {
    }
}
