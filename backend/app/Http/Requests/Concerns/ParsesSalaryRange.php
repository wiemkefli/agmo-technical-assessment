<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

trait ParsesSalaryRange
{
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

        if (! preg_match('/^(\\d+)\\s*-\\s*(\\d+)$/', $value, $m)) {
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
        // Allow clients to provide `salary_range` instead of `salary_min`/`salary_max`.
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
}

