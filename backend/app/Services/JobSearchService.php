<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;

class JobSearchService
{
    public function applyFilters(Builder $query, array $filters): Builder
    {
        $q = isset($filters['q']) ? trim((string) $filters['q']) : null;
        if ($q !== null && $q !== '') {
            $query->where(function (Builder $sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('location', 'like', "%{$q}%");
            });
        }

        $location = isset($filters['location']) ? trim((string) $filters['location']) : null;
        if ($location !== null && $location !== '') {
            $query->where('location', 'like', "%{$location}%");
        }

        if (array_key_exists('is_remote', $filters) && $filters['is_remote'] !== null && $filters['is_remote'] !== '') {
            $query->where('is_remote', (bool) $filters['is_remote']);
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        $salaryMin = $this->toIntOrNull($filters['salary_min'] ?? null);
        $salaryMax = $this->toIntOrNull($filters['salary_max'] ?? null);

        if ($salaryMin !== null || $salaryMax !== null) {
            // When user filters salary, exclude jobs without any salary info.
            $query->where(function (Builder $sub) {
                $sub->whereNotNull('salary_min')->orWhereNotNull('salary_max');
            });
        }

        if ($salaryMin !== null) {
            $query->where(function (Builder $sub) use ($salaryMin) {
                $sub->where(function (Builder $q) use ($salaryMin) {
                    $q->whereNotNull('salary_max')->where('salary_max', '>=', $salaryMin);
                })->orWhere(function (Builder $q) use ($salaryMin) {
                    $q->whereNull('salary_max')->whereNotNull('salary_min')->where('salary_min', '>=', $salaryMin);
                })->orWhere(function (Builder $q) use ($salaryMin) {
                    $q->whereNotNull('salary_min')->where('salary_min', '>=', $salaryMin);
                });
            });
        }

        if ($salaryMax !== null) {
            $query->where(function (Builder $sub) use ($salaryMax) {
                $sub->where(function (Builder $q) use ($salaryMax) {
                    $q->whereNotNull('salary_min')->where('salary_min', '<=', $salaryMax);
                })->orWhere(function (Builder $q) use ($salaryMax) {
                    $q->whereNull('salary_min')->whereNotNull('salary_max')->where('salary_max', '<=', $salaryMax);
                })->orWhere(function (Builder $q) use ($salaryMax) {
                    $q->whereNotNull('salary_max')->where('salary_max', '<=', $salaryMax);
                });
            });
        }

        if (!empty($filters['salary_currency'])) {
            $query->where('salary_currency', $filters['salary_currency']);
        }

        if (!empty($filters['salary_period'])) {
            $query->where('salary_period', $filters['salary_period']);
        }

        return $query;
    }

    protected function toIntOrNull(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_int($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value;
        }

        return null;
    }
}

