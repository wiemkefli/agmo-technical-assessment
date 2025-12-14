<?php

namespace App\Services;

use App\Models\ApplicantProfile;
use App\Models\Application;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResumeService
{
    public function replaceApplicantProfileResume(
        ApplicantProfile $profile,
        int $userId,
        UploadedFile $file
    ): void
    {
        $disk = Storage::disk('local');

        if ($profile->resume_path && $disk->exists($profile->resume_path)) {
            $disk->delete($profile->resume_path);
        }

        $path = $file->storeAs(
            "applicant-resumes/{$userId}",
            Str::uuid() . '.pdf',
            'local'
        );

        $profile->resume_path = $path;
        $profile->resume_original_name = $file->getClientOriginalName();
        $profile->resume_mime = $file->getClientMimeType();
        $profile->resume_size = $file->getSize();
        $profile->save();
    }

    public function deleteApplicantProfileResume(ApplicantProfile $profile): void
    {
        $disk = Storage::disk('local');

        if ($profile->resume_path && $disk->exists($profile->resume_path)) {
            $disk->delete($profile->resume_path);
        }

        $profile->forceFill([
            'resume_path' => null,
            'resume_original_name' => null,
            'resume_mime' => null,
            'resume_size' => null,
        ])->save();
    }

    public function localExists(string $path): bool
    {
        return Storage::disk('local')->exists($path);
    }

    public function downloadLocalIfExists(string $path, string $filename): ?StreamedResponse
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            return null;
        }

        return $disk->download($path, $filename);
    }

    public function attachUploadedResumeToApplication(Application $application, UploadedFile $file): void
    {
        $path = $file->store('resumes', 'local');

        $application->resume_path = $path;
        $application->resume_original_name = $file->getClientOriginalName();
        $application->resume_mime = $file->getClientMimeType();
        $application->resume_size = $file->getSize();
    }

    public function attachCopiedProfileResumeToApplication(
        Application $application,
        ApplicantProfile $profile,
        int $applicantId
    ): void
    {
        $disk = Storage::disk('local');

        $sourcePath = $profile->resume_path;
        if (! $sourcePath || ! $disk->exists($sourcePath)) {
            throw new \RuntimeException('Profile resume source file is missing.');
        }

        $originalName = $profile->resume_original_name ?: 'resume.pdf';
        $safeName = $this->safeFileName($originalName) ?: 'resume.pdf';
        $destPath = "resumes/{$applicantId}/" . Str::uuid() . '-' . $safeName;

        $disk->copy($sourcePath, $destPath);

        $application->resume_path = $destPath;
        $application->resume_original_name = $profile->resume_original_name;
        $application->resume_mime = $profile->resume_mime ?: $disk->mimeType($destPath);
        $application->resume_size = $profile->resume_size ?: $disk->size($destPath);
    }

    protected function safeFileName(string $name): string
    {
        return preg_replace('/[^A-Za-z0-9._-]+/', '-', $name) ?: '';
    }
}

