<?php

/**
 * @file plugins/generic/compilatio/api/Services/Resolver/CompilatioThresholdsResolver.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioThresholdsResolver
 * @brief Resolves document similarity thresholds.
 */

namespace APP\plugins\generic\compilatio\api\Services\Resolver;

final class CompilatioThresholdsResolver
{
    /** @return array{warning: int, critical: int} */
    public function resolve(mixed $value): array
    {
        $thresholds = is_array($value) ? $value : (array) $value;

        return [
            'warning' => $this->normalize($thresholds['warning'] ?? null, 10),
            'critical' => $this->normalize($thresholds['critical'] ?? null, 20),
        ];
    }

    private function normalize(mixed $value, int $default): int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        return $default;
    }
}
