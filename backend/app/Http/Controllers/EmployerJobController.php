<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployerJobIndexRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Http\Requests\JobStoreRequest;
use App\Http\Requests\JobUpdateRequest;
use App\Models\Job;
use App\Services\JobService;

class EmployerJobController extends Controller
{
    public function __construct(
        protected JobService $jobService
    )
    {
    }

    public function index(EmployerJobIndexRequest $request)
    {
        $user = $request->user();
        $jobs = $this->jobService->searchEmployer(
            $user,
            $request->jobFilters(),
            $request->sort(),
            $request->perPage()
        );

        return new JobCollection($jobs);
    }

    public function store(JobStoreRequest $request)
    {
        $this->authorize('create', Job::class);

        $job = $this->jobService->create($request->user(), $request->validated());

        return (new JobResource($job->load(['employer.employerProfile'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Job $job)
    {
        $this->authorize('update', $job);

        return new JobResource($job->load(['employer.employerProfile']));
    }

    public function update(JobUpdateRequest $request, Job $job)
    {
        $this->authorize('update', $job);

        $job = $this->jobService->update($job, $request->validated());

        return new JobResource($job->load(['employer.employerProfile']));
    }

    public function destroy(Job $job)
    {
        $this->authorize('delete', $job);

        $this->jobService->delete($job);

        return response()->json(['message' => 'Deleted']);
    }

    public function applications(Job $job)
    {
        $this->authorize('viewApplications', $job);

        $applications = $job->applications()
            ->with('applicant')
            ->orderByDesc('created_at')
            ->get();

        return ApplicationResource::collection($applications);
    }
}
