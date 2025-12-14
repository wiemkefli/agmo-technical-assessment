<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PerPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }

    public function perPage(int $default = 10, int $max = 50): int
    {
        $perPage = (int) $this->query('per_page', $default);

        return max(1, min($perPage, $max));
    }
}

