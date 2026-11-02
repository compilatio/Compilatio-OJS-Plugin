<?php

/**
 * @file plugins/generic/compilatio/api/DTO/DocumentUploadResult.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class DocumentUploadResult
 * @brief Represents the result of a document upload.
 */

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentUploadResult
{
    public function __construct(
        public CompilatioDocument $document,
        public string $status,
    ) {}
}
