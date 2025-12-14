<?php

namespace App\Providers;

use App\Models\Application;
use App\Models\Job;
use App\Policies\ApplicationPolicy;
use App\Policies\JobPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Application::class => ApplicationPolicy::class,
        Job::class => JobPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
