<?php

namespace APP\plugins\generic\compilatio\api\Services\Handler;

use APP\plugins\generic\compilatio\api\DTO\Analysis;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use RuntimeException;

final class DocumentAnalysisHandler
{
    public function __construct(
        private readonly CompilatioDocumentRepository $remoteDocuments,
        private readonly CompilatioDocumentStore $localDocuments,
    ) {}

    public function launch(int $submissionFileId): Analysis
    {
        $document = $this->localDocuments->getForSubmissionFile($submissionFileId);
        if (!$document) {
            throw new RuntimeException('The local Compilatio document can not be found.');
        }

        $externalId = $document->externalId;
        if (null === $externalId || '' === $externalId) {
            throw new RuntimeException('The document has not been sent to Compilatio.');
        }

        if (Document::STATUS_SENT !== ($document->status ?? null)) {
            throw new RuntimeException('The Compilatio analysis can not be launched for this document.');
        }

        $analysis = $this->remoteDocuments->launchAnalysis($externalId);
        $status = true === ($analysis->running) || 'running' === ($analysis->state)
            ? Document::STATUS_ANALYSING
            : Document::STATUS_QUEUE;

        $this->localDocuments->markAnalysisLaunched(
            $submissionFileId,
            $status,
        );

        return $analysis;
    }

    public function getReportUrl(int $submissionFileId): string
    {
        $document = $this->localDocuments->getForSubmissionFile($submissionFileId);
        if (!$document) {
            throw new RuntimeException('The local Compilatio document can not be found.');
        }

        $externalId = $document->externalId;
        if (null === $externalId || '' === $externalId) {
            throw new RuntimeException('The document has not been sent to Compilatio.');
        }

        if (Document::STATUS_SCORED !== ($document->status ?? null)) {
            throw new RuntimeException('The Compilatio report is not available yet.');
        }

        return $this->remoteDocuments->getReportUrl($externalId);
    }
}
