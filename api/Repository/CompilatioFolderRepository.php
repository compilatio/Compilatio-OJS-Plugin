<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use APP\plugins\generic\compilatio\api\DTO\CompilatioFolderConfiguration;
use RuntimeException;

class CompilatioFolderRepository
{
    public function __construct(
        private readonly CompilatioClient $client,
    ) {}

    /**
     * @return array<object>
     */
    public function get(): array
    {
        $response = $this->client->get('private/folders', true);
        $rawFolders = CompilatioResponse::arrayAt(
            $response,
            'data',
            'folders'
        );
        $folders = [];

        foreach ($rawFolders as $folder) {
            if (!is_object($folder)) {
                throw new RuntimeException(
                    'Compilatio API returned an invalid folder.'
                );
            }

            $folders[] = $folder;
        }

        return $folders;
    }

    public function create(
        string $name,
        CompilatioFolderConfiguration $configuration,
    ): object {
        $payload = [
            'name' => $name,
            'origin' => 'OJS',
            'thresholds' => [
                'warning' => $configuration->warningThreshold,
                'critical' => $configuration->criticalThreshold,
            ],
            'default_indexing' => $configuration->defaultIndexing,
            'auto_analysis' => $configuration->autoAnalysis,
            'scheduled_analysis_enabled' =>
            $configuration->scheduledAnalysisEnabled,
        ];

        if (
            $configuration->scheduledAnalysisEnabled
            && null !== $configuration->scheduledAnalysisAt
        ) {
            $payload['scheduled_analysis_date'] = $configuration->scheduledAnalysisAt;
        }

        $response = $this->client->post('private/folders', $payload, true);

        return CompilatioResponse::objectAt(
            $response,
            'data',
            'folder'
        );
    }

    public function update(
        string $folderId,
        string $name,
        CompilatioFolderConfiguration $configuration,
    ): void {
        $payload = [
            'name' => $name,
            'thresholds' => [
                'warning' => $configuration->warningThreshold,
                'critical' => $configuration->criticalThreshold,
            ],
            'default_indexing' => $configuration->defaultIndexing,
            'auto_analysis' => $configuration->autoAnalysis,
            'scheduled_analysis_enabled' =>
            $configuration->scheduledAnalysisEnabled,
        ];

        if (
            $configuration->scheduledAnalysisEnabled
            && null !== $configuration->scheduledAnalysisAt
        ) {
            $payload['scheduled_analysis_date'] = $configuration->scheduledAnalysisAt;
        }

        $this->client->patch(
            'private/folders/' . $folderId,
            $payload,
            true
        );
    }

    /**
     * @return object|null
     */
    public function findFolderByName(string $name): ?object
    {
        foreach ($this->get() as $folder) {
            if (
                'OJS' === ($folder->origin ?? null)
                && ($folder->name ?? null) === $name
            ) {
                return $folder;
            }
        }

        return null;
    }
}
