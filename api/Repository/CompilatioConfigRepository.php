<?php

/**
 * @file plugins/generic/compilatio/api/Repository/CompilatioConfigRepository.php
 *
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 *
 * @class CompilatioConfigRepository
 * @brief Retrieves configuration from the Compilatio API.
 */
namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use GuzzleHttp\Client;
use RuntimeException;

class CompilatioConfigRepository
{
    public function __construct(
        private readonly string $apiKey
    ){}
    
    public function get(): object
    {
        $client = new CompilatioClient($this->apiKey, new Client());
        try {
            $configurationlmsresponse = $client->get('public/configuration-lms');
            $configurationresponse = $client->get('public/configuration');

            $lmsConfiguration = CompilatioResponse::objectAt(
                $configurationlmsresponse,
                'data'
            );
            $configuration = CompilatioResponse::objectAt(
                $configurationresponse,
                'data'
            );

            return (object) array_merge(
                get_object_vars($lmsConfiguration),
                get_object_vars($configuration)
            );
        } catch (RuntimeException $exception) {
            throw $exception;
        }
    }
}
