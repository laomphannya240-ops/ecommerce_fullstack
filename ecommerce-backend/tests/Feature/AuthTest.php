<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_customer_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Customer',
            'email' => 'new@example.com',
            'phone' => '+855 12 000 111',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'new@example.com')
            ->assertJsonPath('data.user.role', 'customer')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email'], 'token']]);

        $this->assertDatabaseHas('users', [
            'email' => 'new@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_registration_rejects_duplicate_email_and_weak_password(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Duplicate',
            'email' => 'existing@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_a_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'shopper@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'shopper@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'shopper@example.com']);

        $this->postJson('/api/login', [
            'email' => 'shopper@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_inactive_users_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'blocked@example.com',
            'password' => 'password123',
            'is_active' => false,
        ]);

        $this->postJson('/api/login', [
            'email' => 'blocked@example.com',
            'password' => 'password123',
        ])->assertForbidden();
    }

    public function test_change_password_reports_an_error_on_the_current_password_field(): void
    {
        $user = User::factory()->create(['password' => 'password123']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/user/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('current_password');
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_logout_revokes_the_current_access_token(): void
    {
        $user = User::factory()->create([
            'email' => 'shopper@example.com',
            'password' => 'password123',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'shopper@example.com',
            'password' => 'password123',
        ]);

        $token = $login->json('data.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // The auth guard is cached for the lifetime of a single test case, so
        // reset it to simulate a brand new HTTP request hitting the API.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user')
            ->assertUnauthorized();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertTrue($user->exists);
    }
}
