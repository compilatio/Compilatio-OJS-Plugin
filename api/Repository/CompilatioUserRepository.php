<?php
namespace APP\plugins\generic\compilatio\api\Manager;
use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use RuntimeException;

class CompilatioUserRepository
{
    public function getCurrentUser(string $apiKey): object|bool
    {
        $client = new CompilatioClient($apiKey, new \GuzzleHttp\Client());
        try {
            $response = $client->get('private/user');

            if (!isset($response->data) ||
                !is_object($response->data) ||
                !isset($response->data->user) ||
                !is_object($response->data->user))
            {
                throw new RuntimeException('Compilatio API returned an invalid response.');
            }
            return $response->data->user;
        } catch (RuntimeException $exception) {
            if (401 === $exception->getCode()){
                return false;
            }

            throw $exception;
        }
    }
}