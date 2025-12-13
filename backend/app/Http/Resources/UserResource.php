<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        $isSelf = (int) ($request->user()?->id ?? 0) === (int) $this->id;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'company' => $this->role === 'employer' ? $this->name : null,
            'website' => $this->employerProfile?->website,
            'phone' => $this->applicantProfile?->phone,
            'location' => $this->applicantProfile?->location,
            'resume' => $this->when(
                $isSelf && $this->role === 'applicant',
                fn () => [
                    'exists' => (bool) $this->applicantProfile?->resume_path,
                    'original_name' => $this->applicantProfile?->resume_original_name,
                    'mime' => $this->applicantProfile?->resume_mime,
                    'size' => $this->applicantProfile?->resume_size,
                ]
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
