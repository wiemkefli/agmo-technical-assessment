<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_employer_and_receive_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Acme Inc',
            'email' => 'acme@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'employer',
            'website' => 'https://acme.example',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'role'],
            'token',
        ]);
        $response->assertJsonPath('data.role', 'employer');
    }

    public function test_user_can_login_with_email_and_password_and_receive_token(): void
    {
        // Seed creates these demo users.
        $this->artisan('migrate');
        $this->artisan('db:seed');

        $response = $this->postJson('/api/auth/login', [
            'email' => 'employer@example.com',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'role'],
            'token',
        ]);
    }

    public function test_login_with_invalid_credentials_returns_401(): void
    {
        $this->artisan('migrate');
        $this->artisan('db:seed');

        $response = $this->postJson('/api/auth/login', [
            'email' => 'employer@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('message', 'Invalid credentials');
    }

    public function test_applicant_cannot_register_with_employer_only_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jane Applicant',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'applicant',
            'website' => 'https://should-not-be-allowed.example',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['website']);
    }
}

