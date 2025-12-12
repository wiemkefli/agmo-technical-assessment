<?php

namespace App\Policies;

use App\Models\Job;
use App\Models\User;

class JobPolicy
{
    public function create(User $user): bool
    {
        return $user->role === 'employer';
    }

    public function update(User $user, Job $job): bool
    {
        return $user->role === 'employer' && $job->employer_id === $user->id;
    }

    public function delete(User $user, Job $job): bool
    {
        return $this->update($user, $job);
    }

    public function viewApplications(User $user, Job $job): bool
    {
        return $this->update($user, $job);
    }
}

