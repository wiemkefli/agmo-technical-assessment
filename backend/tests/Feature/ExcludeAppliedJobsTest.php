<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExcludeAppliedJobsTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_exclude_applied_jobs_and_still_receive_full_page_size(): void
    {
        $employer = User::factory()->employer()->create();
        $jobs = Job::factory()->count(13)->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();

        // Apply to 3 jobs.
        $appliedJobs = $jobs->take(3);
        foreach ($appliedJobs as $job) {
            Application::factory()->for($job, 'job')->for($applicant, 'applicant')->create([
                'status' => 'submitted',
            ]);
        }

        Sanctum::actingAs($applicant);

        $response = $this->getJson('/api/jobs?per_page=10&exclude_applied=1');
        $response->assertOk();

        $returnedIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertCount(10, $returnedIds);

        foreach ($appliedJobs as $job) {
            $this->assertNotContains($job->id, $returnedIds);
        }

        $response->assertJsonPath('meta.per_page', 10);
        $response->assertJsonPath('meta.total', 10);
        $response->assertJsonPath('meta.last_page', 1);
    }
}

