<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\ResourceCollection;

class JobCollection extends ResourceCollection
{
    public $collects = JobResource::class;

    public function toArray($request): array
    {
        return [
            'data' => $this->collection,
        ];
    }

    public function with($request): array
    {
        if ($this->resource instanceof LengthAwarePaginator) {
            return [
                'meta' => [
                    'current_page' => $this->resource->currentPage(),
                    'last_page' => $this->resource->lastPage(),
                    'per_page' => $this->resource->perPage(),
                    'total' => $this->resource->total(),
                ],
            ];
        }

        return [];
    }
}

