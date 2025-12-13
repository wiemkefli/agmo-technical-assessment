<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileResumeUploadRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
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

        $disk = Storage::disk('local');

        if ($profile->resume_path && $disk->exists($profile->resume_path)) {
            $disk->delete($profile->resume_path);
        }

        $file = $request->file('resume');
        $path = $file->storeAs(
            "applicant-resumes/{$user->id}",
            Str::uuid() . '.pdf',
            'local'
        );

        $profile->resume_path = $path;
        $profile->resume_original_name = $file->getClientOriginalName();
        $profile->resume_mime = $file->getClientMimeType();
        $profile->resume_size = $file->getSize();
        $profile->save();

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

        $disk = Storage::disk('local');
        if (! $disk->exists($profile->resume_path)) {
            abort(404);
        }

        $filename = $profile->resume_original_name ?: "resume-{$user->id}.pdf";

        return $disk->download($profile->resume_path, $filename);
    }

    public function deleteResume(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'applicant') {
            abort(403);
        }

        $profile = $user->applicantProfile()->firstOrCreate([]);

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

        return response()->json(['message' => 'Resume removed']);
    }
}
