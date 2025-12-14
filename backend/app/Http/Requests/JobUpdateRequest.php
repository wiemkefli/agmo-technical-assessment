<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ParsesSalaryRange;
use Illuminate\Foundation\Http\FormRequest;

class JobUpdateRequest extends FormRequest
{
    use ParsesSalaryRange;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'salary_min' => ['sometimes', 'required', 'integer', 'min:0'],
            'salary_max' => ['sometimes', 'required', 'integer', 'min:0', 'gte:salary_min'],
            'salary_range' => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_remote' => ['sometimes', 'required', 'boolean'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,published'],
        ];
    }
}
