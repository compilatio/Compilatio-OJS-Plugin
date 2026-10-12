<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\Class;

use APP\plugins\generic\compilatio\api\Class\Bundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioBundleAccess;
use APP\plugins\generic\compilatio\api\DTO\CompilatioDetection;
use APP\plugins\generic\compilatio\api\DTO\CompilatioManagedBundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioUser;
use PHPUnit\Framework\TestCase;

final class BundleTest extends TestCase
{
    public function testGetBundleDetectionsAppliesOnlyAllowedAndConfigurableChoices(): void
    {
        $bundle = $this->createBundle([
            new CompilatioDetection('similarity', true, false),
            new CompilatioDetection('ai_detection', false, true),
            new CompilatioDetection('spellchecker', false, false),
            new CompilatioDetection('unknown_process', true, true),
        ]);

        $detections = $bundle->getBundleDetections((object) [
            'bundleDetections' =>  [
                'ai_detection' =>  ['enabled' => 'true'],
                'spellchecker' => ['enabled' => true],
                'unknown_process' => ['enabled' => true],
            ],
        ]);

        self::assertSame(['similarity', 'ai_detection', 'spellchecker'], array_map(
            static fn(CompilatioDetection $detection): string => $detection->process,
            $detections,
        ));
        self::assertSame([true, true, false], array_map(
            static fn(CompilatioDetection $detection): bool => $detection->enabled,
            $detections,
        ));
    }

    public function testGetBundleDetectionsNoValidBundleDetectionsProvided(): void
    {
        $bundle = $this->createBundle([]);

        $detections = $bundle->getBundleDetections((object) [
            'notABundleDetections' => [],
        ]);
        self::assertSame([], $detections);

        $detections = $bundle->getBundleDetections((object) [
            'bundleDetections' => 'notArray',
        ]);
        self::assertSame([], $detections);

        $detections = $bundle->getBundleDetections((object) [
            'bundleDetections' => [],
        ]);
        self::assertSame([], $detections);

        $bundle = $this->createBundle([new CompilatioDetection('unknown_process', true, true)]);
        $detections = $bundle->getBundleDetections((object) [
            'bundleDetections' => ['unknown_process' => ['enabled' => true]],
        ]);
        self::assertSame([], $detections);
    }

    public function testGetBundleDetectionsKeepsDefaultsForMissingOrInvalidSettings(): void
    {
        $bundle = $this->createBundle([
            new CompilatioDetection('ai_detection', true, true),
        ]);

        $detections = $bundle->getBundleDetections((object) [
            'bundleDetections' => ['ai_detection' => 'invalid'],
        ]);

        self::assertTrue($detections[0]->enabled);
    }

    public function testFolderPayloadExcludesSimilarityAndUnavailableDetectionsFromApi(): void
    {
        $bundle = $this->createBundle([
            new CompilatioDetection('similarity', true, true),
            new CompilatioDetection('ai_detection', true, true),
            new CompilatioDetection('spellchecker', false, false),
            new CompilatioDetection('rewording', true, true),
        ]);

        $payload = $bundle->getFolderDetectionsPayload((object) [
            'bundleDetections' => ['rewording' => ['enabled' => false]],
        ]);

        self::assertSame([
            ['process' => 'ai_detection', 'enabled' => true, 'configurable' => true],
            ['process' => 'rewording', 'enabled' => false, 'configurable' => true],
        ], $payload['api']);

        self::assertSame([
            'similarity' => ['enabled' => true, 'configurable' => true],
            'ai_detection' => ['enabled' => true, 'configurable' => true],
            'spellchecker' => ['enabled' => false, 'configurable' => false],
            'rewording' => ['enabled' => false, 'configurable' => true],
        ], $payload['stored']);
    }

    public function testFeatureAuthorizationUsesBundleAccesses(): void
    {
        $bundle = $this->createBundle([], ['folder-recipe-parameters']);

        self::assertTrue($bundle->isBundleAuthorizedTo('folder-recipe-parameters'));
        self::assertFalse($bundle->isBundleAuthorizedTo('unknown-feature'));
    }

    /**
     * @param list<CompilatioDetection> $detections
     * @param list<string> $features
     */
    private function createBundle(array $detections, array $features = []): Bundle
    {
        $access = new CompilatioBundleAccess($features, $detections);
        $managedBundle = new CompilatioManagedBundle('test', [$access]);

        return new Bundle(new CompilatioUser($managedBundle));
    }
}
