<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        // Create profiles for users that don't have one yet.
        DB::statement("
            INSERT INTO user_profiles (user_id, company, created_at, updated_at)
            SELECT u.id,
                   CASE WHEN u.role = 'employer' THEN u.name ELSE NULL END,
                   ?, ?
            FROM users u
            LEFT JOIN user_profiles up ON up.user_id = u.id
            WHERE up.user_id IS NULL
        ", [$now, $now]);

        // Ensure employers have a company value (fallback to their name).
        DB::statement("
            UPDATE user_profiles up
            INNER JOIN users u ON u.id = up.user_id
            SET up.company = COALESCE(NULLIF(up.company, ''), u.name),
                up.updated_at = ?
            WHERE u.role = 'employer'
        ", [$now]);
    }

    public function down(): void
    {
        // No-op: this is a data backfill migration.
    }
};

