<?php

/**
 * @file plugins/generic/compilatio/api/Services/Resolver/CompilatioLocaleResolver.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioLocaleResolver
 * @brief Resolves the locale used for Compilatio users.
 */

namespace APP\plugins\generic\compilatio\api\Services\Resolver;

use APP\plugins\generic\compilatio\api\Repository\CompilatioConfigRepository;
use PKP\facades\Locale;

final class CompilatioLocaleResolver
{
    private const FALLBACK_LOCALE = 'en';

    public function __construct(
        private readonly CompilatioConfigRepository $configRepository
    ) {
    }

    public function resolve(): string
    {
        $ojsLanguage = substr(Locale::getLocale(), 0, 2);
        $config = $this->configRepository->get();
        $supportedLanguages = $config->supported_languages ?? null;

        if (!is_array($supportedLanguages)) {
            return self::FALLBACK_LOCALE;
        }

        return in_array($ojsLanguage, $supportedLanguages, true)
            ? $ojsLanguage
            : self::FALLBACK_LOCALE;
    }
}
