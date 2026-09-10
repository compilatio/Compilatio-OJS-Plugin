<?php

namespace APP\plugins\generic\compilatio\api\Client;

use APP\plugins\generic\compilatio\api\DTO\CompilatioResponse;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\RequestOptions;
use JsonException;
use Psr\Http\Message\ResponseInterface;
use RuntimeException;

class CompilatioClient
{
    private const API_BASE_URL = 'https://app.compilatio.net/api/';

    public function __construct(
        private readonly string $token,
        private readonly ClientInterface $httpClient,
        private readonly ?string $userId = null,
    ) {
    }

    /**
     * @return object
     */
    public function get(string $endpoint, bool $addUserId = false): object
    {
        $response = $this->request('GET', $endpoint, $addUserId);
        $this->assertSuccessfulResponse($response);
        return $this->checkJsonBody($response);
    }

    /**
     * @param array<string, mixed> $payload
     * @return object
     */
    public function post(string $endpoint, array $payload, bool $addUserId = false): object
    {
        $options = [
            RequestOptions::JSON => $payload,
        ];

        $response = $this->request('POST', $endpoint, $addUserId, $options);
        
        $this->assertSuccessfulResponse($response);
        return $this->checkJsonBody($response);
    }

    /**
     * @param array<int, array<string, mixed>> $payload
     * @return object
     */
    public function postFile(string $endpoint, array $payload, bool $addUserId = false): object
    {
        return $this->postFileWithStatus($endpoint, $payload, $addUserId)->body;
    }

    /**
     * @param array<int, array<string, mixed>> $payload
     */
    public function postFileWithStatus(
        string $endpoint,
        array $payload,
        bool $addUserId = false,
    ): CompilatioResponse
    {
        $options = [
            RequestOptions::MULTIPART => $payload
        ];

        $response = $this->request('POST', $endpoint, $addUserId, $options);
        $this->assertSuccessfulResponse($response);
        return new CompilatioResponse(
            statusCode: $response->getStatusCode(),
            body: $this->checkJsonBody($response),
        );
    }

    public function delete(string $endpoint, bool $addUserId = false): void
    {
        $response = $this->request('DELETE', $endpoint, $addUserId);

        if (404 === $response->getStatusCode()) {
            return;
        }
        $this->assertSuccessfulResponse($response);
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function patch(string $endpoint, array $payload, bool $addUserId = false): void
    {
        $options = [
            RequestOptions::JSON => $payload,
        ];

        $response = $this->request('PATCH', $endpoint, $addUserId, $options);
        $this->assertSuccessfulResponse($response);
    }

    /**
     * @param array<string, mixed> $options
     */
    private function request(string $method, string $endpoint, bool $addUserId, array $options = []): ResponseInterface
    {
        $options = $this->addAuthorizationHeader($options, $addUserId);

        return $this->sendRequest($method, $endpoint, $options);
    }

    /**
     * @param array<string, mixed> $options
     */
    private function sendRequest(string $method, string $endpoint, array $options = []): ResponseInterface
    {
        $options[RequestOptions::HTTP_ERRORS] = false;

        try {
            return $this->httpClient->request($method, self::API_BASE_URL . $endpoint, $options);
        } catch (RequestException $exception) {
            $response = $exception->getResponse();

            if ($response instanceof ResponseInterface) {
                return $response;
            }

            throw new RuntimeException('Unable to reach Compilatio API.', 0, $exception);
        } catch (GuzzleException $exception) {
            throw new RuntimeException('Unable to reach Compilatio API.', 0, $exception);
        }
    }

    /**
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    private function addAuthorizationHeader(array $options, bool $addUserId): array
    {
        $headers = $options[RequestOptions::HEADERS] ?? [];

        if (!is_array($headers)) {
            $headers = [];
        }

        $headers['X-Auth-Token'] = $this->token;

        if ($addUserId && $this->userId !== null) {
            $headers['X-LMS-USER-ID'] = $this->userId;
        }

        $options[RequestOptions::HEADERS] = $headers;

        return $options;
    }

    private function assertSuccessfulResponse(ResponseInterface $response): void
    {
        $statusCode = $response->getStatusCode();

        if ($statusCode < 200 || $statusCode >= 300) {
            $body = trim((string) $response->getBody());

            throw new RuntimeException(
                sprintf(
                    'Compilatio API returned status %d: %s',
                    $statusCode,
                    $body !== '' ? $body : $response->getReasonPhrase()
                ),
                $statusCode
            );
        }
    }

    private function checkJsonBody(ResponseInterface $response): object
    {
        try {
            $decodedResponse = json_decode((string) $response->getBody(), false, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('Compilatio API returned an invalid JSON payload.', 0, $exception);
        }

        if (!is_object($decodedResponse)) {
            throw new RuntimeException('Compilatio API returned an invalid JSON payload.');
        }

        return $decodedResponse;
    }
}
