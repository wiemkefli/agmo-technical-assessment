<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'salary_currency' => ['nullable', 'string', 'size:3', 'required_with:salary_min,salary_max'],
            'salary_period' => ['nullable', 'string', 'in:month,year', 'required_with:salary_min,salary_max'],
            'is_remote' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'string', 'in:draft,published'],
        ];
    }
}
