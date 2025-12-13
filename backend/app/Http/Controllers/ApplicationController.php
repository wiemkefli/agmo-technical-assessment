<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationResource;
use App\Http\Requests\ApplicationStoreRequest;
use App\Models\Application;
use App\Models\Job;
use App\Services\ApplicationService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(protected ApplicationService $applicationService)
    {
    }

    public function index(Request $request)
    {
        $applications = Application::query()
            ->where('applicant_id', $request->user()->id)
            ->with(['job.employer.profile'])
            ->latest()
            ->get();

        return ApplicationResource::collection($applications);
    }

    public function store(ApplicationStoreRequest $request, Job $job)
    {
        $application = $this->applicationService->create(
            $request->user(),
            $job,
            $request->validated()
        );

        return (new ApplicationResource($application))
            ->response()
            ->setStatusCode(201);
    }
}
