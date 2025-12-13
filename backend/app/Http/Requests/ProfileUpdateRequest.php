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
        return [
            'company' => [
                Rule::requiredIf(fn () => $this->user()?->role === 'employer'),
                'nullable',
                'string',
                'min:2',
                'max:255',
            ],
        ];
    }
}
