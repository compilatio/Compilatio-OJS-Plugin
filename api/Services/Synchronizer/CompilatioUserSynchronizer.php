<?php

/**
 * @file plugins/generic/compilatio/api/Services/Synchronizer/CompilatioUserSynchronizer.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioUserSynchronizer
 * @brief Synchronizes OJS users with Compilatio.
 */

namespace APP\plugins\generic\compilatio\api\Services\Synchronizer;

use APP\plugins\generic\compilatio\api\Repository\CompilatioUserRepository;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioLocaleResolver;
use PKP\user\User;
use RuntimeException;

final class CompilatioUserSynchronizer
{
    public function __construct(
        private CompilatioLocaleResolver $localeResolver,
        private CompilatioUserRepository $remoteUsers,
    ) {}

    public function syncUser(User $currentOJSUser): string
    {
        $locale = $this->localeResolver->resolve();
        $firstName = $currentOJSUser->getLocalizedGivenName();
        $lastName = $currentOJSUser->getLocalizedFamilyName();

        $compilatioUser = $this->remoteUsers->setUser(
            $firstName,
            $lastName,
            $currentOJSUser->getEmail(),
            $locale
        );

        $compilatioUserId = $compilatioUser->id ?? null;

        if (!isset($compilatioUserId) || !is_string($compilatioUserId)) {
            throw new RuntimeException(
                'Compilatio API returned a user without a valid ID.'
            );
        }

        return $compilatioUserId;
    }
}
