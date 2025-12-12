<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplicationStoreRequest;
use App\Models\Job;
use App\Services\ApplicationService;

class ApplicationController extends Controller
{
    public function __construct(protected ApplicationService $applicationService)
    {
    }

    public function store(ApplicationStoreRequest $request, Job $job)
    {
        $application = $this->applicationService->create(
            $request->user(),
            $job,
            $request->validated()
        );

        return response()->json(['data' => $application], 201);
    }
}

