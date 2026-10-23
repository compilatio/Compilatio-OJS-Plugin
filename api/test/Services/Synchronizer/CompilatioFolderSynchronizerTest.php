<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\Services\Synchronizer;

use APP\plugins\generic\compilatio\api\DTO\CompilatioFolderConfiguration;
use APP\plugins\generic\compilatio\api\Repository\CompilatioFolderRepository;
use APP\plugins\generic\compilatio\api\Services\Synchronizer\CompilatioFolderSynchronizer;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class CompilatioFolderSynchronizerTest extends TestCase
{
    public function testUpdatesSavedFolderEvenWhenJournalNameChanges(): void
    {
        $configuration = new CompilatioFolderConfiguration(10, 20, false, false, false);
        $repository = $this->createMock(CompilatioFolderRepository::class);
        $repository->expects(self::never())->method('findFolderByName');
        $repository->expects(self::never())->method('create');
        $repository->expects(self::once())->method('update')
            ->with('folder-123', 'Nouveau nom', $configuration);

        self::assertSame('folder-123', (new CompilatioFolderSynchronizer($repository))->synchronize(
            'Nouveau nom', $configuration, 'folder-123',
        ));
    }

    public function testCreatesFolderWhenNoSavedIdOrMatchingFolderExists(): void
    {
        $configuration = new CompilatioFolderConfiguration(10, 20, false, false, false);
        $repository = $this->createMock(CompilatioFolderRepository::class);
        $repository->expects(self::once())->method('findFolderByName')->with('Journal')->willReturn(null);
        $repository->expects(self::once())->method('create')->with('Journal', $configuration)
            ->willReturn((object) ['id' => 'folder-new']);
        $repository->expects(self::never())->method('update');

        self::assertSame('folder-new', (new CompilatioFolderSynchronizer($repository))->synchronize(
            'Journal', $configuration,
        ));
    }

    public function testDoesNotCreateAnotherFolderWhenSavedFolderUpdateFails(): void
    {
        $configuration = new CompilatioFolderConfiguration(10, 20, false, false, false);
        $repository = $this->createMock(CompilatioFolderRepository::class);
        $repository->expects(self::never())->method('findFolderByName');
        $repository->expects(self::never())->method('create');
        $repository->expects(self::once())->method('update')
            ->willThrowException(new RuntimeException('Folder unavailable'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Folder unavailable');
        (new CompilatioFolderSynchronizer($repository))->synchronize('Journal', $configuration, 'folder-123');
    }
}
