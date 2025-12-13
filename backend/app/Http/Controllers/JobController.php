<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Services\JobSearchService;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function __construct(protected JobSearchService $jobSearchService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_remote' => ['nullable', 'boolean'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0'],
            'sort' => ['nullable', 'string', 'in:newest,oldest'],
        ]);

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $query = Job::query()
            ->where('status', 'published')
            ->with(['employer.employerProfile']);

        $this->jobSearchService->applyFilters($query, $filters);

        $sort = $filters['sort'] ?? 'newest';
        if ($sort === 'oldest') {
            $query->orderBy('published_at')->orderBy('id');
        } else {
            $query->orderByDesc('published_at')->orderByDesc('id');
        }

        $jobs = $query
            ->paginate($perPage);

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
