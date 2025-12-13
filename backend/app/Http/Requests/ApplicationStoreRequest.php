<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplicationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string'],
            // 5MB max, PDF only.
            'resume' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
