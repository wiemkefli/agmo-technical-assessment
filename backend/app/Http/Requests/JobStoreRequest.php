<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class JobStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected ?bool $salaryRangeMatched = null;

    protected function parseSalaryRangeToMinMax(): void
    {
        $value = $this->input('salary_range');
        if ($value === null) {
            return;
        }

        $value = trim((string) $value);
        if ($value === '') {
            $this->salaryRangeMatched = false;
            return;
        }

        if (! preg_match('/^(\d+)\s*-\s*(\d+)$/', $value, $m)) {
            $this->salaryRangeMatched = false;
            return;
        }

        $this->salaryRangeMatched = true;

        $this->merge([
            'salary_min' => (int) $m[1],
            'salary_max' => (int) $m[2],
        ]);
    }

    protected function prepareForValidation(): void
    {
        // Allow clients (e.g. Postman) to provide `salary_range` instead of `salary_min`/`salary_max`.
        // Format: "min-max" (numbers only, optional spaces around the dash).
        if ($this->filled('salary_range') && (! $this->filled('salary_min') || ! $this->filled('salary_max'))) {
            $this->parseSalaryRangeToMinMax();
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('salary_range') && $this->salaryRangeMatched === false) {
                $validator->errors()->add('salary_range', 'Salary range must be in the format "min-max" (e.g. "3000-5000").');
            }
        });
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
