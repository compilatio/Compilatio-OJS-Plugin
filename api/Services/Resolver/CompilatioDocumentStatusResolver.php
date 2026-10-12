<?php

namespace APP\plugins\generic\compilatio\api\Services\Resolver;

use APP\plugins\generic\compilatio\api\DTO\Document;
use Throwable;

final class CompilatioDocumentStatusResolver
{
    public function resolve(int|string $status): string
    {
        return $this->tryResolve($status) ?? Document::STATUS_ERROR_SENDING_FAILED;
    }

    public function tryResolve(int|string $status): ?string
    {
        if (is_string($status) && ctype_digit($status)) {
            $status = (int) $status;
        }

        return match ($status) {
            201, 202 => Document::STATUS_SENT,
            203 => Document::STATUS_ANALYSING,
            404 => Document::STATUS_ERROR_NOT_FOUND,
            412 => Document::STATUS_ERROR_TOO_SHORT,
            413 => Document::STATUS_ERROR_TOO_LARGE,
            414 => Document::STATUS_ERROR_TOO_LONG,
            415 => Document::STATUS_ERROR_UNSUPPORTED,
            416 => Document::STATUS_ERROR_SENDING_FAILED,
            417 => Document::STATUS_ERROR_EXTRACTION_FAILED,
            418 => Document::STATUS_ERROR_ANALYSIS_FAILED,
            'Analyzed' => Document::STATUS_SCORED,
            'In queue' => Document::STATUS_QUEUE,
            'pending' => Document::STATUS_ERROR_SENDING_FAILED,
            default => null,
        };
    }

    public function fromHttpStatus(int $statusCode): string
    {
        if ($statusCode >= 200 && $statusCode < 300) {
            return 203 === $statusCode
                ? Document::STATUS_ANALYSING
                : Document::STATUS_SENT;
        }

        return $this->resolve($statusCode);
    }

    public function fromException(Throwable $exception): string
    {
        $httpStatus = (int) $exception->getCode();

        if ($httpStatus >= 200 && $httpStatus < 300) {
            return Document::STATUS_ERROR_SENDING_FAILED;
        }

        return $this->fromHttpStatus($httpStatus);
    }
}
