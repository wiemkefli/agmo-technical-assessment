<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmployerJobAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employer_can_update_and_delete_own_job(): void
    {
        $employer = User::factory()->employer()->create();
        Sanctum::actingAs($employer);

        $create = $this->postJson('/api/employer/jobs', [
            'title' => 'Backend Engineer',
            'description' => 'Build APIs.',
            'location' => 'Kuala Lumpur',
            'salary_range' => '3000-5000',
            'is_remote' => true,
            'status' => 'draft',
        ]);

        $create->assertStatus(201);
        $jobId = $create->json('data.id');
        $this->assertNotNull($jobId);

        $update = $this->patchJson("/api/employer/jobs/{$jobId}", [
            'title' => 'Senior Backend Engineer',
            'status' => 'published',
        ]);

        $update->assertOk();
        $update->assertJsonPath('data.title', 'Senior Backend Engineer');
        $update->assertJsonPath('data.status', 'published');

        $delete = $this->deleteJson("/api/employer/jobs/{$jobId}");
        $delete->assertOk();
        $delete->assertJsonPath('message', 'Deleted');

        $this->assertNull(Job::find($jobId));
    }

    public function test_employer_can_only_manage_own_jobs(): void
    {
        $employerA = User::factory()->employer()->create();
        $employerB = User::factory()->employer()->create();

        Sanctum::actingAs($employerA);

        $create = $this->postJson('/api/employer/jobs', [
            'title' => 'Backend Engineer',
            'description' => 'Build APIs.',
            'location' => 'Kuala Lumpur',
            'salary_range' => '3000-5000',
            'is_remote' => true,
            'status' => 'published',
        ]);

        $create->assertStatus(201);
        $jobId = $create->json('data.id');
        $this->assertNotNull($jobId);

        Sanctum::actingAs($employerB);

        $this->getJson("/api/employer/jobs/{$jobId}")->assertStatus(403);
        $this->patchJson("/api/employer/jobs/{$jobId}", ['title' => 'Hacked'])->assertStatus(403);
        $this->deleteJson("/api/employer/jobs/{$jobId}")->assertStatus(403);
        $this->getJson("/api/employer/jobs/{$jobId}/applications")->assertStatus(403);
    }

    public function test_applicant_cannot_create_employer_job(): void
    {
        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $response = $this->postJson('/api/employer/jobs', [
            'title' => 'Should Fail',
            'description' => 'Nope.',
            'location' => 'KL',
            'salary_range' => '1000-2000',
            'is_remote' => false,
            'status' => 'draft',
        ]);

        $response->assertStatus(403);
    }
}
