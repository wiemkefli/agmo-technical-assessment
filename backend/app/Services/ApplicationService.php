<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        } elseif (! empty($data['use_profile_resume'])) {
            $profile = $applicant->applicantProfile()->first();

            if (! $profile?->resume_path) {
                throw ValidationException::withMessages([
                    'resume' => ['No saved resume found. Please upload a PDF or apply without a resume.'],
                ]);
            }

            $disk = Storage::disk('public');
            if (! $disk->exists($profile->resume_path)) {
                throw ValidationException::withMessages([
                    'resume' => ['Saved resume file is missing. Please upload it again.'],
                ]);
            }

            $originalName = $profile->resume_original_name ?: 'resume.pdf';
            $safeName = preg_replace('/[^A-Za-z0-9._-]+/', '-', $originalName) ?: 'resume.pdf';
            $destPath = "resumes/{$applicant->id}/" . Str::uuid() . '-' . $safeName;

            $disk->copy($profile->resume_path, $destPath);

            $application->resume_path = $destPath;
            $application->resume_original_name = $profile->resume_original_name;
            $application->resume_mime = $profile->resume_mime ?: $disk->mimeType($destPath);
            $application->resume_size = $profile->resume_size ?: $disk->size($destPath);
        }

        $application->save();

        return $application->refresh();
    }
}
