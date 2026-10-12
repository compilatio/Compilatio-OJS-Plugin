<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\Services\Resolver;

use APP\plugins\generic\compilatio\api\DTO\CompilatioBundleAccess;
use APP\plugins\generic\compilatio\api\DTO\CompilatioDetection;
use APP\plugins\generic\compilatio\api\DTO\CompilatioManagedBundle;
use APP\plugins\generic\compilatio\api\DTO\CompilatioUser;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioBundleSettingsResolver;
use PHPUnit\Framework\TestCase;

final class CompilatioBundleSettingsResolverTest extends TestCase
{
    public function testRequestedChoicesAreUsedForStorageAndRemoteConfiguration(): void
    {
        $user = new CompilatioUser(new CompilatioManagedBundle('test', [
            new CompilatioBundleAccess(['folder-recipe-parameters'], [
                new CompilatioDetection('similarity', true, false),
                new CompilatioDetection('ai_detection', true, true),
            ]),
        ]));

        $settings = (new CompilatioBundleSettingsResolver())->resolve(
            $user,
            (object) ['bundleDetections' => ['ai_detection' => ['enabled' => true]]],
            ['ai_detection' => ['enabled' => false]],
        );

        self::assertTrue($settings->hasFolderRecipeParameters);
        self::assertSame([
            'similarity' => ['enabled' => true, 'configurable' => false],
            'ai_detection' => ['enabled' => false, 'configurable' => true],
        ], $settings->detections);
        self::assertSame([
            ['process' => 'ai_detection', 'enabled' => false, 'configurable' => true],
        ], $settings->recipeDetections);
    }

    public function testUnauthorizedBundleDoesNotProduceRemoteConfiguration(): void
    {
        $user = new CompilatioUser(new CompilatioManagedBundle('test', []));
        $settings = (new CompilatioBundleSettingsResolver())->resolve(
            $user,
            (object) [],
            ['ai_detection' => ['enabled' => true]],
        );

        self::assertFalse($settings->hasFolderRecipeParameters);
        self::assertNull($settings->detections);
        self::assertNull($settings->recipeDetections);
    }
}
