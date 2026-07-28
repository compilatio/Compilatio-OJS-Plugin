<?php

namespace APP\plugins\generic\compilatio;

use APP\core\Application;
use APP\template\TemplateManager;
use PKP\core\JSONMessage;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\template\PKPTemplateManager;

class CompilatioPlugin extends GenericPlugin
{

    private const PLUGIN_NAME = 'Compilatio';
    private const PLUGIN_DESCRIPTION = 'Compilatio OJS Plugin for plagiarism detection';

    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);

        if (!$success || !$this->getEnabled($mainContextId)) {
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

        $templateMgr = TemplateManager::getManager($request);
        return new JSONMessage(true, $templateMgr->fetch($this->getTemplateResource('settings.tpl')));
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