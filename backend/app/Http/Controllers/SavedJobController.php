<?php

namespace App\Http\Controllers;

use App\Http\Requests\PerPageRequest;
use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Services\SavedJobService;
use Illuminate\Http\Request;

class SavedJobController extends Controller
{
    public function __construct(protected SavedJobService $savedJobService)
    {
    }

    public function index(PerPageRequest $request)
    {
        $jobs = $this->savedJobService->paginate($request->user(), $request->perPage());

        return new JobCollection($jobs);
    }

    public function ids(Request $request)
    {
        $ids = $this->savedJobService->ids($request->user());

        return response()->json(['data' => $ids]);
    }

    public function store(Request $request, Job $job)
    {
        $job = $this->savedJobService->save($request->user(), $job);

        return (new JobResource($job))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, Job $job)
    {
        $this->savedJobService->unsave($request->user(), $job);

        return response()->json(['message' => 'Removed']);
    }
}
