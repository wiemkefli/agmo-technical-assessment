<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ApplicationService
{
    public function __construct(protected ResumeService $resumeService)
    {
    }

    public function create(User $applicant, Job $job, array $data): Application
    {
        if ($job->status !== 'published') {
            throw ValidationException::withMessages([
                'job' => ['You can only apply to published jobs.'],
            ]);
        }

        $exists = Application::where('job_id', $job->id)
            ->where('applicant_id', $applicant->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'job' => ['You have already applied to this job.'],
            ]);
        }

        $application = new Application([
            'message' => $data['message'],
            'status' => 'submitted',
        ]);

        $application->job()->associate($job);
        $application->applicant()->associate($applicant);

        if (isset($data['resume']) && $data['resume']) {
            $this->resumeService->attachUploadedResumeToApplication($application, $data['resume']);
        } elseif (! empty($data['use_profile_resume'])) {
            $profile = $applicant->applicantProfile()->first();

            if (! $profile?->resume_path) {
                throw ValidationException::withMessages([
                    'resume' => ['No saved resume found. Please upload a PDF or apply without a resume.'],
                ]);
            }

            if (! $this->resumeService->localExists($profile->resume_path)) {
                throw ValidationException::withMessages([
                    'resume' => ['Saved resume file is missing. Please upload it again.'],
                ]);
            }

            $this->resumeService->attachCopiedProfileResumeToApplication($application, $profile, (int) $applicant->id);
        }

        $application->save();

        return $application->refresh();
    }
}
