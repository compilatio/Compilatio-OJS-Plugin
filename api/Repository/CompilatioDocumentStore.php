<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentUploadResponse;
use Illuminate\Support\Facades\DB;
use JsonException;
use RuntimeException;

final class CompilatioDocumentStore
{
    private const TABLE = 'compilatio_documents';

    public function existsForSubmissionFile(int $submissionFileId): bool
    {
        return DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->whereNotNull('external_id')
            ->exists();
    }

    public function getForSubmissionFile(int $submissionFileId): ?object
    {
        return DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->first();
    }

    public function insetDocument(Document $document): void
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
        DocumentUploadResponse $response,
        string $status,
    ): void
    {
        $document = $response->document;
        $externalId = $document->id ?? null;
        if (!is_string($externalId) || $externalId === '') {
            throw new RuntimeException('Compilatio returned a document without an ID.');
        }

        $now = date('Y-m-d H:i:s');

        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'external_id' => $externalId,
                'analysis_id' => $this->stringOrNull($document->analysis_id ?? null),
                'status' => $status,
                'error_message' => null,
                'light_reports' => $this->encodeLightReports(
                    $document->light_reports ?? null
                ),
                'submitted_at' => $now,
                'last_synced_at' => $now,
                'updated_at' => $now,
            ]);
    }

    public function markError(
        int $submissionFileId,
        string $status,
        string $message,
    ): void
    {
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

    public function updateLightReports(
        int $submissionFileId,
        mixed $lightReports,
        string $status,
    ): void {
        DB::table(self::TABLE)
            ->where('submission_file_id', $submissionFileId)
            ->update([
                'light_reports' => $this->encodeLightReports($lightReports),
                'status' => $status,
                'error_message' => null,
                'last_synced_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }

    private function encodeLightReports(mixed $lightReports): ?string
    {
        if ($lightReports === null) {
            return null;
        }

        try {
            return json_encode(
                $lightReports,
                JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
            );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'Compilatio returned invalid light reports.',
                0,
                $exception,
            );
        }
    }
}
