<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioFolderConfiguration
{
    public function __construct(
        public int $warningThreshold,
        public int $criticalThreshold,
        public bool $defaultIndexing,
        public bool $autoAnalysis,
        public bool $scheduledAnalysisEnabled,
    ) {
    }
}