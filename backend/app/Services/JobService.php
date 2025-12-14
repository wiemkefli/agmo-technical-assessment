<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class JobService
{
    public function __construct(protected JobSearchService $jobSearchService)
    {
    }

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

    public function searchPublished(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Job::query()
            ->where('status', 'published')
            ->with(['employer.employerProfile']);

        $this->jobSearchService->applyFilters($query, $filters);
        $this->applySort($query, $sort, 'published_at');

        return $query->paginate($perPage);
    }

    public function searchEmployer(User $employer, array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Job::query()
            ->where('employer_id', $employer->id)
            ->with(['employer.employerProfile']);

        $this->jobSearchService->applyFilters($query, $filters);
        $this->applySort($query, $sort, 'created_at');

        return $query->paginate($perPage);
    }

    protected function applySort(
        Builder $query,
        string $sort,
        string $timestampColumn,
        string $tieBreakerColumn = 'id'
    ): Builder
    {
        if ($sort === 'oldest') {
            $query->orderBy($timestampColumn)->orderBy($tieBreakerColumn);
        } else {
            $query->orderByDesc($timestampColumn)->orderByDesc($tieBreakerColumn);
        }

        return $query;
    }

    protected function normalizePublishFields(array $data, ?Job $existing = null): array
    {
        $payload = Arr::only($data, [
            'title',
            'description',
            'location',
            'salary_min',
            'salary_max',
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
