<?php

namespace APP\plugins\generic\compilatio;

use PKP\plugins\GenericPlugin;

class CompilatioPlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);

        if (!$success || !$this->getEnabled($mainContextId)) {
            return $success;
        }

        return $success;
    }

    public function getDisplayName(): string
    {
        return 'Compilatio';
    }

    public function getDescription(): string
    {
        return 'Intégration de Compilatio dans OJS.';
    }
}