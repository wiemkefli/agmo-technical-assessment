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
        $title = fake()->jobTitle();
        $location = fake()->randomElement([
            'Kuala Lumpur',
            'Selangor',
            'Penang',
            'Johor Bahru',
            'Singapore',
            'Remote',
        ]);

        return [
            'employer_id' => User::factory()->employer(),
            'title' => $title,
            'description' => $this->englishDescription($title),
            'location' => $location,
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMax,
            'salary_currency' => fake()->randomElement(['MYR', 'USD', 'SGD']),
            'salary_period' => fake()->randomElement(['month', 'year']),
            'is_remote' => fake()->boolean(30),
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
        ];
    }

    private function englishDescription(string $title): string
    {
        $openers = [
            "We're looking for a {$title} to join our team and help deliver great outcomes for customers.",
            "Join us as a {$title} and work with a supportive team that values quality, ownership, and continuous improvement.",
            "We are hiring a {$title} to support day-to-day operations and drive measurable results.",
        ];

        $responsibilities = [
            'Deliver high-quality work on time and communicate progress clearly.',
            'Collaborate with cross-functional partners to plan and execute tasks.',
            'Identify issues early and propose practical solutions.',
            'Document work and share knowledge with the team.',
        ];

        $requirements = [
            'Experience in a similar role or relevant domain.',
            'Strong communication skills and attention to detail.',
            'Comfortable working independently and as part of a team.',
            'Willingness to learn and adapt to new tools and processes.',
        ];

        $benefits = [
            'Flexible work arrangement where possible.',
            'Clear growth path and mentorship.',
            'Competitive salary and paid leave.',
            'Friendly team culture and modern tools.',
        ];

        $pick = fn (array $items, int $count) => collect($items)->shuffle()->take($count)->values()->all();

        $lines = [];
        $lines[] = fake()->randomElement($openers);
        $lines[] = '';
        $lines[] = "What you'll do:";
        foreach ($pick($responsibilities, 3) as $item) {
            $lines[] = "- {$item}";
        }
        $lines[] = '';
        $lines[] = 'What we are looking for:';
        foreach ($pick($requirements, 3) as $item) {
            $lines[] = "- {$item}";
        }
        $lines[] = '';
        $lines[] = 'What we offer:';
        foreach ($pick($benefits, 3) as $item) {
            $lines[] = "- {$item}";
        }

        return implode("\n", $lines);
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
