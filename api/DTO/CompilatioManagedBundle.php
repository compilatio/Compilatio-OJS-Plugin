<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioManagedBundle
{
    /**
     * @param list<CompilatioBundleAccess> $accesses
     */
    public function __construct(
        public readonly string $name,
        public readonly array $accesses,
    ) {
    }
}
