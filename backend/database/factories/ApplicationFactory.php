<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Application>
 */
class ApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'job_id' => Job::factory()->published(),
            'applicant_id' => User::factory()->applicant(),
            'message' => fake()->sentences(2, true),
            'status' => fake()->randomElement(['submitted', 'reviewed', 'rejected', 'shortlisted']),
            'resume_path' => null,
            'resume_original_name' => null,
            'resume_mime' => null,
            'resume_size' => null,
        ];
    }

    public function withResume(): static
    {
        $name = fake()->randomElement(['resume.pdf', 'cv.docx']);

        return $this->state(fn () => [
            'resume_original_name' => $name,
            'resume_mime' => str_ends_with($name, '.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'resume_size' => fake()->numberBetween(50_000, 500_000),
            'resume_path' => 'resumes/' . fake()->uuid() . '-' . $name,
        ]);
    }
}

