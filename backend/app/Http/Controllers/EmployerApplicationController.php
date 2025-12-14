<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationStatusUpdateRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\ResumeService;
use Illuminate\Http\Request;

class EmployerApplicationController extends Controller
{
    public function __construct(protected ResumeService $resumeService)
    {
    }

    public function resume(Request $request, Application $application)
    {
        $this->authorize('viewResume', $application);

        if (! $application->resume_path) {
            abort(404);
        }

        $filename = $application->resume_original_name ?: "resume-{$application->id}";

        $response = $this->resumeService->downloadLocalIfExists($application->resume_path, $filename);
        if (! $response) {
            abort(404);
        }

        return $response;
    }

    public function update(ApplicationStatusUpdateRequest $request, Application $application)
    {
        $this->authorize('update', $application);

        $application->status = $request->validated()['status'];
        $application->save();

        return new ApplicationResource($application->loadMissing('applicant'));
    }
}
