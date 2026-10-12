<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentUploadResult
{
    public function __construct(
        public CompilatioDocument $document,
        public string $status,
    ) {}
}
