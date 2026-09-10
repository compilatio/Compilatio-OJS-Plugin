<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class CompilatioResponse
{
    public function __construct(
        public int $statusCode,
        public object $body,
    ) {}
}
