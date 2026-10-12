<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioBundleSettings
{
    /**
     * @param array<string, mixed>|null $detections
     * @param list<array{process: string, enabled: bool, configurable: bool}>|null $recipeDetections
     */
    public function __construct(
        public bool $hasFolderRecipeParameters,
        public ?array $detections,
        public ?array $recipeDetections = null,
    ) {
    }
}
