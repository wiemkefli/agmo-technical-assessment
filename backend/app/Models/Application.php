<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    /** @use HasFactory<\Database\Factories\ApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        'job_id',
        'applicant_id',
        'message',
        'status',
        'resume_path',
        'resume_original_name',
        'resume_mime',
        'resume_size',
    ];

    protected function casts(): array
    {
        return [
            'resume_size' => 'integer',
        ];
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }
}

