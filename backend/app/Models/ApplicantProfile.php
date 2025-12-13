<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantProfile extends Model
{
    /** @use HasFactory<\Database\Factories\ApplicantProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'location',
        'resume_path',
        'resume_original_name',
        'resume_mime',
        'resume_size',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
