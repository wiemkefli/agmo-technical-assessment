<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Arr;

class JobService
{
    public function create(User $employer, array $data): Job
    {
        $payload = $this->normalizePublishFields($data);

        return Job::create([
            'employer_id' => $employer->id,
            ...$payload,
        ]);
    }

    public function update(Job $job, array $data): Job
    {
        $payload = $this->normalizePublishFields($data, $job);

        $job->fill($payload);
        $job->save();

        return $job->refresh();
    }

    public function delete(Job $job): void
    {
        $job->delete();
    }

    protected function normalizePublishFields(array $data, ?Job $existing = null): array
    {
        $payload = Arr::only($data, [
            'title',
            'description',
            'location',
            'salary_min',
            'salary_max',
            'salary_currency',
            'salary_period',
            'is_remote',
            'status',
        ]);

        if (array_key_exists('status', $payload)) {
            if ($payload['status'] === 'published') {
                $payload['published_at'] = $existing?->published_at ?? now();
            }

            if ($payload['status'] === 'draft') {
                $payload['published_at'] = null;
            }
        }

        return $payload;
    }
}
