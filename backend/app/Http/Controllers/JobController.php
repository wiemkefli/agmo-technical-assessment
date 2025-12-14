<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobIndexRequest;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Services\JobService;

class JobController extends Controller
{
    public function __construct(protected JobService $jobService)
    {
    }

    public function index(JobIndexRequest $request)
    {
        $jobs = $this->jobService->searchPublished(
            $request->jobFilters(),
            $request->sort(),
            $request->perPage()
        );

        return new JobCollection($jobs);
    }

    public function show(Job $job)
    {
        if ($job->status !== 'published') {
            abort(404);
        }

        return new JobResource($job->load(['employer.employerProfile']));
    }
}
