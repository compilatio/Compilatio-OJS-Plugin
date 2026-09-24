<?php

namespace APP\plugins\generic\compilatio\api\Logger;

use JsonException;
use RuntimeException;
use Stringable;
use Throwable;

final class CompilatioDebugLogger
{
    private const LOG_DIRECTORY = __DIR__ . '/../../logs';
    private const LOG_FILE = self::LOG_DIRECTORY . '/compilatio.log';

    public static function log(string $label, mixed $value = null): void
    {
        try {
            if (!is_dir(self::LOG_DIRECTORY)) {
                mkdir(self::LOG_DIRECTORY, 0775, true);
            }

            $line = sprintf(
                "[%s] [pid:%d] %s: %s\n",
                date('Y-m-d H:i:s'),
                getmypid(),
                $label,
                self::format($value)
            );

            $writtenBytes = file_put_contents(self::LOG_FILE, $line, FILE_APPEND | LOCK_EX);
            if (false === $writtenBytes) {
                throw new RuntimeException('file_put_contents returned false for ' . self::LOG_FILE);
            }
        } catch (Throwable $exception) {
            error_log('[Compilatio] Unable to write plugin log: ' . $exception->getMessage());
        }
    }

    private static function format(mixed $value): string
    {
        if (is_array($value)) {
            try {
                return json_encode(
                    $value,
                    JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
                );
            } catch (JsonException) {
                return print_r($value, true);
            }
        }

        if ($value instanceof Stringable) {
            return (string) $value;
        }

        if (is_object($value)) {
            return sprintf('[object %s] %s', $value::class, print_r($value, true));
        }

        return var_export($value, true);
    }
}
