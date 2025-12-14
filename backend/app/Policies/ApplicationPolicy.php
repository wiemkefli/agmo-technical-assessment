<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function update(User $user, Application $application): bool
    {
        $application->loadMissing('job');

        return $user->role === 'employer'
            && (int) $application->job?->employer_id === (int) $user->id;
    }

    public function viewResume(User $user, Application $application): bool
    {
        return $this->update($user, $application);
    }
}

