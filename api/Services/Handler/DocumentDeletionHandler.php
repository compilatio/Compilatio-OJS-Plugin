<?php

namespace APP\plugins\generic\compilatio\api\Services\Handler;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\api\Services\Logging\CompilatioOjsLogger;
use GuzzleHttp\Client;
use PKP\plugins\Plugin;
use PKP\submissionFile\SubmissionFile;
use RuntimeException;
use Throwable;

final class DocumentDeletionHandler
{
    public function __construct(private readonly Plugin $plugin) {}

    public function handle(SubmissionFile $submissionFile): void
    {
        $submissionFileId = $submissionFile->getId();
        if (null === $submissionFileId) {
            return;
        }

        $compilatioDocumentStore = new CompilatioDocumentStore();
        $document = $compilatioDocumentStore->getForSubmissionFile($submissionFileId);

        if (!$document) {
            return;
        }

        $externalId = $document->externalId;
        if (null === $externalId || '' === $externalId) {
            $compilatioDocumentStore->deleteForSubmissionFile($submissionFileId);
            return;
        }

        try {
            $contextId = $document->contextId;
            $compilatioDocumentRepository = new CompilatioDocumentRepository(
                new CompilatioClient(
                    $this->requireStringSetting($contextId, 'apiKey'),
                    new Client(),
                    $this->requireStringSetting($contextId, 'compilatioUserId'),
                )
            );

            $compilatioDocumentRepository->delete($externalId);
            $compilatioDocumentStore->deleteForSubmissionFile($submissionFileId);

            CompilatioOjsLogger::log('info', 'Compilatio document deleted', [
                'submissionFileId' => $submissionFileId,
                'externalId' => $externalId,
            ]);
        } catch (Throwable $exception) {
            $compilatioDocumentStore->markError(
                $submissionFileId,
                Document::STATUS_ERROR_DELETE,
                $exception->getMessage(),
            );

            CompilatioOjsLogger::log('error', 'Compilatio document deletion failed', [
                'submissionFileId' => $submissionFileId,
                'externalId' => $externalId,
                'httpStatus' => $exception->getCode(),
                'status' => Document::STATUS_ERROR_DELETE,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function requireStringSetting(int $contextId, string $name): string
    {
        $value = $this->plugin->getSetting($contextId, $name);
        if (!is_string($value) || '' === $value) {
            throw new RuntimeException("The Compilatio setting {$name} is missing.");
        }

        return $value;
    }
}
