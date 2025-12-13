<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employer_id')
                ->constrained('users')
                ->restrictOnDelete(); // don't allow deleting employer if jobs exist

            $table->string('title');
            $table->text('description');
            $table->string('location');

            $table->unsignedInteger('salary_min');
            $table->unsignedInteger('salary_max');
            $table->string('salary_currency', 3);
            $table->string('salary_period', 10); // month | year
            $table->boolean('is_remote')->default(false);

            // Keep as string for portability; validate values in code.
            $table->string('status', 20)->default('draft'); // draft | published
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            // Indexes for the required access patterns
            $table->index(['status', 'created_at']);               // public feed: published newest
            $table->index(['employer_id', 'created_at']);          // employer dashboard
            $table->index(['employer_id', 'status', 'created_at']); // employer filter by status
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
