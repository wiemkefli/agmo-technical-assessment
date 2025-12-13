<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApplicantApplicationRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_only_apply_to_published_jobs(): void
    {
        $employer = User::factory()->employer()->create();
        $draftJob = Job::factory()->draft()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $response = $this->postJson("/api/jobs/{$draftJob->id}/apply", [
            'message' => 'Please consider me.',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['job']);
    }

    public function test_applicant_cannot_apply_twice_to_same_job(): void
    {
        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $first = $this->postJson("/api/jobs/{$job->id}/apply", [
            'message' => 'First application.',
        ]);
        $first->assertStatus(201);

        $second = $this->postJson("/api/jobs/{$job->id}/apply", [
            'message' => 'Second application.',
        ]);
        $second->assertStatus(422);
        $second->assertJsonValidationErrors(['job']);
    }

    public function test_public_job_feed_only_returns_published_jobs(): void
    {
        $employer = User::factory()->employer()->create();
        $published = Job::factory()->published()->for($employer, 'employer')->create();
        $draft = Job::factory()->draft()->for($employer, 'employer')->create();

        $response = $this->getJson('/api/jobs?per_page=50');
        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($published->id, $ids);
        $this->assertNotContains($draft->id, $ids);
    }
}

