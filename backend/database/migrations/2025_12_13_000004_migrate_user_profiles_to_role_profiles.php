<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        // Ensure every employer has an employer_profile.
        if (Schema::hasTable('user_profiles')) {
            DB::statement("
                INSERT INTO employer_profiles (user_id, company, website, created_at, updated_at)
                SELECT u.id,
                       COALESCE(NULLIF(up.company, ''), u.name) as company,
                       NULL as website,
                       ?, ?
                FROM users u
                LEFT JOIN employer_profiles ep ON ep.user_id = u.id
                LEFT JOIN user_profiles up ON up.user_id = u.id
                WHERE u.role = 'employer' AND ep.user_id IS NULL
            ", [$now, $now]);
        } else {
            DB::statement("
                INSERT INTO employer_profiles (user_id, company, website, created_at, updated_at)
                SELECT u.id,
                       u.name as company,
                       NULL as website,
                       ?, ?
                FROM users u
                LEFT JOIN employer_profiles ep ON ep.user_id = u.id
                WHERE u.role = 'employer' AND ep.user_id IS NULL
            ", [$now, $now]);
        }

        // Ensure every applicant has an applicant_profile.
        DB::statement("
            INSERT INTO applicant_profiles (user_id, phone, location, created_at, updated_at)
            SELECT u.id,
                   NULL as phone,
                   NULL as location,
                   ?, ?
            FROM users u
            LEFT JOIN applicant_profiles ap ON ap.user_id = u.id
            WHERE u.role = 'applicant' AND ap.user_id IS NULL
        ", [$now, $now]);

        if (Schema::hasTable('user_profiles')) {
            Schema::drop('user_profiles');
        }
    }

    public function down(): void
    {
        // No-op: data migration.
    }
};
