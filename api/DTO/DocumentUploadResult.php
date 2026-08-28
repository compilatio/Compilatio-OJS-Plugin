<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentUploadResult
{
    public function __construct(
        public DocumentUploadResponse $response,
        public string $status,
    ) {
    }
}
