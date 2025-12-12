<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployerJobController;
use App\Http\Controllers\JobController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{job}', [JobController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:applicant'])->group(function () {
    Route::post('jobs/{job}/apply', [ApplicationController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:employer'])->prefix('employer')->group(function () {
    Route::get('jobs', [EmployerJobController::class, 'index']);
    Route::post('jobs', [EmployerJobController::class, 'store']);
    Route::get('jobs/{job}', [EmployerJobController::class, 'show']);
    Route::patch('jobs/{job}', [EmployerJobController::class, 'update']);
    Route::delete('jobs/{job}', [EmployerJobController::class, 'destroy']);
    Route::get('jobs/{job}/applications', [EmployerJobController::class, 'applications']);
});
