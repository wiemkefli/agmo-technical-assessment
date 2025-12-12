<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $demoEmployer = User::factory()->employer()->create([
            'name' => 'Demo Employer',
            'email' => 'employer@example.com',
        ]);

        $demoApplicant = User::factory()->applicant()->create([
            'name' => 'Demo Applicant',
            'email' => 'applicant@example.com',
        ]);

        $employers = User::factory()->employer()->count(3)->create();
        $applicants = User::factory()->applicant()->count(8)->create();

        $employers = $employers->push($demoEmployer);
        $applicants = $applicants->push($demoApplicant);

        $publishedJobs = collect();

        $employers->each(function (User $employer) use (&$publishedJobs) {
            $published = Job::factory()
                ->published()
                ->count(4)
                ->for($employer, 'employer')
                ->create();

            Job::factory()
                ->draft()
                ->count(1)
                ->for($employer, 'employer')
                ->create();

            $publishedJobs = $publishedJobs->concat($published);
        });

        $publishedJobs->each(function (Job $job) use ($applicants) {
            $count = rand(0, 3);
            if ($count === 0) {
                return;
            }

            $selectedApplicants = $applicants->random($count);

            foreach (collect($selectedApplicants) as $applicant) {
                Application::factory()
                    ->for($job)
                    ->for($applicant, 'applicant')
                    ->create();
            }
        });
    }
}
