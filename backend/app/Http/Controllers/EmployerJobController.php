<?php

namespace App\Http\Controllers;

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

        return response()->json([
            'data' => $jobs->items(),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function store(JobStoreRequest $request)
    {
        $this->authorize('create', Job::class);

        $job = $this->jobService->create($request->user(), $request->validated());

        return response()->json(['data' => $job], 201);
    }

    public function update(JobUpdateRequest $request, Job $job)
    {
        $this->authorize('update', $job);

        $job = $this->jobService->update($job, $request->validated());

        return response()->json(['data' => $job]);
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

        return response()->json([
            'data' => $applications,
        ]);
    }
}

