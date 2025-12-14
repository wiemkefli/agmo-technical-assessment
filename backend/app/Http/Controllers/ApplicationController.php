<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationCollection;
use App\Http\Resources\ApplicationResource;
use App\Http\Requests\ApplicationStoreRequest;
use App\Http\Requests\PerPageRequest;
use App\Models\Application;
use App\Models\Job;
use App\Services\ApplicationService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(protected ApplicationService $applicationService)
    {
    }

    public function index(PerPageRequest $request)
    {
        $applications = Application::query()
            ->where('applicant_id', $request->user()->id)
            ->with(['job.employer.employerProfile'])
            ->latest()
            ->paginate($request->perPage());

        return new ApplicationCollection($applications);
    }

    public function ids(Request $request)
    {
        $rows = Application::query()
            ->where('applicant_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get(['job_id', 'status']);

        return response()->json([
            'data' => $rows,
        ]);
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
