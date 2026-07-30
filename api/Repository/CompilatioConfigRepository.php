<?php
namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use RuntimeException;

class CompilatioConfigRepository
{
    public function __construct(
        private readonly string $apiKey
    ){}
    
    public function get(): object
    {
        $client = new CompilatioClient($this->apiKey, new \GuzzleHttp\Client());
        try {
            $configurationlmsresponse = $client->get('public/configuration-lms');
            $configurationresponse = $client->get('public/configuration');

            CompilatioResponse::objectAt($configurationlmsresponse, 'data');
            CompilatioResponse::objectAt($configurationresponse, 'data');

            return (object) array_merge((array) $configurationlmsresponse->data, (array) $configurationresponse->data);
        } catch (RuntimeException $exception) {
            throw $exception;
        }
    }
}
