<?php

namespace APP\plugins\generic\compilatio\api\Services\Handler;

use APP\facades\Repo;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\DTO\DocumentAuthor;
use APP\plugins\generic\compilatio\api\Exception\CompilatioDocumentUploadException;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\api\Services\Logging\CompilatioOjsLogger;
use APP\submission\Submission;
use GuzzleHttp\Client;
use PKP\author\Author;
use PKP\db\DAORegistry;
use PKP\plugins\Plugin;
use PKP\security\Role;
use PKP\services\PKPFileService;
use PKP\submission\Genre;
use PKP\submission\GenreDAO;
use PKP\submissionFile\SubmissionFile;
use RuntimeException;
use Throwable;

final class DocumentSubmissionHandler
{
    public function __construct(private readonly Plugin $plugin) {}

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

        $submissionId = $submission->getId();
        $submissionFileId = $submissionFile->getId();
        if (null === $submissionId || null === $submissionFileId) {
            return;
        }

        $store = new CompilatioDocumentStore();
        if ($store->existsForSubmissionFile($submissionFileId)) {
            return;
        }

        try {
            $document = $this->buildDocument(
                $submission,
                $submissionFile,
                $contextId,
                $submissionId,
                $submissionFileId,
            );
            $store->insertDocument($document);

            $compilatioDocumentRepository = new CompilatioDocumentRepository(
                new CompilatioClient(
                    $this->requireStringSetting($contextId, 'apiKey'),
                    new Client(),
                    $this->requireStringSetting($contextId, 'compilatioUserId'),
                )
            );

            $result = $compilatioDocumentRepository->create($document);
            $remoteDocument = $result->document;
            $status = $result->status;

            if (Document::STATUS_SENT === $status) {
                $launchMode = $this->plugin->getSetting($contextId, 'analysisLaunchMode');
                if (in_array($launchMode, ['automatic', 'scheduled'], true)) {
                    $status = Document::STATUS_QUEUE;
                }
            }

            $store->markUploaded($document->submissionFileId, $remoteDocument, $status);

            CompilatioOjsLogger::log('info', 'Compilatio document sent', [
                'submissionFileId' => $document->submissionFileId,
                'externalId' => $remoteDocument->id,
                'status' => $status,
            ]);
        } catch (CompilatioDocumentUploadException $exception) {
            $store->markError(
                $submissionFileId,
                $exception->status,
                $exception->getMessage(),
            );
            CompilatioOjsLogger::log('error', 'Compilatio document upload failed', [
                'submissionFileId' => $submissionFileId,
                'httpStatus' => $exception->httpStatus,
                'status' => $exception->status,
                'error' => $exception->getMessage(),
            ]);
        } catch (Throwable $exception) {
            $store->markError(
                $submissionFileId,
                Document::STATUS_ERROR_SENDING_FAILED,
                $exception->getMessage(),
            );
            CompilatioOjsLogger::log('error', 'Compilatio document upload failed', [
                'submissionFileId' => $submissionFileId,
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
        int $submissionId,
        int $submissionFileId,
    ): Document {
        $fileId = $submissionFile->getData('fileId');
        $uploaderUserId = $submissionFile->getData('uploaderUserId');
        if (!is_int($fileId) || !is_int($uploaderUserId)) {
            throw new RuntimeException('The OJS document identifiers are invalid.');
        }

        $fileService = app()->get('file');
        if (!$fileService instanceof PKPFileService) {
            throw new RuntimeException('The OJS file service is unavailable.');
        }

        /** @var object|null $file */
        $file = $fileService->get($fileId);
        if (null === $file) {
            throw new RuntimeException('The OJS document can not be found.');
        }

        $fileProperties = get_object_vars($file);
        $path = $fileProperties['path'] ?? null;
        if (!is_string($path) || '' === $path || !$fileService->fs->has($path)) {
            throw new RuntimeException('The physical OJS document can not be found.');
        }

        $contentType = $fileProperties['mimetype'] ?? null;
        if (!is_string($contentType) || '' === $contentType) {
            $contentType = 'application/octet-stream';
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
        $publicationAuthors = $publication->getData('authors');
        if (!is_iterable($publicationAuthors)) {
            throw new RuntimeException('The OJS publication authors are invalid.');
        }

        foreach ($publicationAuthors as $author) {
            if (!$author instanceof Author) {
                continue;
            }

            if ($this->isTranslator($author)) {
                continue;
            }

            $authors[] = new DocumentAuthor(
                $this->clean($author->getLocalizedGivenName()),
                $this->clean($author->getLocalizedFamilyName()),
                $this->clean($author->getEmail()),
            );
        }

        $originalName = $submissionFile->getLocalizedData('name');
        $description = $publication->getLocalizedData('abstract');
        $filename = $fileService->formatFilename(
            $path,
            is_string($originalName) && '' !== $originalName ? $originalName : 'document'
        );

        return new Document(
            contextId: $contextId,
            submissionId: $submissionId,
            submissionFileId: $submissionFileId,
            fileId: $fileId,
            uploaderUserId: $uploaderUserId,
            folderId: $this->requireStringSetting($contextId, 'compilatioFolderId'),
            filename: $filename,
            title: $this->clean($publication->getLocalizedTitle()),
            description: $this->clean(is_string($description) ? $description : ''),
            path: $path,
            contentType: $contentType,
            indexed: $this->isTruthy(
                $this->plugin->getSetting($contextId, 'automaticIndexingEnabled')
            ),
            depositor: new DocumentAuthor(
                $this->clean($uploader->getLocalizedGivenName()),
                $this->clean($uploader->getLocalizedFamilyName()),
                $this->clean($uploader->getEmail()),
            ),
            authors: $authors,
        );
    }

    private function isTranslator(Author $author): bool
    {
        $userGroup = $author->getUserGroup();
        $roleId = $userGroup->getAttribute('roleId');

        return $this->isTruthy($userGroup->getAttribute('isDefault'))
            && in_array($roleId, [Role::ROLE_ID_AUTHOR, (string) Role::ROLE_ID_AUTHOR], true)
            && !$this->isTruthy($userGroup->getAttribute('permitSelfRegistration'));
    }

    private function isArticleText(
        SubmissionFile $submissionFile,
        int $contextId,
    ): bool {
        /** @var GenreDAO $genreDao */
        $genreDao = DAORegistry::getDAO('GenreDAO');
        /** @var Genre|null $articleTextGenre */
        $articleTextGenre = $genreDao->getByKey('SUBMISSION', $contextId);

        return null !== $articleTextGenre
            && $submissionFile->getData('genreId') === $articleTextGenre->getId();
    }

    private function requireStringSetting(int $contextId, string $name): string
    {
        $value = $this->plugin->getSetting($contextId, $name);
        if (!is_string($value) || '' === $value) {
            throw new RuntimeException("The Compilatio setting {$name} is missing.");
        }

        return $value;
    }

    private function clean(mixed $value): string
    {
        return is_string($value) ? trim(strip_tags($value)) : '';
    }

    private function isTruthy(mixed $value): bool
    {
        return true === $value || 1 === $value || '1' === $value;
    }
}
