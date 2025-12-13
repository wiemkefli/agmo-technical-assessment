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
            'company' => fake()->randomElement([
                'Acme Labs',
                'Northwind Trading',
                'Contoso Solutions',
                'BlueSky Logistics',
                'Evergreen Health',
                'Summit Retail Group',
                'Pioneer Manufacturing',
                'Cedar & Co.',
                'BrightPath Education',
                'Oceanview Hospitality',
                'Silverline Finance',
                'Greenfield Energy',
            ]),
            'website' => fake()->boolean(40) ? fake()->url() : null,
        ];
    }
}
