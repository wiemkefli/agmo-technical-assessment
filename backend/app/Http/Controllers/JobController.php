<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobIndexRequest;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Services\JobQueryBuilder;

class JobController extends Controller
{
    public function __construct(protected JobQueryBuilder $jobQueryBuilder)
    {
    }

    public function index(JobIndexRequest $request)
    {
        $filters = $request->jobFilters();

        $query = Job::query()
            ->where('status', 'published')
            ->with(['employer.employerProfile']);

        $this->jobQueryBuilder->applyFilters($query, $filters);
        $this->jobQueryBuilder->applySort($query, $request->sort(), 'published_at');

        $jobs = $this->jobQueryBuilder->paginate($query, $request->perPage());

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
