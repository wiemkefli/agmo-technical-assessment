<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ParsesSalaryRange;
use Illuminate\Foundation\Http\FormRequest;

class JobStoreRequest extends FormRequest
{
    use ParsesSalaryRange;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'salary_min' => ['required', 'integer', 'min:0'],
            'salary_max' => ['required', 'integer', 'min:0', 'gte:salary_min'],
            'salary_range' => ['nullable', 'string', 'max:50'],
            'is_remote' => ['required', 'boolean'],
            'status' => ['required', 'string', 'in:draft,published'],
        ];
    }
}
