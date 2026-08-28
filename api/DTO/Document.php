<?php

namespace APP\plugins\generic\compilatio\api\DTO;

use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;

final readonly class Document
{
    public const STATUS_SENT = 'sent';
    public const STATUS_QUEUE = 'queue';
    public const STATUS_ANALYSING = 'analysing';
    public const STATUS_SCORED = 'scored';
    public const STATUS_ERROR_NOT_FOUND = 'error_not_found';
    public const STATUS_ERROR_TOO_SHORT = 'error_too_short';
    public const STATUS_ERROR_TOO_LARGE = 'error_too_large';
    public const STATUS_ERROR_TOO_LONG = 'error_too_long';
    public const STATUS_ERROR_UNSUPPORTED = 'error_unsupported';
    public const STATUS_ERROR_SENDING_FAILED = 'error_sending_failed';
    public const STATUS_ERROR_EXTRACTION_FAILED = 'error_extraction_failed';
    public const STATUS_ERROR_ANALYSIS_FAILED = 'error_analysis_failed';

    /** @param list<DocumentAuthor> $authors */
    public function __construct(
        public int $contextId,
        public int $submissionId,
        public int $submissionFileId,
        public int $fileId,
        public int $uploaderUserId,
        public string $folderId,
        public string $filename,
        public string $title,
        public string $description,
        public string $path,
        public string $contentType,
        public bool $indexed,
        public DocumentAuthor $depositor,
        public array $authors,
    ) {
    }
}
