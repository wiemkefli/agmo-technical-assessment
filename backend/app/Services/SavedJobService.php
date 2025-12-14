<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class SavedJobService
{
    public function paginate(User $user, int $perPage): LengthAwarePaginator
    {
        return $user
            ->savedJobs()
            ->where('jobs.status', 'published')
            ->with(['employer.employerProfile'])
            ->orderByDesc('saved_jobs.created_at')
            ->paginate($perPage);
    }

    public function ids(User $user): Collection
    {
        return $user
            ->savedJobs()
            ->where('jobs.status', 'published')
            ->orderByDesc('saved_jobs.created_at')
            ->pluck('jobs.id');
    }

    public function save(User $user, Job $job): Job
    {
        if ($job->status !== 'published') {
            throw ValidationException::withMessages([
                'job' => ['You can only save published jobs.'],
            ]);
        }

        $user->savedJobs()->syncWithoutDetaching([$job->id]);

        return $job->load(['employer.employerProfile']);
    }

    public function unsave(User $user, Job $job): void
    {
        $user->savedJobs()->detach($job->id);
    }
}

