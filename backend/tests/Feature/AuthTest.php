<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_a_farmer_can_register_and_then_log_in(): void
    {
        $registerResponse = $this->postJson('/api/register', [
            'username' => 'Test Farmer',
            'email' => 'farmer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'farmer',
        ]);

        $registerResponse->assertStatus(200);
        $this->assertDatabaseHas('users', ['email' => 'farmer@example.com']);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'farmer@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure(['status', 'token', 'id', 'name', 'roles']);

        $this->assertSame('farmer', $loginResponse->json('roles.0.name'));
    }

    public function test_login_fails_with_an_incorrect_password(): void
    {
        User::factory()->create([
            'email' => 'farmer@example.com',
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'farmer@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_registration_fails_when_passwords_do_not_match(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => 'Test Farmer',
            'email' => 'farmer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'something-else',
            'role' => 'farmer',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'farmer@example.com']);
    }

    public function test_registration_fails_when_email_is_already_taken(): void
    {
        User::factory()->create(['email' => 'farmer@example.com']);

        $response = $this->postJson('/api/register', [
            'username' => 'Another Farmer',
            'email' => 'farmer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'farmer',
        ]);

        $response->assertStatus(422);
    }
}
