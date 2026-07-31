<?php

namespace APP\plugins\generic\compilatio\api\Client;

use RuntimeException;

final class CompilatioResponse
{
    public static function objectAt(object $response, string ...$path): object
    {
        $value = $response;
        $currentPath = [];

        foreach ($path as $property) {
            $currentPath[] = $property;
            $properties = get_object_vars($value);
            $nextValue = $properties[$property] ?? null;

            if (!is_object($nextValue)) {
                $caller = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1)[0] ?? [];
                $file = isset($caller['file']) && is_string($caller['file'])
                    ? self::relativeFile($caller['file'])
                    : 'unknown file';
                $line = isset($caller['line']) && is_int($caller['line'])
                    ? $caller['line']
                    : 0;

                throw new RuntimeException(sprintf(
                    'Compilatio API returned an invalid response at "%s" (%s:%d).',
                    implode('.', $currentPath),
                    $file,
                    $line
                ));
            }

            $value = $nextValue;
        }

        return $value;
    }

    /**
     * @return array<mixed>
     */
    public static function arrayAt(object $response, string ...$path): array
    {
        $value = $response;
        $currentPath = [];

        foreach ($path as $property) {
            $currentPath[] = $property;
            $properties = get_object_vars($value);
            $nextValue = $properties[$property] ?? null;
            $isLastProperty = count($currentPath) === count($path);

            if ($isLastProperty) {
                if (!is_array($nextValue)) {
                    self::throwInvalidResponse($currentPath, 'an array');
                }

                return $nextValue;
            }

            if (!is_object($nextValue)) {
                self::throwInvalidResponse($currentPath, 'an object');
            }

            $value = $nextValue;
        }

        self::throwInvalidResponse($path, 'an array');
    }

    /**
     * @param array<string> $path
     */
    private static function throwInvalidResponse(array $path, string $expectedType): never
    {
        $caller = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[1] ?? [];
        $file = isset($caller['file']) && is_string($caller['file'])
            ? self::relativeFile($caller['file'])
            : 'unknown file';
        $line = isset($caller['line']) && is_int($caller['line'])
            ? $caller['line']
            : 0;

        throw new RuntimeException(sprintf(
            'Compilatio API returned an invalid response at "%s": expected %s (%s:%d).',
            implode('.', $path),
            $expectedType,
            $file,
            $line
        ));
    }

    private static function relativeFile(string $file): string
    {
        $projectDirectory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR;

        return str_starts_with($file, $projectDirectory)
            ? substr($file, strlen($projectDirectory))
            : $file;
    }
}
