<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalaryRangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_employer_can_create_job_using_salary_range(): void
    {
        $employer = User::factory()->employer()->create();
        Sanctum::actingAs($employer);

        $response = $this->postJson('/api/employer/jobs', [
            'title' => 'Senior Backend Engineer',
            'description' => 'Build APIs.',
            'location' => 'Kuala Lumpur',
            'salary_range' => '3000-5000',
            'is_remote' => true,
            'status' => 'published',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.salary_min', 3000);
        $response->assertJsonPath('data.salary_max', 5000);
        $response->assertJsonPath('data.salary_range', '3000-5000');
    }

    public function test_salary_range_must_match_expected_format(): void
    {
        $employer = User::factory()->employer()->create();
        Sanctum::actingAs($employer);

        $response = $this->postJson('/api/employer/jobs', [
            'title' => 'Senior Backend Engineer',
            'description' => 'Build APIs.',
            'location' => 'Kuala Lumpur',
            'salary_range' => 'abc',
            'is_remote' => true,
            'status' => 'published',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_range']);
    }
}

