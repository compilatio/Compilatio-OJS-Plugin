<?php

namespace APP\plugins\generic\compilatio\api\Cron;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioDocumentStatusResolver;
use APP\plugins\generic\compilatio\CompilatioPlugin;
use GuzzleHttp\Client;
use PKP\scheduledTask\ScheduledTask;
use PKP\scheduledTask\ScheduledTaskHelper;
use RuntimeException;
use Throwable;

final class FetchAnalysisStatus extends ScheduledTask
{
    private const FAILED_STATES = ['crashed', 'aborted', 'canceled', 'cancelled'];

    /** @var array<int, CompilatioDocumentRepository> */
    private array $repositories = [];

    public function __construct(private readonly CompilatioPlugin $plugin)
    {
        parent::__construct();
    }

    public function getName(): string
    {
        return 'Compilatio: fetch analysis statuses';
    }

    protected function executeActions(): bool
    {
        $store = new CompilatioDocumentStore();
        $documents = $store->getPendingSynchronization();

        $successful = true;
        foreach ($documents as $document) {
            try {
                $this->synchronizeDocument($document, $store);
            } catch (Throwable $exception) {
                $successful = false;
                $this->addExecutionLogEntry(
                    sprintf(
                        'Unable to synchronize document %d: %s',
                        $document->id,
                        $exception->getMessage(),
                    ),
                    ScheduledTaskHelper::SCHEDULED_TASK_MESSAGE_TYPE_ERROR,
                );
            }
        }

        $documents = $store->getFailedDeletion();

        foreach ($documents as $document) {
            try {
                $this->deleteDocument($document, $store);
            } catch (Throwable $exception) {
                $successful = false;
                $this->addExecutionLogEntry(
                    sprintf(
                        'Unable to delete document %d: %s',
                        $document->id,
                        $exception->getMessage(),
                    ),
                    ScheduledTaskHelper::SCHEDULED_TASK_MESSAGE_TYPE_ERROR,
                );
            }
        }


        return $successful;
    }

    private function synchronizeDocument(
        Document $document,
        CompilatioDocumentStore $store,
    ): void {
        $externalId = $document->externalId ?? null;
        if (!is_string($externalId) || '' === $externalId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $remoteDocument = $this->getRepository((int) $document->contextId)
            ->getById($externalId);

        if (
            $this->containsFailedAnalysisState($remoteDocument->analyses)
            || $this->containsFailedAnalysisState($remoteDocument->state)
        ) {
            $store->updateStatus(
                (int) $document->submissionFileId,
                Document::STATUS_ERROR_ANALYSIS_FAILED,
            );
            return;
        }

        $lightReports = $remoteDocument->lightReports;

        if (null !== $lightReports) {
            $store->updateLightReports(
                (int) $document->submissionFileId,
                $lightReports,
                Document::STATUS_SCORED,
            );
            return;
        }

        $status = null !== $remoteDocument->status
            ? (new CompilatioDocumentStatusResolver())->tryResolve($remoteDocument->status)
            : null;

        // An upload status may lag behind a manually launched analysis.
        if (null === $status || Document::STATUS_SENT === $status || $document->status === $status) {
            return;
        }

        $store->updateStatus(
            (int) $document->submissionFileId,
            $status,
        );
    }

    private function containsFailedAnalysisState(mixed $value): bool
    {
        if (is_string($value)) {
            return in_array($value, self::FAILED_STATES, true);
        }

        if (is_object($value)) {
            $value = get_object_vars($value);
        }

        if (!is_array($value)) {
            return false;
        }

        foreach ($value as $nestedValue) {
            if ($this->containsFailedAnalysisState($nestedValue)) {
                return true;
            }
        }

        return false;
    }

    private function deleteDocument(Document $document, CompilatioDocumentStore $store): void
    {
        $externalId = $document->externalId ?? null;
        if (!is_string($externalId) || '' === $externalId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        try {
            $this->getRepository((int) $document->contextId)
                ->delete($externalId);
        } catch (Throwable $exception) {
            throw new RuntimeException(
                sprintf(
                    'Unable to delete document %d in Compilatio: %s',
                    $document->id,
                    $exception->getMessage(),
                ),
                0,
                $exception,
            );
        }

        $store->deleteForSubmissionFile(
            (int) $document->submissionFileId,
        );
    }

    private function getRepository(int $contextId): CompilatioDocumentRepository
    {
        if (isset($this->repositories[$contextId])) {
            return $this->repositories[$contextId];
        }

        return $this->repositories[$contextId] = new CompilatioDocumentRepository(
            new CompilatioClient(
                $this->requireSetting($contextId, 'apiKey'),
                new Client(),
                $this->requireSetting($contextId, 'compilatioUserId'),
            )
        );
    }

    private function requireSetting(int $contextId, string $name): string
    {
        $value = $this->plugin->getSetting($contextId, $name);
        if (!is_string($value) || '' === $value) {
            throw new RuntimeException(
                "The Compilatio setting {$name} is missing for context {$contextId}."
            );
        }

        return $value;
    }
}
