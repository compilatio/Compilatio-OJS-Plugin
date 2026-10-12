<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioDetection
{
    public function __construct(
        public readonly string $process,
        public bool $enabled,
        public readonly bool $configurable,
    ) {
    }
}
