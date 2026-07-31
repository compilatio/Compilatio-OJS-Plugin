<?php
namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use GuzzleHttp\Client;

class CompilatioFolderRepository
{
    public function __construct(
        private readonly string $apiKey,
        private readonly ?string $userId = null
    ) {}

    /**
     * @return array<object>
     */
    public function get(): array
    {
        $compilatioClient = new CompilatioClient($this->apiKey, new Client(), $this->userId);
        $response = $compilatioClient->get('private/folders', true);
        return CompilatioResponse::arrayAt($response, 'data', 'folders');
    }

    public function create(string $name, int $warningThreshold, int $criticalThreshold, bool $defaultIndexing, bool $autoAnalysis, bool $scheduledAnalysisEnabled): object
    {
        $compilatioClient = new CompilatioClient($this->apiKey, new Client(), $this->userId);
        $response = $compilatioClient->post('private/folders',
        [
            'name' => $name,
            'origin' => 'OJS',
            'thresholds' => [
                'warning' => $warningThreshold,
                'critical' => $criticalThreshold,
            ],
            'default_indexing' => $defaultIndexing,
            'auto_analysis' => $autoAnalysis,
            'scheduled_analysis_enabled' => $scheduledAnalysisEnabled,
        ], true);

        return CompilatioResponse::objectAt($response, 'data', 'folder');
    }

    public function update(
        string $folderId,
        string $name,
        int $warningThreshold,
        int $criticalThreshold,
        bool $defaultIndexing,
        bool $autoAnalysis,
        bool $scheduledAnalysisEnabled,
    ): void {
        $compilatioClient = new CompilatioClient($this->apiKey, new Client(), $this->userId);
        $compilatioClient->patch('private/folders/' . $folderId, [
            'name' => $name,
            'origin' => 'OJS',
            'thresholds' => [
                'warning' => $warningThreshold,
                'critical' => $criticalThreshold,
            ],
            'default_indexing' => $defaultIndexing,
            'auto_analysis' => $autoAnalysis,
            'scheduled_analysis_enabled' => $scheduledAnalysisEnabled,
        ], true);
    }
}