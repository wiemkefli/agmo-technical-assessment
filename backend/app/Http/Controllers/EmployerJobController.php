<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationResource;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Http\Requests\JobStoreRequest;
use App\Http\Requests\JobUpdateRequest;
use App\Models\Job;
use App\Services\JobService;
use Illuminate\Http\Request;

class EmployerJobController extends Controller
{
    public function __construct(protected JobService $jobService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $jobs = Job::query()
            ->where('employer_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return new JobCollection($jobs);
    }

    public function store(JobStoreRequest $request)
    {
        $this->authorize('create', Job::class);

        $job = $this->jobService->create($request->user(), $request->validated());

        return (new JobResource($job))
            ->response()
            ->setStatusCode(201);
    }

    public function update(JobUpdateRequest $request, Job $job)
    {
        $this->authorize('update', $job);

        $job = $this->jobService->update($job, $request->validated());

        return new JobResource($job);
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
