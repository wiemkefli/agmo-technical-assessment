<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileResumeUploadRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use App\Services\ResumeService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(protected ResumeService $resumeService)
    {
    }

    public function show(Request $request)
    {
        return new UserResource($request->user()->load(['employerProfile', 'applicantProfile']));
    }

    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'employer') {
            $profile = $user->employerProfile()->firstOrCreate([]);
            $profile->fill([
                'website' => $data['website'] ?? null,
            ]);
            $profile->save();

            if (array_key_exists('company', $data) && $user->name !== $data['company']) {
                $user->forceFill(['name' => $data['company']])->save();
            }
        } else {
            $profile = $user->applicantProfile()->firstOrCreate([]);
            $profile->fill($data);
            $profile->save();
        }

        return new UserResource($user->refresh()->load(['employerProfile', 'applicantProfile']));
    }

    public function uploadResume(ProfileResumeUploadRequest $request)
    {
        $user = $request->user();
        if ($user->role !== 'applicant') {
            abort(403);
        }

        $profile = $user->applicantProfile()->firstOrCreate([]);

        $file = $request->file('resume');
        $this->resumeService->replaceApplicantProfileResume($profile, (int) $user->id, $file);

        return new UserResource($user->refresh()->load(['employerProfile', 'applicantProfile']));
    }

    public function downloadResume(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'applicant') {
            abort(403);
        }

        $profile = $user->applicantProfile()->first();
        if (! $profile?->resume_path) {
            abort(404);
        }

        $filename = $profile->resume_original_name ?: "resume-{$user->id}.pdf";

        $response = $this->resumeService->downloadLocalIfExists($profile->resume_path, $filename);
        if (! $response) {
            abort(404);
        }

        return $response;
    }

    public function deleteResume(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'applicant') {
            abort(403);
        }

        $profile = $user->applicantProfile()->firstOrCreate([]);
        $this->resumeService->deleteApplicantProfileResume($profile);

        return response()->json(['message' => 'Resume removed']);
    }
}
