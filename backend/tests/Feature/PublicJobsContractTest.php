<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicJobsContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_jobs_response_shape_and_employer_does_not_include_email(): void
    {
        $employer = User::factory()->employer()->create();
        $employer->employerProfile()->update(['website' => 'https://example.test']);

        $job = Job::factory()->published()->for($employer, 'employer')->create([
            'salary_min' => 3000,
            'salary_max' => 5000,
        ]);

        $response = $this->getJson('/api/jobs?per_page=10');
        $response->assertOk();

        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'employer_id',
                    'title',
                    'description',
                    'location',
                    'salary_min',
                    'salary_max',
                    'salary_range',
                    'is_remote',
                    'status',
                    'published_at',
                    'created_at',
                    'updated_at',
                    'employer' => [
                        'id',
                        'company',
                        'website',
                    ],
                ],
            ],
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ],
        ]);

        $data = collect($response->json('data'));
        $item = $data->firstWhere('id', $job->id);
        $this->assertNotNull($item);
        $this->assertSame('3000-5000', $item['salary_range']);
        $this->assertArrayNotHasKey('email', $item['employer']);
    }
}

