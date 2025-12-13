<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployerApplicationController;
use App\Http\Controllers\EmployerJobController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SavedJobController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);
});

Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{job}', [JobController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:applicant'])->group(function () {
    Route::post('profile/resume', [ProfileController::class, 'uploadResume']);
    Route::get('profile/resume', [ProfileController::class, 'downloadResume']);
    Route::delete('profile/resume', [ProfileController::class, 'deleteResume']);

    Route::get('applied-jobs', [ApplicationController::class, 'index']);
    // Backwards-compatible alias (deprecated)
    Route::get('applications', [ApplicationController::class, 'index']);
    Route::post('jobs/{job}/apply', [ApplicationController::class, 'store']);

    Route::get('recommended-jobs', [RecommendationController::class, 'index']);
    Route::get('saved-jobs', [SavedJobController::class, 'index']);
    Route::get('saved-jobs/ids', [SavedJobController::class, 'ids']);
    Route::post('jobs/{job}/save', [SavedJobController::class, 'store']);
    Route::delete('jobs/{job}/save', [SavedJobController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:employer'])->prefix('employer')->group(function () {
    Route::get('jobs', [EmployerJobController::class, 'index']);
    Route::post('jobs', [EmployerJobController::class, 'store']);
    Route::get('jobs/{job}', [EmployerJobController::class, 'show']);
    Route::patch('jobs/{job}', [EmployerJobController::class, 'update']);
    Route::delete('jobs/{job}', [EmployerJobController::class, 'destroy']);
    Route::get('jobs/{job}/applications', [EmployerJobController::class, 'applications']);

    Route::get('applications/{application}/resume', [EmployerApplicationController::class, 'resume']);
    Route::patch('applications/{application}', [EmployerApplicationController::class, 'update']);
});
