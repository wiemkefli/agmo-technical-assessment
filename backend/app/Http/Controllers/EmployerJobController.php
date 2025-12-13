<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicationResource;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Http\Requests\JobStoreRequest;
use App\Http\Requests\JobUpdateRequest;
use App\Models\Job;
use App\Services\JobSearchService;
use App\Services\JobService;
use Illuminate\Http\Request;

class EmployerJobController extends Controller
{
    public function __construct(
        protected JobService $jobService,
        protected JobSearchService $jobSearchService
    )
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_remote' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'salary_currency' => ['nullable', 'string', 'size:3'],
            'salary_period' => ['nullable', 'string', 'in:month,year'],
            'sort' => ['nullable', 'string', 'in:newest,oldest'],
        ]);

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $query = Job::query()
            ->where('employer_id', $user->id)
            ->with(['employer.employerProfile']);

        $this->jobSearchService->applyFilters($query, $filters);

        $sort = $filters['sort'] ?? 'newest';
        if ($sort === 'oldest') {
            $query->orderBy('created_at')->orderBy('id');
        } else {
            $query->orderByDesc('created_at')->orderByDesc('id');
        }

        $jobs = $query
            ->paginate($perPage);

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
