<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployerProfile>
 */
class EmployerProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company' => fake()->company(),
            'website' => fake()->boolean(40) ? fake()->url() : null,
        ];
    }
}

