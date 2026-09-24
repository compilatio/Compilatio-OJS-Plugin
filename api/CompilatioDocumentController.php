<?php

namespace APP\plugins\generic\compilatio\api;

use APP\facades\Repo;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentAnalysisHandler;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentSubmissionHandler;
use APP\plugins\generic\compilatio\api\Services\Synchronizer\CompilatioDocumentIndexingSynchronizer;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use PKP\core\PKPBaseController;
use PKP\plugins\Plugin;
use PKP\security\Role;
use RuntimeException;
use Throwable;

final class CompilatioDocumentController extends PKPBaseController
{
    public function __construct(private readonly Plugin $plugin) {}

    public function getHandlerPath(): string
    {
        return 'plugins/compilatio/documents';
    }

    /**
     * @return array<string>
     */
    public function getRouteGroupMiddleware(): array
    {
        return [
            'has.user',
            'has.context',
            self::roleAuthorizer([
                Role::ROLE_ID_SITE_ADMIN,
                Role::ROLE_ID_MANAGER,
                Role::ROLE_ID_SUB_EDITOR,
                Role::ROLE_ID_ASSISTANT,
                Role::ROLE_ID_AUTHOR,
            ]),
        ];
    }

    public function getGroupRoutes(): void
    {
        Route::get('submission/{submissionId}', $this->getSubmissionDocuments(...));
        Route::post('{submissionFileId}/retry', $this->resendDocument(...));
        Route::post('{submissionFileId}/analyse', $this->analyse(...));
        Route::post('{submissionFileId}/report', $this->report(...));
        Route::patch('{submissionFileId}/indexing', $this->updateIndexing(...));
    }

    public function getSubmissionDocuments(Request $request): JsonResponse
    {
        try {
            $submissionFileId = $this->getRouteId($request, 'submissionId');
            $contextId = $this->authorizeSubmission($submissionFileId);
            $documents = (new CompilatioDocumentStore())->getForSubmission(
                $submissionFileId,
                $contextId,
            );

            return response()->json(array_map(
                fn(Document $document): array => $this->formatDocumentResponse($document),
                $documents,
            ));
        } catch (Throwable $exception) {
            return $this->errorResponse($exception);
        }
    }

    public function resendDocument(Request $request): JsonResponse
    {
        try {
            $submissionFileId = $this->getRouteId($request, 'submissionFileId');
            $compilatioDocumentStore = new CompilatioDocumentStore();
            $localDocument = $compilatioDocumentStore->getForSubmissionFile($submissionFileId);

            if (!$localDocument) {
                throw new RuntimeException('The Compilatio document can not be found.', 404);
            }

            $contextId = $this->authorizeSubmission((int) $localDocument->submissionId);
            if ((int) $localDocument->contextId !== $contextId) {
                throw new RuntimeException('Access denied.', 403);
            }
            if ('error_sending_failed' !== ($localDocument->status ?? null)) {
                throw new RuntimeException('Only a failed document upload can be retried.', 409);
            }

            $submission = Repo::submission()->get((int) $localDocument->submissionId);
            $submissionFile = Repo::submissionFile()->get(
                $submissionFileId,
                (int) $localDocument->submissionId,
            );
            if (!$submission || !$submissionFile) {
                throw new RuntimeException('The OJS document can not be found.', 404);
            }

            (new DocumentSubmissionHandler($this->plugin))->handle(
                $submission,
                $submissionFile,
                $contextId,
            );

            $retriedDocument = $compilatioDocumentStore->getForSubmissionFile($submissionFileId);
            if (!$retriedDocument) {
                throw new RuntimeException('The retried document can not be found.', 500);
            }
            if ('error_sending_failed' === ($retriedDocument->status ?? null)) {
                $message = is_string($retriedDocument->errorMessage ?? null)
                    ? $retriedDocument->errorMessage
                    : 'The document could not be sent to Compilatio.';
                throw new RuntimeException($message, 502);
            }

            return response()->json($this->formatDocumentResponse($retriedDocument));
        } catch (Throwable $exception) {
            return $this->errorResponse($exception);
        }
    }

    public function analyse(Request $request): JsonResponse
    {
        try {
            $submissionFileId = $this->getRouteId($request, 'submissionFileId');
            $handler = $this->getHandler($submissionFileId);
            $analysis = $handler->launch($submissionFileId);

            return response()->json([
                'status' => true === ($analysis->running) || 'running' === ($analysis->state)
                    ? 'analysing'
                    : 'queue',
            ]);
        } catch (Throwable $exception) {
            return $this->errorResponse($exception);
        }
    }

    public function updateIndexing(Request $request): JsonResponse
    {
        try {
            $submissionFileId = $this->getRouteId($request, 'submissionFileId');
            $store = new CompilatioDocumentStore();
            $document = $store->getForSubmissionFile($submissionFileId);
            if (!$document) {
                throw new RuntimeException('The Compilatio document can not be found.', 404);
            }

            $contextId = $this->authorizeSubmission($document->submissionId);
            if ($document->contextId !== $contextId) {
                throw new RuntimeException('Access denied.', 403);
            }

            $indexed = $request->input('indexed');
            if (!is_bool($indexed)) {
                $message = __('plugins.generic.compilatio.documents.invalidIndexed');
                throw new RuntimeException(
                    is_string($message) ? $message : 'The indexed value must be a boolean.',
                    422,
                );
            }

            if (empty($document->externalId) || Document::STATUS_ERROR_DELETE === $document->status) {
                $message = __('plugins.generic.compilatio.documents.indexingUnavailable');
                throw new RuntimeException(
                    is_string($message) ? $message : 'Indexing is not available for this document.',
                    409,
                );
            }

            $synchronizer = new CompilatioDocumentIndexingSynchronizer(
                new CompilatioDocumentRepository(
                    new CompilatioClient(
                        $this->requireSetting($contextId, 'apiKey'),
                        new Client(),
                        $this->requireSetting($contextId, 'compilatioUserId'),
                    ),
                ),
                $store,
            );
            $synchronizer->synchronize($submissionFileId, $indexed);

            return response()->json([
                'submissionFileId' => $submissionFileId,
                'indexed' => $indexed,
            ]);
        } catch (Throwable $exception) {
            return $this->errorResponse($exception);
        }
    }

    public function report(Request $request): JsonResponse
    {
        try {
            $submissionFileId = $this->getRouteId($request, 'submissionFileId');
            $handler = $this->getHandler($submissionFileId);

            return response()->json([
                'url' => $handler->getReportUrl($submissionFileId),
            ]);
        } catch (Throwable $exception) {
            return $this->errorResponse($exception);
        }
    }

    private function getHandler(int $submissionFileId): DocumentAnalysisHandler
    {
        $compilatioDocumentStore = new CompilatioDocumentStore();
        $document = $compilatioDocumentStore->getForSubmissionFile($submissionFileId);
        if (!$document) {
            throw new RuntimeException('The Compilatio document can not be found.', 404);
        }

        $context = $this->getRequest()->getContext();
        $user = $this->getRequest()->getUser();
        $contextId = $context?->getId();
        if (!$context || !$user || !is_int($contextId) || (int) $document->contextId !== $contextId) {
            throw new RuntimeException('Access denied.', 403);
        }

        $this->authorizeSubmission((int) $document->submissionId);

        return new DocumentAnalysisHandler(
            new CompilatioDocumentRepository(
                new CompilatioClient(
                    $this->requireSetting($contextId, 'apiKey'),
                    new Client(),
                    $this->requireSetting($contextId, 'compilatioUserId'),
                )
            ),
            $compilatioDocumentStore,
        );
    }

    private function authorizeSubmission(int $submissionId): int
    {
        $context = $this->getRequest()->getContext();
        $user = $this->getRequest()->getUser();
        $contextId = $context?->getId();
        if (!$context || !$user || !is_int($contextId)) {
            throw new RuntimeException('Access denied.', 403);
        }

        $submission = Repo::submission()->get($submissionId);

        if (null === $submission) {
            throw new RuntimeException('The submission can not be found.', 404);
        }

        $submissionContextId = $submission->getData('contextId');

        if ($submissionContextId !== $contextId) {
            throw new RuntimeException('The submission can not be found.', 404);
        }

        $roleIds = [];
        foreach (array_merge($user->getRoles($contextId), $user->getRoles(null)) as $role) {
            if ($role instanceof Role) {
                $roleIds[] = $role->getRoleId();
            }
        }

        $hasEditorialAccess = (bool) array_intersect([
            Role::ROLE_ID_SITE_ADMIN,
            Role::ROLE_ID_MANAGER,
            Role::ROLE_ID_SUB_EDITOR,
            Role::ROLE_ID_ASSISTANT,
        ], $roleIds);
        if (!$hasEditorialAccess) {
            $userId = $user->getId();
            if (!is_int($userId)) {
                throw new RuntimeException('Access denied.', 403);
            }

            $accessibleStages = Repo::user()->getAccessibleWorkflowStages(
                $userId,
                $contextId,
                $submission,
                $roleIds,
            );

            if ([] === $accessibleStages) {
                throw new RuntimeException('Access denied.', 403);
            }
        }

        return $contextId;
    }

    private function getStatusLabel(?string $status): string
    {
        $key = in_array($status, Document::DOCUMENT_STATUSES, true)
            ? $status
            : 'not_sent';

        $label = __('plugins.generic.compilatio.documents.' . $key);

        return is_string($label) ? $label : $key;
    }

    /** @return array{submissionFileId: int, status: string, statusLabel: string, score: ?float, indexed: bool, canIndex: bool} */
    private function formatDocumentResponse(Document $document): array
    {
        return [
            'submissionFileId' => $document->submissionFileId,
            'status' => $document->status ?? '',
            'statusLabel' => $this->getStatusLabel($document->status),
            'score' => $this->getGlobalScore($document->lightReports),
            'indexed' => $document->indexed,
            'canIndex' => !empty($document->externalId) && Document::STATUS_ERROR_DELETE !== $document->status,
        ];
    }

    private function getGlobalScore(mixed $lightReports): ?float
    {
        if (!is_string($lightReports) || '' === $lightReports) {
            return null;
        }

        $reports = json_decode($lightReports, true);
        if (!is_array($reports)) {
            return null;
        }

        foreach ($reports as $report) {
            if (!is_array($report) || !isset($report['scores']) || !is_array($report['scores'])) {
                continue;
            }

            $score = $report['scores']['global_score_percent'] ?? null;
            if (is_numeric($score)) {
                return (float) $score;
            }
        }

        return null;
    }

    private function requireSetting(int $contextId, string $name): string
    {
        $value = $this->plugin->getSetting($contextId, $name);
        if (!is_string($value) || '' === $value) {
            throw new RuntimeException("The Compilatio setting {$name} is missing.");
        }

        return $value;
    }

    private function getRouteId(Request $request, string $name): int
    {
        $id = $request->route($name);
        if (!is_string($id)) {
            throw new RuntimeException("The route parameter {$name} is missing.", 400);
        }

        $id = (string) $id;
        $normalizedId = trim($id, " \t\n\r\0\x0B/");

        if (!ctype_digit($normalizedId) || (int) $normalizedId < 1) {
            throw new RuntimeException(
                sprintf('The requested identifier %s is invalid.', json_encode($id)),
                400,
            );
        }

        return (int) $normalizedId;
    }

    private function errorResponse(Throwable $exception): JsonResponse
    {
        $statusCode = (int) $exception->getCode();
        if ($statusCode < 400 || $statusCode > 599) {
            $statusCode = 500;
        }

        Log::error('Compilatio document API error', [
            'httpStatus' => $statusCode,
            'error' => $exception->getMessage(),
        ]);

        return response()->json([
            'errorMessage' => $this->getPublicErrorMessage($exception, $statusCode),
        ], $statusCode);
    }

    private function getPublicErrorMessage(
        Throwable $exception,
        int $statusCode,
    ): string {
        $technicalMessage = $exception->getMessage();

        if (in_array($statusCode, [401, 403], true)) {
            return "Compilatio Auth failed";
        }

        if (503 === $statusCode) {
            return 'Compilatio is currently not avalaible. Please try again later.';
        }

        if ($statusCode >= 500) {
            return 'A Compilatio error has occured. Please try again later.';
        }

        if (str_starts_with($technicalMessage, 'Compilatio API returned status')) {
            return 'Compilatio Error';
        }

        return $technicalMessage;
    }
}
