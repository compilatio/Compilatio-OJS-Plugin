<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\DTO;

use APP\plugins\generic\compilatio\api\DTO\CompilatioDocument;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class CompilatioDocumentTest extends TestCase
{
    public function testBuildPreservesNumericStatusAndNestedAnalyses(): void
    {
        $analyses = [(object) ['state' => 'crashed']];
        $document = CompilatioDocument::build((object) [
            'id' => 'remote-123',
            'status' => 203,
            'analyses' => $analyses,
        ]);

        self::assertSame(203, $document->status);
        self::assertSame($analyses, $document->analyses);
    }

    public function testBuildRejectsMissingRemoteId(): void
    {
        $this->expectException(RuntimeException::class);

        CompilatioDocument::build((object) ['status' => 202]);
    }

    public function testBuildRejectsBadId(): void
    {
        $this->expectException(RuntimeException::class);
        CompilatioDocument::build((object) ['id' => 123]);
    }

    public function testBuildRejectsBadStatus(): void
    {
        $document = CompilatioDocument::build((object) [
            'id' => 'remote-123',
            'status' => ['invalid_status']
        ]);
        CompilatioDocument::build((object) ['id' => 'valid_id', 'status' => ['invalid_status']]);
        self::assertSame(null, $document->status);
    }
}
