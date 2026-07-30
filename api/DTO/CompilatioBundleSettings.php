<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioBundleSettings
{
    /**
     * @param array<string, mixed>|null $detections
     */
    public function __construct(
        public bool $hasFolderRecipeParameters,
        public ?array $detections,
    ) {
    }
}
