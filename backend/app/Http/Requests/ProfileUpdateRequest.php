<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isEmployer = $this->user()?->role === 'employer';

        return [
            'company' => [
                Rule::requiredIf(fn () => $isEmployer),
                Rule::prohibitedIf(fn () => ! $isEmployer),
                'string',
                'min:2',
                'max:255',
            ],
            'website' => [
                Rule::prohibitedIf(fn () => ! $isEmployer),
                'nullable',
                'url',
                'max:255',
            ],
            'phone' => [
                Rule::prohibitedIf(fn () => $isEmployer),
                'nullable',
                'string',
                'min:6',
                'max:30',
            ],
            'location' => [
                Rule::prohibitedIf(fn () => $isEmployer),
                'nullable',
                'string',
                'min:2',
                'max:255',
            ],
        ];
    }
}
