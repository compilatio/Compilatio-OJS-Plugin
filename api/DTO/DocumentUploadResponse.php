<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentUploadResponse
{
    public function __construct(
        public int $statusCode,
        public object $document,
    ) {
    }
}
