<?php

namespace APP\plugins\generic\compilatio;

use APP\core\Application;
use APP\plugins\generic\compilatio\api\CompilatioSettingsController;
use APP\template\TemplateManager;
use PKP\core\JSONMessage;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\security\Role;
use PKP\template\PKPTemplateManager;

class CompilatioPlugin extends GenericPlugin
{

    private const PLUGIN_NAME = 'Compilatio';
    private const PLUGIN_DESCRIPTION = 'Compilatio OJS Plugin for plagiarism detection';

    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);

        if (!$success) {
            return $success;
        }

        Hook::add('APIHandler::endpoints::plugin', [$this, 'registerApiControllers']);

        if (!$this->getEnabled($mainContextId)) {
            return $success;
        }

        Hook::add('TemplateManager::display', [$this, 'addAssets']);

        return $success;
    }

    public function getDisplayName(): string
    {
        return self::PLUGIN_NAME;
    }

    public function getDescription(): string
    {
        return self::PLUGIN_DESCRIPTION;
    }

    public function getActions($request, $verb): array
    {
        $router = $request->getRouter();
        $actions = parent::getActions($request, $verb);

        if (!$this->getEnabled()) {
            return $actions;
        }

        array_unshift($actions, new LinkAction(
            'settings',
            new AjaxModal(
                $router->url($request, null, null, 'manage', null, [
                    'verb' => 'settings',
                    'plugin' => $this->getName(),
                    'category' => 'generic',
                ]),
                $this->getDisplayName()
            ),
            __('manager.plugins.settings')
        ));

        return $actions;
    }
    
    public function manage($args, $request): JSONMessage
    {
        if ($request->getUserVar('verb') !== 'settings') {
            return parent::manage($args, $request);
        }

        $context = $request->getContext();
        $user = $request->getUser();

        if (!$context || !$user || !$this->canManageSettings($user, $context->getId())) {
            return new JSONMessage(false, __('user.authorization.roleBasedAccessDenied'));
        }

        $templateMgr = TemplateManager::getManager($request);
        $templateMgr->assign([
            'compilatioSettingsApiUrl' => $request->getDispatcher()->url(
                $request,
                Application::ROUTE_API,
                $context->getPath(),
                'plugins/compilatio/settings'
            ),
            'compilatioCsrfToken' => $request->getSession()->token(),
        ]);

        return new JSONMessage(
            true,
            $templateMgr->fetch($this->getTemplateResource('settings.tpl'))
        );
    }

    private function canManageSettings($user, int $contextId): bool
    {
        $roles = array_merge($user->getRoles($contextId), $user->getRoles(null));
        $roleIds = array_map(static fn ($role) => $role->getRoleId(), $roles);

        return (bool) array_intersect(
            [Role::ROLE_ID_MANAGER, Role::ROLE_ID_SITE_ADMIN],
            $roleIds
        );
    }

    public function registerApiControllers(string $hookName, $apiRouter): bool
    {
        require_once __DIR__ . '/api/CompilatioSettingsRequest.php';
        require_once __DIR__ . '/api/CompilatioSettingsController.php';

        $apiRouter->registerPluginApiControllers([
            new CompilatioSettingsController($this),
        ]);

        return false;
    }

    public function addAssets(string $hookName, array $args): bool
    {
        /** @var PKPTemplateManager $templateMgr */
        $templateMgr = &$args[0];

        $request = Application::get()->getRequest();
        $baseUrl = $request->getBaseUrl();
        $pluginPath = $this->getPluginPath();

        $jsFile = __DIR__ . '/view/build/PlagiarismPanel.runtime.js';
        $cssFile = __DIR__ . '/view/build/style.css';

        $templateMgr->addJavaScript(
            'compilatioSettingsPanel',
            $baseUrl . '/' . $pluginPath
                . '/view/build/PlagiarismPanel.runtime.js?v='
                .  filemtime($jsFile),
            [
                'contexts' => ['backend'],
                'priority' => PKPTemplateManager::STYLE_SEQUENCE_LAST,
            ]
        );

        $templateMgr->addStyleSheet(
            'compilatioTailwind',
            $baseUrl . '/' . $pluginPath
                . '/view/build/style.css?v='
                . filemtime($cssFile),
            [
                'contexts' => ['backend'],
            ]
        );

        return false;
    }
}
