<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_recommended_jobs_excludes_applied_jobs_but_includes_saved_jobs(): void
    {
        $employer = User::factory()->employer()->create();

        $savedJob = Job::factory()->published()->for($employer, 'employer')->create();
        $appliedJob = Job::factory()->published()->for($employer, 'employer')->create();
        $otherJob = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $this->postJson("/api/jobs/{$savedJob->id}/save")->assertStatus(201);

        $this->postJson("/api/jobs/{$appliedJob->id}/apply", [
            'message' => 'Hi!',
        ])->assertStatus(201);

        $res = $this->getJson('/api/recommended-jobs?per_page=50');
        $res->assertOk();

        $ids = collect($res->json('data'))->pluck('id')->all();

        $this->assertNotContains($appliedJob->id, $ids);
        $this->assertContains($savedJob->id, $ids);
        $this->assertContains($otherJob->id, $ids);
    }
}
