<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SavedJobsTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_save_and_unsave_published_job_and_list_saved_jobs(): void
    {
        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $save = $this->postJson("/api/jobs/{$job->id}/save");
        $save->assertStatus(201);
        $save->assertJsonPath('data.id', $job->id);
        $save->assertJsonPath('data.salary_range', "{$job->salary_min}-{$job->salary_max}");

        $ids = $this->getJson('/api/saved-jobs/ids');
        $ids->assertOk();
        $this->assertContains($job->id, $ids->json('data'));

        $list = $this->getJson('/api/saved-jobs?per_page=50');
        $list->assertOk();
        $savedIds = collect($list->json('data'))->pluck('id')->all();
        $this->assertContains($job->id, $savedIds);

        $unsave = $this->deleteJson("/api/jobs/{$job->id}/save");
        $unsave->assertOk();
        $unsave->assertJsonPath('message', 'Removed');

        $idsAfter = $this->getJson('/api/saved-jobs/ids');
        $idsAfter->assertOk();
        $this->assertNotContains($job->id, $idsAfter->json('data'));
    }

    public function test_applicant_cannot_save_draft_job(): void
    {
        $employer = User::factory()->employer()->create();
        $job = Job::factory()->draft()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $save = $this->postJson("/api/jobs/{$job->id}/save");
        $save->assertStatus(422);
        $save->assertJsonValidationErrors(['job']);
    }
}

