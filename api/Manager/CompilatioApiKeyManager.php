<?php
namespace APP\plugins\generic\compilatio\api\Manager;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use RuntimeException;

class CompilatioApiKeyManager
{
    public function validateApiKey(string $apiKey): array|bool
    {
        $client = new CompilatioClient($apiKey, new \GuzzleHttp\Client());
        try {
            return $client->get('private/user');

        } catch (RuntimeException $exception) {
            if (401 === $exception->getCode()){
                return false;
            }

            throw $exception;
        }
    }
}