<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class JobUpdateRequest extends FormRequest
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
        // Allow PATCH with `salary_range` instead of explicit min/max fields.
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
