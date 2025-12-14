<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ApplicationCollection extends ResourceCollection
{
    public $collects = ApplicationResource::class;

    public function toArray($request): array
    {
        return [
            'data' => $this->collection,
        ];
    }
}

