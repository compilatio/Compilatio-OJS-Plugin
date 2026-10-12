<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioBundleAccess
{
    /**
     * @param list<string>|null $authorizedFeatures
     * @param list<CompilatioDetection>|null $detections
     */
    public function __construct(
        public readonly ?array $authorizedFeatures,
        public readonly ?array $detections,
    ) {
    }
}
