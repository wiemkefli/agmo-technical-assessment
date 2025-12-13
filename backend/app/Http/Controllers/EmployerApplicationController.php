<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationStatusUpdateRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployerApplicationController extends Controller
{
    public function resume(Request $request, Application $application)
    {
        $application->loadMissing('job');

        if ((int) $application->job?->employer_id !== (int) $request->user()->id) {
            abort(403);
        }

        if (! $application->resume_path) {
            abort(404);
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($application->resume_path)) {
            abort(404);
        }

        $filename = $application->resume_original_name ?: "resume-{$application->id}";

        return $disk->download($application->resume_path, $filename);
    }

    public function update(ApplicationStatusUpdateRequest $request, Application $application)
    {
        $application->loadMissing('job');

        if ((int) $application->job?->employer_id !== (int) $request->user()->id) {
            abort(403);
        }

        $application->status = $request->validated()['status'];
        $application->save();

        return new ApplicationResource($application->loadMissing('applicant'));
    }
}
