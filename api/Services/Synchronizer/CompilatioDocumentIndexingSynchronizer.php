<?php

namespace APP\plugins\generic\compilatio\api\Services\Synchronizer;

use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use RuntimeException;

final class CompilatioDocumentIndexingSynchronizer
{
    public function __construct(
        private readonly CompilatioDocumentRepository $remoteDocuments,
        private readonly CompilatioDocumentStore $localDocuments,
    ) {
    }

    public function synchronize(int $submissionFileId, bool $indexed): void
    {
        $document = $this->localDocuments->getForSubmissionFile($submissionFileId);
        if (!$document) {
            throw new RuntimeException('The local Compilatio document can not be found.');
        }

        $externalId = $document->external_id ?? null;
        if (!is_string($externalId) || $externalId === '') {
            throw new RuntimeException('The document has not been sent to Compilatio yet.');
        }

        $this->remoteDocuments->updateIndexing($externalId, $indexed);
        $this->localDocuments->updateIndexing($submissionFileId, $indexed);
    }
}
