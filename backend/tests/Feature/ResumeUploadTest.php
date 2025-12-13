<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResumeUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_applicant_can_upload_resume_and_employer_can_download_it(): void
    {
        Storage::fake('local');

        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $applyResponse = $this->post("/api/jobs/{$job->id}/apply", [
            'message' => 'Hello! Please find my resume attached.',
            'resume' => UploadedFile::fake()->create('resume.pdf', 120, 'application/pdf'),
        ]);

        $applyResponse->assertStatus(201);

        $applicationId = $applyResponse->json('data.id');
        $hasResume = $applyResponse->json('data.has_resume');
        $resumeOriginalName = $applyResponse->json('data.resume_original_name');

        $this->assertNotNull($applicationId);
        $this->assertTrue((bool) $hasResume);
        $this->assertSame('resume.pdf', $resumeOriginalName);

        Sanctum::actingAs($employer);

        $downloadResponse = $this->get("/api/employer/applications/{$applicationId}/resume");
        $downloadResponse->assertOk();

        $contentDisposition = $downloadResponse->headers->get('content-disposition') ?? '';
        $this->assertStringContainsString('resume.pdf', $contentDisposition);
    }

    public function test_other_employer_cannot_download_resume(): void
    {
        Storage::fake('local');

        $employer = User::factory()->employer()->create();
        $job = Job::factory()->published()->for($employer, 'employer')->create();

        $applicant = User::factory()->applicant()->create();
        Sanctum::actingAs($applicant);

        $applyResponse = $this->post("/api/jobs/{$job->id}/apply", [
            'message' => 'Hello! Please find my resume attached.',
            'resume' => UploadedFile::fake()->create('resume.pdf', 120, 'application/pdf'),
        ]);
        $applyResponse->assertStatus(201);

        $applicationId = $applyResponse->json('data.id');

        $otherEmployer = User::factory()->employer()->create();
        Sanctum::actingAs($otherEmployer);

        $downloadResponse = $this->get("/api/employer/applications/{$applicationId}/resume");
        $downloadResponse->assertStatus(403);
    }
}
