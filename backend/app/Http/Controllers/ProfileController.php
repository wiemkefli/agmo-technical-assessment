<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return new UserResource($request->user()->load(['employerProfile', 'applicantProfile']));
    }

    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'employer') {
            $profile = $user->employerProfile()->firstOrCreate([], [
                'company' => $user->name,
            ]);
            $profile->fill($data);
            $profile->save();

            if (array_key_exists('company', $data) && $user->name !== $data['company']) {
                $user->forceFill(['name' => $data['company']])->save();
            }
        } else {
            $profile = $user->applicantProfile()->firstOrCreate([]);
            $profile->fill($data);
            $profile->save();
        }

        return new UserResource($user->refresh()->load(['employerProfile', 'applicantProfile']));
    }
}
