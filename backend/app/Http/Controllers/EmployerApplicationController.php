<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationStatusUpdateRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\Request;

class EmployerApplicationController extends Controller
{
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

