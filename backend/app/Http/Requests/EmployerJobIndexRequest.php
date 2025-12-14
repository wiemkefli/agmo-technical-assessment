<?php

namespace App\Http\Requests;

class EmployerJobIndexRequest extends JobIndexRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'status' => ['nullable', 'string', 'in:draft,published'],
        ];
    }
}

