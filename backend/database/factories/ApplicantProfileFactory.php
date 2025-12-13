<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApplicantProfile>
 */
class ApplicantProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phone' => fake()->boolean(50) ? fake()->e164PhoneNumber() : null,
            'location' => fake()->boolean(70) ? fake()->city() : null,
        ];
    }
}

