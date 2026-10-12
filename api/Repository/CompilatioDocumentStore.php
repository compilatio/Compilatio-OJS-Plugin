<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\DTO\CompilatioDocument;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Mapper\DocumentDatabaseMapper;
use Illuminate\Support\Facades\DB;

final class CompilatioDocumentStore
{
    private const TABLE = 'compilatio_documents';

    private readonly DocumentDatabaseMapper $documentMapper;

    public function __construct()
    {
        $this->documentMapper = new DocumentDatabaseMapper();
    }

    public function existsForSubmissionFile(int $submissionFileId): bool
    {
        return DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->whereNotNull('external_id')
            ->exists();
    }

    public function getForSubmissionFile(int $submissionFileId): ?Document
    {
        $dbDocument = DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->first();

        if (null === $dbDocument) {
            return null;
        }

        return $this->documentMapper->map($dbDocument);
    }

    /** @return array<int, Document> */
    public function getForSubmission(int $submissionId, int $contextId): array
    {
        $dbDocuments = DB::table(self::TABLE)
            ->where('submission_id', $submissionId)
            ->where('context_id', $contextId)
            ->get()
            ->all();

        return array_map(
            fn($dbDocument) => $this->documentMapper->map($dbDocument),
            $dbDocuments,
        );
    }

    /** @return array<int, Document> */
    public function getPendingSynchronization(): array
    {
        $documents = DB::table(self::TABLE)
            ->whereIn('status', [Document::STATUS_SENT, ...Document::STATUS_ANALYSING_IN_PROGRESS])
            ->whereNotNull('external_id')
            ->get();

        return array_map(
            fn($dbDocument) => $this->documentMapper->map($dbDocument),
            $documents->all(),
        );
    }

    /** @return array<int, Document> */
    public function getFailedDeletion(): array
    {
        $documents = DB::table(self::TABLE)
            ->where('status', Document::STATUS_ERROR_DELETE)
            ->whereNotNull('external_id')
            ->get();

        return array_map(
            fn($dbDocument) => $this->documentMapper->map($dbDocument),
            $documents->all(),
        );
    }

    public function deleteForSubmissionFile(int $submissionFileId): void
    {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->delete();
    }

    public function insertDocument(Document $document): void
    {
        $now = date('Y-m-d H:i:s');
        DB::table(self::TABLE)->updateOrInsert(
            ['submission_file_id' => $document->submissionFileId],
            [
                'context_id' => $document->contextId,
                'submission_id' => $document->submissionId,
                'file_id' => $document->fileId,
                'uploader_user_id' => $document->uploaderUserId,
                'folder_id' => $document->folderId,
                'filename' => $document->filename,
                'title' => $document->title,
                'description' => $document->description,
                'indexed' => $document->indexed,
                'status' => null,
                'error_message' => null,
                'updated_at' => $now,
                'created_at' => $now,
            ]
        );
    }

    public function markUploaded(
        int $submissionFileId,
        CompilatioDocument $document,
        string $status,
    ): void {
        $now = date('Y-m-d H:i:s');

        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'external_id' => $document->id,
                'status' => $status,
                'error_message' => null,
                'light_reports' => $document->lightReports,
                'submitted_at' => $now,
                'last_synced_at' => $now,
                'updated_at' => $now,
            ]);
    }

    public function markError(
        int $submissionFileId,
        string $status,
        string $message,
    ): void {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'status' => $status,
                'error_message' => mb_substr($message, 0, 2000),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    public function updateIndexing(int $submissionFileId, bool $indexed): void
    {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'indexed' => $indexed,
                'last_synced_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    public function updateStatus(int $submissionFileId, string $status): void
    {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'status' => $status,
                'last_synced_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    public function markAnalysisLaunched(
        int $submissionFileId,
        string $status,
    ): void {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'status' => $status,
                'error_message' => null,
                'last_synced_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    public function updateLightReports(
        int $submissionFileId,
        ?string $lightReports,
        string $status,
    ): void {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'light_reports' => $lightReports,
                'status' => $status,
                'error_message' => null,
                'last_synced_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }
}
