<?php
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
