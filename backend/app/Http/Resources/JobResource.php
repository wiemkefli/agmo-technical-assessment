<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray($request): array
    {
        $salaryMin = $this->salary_min;
        $salaryMax = $this->salary_max;

        $salaryRange = null;
        if ($salaryMin !== null && $salaryMax !== null) {
            $salaryRange = "{$salaryMin}-{$salaryMax}";
        } elseif ($salaryMin !== null) {
            $salaryRange = "{$salaryMin}-";
        } elseif ($salaryMax !== null) {
            $salaryRange = "-{$salaryMax}";
        }

        return [
            'id' => $this->id,
            'employer_id' => $this->employer_id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary_range' => $salaryRange,
            'is_remote' => (bool) $this->is_remote,
            'status' => $this->status,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'employer' => $this->whenLoaded('employer', fn () => new PublicEmployerResource($this->employer)),
        ];
    }
}
