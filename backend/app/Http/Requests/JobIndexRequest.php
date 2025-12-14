<?php

namespace App\Http\Requests;

class JobIndexRequest extends PerPageRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_remote' => ['nullable', 'boolean'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'sort' => ['nullable', 'string', 'in:newest,oldest'],
        ];
    }

    /**
     * Filters to be applied to the jobs query (excludes sort).
     */
    public function jobFilters(): array
    {
        $filters = $this->validated();
        unset($filters['sort']);

        return $filters;
    }

    public function sort(): string
    {
        $validated = $this->validated();
        $sort = $validated['sort'] ?? 'newest';

        return $sort === 'oldest' ? 'oldest' : 'newest';
    }
}
