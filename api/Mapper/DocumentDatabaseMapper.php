<?php

namespace APP\plugins\generic\compilatio\api\Mapper;

use APP\plugins\generic\compilatio\api\DTO\Document;
use RuntimeException;

/**
 * @phpstan-type DocumentRow array{
 *     id: int|string,
 *     context_id: int|string,
 *     submission_id: int|string,
 *     submission_file_id: int|string,
 *     file_id: int|string,
 *     uploader_user_id: int|string,
 *     folder_id: string,
 *     filename: string,
 *     title: string|null,
 *     description: string|null,
 *     indexed: bool|int|string,
 *     external_id: string|null,
 *     status: string|null,
 *     light_reports: string|null,
 *     error_message: string|null
 * }
 */
final class DocumentDatabaseMapper
{
    public function map(mixed $record): Document
    {
        if (!is_object($record)) {
            throw new RuntimeException('The Compilatio document database row is invalid.');
        }

        /** @var DocumentRow $row */
        $row = get_object_vars($record);

        return new Document(
            contextId: (int) $row['context_id'],
            submissionId: (int) $row['submission_id'],
            submissionFileId: (int) $row['submission_file_id'],
            fileId: (int) $row['file_id'],
            uploaderUserId: (int) $row['uploader_user_id'],
            folderId: $row['folder_id'],
            filename: $row['filename'],
            title: $row['title'] ?? '',
            description: $row['description'] ?? '',
            indexed: (bool) $row['indexed'],
            authors: [],
            id: (int) $row['id'],
            externalId: $row['external_id'],
            status: $row['status'],
            lightReports: $row['light_reports'],
            errorMessage: $row['error_message'],
        );
    }
}
