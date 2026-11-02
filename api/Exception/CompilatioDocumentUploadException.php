<?php

/**
 * @file plugins/generic/compilatio/api/Exception/CompilatioDocumentUploadException.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioDocumentUploadException
 * @brief Reports a failed Compilatio document upload.
 */

namespace APP\plugins\generic\compilatio\api\Exception;

use RuntimeException;
use Throwable;

final class CompilatioDocumentUploadException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $status,
        public readonly int $httpStatus,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $httpStatus, $previous);
    }
}
