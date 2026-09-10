<?php

namespace APP\plugins\generic\compilatio\api\DTO;

final readonly class Analysis
{
    public function __construct(
        public bool $running,
        public ?string $state = null
    ) {}

    public static function build(object $analysis): self
    {
        $properties = get_object_vars($analysis);


        $running = $properties['running'] ?? false;
        $state = $properties['state'] ?? null;

        return new self(
            running: is_bool($running) ? $running : false,
            state: is_string($state) ? $state : null,
        );
    }
}
