<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->unsignedInteger('salary_min')->nullable()->after('location');
            $table->unsignedInteger('salary_max')->nullable()->after('salary_min');
            $table->string('salary_currency', 3)->nullable()->after('salary_max');
            $table->string('salary_period', 10)->nullable()->after('salary_currency'); // month | year

            $table->dropColumn('salary_range');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('salary_range')->nullable()->after('location');

            $table->dropColumn('salary_min');
            $table->dropColumn('salary_max');
            $table->dropColumn('salary_currency');
            $table->dropColumn('salary_period');
        });
    }
};

