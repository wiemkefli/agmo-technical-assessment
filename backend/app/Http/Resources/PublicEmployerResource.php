<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicEmployerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'company' => $this->name,
            'website' => $this->employerProfile?->website,
        ];
    }
}

