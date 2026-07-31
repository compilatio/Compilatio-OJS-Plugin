<?php

namespace APP\plugins\generic\compilatio\api\Services\Synchronizer;

use APP\plugins\generic\compilatio\api\DTO\CompilatioFolderConfiguration;
use APP\plugins\generic\compilatio\api\Repository\CompilatioFolderRepository;
use RuntimeException;

final class CompilatioFolderSynchronizer
{
    public function __construct(
        private CompilatioFolderRepository $folderRepository,
    ) {
    }

    public function synchronize(
        string $reviewName,
        CompilatioFolderConfiguration $configuration,
    ): string {
        $folder = $this->folderRepository
            ->findFolderByName($reviewName);

        if ($folder === null) {
            $folder = $this->folderRepository->create(
                $reviewName,
                $configuration,
            );
        } else {
            $folderId = $this->extractFolderId($folder);

            $this->folderRepository->update(
                $folderId,
                $reviewName,
                $configuration,
            );
        }

        return $this->extractFolderId($folder);
    }

    private function extractFolderId(object $folder): string
    {
        $folderId = $folder->id ?? null;

        if (!is_string($folderId) || $folderId === '') {
            throw new RuntimeException(
                'Compilatio API returned a folder without a valid ID.'
            );
        }

        return $folderId;
    }
}