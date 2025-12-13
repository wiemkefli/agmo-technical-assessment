<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $useProfileResume = $this->boolean('use_profile_resume');

        return [
            'message' => ['required', 'string'],
            'use_profile_resume' => ['nullable', 'boolean'],
            // 5MB max, PDF only.
            'resume' => [
                Rule::prohibitedIf(fn () => $useProfileResume),
                'nullable',
                'file',
                'mimes:pdf',
                'max:5120',
            ],
        ];
    }
}
