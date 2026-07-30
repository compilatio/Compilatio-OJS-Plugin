<?php
namespace APP\plugins\generic\compilatio\api\Services;

use PKP\user\User;
use APP\plugins\generic\compilatio\api\Repository\CompilatioUserRepository;
use RuntimeException;
use InvalidArgumentException;

final class CompilatioUserSynchronizer
{
    public function __construct(
        private CompilatioLocaleResolver $localeResolver,
        private CompilatioUserRepository $remoteUsers,
    ) {}

    public function syncUser(?User $currentOJSUser): string
    {
        if ($currentOJSUser === null) {
            throw new InvalidArgumentException('OJS user cannot be null.');
        }

        $locale = $this->localeResolver->resolve();

        $compilatioUser = $this->remoteUsers->setUser(
            $currentOJSUser->getGivenName($locale),
            $currentOJSUser->getFamilyName($locale),
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
