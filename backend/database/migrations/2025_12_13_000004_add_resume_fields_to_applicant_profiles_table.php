<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('resume_path')->nullable()->after('location');
            $table->string('resume_original_name')->nullable()->after('resume_path');
            $table->string('resume_mime', 100)->nullable()->after('resume_original_name');
            $table->unsignedBigInteger('resume_size')->nullable()->after('resume_mime');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'resume_path',
                'resume_original_name',
                'resume_mime',
                'resume_size',
            ]);
        });
    }
};

