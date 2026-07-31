<?php
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
