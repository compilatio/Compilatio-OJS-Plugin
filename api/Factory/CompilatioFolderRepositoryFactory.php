<?php

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
