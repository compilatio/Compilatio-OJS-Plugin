<?php

namespace APP\plugins\generic\compilatio\api\DTO;

use RuntimeException;

final readonly class CompilatioDocument
{
    public function __construct(
        public string $id,
        public string|int|null $status,
        public ?string $lightReports,
        public ?string $state,
        public mixed $analyses,
    ) {}

    public static function build(object $document): self
    {
        $properties = get_object_vars($document);
        $id = $properties['id'] ?? null;

        if (!is_string($id) || '' === $id) {
            throw new RuntimeException('Compilatio returned a document without an ID.');
        }

        $status = $properties['status'] ?? null;
        if (!is_string($status) && !is_int($status)) {
            $status = null;
        }

        $state = $properties['state'] ?? null;
        $analyses = $properties['analyses'] ?? null;

        $lightReports = isset($properties['light_reports'])
            ? json_encode(
                $properties['light_reports'],
                JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
            )
            : null;

        return new self(
            id: $id,
            status: $status,
            lightReports: $lightReports,
            analyses: $analyses,
            state: is_string($state) ? $state : null,
        );
    }
}
