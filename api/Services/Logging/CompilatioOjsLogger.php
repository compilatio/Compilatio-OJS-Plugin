<?php

namespace APP\plugins\generic\compilatio\api\Services\Logging;

use Illuminate\Support\Facades\Log;
use Throwable;

final class CompilatioOjsLogger
{
    /** @param array<string, mixed> $context */
    public static function log(string $level, string $message, array $context = []): void
    {
        try {
            Log::log($level, $message, $context);
        } catch (Throwable $exception) {
            // Some OJS versions can fail while creating Laravel's log channel so we log on error_log to keep trace.
            $details = json_encode($context, JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
            error_log(sprintf(
                '[Compilatio] %s: %s%s (OJS logger unavailable: %s)',
                strtoupper($level),
                $message,
                is_string($details) && '{}' !== $details ? ' ' . $details : '',
                $exception->getMessage(),
            ));
        }
    }
}
