<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\CompilatioFolderConfiguration;
use APP\plugins\generic\compilatio\api\Repository\CompilatioFolderRepository;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CompilatioFolderRepositoryTest extends TestCase
{
    /** @param list<array{process: string, enabled: bool, configurable: bool}>|null $detections */
    #[DataProvider('detectionConfigurations')]
    public function testSendsDetectionsWhenCreatingAndUpdatingFolder(?array $detections): void
    {
        $configuration = new CompilatioFolderConfiguration(
            warningThreshold: 10,
            criticalThreshold: 20,
            defaultIndexing: false,
            autoAnalysis: false,
            scheduledAnalysisEnabled: true,
            scheduledAnalysisAt: '2030-01-01T12:00:00Z',
            recipeDetections: $detections,
        );
        $expectedPayload = [
            'name' => 'Journal',
            'thresholds' => ['warning' => 10, 'critical' => 20],
            'default_indexing' => false,
            'auto_analysis' => false,
            'scheduled_analysis_enabled' => true,
            'scheduled_analysis_date' => '2030-01-01T12:00:00Z',
        ];
        if (null !== $detections) {
            $expectedPayload['recipe_detections'] = $detections;
        }

        $folder = (object) ['id' => 'folder-123'];
        $client = $this->createMock(CompilatioClient::class);
        $client->expects(self::once())->method('post')
            ->with('private/folders', $expectedPayload + ['origin' => 'OJS'], true)
            ->willReturn((object) ['data' => (object) ['folder' => $folder]]);
        $client->expects(self::once())->method('patch')
            ->with('private/folders/folder-123', $expectedPayload, true);

        $repository = new CompilatioFolderRepository($client);
        self::assertSame($folder, $repository->create('Journal', $configuration));
        $repository->update('folder-123', 'Journal', $configuration);
    }

    /** @return iterable<string, array{0: list<array{process: string, enabled: bool, configurable: bool}>|null}> */
    public static function detectionConfigurations(): iterable
    {
        yield 'enabled and disabled detections' => [[
            ['process' => 'ai_detection', 'enabled' => true, 'configurable' => true],
            ['process' => 'rewording', 'enabled' => false, 'configurable' => true],
        ]];
        yield 'explicit empty list' => [[]];
        yield 'configuration not authorized' => [null];
    }
}
