<?php

declare(strict_types=1);

namespace APP\plugins\generic\compilatio\api\test\Services\Resolver;

use APP\plugins\generic\compilatio\api\DTO\Document;
use APP\plugins\generic\compilatio\api\Services\Resolver\CompilatioDocumentStatusResolver;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class CompilatioDocumentStatusResolverTest extends TestCase
{
    public function testNumericAndStringAnalysisStatusMeanAnalysing(): void
    {
        $resolver = new CompilatioDocumentStatusResolver();

        self::assertSame(Document::STATUS_ANALYSING, $resolver->resolve(203));
        self::assertSame(Document::STATUS_ANALYSING, $resolver->resolve('203'));
        self::assertSame(Document::STATUS_ANALYSING, $resolver->fromHttpStatus(203));
    }

    public function testQueueAndCompletedStatesAreMapped(): void
    {
        $resolver = new CompilatioDocumentStatusResolver();

        self::assertSame(Document::STATUS_QUEUE, $resolver->resolve('In queue'));
        self::assertSame(Document::STATUS_SCORED, $resolver->resolve('Analyzed'));
    }

    public function testUnknownStatusFallsBackToSendingError(): void
    {
        $resolver = new CompilatioDocumentStatusResolver();

        self::assertNull($resolver->tryResolve('unknown'));
        self::assertSame(Document::STATUS_ERROR_SENDING_FAILED, $resolver->resolve('unknown'));
        self::assertSame(
            Document::STATUS_ERROR_ANALYSIS_FAILED,
            $resolver->fromException(new RuntimeException('Analysis failed', 418)),
        );
    }
}
