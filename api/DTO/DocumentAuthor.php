<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class DocumentAuthor
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
    ) {
    }
}
