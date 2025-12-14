<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class JobQueryBuilder
{
    public function __construct(protected JobSearchService $jobSearchService)
    {
    }

    public function applyFilters(Builder $query, array $filters): Builder
    {
        return $this->jobSearchService->applyFilters($query, $filters);
    }

    public function applySort(
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

    public function paginate(Builder $query, int $perPage): LengthAwarePaginator
    {
        return $query->paginate($perPage);
    }
}

