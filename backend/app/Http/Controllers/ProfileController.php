<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return new UserResource($request->user()->load('profile'));
    }

    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $profile = $user->profile()->firstOrCreate([]);

        $profile->fill($request->validated());
        $profile->save();

        return new UserResource($user->refresh()->load('profile'));
    }
}

