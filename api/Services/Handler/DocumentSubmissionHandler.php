<?php

namespace APP\plugins\generic\compilatio\api\Services\Handler;

use APP\facades\Repo;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;
use APP\plugins\generic\compilatio\api\Exception\CompilatioDocumentUploadException;
use APP\plugins\generic\compilatio\api\Logger\CompilatioDebugLogger;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\submission\Submission;
use GuzzleHttp\Client;
use PKP\author\Author;
use PKP\db\DAORegistry;
use PKP\plugins\Plugin;
use PKP\security\Role;
use PKP\submission\GenreDAO;
use PKP\submissionFile\SubmissionFile;
use RuntimeException;
use Throwable;

final class DocumentSubmissionHandler
{
    public function __construct(private readonly Plugin $plugin)
    {
    }

    public function handle(
        Submission $submission,
        SubmissionFile $submissionFile,
        int $contextId,
    ): void {
        if (SubmissionFile::SUBMISSION_FILE_SUBMISSION !== $submissionFile->getData('fileStage')) {
            return;
        }

        if (!$this->isArticleText($submissionFile, $contextId)) {
            return;
        }

        $store = new CompilatioDocumentStore();
        if ($store->existsForSubmissionFile($submissionFile->getId())) {
            CompilatioDebugLogger::log('Document already sent', $submissionFile->getId());
            return;
        }

        try {
            $document = $this->buildDocument($submission, $submissionFile, $contextId);
            $store->insetDocument($document);

            $compilatioDocumentRepository = new CompilatioDocumentRepository(
                new CompilatioClient(
                    $this->requireStringSetting($contextId, 'apiKey'),
                    new Client(),
                    $this->requireStringSetting($contextId, 'compilatioUserId'),
                )
            );

            $result = $compilatioDocumentRepository->create($document);
            $response = $result->response;
            $remoteDocument = $response->document->data->document;

            $store->markUploaded($document->submissionFileId, $response, $result->status);

            CompilatioDebugLogger::log('Document sent', [
                'submissionFileId' => $document->submissionFileId,
                'externalId' => $remoteDocument->id,
                'httpStatus' => $response->statusCode,
                'status' => $result->status,
            ]);
        } catch (CompilatioDocumentUploadException $exception) {
            $store->markError(
                $submissionFile->getId(),
                $exception->status,
                $exception->getMessage(),
            );
            CompilatioDebugLogger::log('Document upload error', [
                'submissionFileId' => $submissionFile->getId(),
                'httpStatus' => $exception->httpStatus,
                'status' => $exception->status,
                'error' => $exception->getMessage(),
            ]);
        } catch (Throwable $exception) {
            $store->markError(
                $submissionFile->getId(),
                Document::STATUS_ERROR_SENDING_FAILED,
                $exception->getMessage(),
            );
            CompilatioDebugLogger::log('Document upload error', [
                'submissionFileId' => $submissionFile->getId(),
                'httpStatus' => $exception->getCode(),
                'status' => Document::STATUS_ERROR_SENDING_FAILED,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function buildDocument(
        Submission $submission,
        SubmissionFile $submissionFile,
        int $contextId,
    ): Document {
        $fileId = $submissionFile->getData('fileId');
        $uploaderUserId = $submissionFile->getData('uploaderUserId');
        if (!is_int($fileId) || !is_int($uploaderUserId)) {
            throw new RuntimeException('The OJS document identifiers are invalid.');
        }

        $fileService = app()->get('file');
        $file = $fileService->get($fileId);
        if (!$file || !$fileService->fs->has($file->path)) {
            throw new RuntimeException('The physical OJS document can not be found.');
        }

        $uploader = Repo::user()->get($uploaderUserId);
        if (!$uploader) {
            throw new RuntimeException('The OJS depositor can not be found.');
        }

        $publication = $submission->getCurrentPublication();
        if (!$publication) {
            throw new RuntimeException('The current OJS publication can not be found.');
        }

        $authors = [];
        foreach ($publication->getData('authors') as $author) {
            if ($this->isTranslator($author)) {
                continue;
            }

            $authors[] = new DocumentAuthor(
                $this->clean((string) $author->getLocalizedGivenName()),
                $this->clean((string) $author->getLocalizedFamilyName()),
                (string) $author->getEmail(),
            );
        }

        $originalName = $submissionFile->getLocalizedData('name');
        $description = $publication->getLocalizedData('abstract');
        $filename = $fileService->formatFilename(
            $file->path,
            is_string($originalName) && $originalName !== '' ? $originalName : 'document'
        );

        return new Document(
            contextId: $contextId,
            submissionId: $submission->getId(),
            submissionFileId: $submissionFile->getId(),
            fileId: $fileId,
            uploaderUserId: $uploaderUserId,
            folderId: $this->requireStringSetting($contextId, 'compilatioFolderId'),
            filename: $filename,
            title: $this->clean((string) $publication->getLocalizedTitle()),
            description: $this->clean(is_string($description) ? $description : ''),
            path: $file->path,
            contentType: (string) ($file->mimetype ?? 'application/octet-stream'),
            indexed: (bool) $this->plugin->getSetting($contextId, 'automaticIndexingEnabled'),
            depositor: new DocumentAuthor(
                $this->clean((string) $uploader->getLocalizedGivenName()),
                $this->clean((string) $uploader->getLocalizedFamilyName()),
                (string) $uploader->getEmail(),
            ),
            authors: $authors,
        );
    }

    private function isTranslator(Author $author): bool
    {
        $userGroup = $author->getUserGroup();

        return $userGroup !== null
            && (bool) $userGroup->isDefault
            && (int) $userGroup->roleId === Role::ROLE_ID_AUTHOR
            && !(bool) $userGroup->permitSelfRegistration;
    }

    private function isArticleText(
        SubmissionFile $submissionFile,
        int $contextId,
    ): bool {
        /** @var GenreDAO $genreDao */
        $genreDao = DAORegistry::getDAO('GenreDAO');
        $articleTextGenre = $genreDao->getByKey('SUBMISSION', $contextId);

        return $articleTextGenre !== null
            && $submissionFile->getData('genreId') === $articleTextGenre->getId();
    }

    private function requireStringSetting(int $contextId, string $name): string
    {
        $value = $this->plugin->getSetting($contextId, $name);
        if (!is_string($value) || $value === '') {
            throw new RuntimeException("The Compilatio setting {$name} is missing.");
        }

        return $value;
    }

    private function clean(string $value): string
    {
        return trim(strip_tags($value));
    }
}
