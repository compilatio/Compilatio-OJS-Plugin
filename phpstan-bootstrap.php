<?php

declare(strict_types=1);

$ojsRoot = dirname(__DIR__, 3);

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