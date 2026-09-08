<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;
use APP\plugins\generic\compilatio\api\DTO\DocumentUploadResponse;
use APP\plugins\generic\compilatio\api\DTO\DocumentUploadResult;
use APP\plugins\generic\compilatio\api\Exception\CompilatioDocumentUploadException;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioDocumentStatusResolver;
use RuntimeException;
use Throwable;

final class CompilatioDocumentRepository
{
    private const REPORT_REDIRECT_URL = 'https://app.compilatio.net/api/private/reports/redirect/';

    public function __construct(private readonly CompilatioClient $client)
    {
    }

    public function getById(string $documentId): object
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $document = $this->client->get(
            'private/documents/' . rawurlencode($documentId),
            true,
        );

        return $document;
    }

    public function create(Document $document): DocumentUploadResult
    {
        $statusResolver = new CompilatioDocumentStatusResolver();
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

            try {
                $response = $this->client->postFileWithStatus(
                    'private/documents',
                    $multipart,
                    true,
                );
            } catch (Throwable $exception) {
                throw new CompilatioDocumentUploadException(
                    $exception->getMessage(),
                    $statusResolver->fromException($exception),
                    (int) $exception->getCode(),
                    $exception,
                );
            }

            $responseBody = $response['body'];
            $remoteStatus = $responseBody->data->document->status ?? null;
            $status = is_int($remoteStatus) || is_string($remoteStatus)
                ? $statusResolver->resolve($remoteStatus)
                : $statusResolver->fromHttpStatus($response['statusCode']);

            return new DocumentUploadResult(
                new DocumentUploadResponse(
                    $response['statusCode'],
                    $responseBody,
                ),
                $status,
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

    public function launchAnalysis(string $documentId): object
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $analysis = $this->client->post(
            'private/analyses',
            ['doc_id' => $documentId],
            true,
        );

        return $analysis;
    }

    public function getReportUrl(string $documentId): string
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $response = $this->client->post(
            'private/documents/' . rawurlencode($documentId) . '/report-jwt',
            [],
            true,
        );
        $jwt = $response->data->jwt ?? null;

        if (!is_string($jwt) || '' === $jwt) {
            throw new RuntimeException('Compilatio returned a report without a JWT.');
        }

        return self::REPORT_REDIRECT_URL . rawurlencode($jwt);
    }

    public function delete(string $documentId): void
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $this->client->delete(
            'private/document/' . rawurlencode($documentId),
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
