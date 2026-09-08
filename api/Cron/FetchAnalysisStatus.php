<?php

namespace APP\plugins\generic\compilatio\api\Cron;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\CompilatioPlugin;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;
use PKP\scheduledTask\ScheduledTask;
use PKP\scheduledTask\ScheduledTaskHelper;
use RuntimeException;
use Throwable;

final class FetchAnalysisStatus extends ScheduledTask
{
    private const TABLE = 'compilatio_documents';
    private const FAILED_STATES = ['crashed', 'aborted', 'canceled'];

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
        $documents = DB::table(self::TABLE)
            ->whereIn('status', Document::STATUS_ANALYSING_IN_PROGRESS)
            ->whereNotNull('external_id')
            ->get();

        $store = new CompilatioDocumentStore();
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

        return $successful;
    }

    private function synchronizeDocument(
        object $document,
        CompilatioDocumentStore $store,
    ): void {
        $externalId = $document->external_id ?? null;
        if (!is_string($externalId) || '' === $externalId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $response = $this->getRepository((int) $document->context_id)
            ->getById($externalId);
        $remoteDocument = $response->data->document ?? null;

        if (!is_object($remoteDocument)) {
            throw new RuntimeException('Compilatio returned an invalid document.');
        }

        $lightReports = $remoteDocument->light_reports ?? null;

        if (null !== $lightReports) {
            $store->updateLightReports(
                (int) $document->submission_file_id,
                $lightReports,
                Document::STATUS_SCORED,
            );
            return;
        }

        if (!in_array($remoteDocument->state ?? null, self::FAILED_STATES, true)) {
            return;
        }
        
        $store->updateStatus(
            (int) $document->submission_file_id,
            Document::STATUS_ERROR_ANALYSIS_FAILED,
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
        if (!is_string($value) || $value === '') {
            throw new RuntimeException(
                "The Compilatio setting {$name} is missing for context {$contextId}."
            );
        }

        return $value;
    }
}
