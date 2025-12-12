<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $jobs = Job::query()
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return new JobCollection($jobs);
    }

    public function show(Job $job)
    {
        if ($job->status !== 'published') {
            abort(404);
        }

        return new JobResource($job);
    }
}
