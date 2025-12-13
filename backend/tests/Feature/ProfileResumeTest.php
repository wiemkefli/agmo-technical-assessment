<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileResumeTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_upload_and_download_profile_resume(): void
    {
        Storage::fake('public');

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $upload = $this->post('/api/profile/resume', [
            'resume' => UploadedFile::fake()->create('resume.pdf', 120, 'application/pdf'),
        ]);

        $upload->assertOk();

        $profile = $applicant->refresh()->applicantProfile()->first();
        $this->assertNotNull($profile?->resume_path);
        Storage::disk('public')->assertExists($profile->resume_path);

        $download = $this->get('/api/profile/resume');
        $download->assertOk();
    }

    public function test_applicant_can_apply_using_saved_profile_resume_and_employer_can_download_application_resume(): void
    {
        Storage::fake('public');

        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $this->post('/api/profile/resume', [
            'resume' => UploadedFile::fake()->create('resume.pdf', 120, 'application/pdf'),
        ])->assertOk();

        $profilePath = $applicant->refresh()->applicantProfile()->first()?->resume_path;
        $this->assertNotNull($profilePath);

        $apply = $this->post("/api/jobs/{$job->id}/apply", [
            'message' => 'Hello!',
            'use_profile_resume' => true,
        ]);

        $apply->assertStatus(201);

        $applicationId = $apply->json('data.id');
        $applicationResumePath = $apply->json('data.resume_path');

        $this->assertNotNull($applicationId);
        $this->assertNotNull($applicationResumePath);
        $this->assertNotSame($profilePath, $applicationResumePath);

        Storage::disk('public')->assertExists($applicationResumePath);

        Sanctum::actingAs($employer);
        $download = $this->get("/api/employer/applications/{$applicationId}/resume");
        $download->assertOk();
    }

    public function test_applicant_can_apply_without_resume(): void
    {
        Storage::fake('public');

        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $apply = $this->post("/api/jobs/{$job->id}/apply", [
            'message' => 'No resume attached.',
        ]);

        $apply->assertStatus(201);
        $this->assertNull($apply->json('data.resume_path'));
    }
}

