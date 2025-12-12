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

        return [
            'employer_id' => User::factory()->employer(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraphs(3, true),
            'location' => fake()->optional()->city(),
            'salary_range' => fake()->optional()->randomElement([
                '3000-5000 MYR',
                '5000-8000 MYR',
                '8000-12000 MYR',
                'Negotiable',
            ]),
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

