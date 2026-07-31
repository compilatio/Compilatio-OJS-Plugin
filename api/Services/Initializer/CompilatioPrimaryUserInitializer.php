<?php
namespace APP\plugins\generic\compilatio\api\Services\Initializer;

use APP\plugins\generic\compilatio\api\Services\Synchronizer\CompilatioUserSynchronizer;
use APP\plugins\generic\compilatio\CompilatioPlugin;
use PKP\user\User;
use RuntimeException;


class CompilatioPrimaryUserInitializer
{
    public function __construct(
        private CompilatioPlugin $plugin,
        private CompilatioUserSynchronizer $userSynchronizer,
    ) {
    }

    public function initializeIfMissing(
        int $contextId,
        User $ojsUser,
    ): void {
        $currentCompilatioUserId = $this->plugin->getSetting(
            $contextId,
            'compilatioUserId'
        );

        if (
            $currentCompilatioUserId !== null
            && $currentCompilatioUserId !== ''
        ) {
            return;
        }

        $ojsUserId = $ojsUser->getId();

        if ($ojsUserId === null) {
            throw new RuntimeException(
                'Unable to retrieve the OJS user ID.'
            );
        }

        $compilatioUserId = $this->userSynchronizer->syncUser(
            $ojsUser
        );

        $this->plugin->updateSetting(
            $contextId,
            'compilatioUserId',
            $compilatioUserId,
            'string'
        );

        $this->plugin->updateSetting(
            $contextId,
            'primaryOjsUserId',
            $ojsUserId,
            'int'
        );
    }
}