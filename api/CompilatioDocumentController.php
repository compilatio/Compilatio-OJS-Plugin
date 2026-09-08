<?php

namespace APP\plugins\generic\compilatio\api;

use APP\facades\Repo;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Logger\CompilatioDebugLogger;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentRepository;
use APP\plugins\generic\compilatio\api\Repository\CompilatioDocumentStore;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentAnalysisHandler;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentSubmissionHandler;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use PKP\core\PKPBaseController;
use PKP\plugins\Plugin;
use PKP\security\Role;
use RuntimeException;
use Throwable;

final class CompilatioDocumentController extends PKPBaseController
{
    public function __construct(private readonly Plugin $plugin)
    {
    }

    public function getHandlerPath(): string
    {
        return 'plugins/compilatio/documents';
    }

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
        Route::post('{submissionFileId}/retry', $this->compilatioDocumentStore(...));
        Route::post('{submissionFileId}/analyse', $this->analyse(...));
        Route::post('{submissionFileId}/report', $this->report(...));
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

            return response()->json(array_map(fn (object $document): array => [
                'submissionFileId' => (int) $document->submission_file_id,
                'status' => is_string($document->status ?? null) ? $document->status : '',
                'statusLabel' => $this->getStatusLabel($document->status ?? null),
                'score' => $this->getGlobalScore($document->light_reports ?? null),
            ], $documents));
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

            $contextId = $this->authorizeSubmission((int) $localDocument->submission_id);
            if ((int) $localDocument->context_id !== $contextId) {
                throw new RuntimeException('Access denied.', 403);
            }
            if ('error_sending_failed' !== ($localDocument->status ?? null)) {
                throw new RuntimeException('Only a failed document upload can be retried.', 409);
            }

            $submission = Repo::submission()->get((int) $localDocument->submission_id);
            $submissionFile = Repo::submissionFile()->get(
                $submissionFileId,
                (int) $localDocument->submission_id,
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
                $message = is_string($retriedDocument->error_message ?? null)
                    ? $retriedDocument->error_message
                    : 'The document could not be sent to Compilatio.';
                throw new RuntimeException($message, 502);
            }

            return response()->json([
                'submissionFileId' => $submissionFileId,
                'status' => is_string($retriedDocument->status ?? null)
                    ? $retriedDocument->status
                    : '',
                'statusLabel' => $this->getStatusLabel($retriedDocument->status ?? null),
                'score' => $this->getGlobalScore($retriedDocument->light_reports ?? null),
            ]);
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
                'analysisId' => $analysis->id,
                'status' => ($analysis->running ?? false) === true
                    || 'running' === ($analysis->state ?? null)
                        ? 'analysing'
                        : 'queue',
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
        if (!$context || !$user || !is_int($contextId) || (int) $document->context_id !== $contextId) {
            throw new RuntimeException('Access denied.', 403);
        }

        $this->authorizeSubmission((int) $document->submission_id);

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
        if (!$submission || (int) $submission->getData('contextId') !== $contextId) {
            throw new RuntimeException('The submission can not be found.', 404);
        }

        $roleIds = array_map(
            static fn (Role $role): int => $role->getRoleId(),
            array_merge($user->getRoles($contextId), $user->getRoles(null)),
        );
        $hasEditorialAccess = (bool) array_intersect([
            Role::ROLE_ID_SITE_ADMIN,
            Role::ROLE_ID_MANAGER,
            Role::ROLE_ID_SUB_EDITOR,
            Role::ROLE_ID_ASSISTANT,
        ], $roleIds);
        if (!$hasEditorialAccess) {
            $accessibleStages = Repo::user()->getAccessibleWorkflowStages(
                $user->getId(),
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

    private function getStatusLabel(mixed $status): string
    {
        return match ($status) {
            'sent' => 'Prêt à analyser',
            'queue' => 'Analyse en attente',
            'analysing' => 'Analyse en cours',
            'scored' => 'Analyse terminée',
            'error_not_found' => 'Document introuvable',
            'error_too_short' => 'Document trop court',
            'error_too_large' => 'Document trop volumineux',
            'error_too_long' => 'Document trop long',
            'error_unsupported' => 'Format non pris en charge',
            'error_extraction_failed' => "Échec de l’extraction",
            'error_analysis_failed' => "Échec de l’analyse",
            'error_sending_failed' => "Échec de l’envoi",
            default => 'Non envoyé',
        };
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
            $score = is_array($report) ? ($report['scores']['global_score_percent'] ?? null) : null;
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
        if (!is_string($id) && !is_int($id)) {
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

        CompilatioDebugLogger::log('Document API error', [
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

        if ($statusCode === 503) {
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
