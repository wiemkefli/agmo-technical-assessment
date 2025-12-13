<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Job>
 */
class JobFactory extends Factory
{
    public function definition(): array
    {
        $status = fake()->randomElement(['draft', 'published']);
        $salaryMin = fake()->numberBetween(2000, 12000);
        $salaryMax = $salaryMin + fake()->numberBetween(500, 8000);

        return [
            'employer_id' => User::factory()->employer(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraphs(3, true),
            'location' => fake()->city(),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMax,
            'salary_currency' => fake()->randomElement(['MYR', 'USD', 'SGD']),
            'salary_period' => fake()->randomElement(['month', 'year']),
            'is_remote' => fake()->boolean(30),
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
}
