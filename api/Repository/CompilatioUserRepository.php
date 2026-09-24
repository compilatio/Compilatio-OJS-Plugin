<?php
namespace APP\plugins\generic\compilatio\api\Repository;

use APP\plugins\generic\compilatio\api\Client\CompilatioClient;
use APP\plugins\generic\compilatio\api\Client\CompilatioResponse;
use APP\plugins\generic\compilatio\api\DTO\CompilatioBundleAccess;
use APP\plugins\generic\compilatio\api\DTO\CompilatioDetection;
use APP\plugins\generic\compilatio\api\DTO\CompilatioManagedBundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioUser;
use RuntimeException;

class CompilatioUserRepository
{
    public function __construct(
        private readonly string $apiKey
    ){}
    
    public function getApiKeyOwnerUser(): CompilatioUser
    {
        $client = new CompilatioClient($this->apiKey, new \GuzzleHttp\Client());
        try {
            $response = $client->get('private/user');
            $user = CompilatioResponse::objectAt($response, 'data', 'user');

            return $this->mapApiKeyOwnerUser($user);
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

    private function mapApiKeyOwnerUser(object $user): CompilatioUser
    {
        $managedBundle = CompilatioResponse::objectAt(
            $user,
            'managed_bundle'
        );
        $managedBundleProperties = get_object_vars($managedBundle);
        $name = $managedBundleProperties['name'] ?? null;

        if (!is_string($name)) {
            throw new RuntimeException(
                'Compilatio API returned a user without a valid managed bundle name.'
            );
        }

        $rawAccesses = CompilatioResponse::arrayAt($managedBundle, 'accesses');
        $accesses = [];

        foreach ($rawAccesses as $access) {
            if (!is_object($access)) {
                throw new RuntimeException(
                    'Compilatio API returned a managed bundle with an invalid access.'
                );
            }

            $accesses[] = $this->mapBundleAccess($access);
        }

        return new CompilatioUser(
            new CompilatioManagedBundle($name, $accesses)
        );
    }

    private function mapBundleAccess(object $access): CompilatioBundleAccess
    {
        $properties = get_object_vars($access);

        return new CompilatioBundleAccess(
            $this->mapAuthorizedFeatures($properties['authorized_features'] ?? null),
            $this->mapDetections($properties['detections'] ?? null),
        );
    }

    /**
     * @return list<string>|null
     */
    private function mapAuthorizedFeatures(mixed $value): ?array
    {
        if (null === $value) {
            return null;
        }

        if (!is_array($value)) {
            throw new RuntimeException(
                'Compilatio API returned invalid authorized features.'
            );
        }

        $features = [];

        foreach ($value as $feature) {
            if (!is_string($feature)) {
                throw new RuntimeException(
                    'Compilatio API returned an invalid authorized feature.'
                );
            }

            $features[] = $feature;
        }

        return $features;
    }

    /**
     * @return list<CompilatioDetection>|null
     */
    private function mapDetections(mixed $value): ?array
    {
        if (null === $value) {
            return null;
        }

        if (!is_array($value)) {
            throw new RuntimeException(
                'Compilatio API returned invalid bundle detections.'
            );
        }

        $detections = [];

        foreach ($value as $detection) {
            if (!is_object($detection)) {
                throw new RuntimeException(
                    'Compilatio API returned an invalid bundle detection.'
                );
            }

            $properties = get_object_vars($detection);
            $process = $properties['process'] ?? null;
            $enabled = $properties['enabled'] ?? null;
            $configurable = $properties['configurable'] ?? false;

            if (
                !is_string($process)
                || !is_bool($enabled)
                || !is_bool($configurable)
            ) {
                throw new RuntimeException(
                    'Compilatio API returned an invalid bundle detection.'
                );
            }

            $detections[] = new CompilatioDetection(
                $process,
                $enabled,
                $configurable,
            );
        }

        return $detections;
    }
}
