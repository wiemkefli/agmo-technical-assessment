<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobIndexRequest extends FormRequest
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

    public function perPage(int $default = 10, int $max = 50): int
    {
        $perPage = (int) $this->query('per_page', $default);

        return max(1, min($perPage, $max));
    }
}

