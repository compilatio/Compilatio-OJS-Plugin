<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;
use APP\plugins\generic\compilatio\api\DTO\DocumentUploadResponse;
use RuntimeException;

final class CompilatioDocumentRepository
{
    public function __construct(private readonly CompilatioClient $client)
    {
    }

    public function create(Document $document): DocumentUploadResponse
    {
        $stream = app()->get('file')->fs->readStream($document->path);
        if (!is_resource($stream)) {
            throw new RuntimeException('Unable to open the OJS document.');
        }

        try {
            $multipart = [
                $this->part('file', $stream, $document->filename, $document->contentType),
                $this->part('filename', $document->filename),
                $this->part('title', $document->title),
                $this->part('folder_id', $document->folderId),
                $this->part('indexed', $document->indexed ? '1' : '0'),
                $this->part('origin', 'ojs'),
                $this->part('user_notes[description]', $document->description)
            ];

            $this->addPerson($multipart, 'depositor', $document->depositor);
            foreach ($document->authors as $index => $author) {
                $this->addPerson($multipart, "authors[{$index}]", $author);
            }

            $response = $this->client->postFileWithStatus(
                'private/documents',
                $multipart,
                true,
            );

            return new DocumentUploadResponse(
                $response['statusCode'],
                $response['body'],
            );
        } finally {
            if (is_resource($stream)) fclose($stream);
        }
    }

    public function updateIndexing(string $documentId, bool $indexed): void
    {
        if ($documentId === '') {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $this->client->patch(
            'private/documents/' . rawurlencode($documentId),
            ['indexed' => $indexed],
            true,
        );
    }

    /**
     * @param array<int, array<string, mixed>> $multipart
     */
    private function addPerson(
        array &$multipart,
        string $prefix,
        DocumentAuthor $person,
    ): void {
        $multipart[] = $this->part("{$prefix}[firstname]", $person->firstName);
        $multipart[] = $this->part("{$prefix}[lastname]", $person->lastName);
        $multipart[] = $this->part("{$prefix}[email_address]", $person->email);
    }

    /** @return array<string, mixed> */
    private function part(
        string $name,
        mixed $contents,
        ?string $filename = null,
        ?string $contentType = null,
    ): array {
        $part = ['name' => $name, 'contents' => $contents];

        if ($filename !== null) {
            $part['filename'] = $filename;
        }
        if ($contentType !== null) {
            $part['headers'] = ['Content-Type' => $contentType];
        }

        return $part;
    }
}
