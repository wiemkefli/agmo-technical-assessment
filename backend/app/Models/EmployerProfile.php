<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerProfile extends Model
{
    /** @use HasFactory<\Database\Factories\EmployerProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company',
        'website',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

