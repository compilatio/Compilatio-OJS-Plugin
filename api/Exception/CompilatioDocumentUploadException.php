<?php

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
