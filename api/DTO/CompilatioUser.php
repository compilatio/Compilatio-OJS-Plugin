<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final class CompilatioUser
{
    public function __construct(
        public readonly CompilatioManagedBundle $managedBundle,
    ) {
    }
}
