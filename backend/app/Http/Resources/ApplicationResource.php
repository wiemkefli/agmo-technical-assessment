<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray($request): array
    {
        $hasResume = (bool) $this->resume_path;

        return [
            'id' => $this->id,
            'job_id' => $this->job_id,
            'applicant_id' => $this->applicant_id,
            'message' => $this->message,
            'status' => $this->status,
            'has_resume' => $hasResume,
            'resume_original_name' => $this->resume_original_name,
            'resume_mime' => $this->resume_mime,
            'resume_size' => $this->resume_size,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'applicant' => new UserResource($this->whenLoaded('applicant')),
            'job' => new JobResource($this->whenLoaded('job')),
        ];
    }
}
