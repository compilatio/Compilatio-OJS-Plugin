<?php

namespace APP\plugins\generic\compilatio;

use APP\core\Application;
use APP\facades\Repo;
use APP\plugins\generic\compilatio\api\Cron\FetchAnalysisStatus;
use APP\plugins\generic\compilatio\api\CompilatioSettingsController;
use APP\plugins\generic\compilatio\api\CompilatioDocumentController;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentSubmissionHandler;
use APP\plugins\generic\compilatio\api\Services\Handler\DocumentDeletionHandler;
use APP\plugins\generic\compilatio\api\Logger\CompilatioDebugLogger;
use APP\plugins\generic\compilatio\migration\CompilatioSchemaMigration;
use APP\template\TemplateManager;
use Illuminate\Support\Facades\Event;
use PKP\core\APIRouter;
use PKP\core\JSONMessage;
use PKP\facades\Locale;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\plugins\interfaces\HasTaskScheduler;
use PKP\observers\events\SubmissionSubmitted;
use PKP\scheduledTask\PKPScheduler;
use PKP\security\Role;
use PKP\submissionFile\SubmissionFile;
use PKP\template\PKPTemplateManager;
use PKP\user\User;

class CompilatioPlugin extends GenericPlugin implements HasTaskScheduler
{

    private const PLUGIN_NAME = 'Compilatio';
    private const PLUGIN_DESCRIPTION = 'Compilatio OJS Plugin for plagiarism detection';

    public function register($category, $path, $mainContextId = null)
    {
        if (!parent::register($category, $path, $mainContextId)) {
            return false;
        }

        $this->addLocaleData();

        Hook::add('APIHandler::endpoints::plugin', [$this, 'registerApiControllers']);
        Hook::add('TemplateManager::display', [$this, 'addAssets']);
        Hook::add('SubmissionFile::delete::before', [$this, 'handleFileDeletion']);
        Event::listen(SubmissionSubmitted::class, [$this, 'handleSubmissionSubmitted']);

        return true;
    }

    public function getDisplayName(): string
    {
        return self::PLUGIN_NAME;
    }

    public function getDescription(): string
    {
        return self::PLUGIN_DESCRIPTION;
    }

    public function registerSchedules(PKPScheduler $scheduler): void
    {
        $scheduler
            ->addSchedule(new FetchAnalysisStatus($this))
            ->everyFiveMinutes()
            ->name(FetchAnalysisStatus::class)
            ->withoutOverlapping();
    }

    /**
     * @param array<string, mixed> $verb
     * @return array<int, LinkAction>
     */
    public function getActions($request, $verb): array
    {
        $router = $request->getRouter();
        /** @var array<int, LinkAction> $actions */
        $actions = parent::getActions($request, $verb);

        if (!isset($router)) {
            return $actions;
        }


        if (!$this->getEnabled()) {
            return $actions;
        }

        $title = __('manager.plugins.settings');
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
            is_string($title) ? $title : 'Settings',
        ));

        return $actions;
    }

    /** @param array<string, mixed> $args */
    public function manage($args, $request): JSONMessage
    {
        if ($request->getUserVar('verb') !== 'settings') {
            return parent::manage($args, $request);
        }

        $context = $request->getContext();
        $user = $request->getUser();

        $contextId = $context ? $context->getId() : null;

        if (!$context || !$user || !is_int($contextId) || !$this->canManageSettings($user, $contextId)) {
            $title = __('user.authorization.roleBasedAccessDenied');
            return new JSONMessage(false, is_string($title) ? $title : 'Access denied');
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

    public function registerApiControllers(string $hookName, APIRouter $apiRouter): bool
    {
        require_once __DIR__ . '/api/CompilatioSettingsRequest.php';
        require_once __DIR__ . '/api/CompilatioSettingsController.php';
        require_once __DIR__ . '/api/CompilatioDocumentController.php';

        $apiRouter->registerPluginApiControllers([
            new CompilatioSettingsController($this),
            new CompilatioDocumentController($this),
        ]);

        return false;
    }

    /** @param array<string, mixed> $args */
    public function addAssets(string $hookName, array $args): bool
    {
        $request = Application::get()->getRequest();
        $context = $request->getContext();
        $contextId = $context?->getId();

        if (!is_int($contextId) || !$this->getEnabled($contextId)) {
            return false;
        }

        /** @var PKPTemplateManager $templateMgr */
        $templateMgr = &$args[0];

        $baseUrl = $request->getBaseUrl();
        $pluginPath = $this->getPluginPath();

        $jsFile = __DIR__ . '/view/build/PlagiarismPanel.runtime.js';
        $cssFile = __DIR__ . '/view/build/style.css';
        $documentStatusJsFile = __DIR__ . '/view/compilatioDocumentStatus.js';
        $documentsApiJsFile = __DIR__ . '/view/compilatioDocumentsApi.js';
        $documentsTableJsFile = __DIR__ . '/view/compilatioDocumentsTable.js';
        $documentActionsJsFile = __DIR__ . '/view/compilatioDocumentActions.js';
        $documentsJsFile = __DIR__ . '/view/compilatioDocuments.js';
        $documentsCssFile = __DIR__ . '/view/compilatioDocuments.css';
        $documentsApiUrl = $request->getDispatcher()->url(
            $request,
            Application::ROUTE_API,
            $context->getPath(),
            'plugins/compilatio/documents',
        );

        $templateMgr->addJavaScript(
            'compilatioDocumentsConfig',
            'window.pkpCompilatioDocuments = '
                . json_encode([
                    'apiUrl' => $documentsApiUrl,
                    'locale' => Locale::getLocale(),
                    'messages' => [
                        'retry' => __('plugins.generic.compilatio.documents.retry'),
                        'launch' => __('plugins.generic.compilatio.documents.launch'),
                        'report' => __('plugins.generic.compilatio.documents.report'),
                        'reportMissing' => __('plugins.generic.compilatio.documents.reportMissing'),
                        'reportBlocked' => __('plugins.generic.compilatio.documents.reportBlocked'),
                        'apiError' => __('plugins.generic.compilatio.documents.apiError'),
                        'analysing' => __('plugins.generic.compilatio.documents.analysing'),
                    ],
                ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
                . ';',
            ['contexts' => ['backend'], 'inline' => true]
        );

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

        $templateMgr->addJavaScript(
            'compilatioDocumentStatus',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocumentStatus.js?v=' . filemtime($documentStatusJsFile),
            ['contexts' => ['backend']]
        );

        $templateMgr->addJavaScript(
            'compilatioDocumentsApi',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocumentsApi.js?v=' . filemtime($documentsApiJsFile),
            ['contexts' => ['backend']]
        );

        $templateMgr->addJavaScript(
            'compilatioDocumentsTable',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocumentsTable.js?v=' . filemtime($documentsTableJsFile),
            ['contexts' => ['backend']]
        );

        $templateMgr->addJavaScript(
            'compilatioDocumentActions',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocumentActions.js?v=' . filemtime($documentActionsJsFile),
            ['contexts' => ['backend']]
        );

        $templateMgr->addJavaScript(
            'compilatioDocuments',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocuments.js?v=' . filemtime($documentsJsFile),
            [
                'contexts' => ['backend'],
                'priority' => PKPTemplateManager::STYLE_SEQUENCE_LATE,
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

        $templateMgr->addStyleSheet(
            'compilatioDocuments',
            $baseUrl . '/' . $pluginPath
                . '/view/compilatioDocuments.css?v=' . filemtime($documentsCssFile),
            ['contexts' => ['backend']]
        );

        return false;
    }

    public function handleSubmissionSubmitted(SubmissionSubmitted $event): void
    {
        $contextId = $event->context->getId();
        if (!$contextId || !$this->getEnabled($contextId)) {
            return;
        }

        $submission = $event->submission;
        $submissionFiles = Repo::submissionFile()
            ->getCollector()
            ->filterBySubmissionIds([$submission->getId()])
            ->filterByFileStages([SubmissionFile::SUBMISSION_FILE_SUBMISSION])
            ->getMany();

        $documentSubmissionHandler = new DocumentSubmissionHandler($this);
        foreach ($submissionFiles as $submissionFile) {
            CompilatioDebugLogger::log('SubmissionSubmitted', [
                'contextId' => $contextId,
                'submissionId' => $submission->getId(),
                'submissionFileId' => $submissionFile->getId(),
                'fileId' => $submissionFile->getData('fileId'),
                'fileStage' => $submissionFile->getData('fileStage'),
                'genreId' => $submissionFile->getData('genreId'),
                'uploaderUserId' => $submissionFile->getData('uploaderUserId'),
            ]);

            $documentSubmissionHandler->handle(
                $submission,
                $submissionFile,
                $contextId,
            );
        }
    }

    /** @param array{0: SubmissionFile} $args */
    public function handleFileDeletion(string $hookName, array $args): bool
    {
        /** @var SubmissionFile $submissionFile */
        $submissionFile = $args[0];

        (new DocumentDeletionHandler($this))->handle($submissionFile);

        return false;
    }

    public function getInstallMigration(): CompilatioSchemaMigration
    {
        return new CompilatioSchemaMigration();
    }

    private function canManageSettings(User $user, int $contextId): bool
    {
        /** @var Role[] $roles */
        $roles = array_merge($user->getRoles($contextId), $user->getRoles(null));
        $roleIds = array_map(static fn($role) => $role->getRoleId(), $roles);

        return (bool) array_intersect(
            [Role::ROLE_ID_MANAGER, Role::ROLE_ID_SITE_ADMIN],
            $roleIds
        );
    }
}
