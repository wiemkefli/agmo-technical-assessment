<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SavedJobController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $jobs = $request->user()
            ->savedJobs()
            ->where('jobs.status', 'published')
            ->with(['employer.employerProfile'])
            ->orderByDesc('saved_jobs.created_at')
            ->paginate($perPage);

        return new JobCollection($jobs);
    }

    public function ids(Request $request)
    {
        $ids = $request->user()
            ->savedJobs()
            ->where('jobs.status', 'published')
            ->orderByDesc('saved_jobs.created_at')
            ->pluck('jobs.id');

        return response()->json(['data' => $ids]);
    }

    public function store(Request $request, Job $job)
    {
        if ($job->status !== 'published') {
            throw ValidationException::withMessages([
                'job' => ['You can only save published jobs.'],
            ]);
        }

        $request->user()->savedJobs()->syncWithoutDetaching([$job->id]);

        return (new JobResource($job->load(['employer.employerProfile'])))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, Job $job)
    {
        $request->user()->savedJobs()->detach($job->id);

        return response()->json(['message' => 'Removed']);
    }
}
