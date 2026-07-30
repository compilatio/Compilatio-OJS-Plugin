<?php
namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use RuntimeException;

class CompilatioUserRepository
{
    public function __construct(
        private readonly string $apiKey
    ){}
    
    public function getApiKeyOwnerUser(): object
    {
        $client = new CompilatioClient($this->apiKey, new \GuzzleHttp\Client());
        try {
            $response = $client->get('private/user');

            return CompilatioResponse::objectAt($response, 'data', 'user');
        } catch (RuntimeException $exception) {
            throw $exception;
        }
    }

    public function setUser(string $firstName, string $lastName, string $email, string $locale): object
    {
        $client = new CompilatioClient($this->apiKey, new \GuzzleHttp\Client());
        try {
            $response = $client->post('private/user', [
                'firstname' => $firstName,
                'lastname' => $lastName,
                'email' => $email,
                'locale' => [
                    'timezone' => date_default_timezone_get(),
                    'lang' => $locale,
                ],
            ]);
            return CompilatioResponse::objectAt($response, 'data', 'user');
        } catch (RuntimeException $exception) {
            throw $exception;
        }
    }
}
