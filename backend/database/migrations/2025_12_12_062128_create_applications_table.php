<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_id')
                ->constrained('jobs')
                ->cascadeOnDelete(); // if job deleted, remove applications

            $table->foreignId('applicant_id')
                ->constrained('users')
                ->restrictOnDelete(); // keep history safe (or cascade if you prefer)

            $table->text('message');

            // Optional but useful for employer view (bonus/realism)
            $table->string('status', 20)->default('submitted'); // submitted|reviewed|rejected|shortlisted

            // Bonus: resume upload metadata (safe to include even if UI not done)
            $table->string('resume_path')->nullable();
            $table->string('resume_original_name')->nullable();
            $table->string('resume_mime', 100)->nullable();
            $table->unsignedBigInteger('resume_size')->nullable();

            $table->timestamps();

            // Prevent duplicate applications by same applicant to same job
            $table->unique(['job_id', 'applicant_id']);

            // Indexes for common reads
            $table->index(['job_id', 'created_at']);        // employer viewing applicants for a job
            $table->index(['applicant_id', 'created_at']);  // applicant history (even if not in UI)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
