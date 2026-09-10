<?php

namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse as CompilatioResponseReader;
use APP\plugins\generic\compilatio\api\DTO\Analysis;
use APP\plugins\generic\compilatio\api\DTO\CompilatioDocument;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;
use APP\plugins\generic\compilatio\api\DTO\DocumentUploadResult;
use APP\plugins\generic\compilatio\api\Exception\CompilatioDocumentUploadException;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioDocumentStatusResolver;
use PKP\services\PKPFileService;
use RuntimeException;
use Throwable;

final class CompilatioDocumentRepository
{
    private const REPORT_REDIRECT_URL = 'https://app.compilatio.net/api/private/reports/redirect/';

    public function __construct(private readonly CompilatioClient $client) {}

    public function getById(string $documentId): CompilatioDocument
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $response = $this->client->get(
            'private/documents/' . rawurlencode($documentId),
            true,
        );

        return CompilatioDocument::build(
            CompilatioResponseReader::objectAt($response, 'data', 'document'),
        );
    }

    public function create(Document $document): DocumentUploadResult
    {
        $statusResolver = new CompilatioDocumentStatusResolver();
        $depositor = self::getDepositor($document);
        $stream = self::getStream($document);

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

            $this->addPerson($multipart, 'depositor', $depositor);
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

            $remoteDocument = CompilatioDocument::build(
                CompilatioResponseReader::objectAt($response->body, 'data', 'document'),
            );
            $status = null !== $remoteDocument->status
                ? $statusResolver->resolve($remoteDocument->status)
                : $statusResolver->fromHttpStatus($response->statusCode);

            return new DocumentUploadResult(
                document: $remoteDocument,
                status: $status,
            );
        } finally {
            $this->closeStream($stream);
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

    public function launchAnalysis(string $documentId): Analysis
    {
        if ('' === $documentId) {
            throw new RuntimeException('The Compilatio document ID is missing.');
        }

        $analysis = $this->client->post(
            'private/analyses',
            ['doc_id' => $documentId],
            true,
        );

        return Analysis::build($analysis);
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
        $data = CompilatioResponseReader::objectAt($response, 'data');
        $jwt = get_object_vars($data)['jwt'] ?? null;

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

    private function closeStream(mixed $stream): void
    {
        if (is_resource($stream)) {
            fclose($stream);
        }
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

    /** @return resource */
    private function getStream(Document $document)
    {
        $fileService = app()->get('file');
        if (!$fileService instanceof PKPFileService) {
            throw new RuntimeException('The OJS file service is unavailable.');
        }

        $path = $document->path;
        if (null === $path || '' === $path) {
            throw new RuntimeException('The OJS document path is missing.');
        }

        $stream = $fileService->fs->readStream($path);
        if (!is_resource($stream)) {
            throw new RuntimeException('Unable to open the OJS document.');
        }
        return $stream;
    }

    private static function getDepositor(Document $document): DocumentAuthor
    {
        $depositor = $document->depositor;
        if (!$depositor instanceof DocumentAuthor) {
            throw new RuntimeException('The OJS document depositor is missing.');
        }

        return $depositor;
    }
}
