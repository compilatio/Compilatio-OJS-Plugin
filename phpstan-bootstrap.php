<?php

/**
 * @file plugins/generic/compilatio/phpstan-bootstrap.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @brief Loads the OJS environment for static analysis.
 */

declare(strict_types=1);

$ojsRoot = realpath(getenv('OJS_ROOT') ?: dirname(__DIR__, 3));

if ($ojsRoot === false || !is_file($ojsRoot . '/lib/pkp/lib/vendor/autoload.php')) {
    throw new RuntimeException(
        'OJS dependencies were not found. Set OJS_ROOT to an OJS installation containing lib/pkp/lib/vendor/autoload.php.'
    );
}

if (!chdir($ojsRoot)) {
    throw new RuntimeException(
        sprintf('Unable to use the OJS root directory "%s".', $ojsRoot)
    );
}

if (!defined('PKP_STRICT_MODE')) {
    define('PKP_STRICT_MODE', false);
}

if (!defined('INDEX_FILE_LOCATION')) {
    define('INDEX_FILE_LOCATION', $ojsRoot . '/index.php');
}

require_once $ojsRoot . '/lib/pkp/lib/vendor/autoload.php';
