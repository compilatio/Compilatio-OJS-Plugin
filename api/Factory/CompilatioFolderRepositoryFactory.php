<?php

/**
 * @file plugins/generic/compilatio/api/Factory/CompilatioFolderRepositoryFactory.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioFolderRepositoryFactory
 * @brief Creates Compilatio folder repositories.
 */

namespace APP\plugins\generic\compilatio\api\Factory;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Repository\CompilatioFolderRepository;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;

final class CompilatioFolderRepositoryFactory
{
    public function __construct(
        private readonly ClientInterface $httpClient = new Client(),
    ) {
    }

    public function create(
        string $apiKey,
        ?string $userId = null,
    ): CompilatioFolderRepository {
        return new CompilatioFolderRepository(
            new CompilatioClient($apiKey, $this->httpClient, $userId)
        );
    }
}
