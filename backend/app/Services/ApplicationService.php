<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ApplicationService
{
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
            $file = $data['resume'];
            $path = $file->store('resumes', 'public');

            $application->resume_path = $path;
            $application->resume_original_name = $file->getClientOriginalName();
            $application->resume_mime = $file->getClientMimeType();
            $application->resume_size = $file->getSize();
        }

        $application->save();

        return $application->refresh();
    }
}

