<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_unverified_customer_and_sends_verification(): void
    {
        Notification::fake();

        $res = $this->postJson('/api/v1/register', [
            'name' => 'Müşteri',
            'email' => 'musteri@example.com',
            'password' => 'gizli1234',
            'password_confirmation' => 'gizli1234',
        ])->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'musteri@example.com', 'role' => 'customer', 'email_verified_at' => null]);

        $user = User::where('email', 'musteri@example.com')->first();
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->assertNotNull($res->json('token'));
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::forceCreate(['name' => 'A', 'email' => 'dupe@example.com', 'password' => Hash::make('x'), 'role' => 'customer']);

        $this->postJson('/api/v1/register', [
            'name' => 'B', 'email' => 'dupe@example.com',
            'password' => 'gizli1234', 'password_confirmation' => 'gizli1234',
        ])->assertStatus(422);
    }

    public function test_login_returns_token_and_me_works(): void
    {
        User::forceCreate(['name' => 'C', 'email' => 'c@example.com', 'password' => Hash::make('gizli1234'), 'role' => 'customer']);

        $token = $this->postJson('/api/v1/login', ['email' => 'c@example.com', 'password' => 'gizli1234'])
            ->assertOk()->json('token');

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/me')
            ->assertOk()->assertJsonPath('email', 'c@example.com');
    }

    public function test_login_wrong_password_is_rejected(): void
    {
        User::forceCreate(['name' => 'D', 'email' => 'd@example.com', 'password' => Hash::make('gizli1234'), 'role' => 'customer']);

        $this->postJson('/api/v1/login', ['email' => 'd@example.com', 'password' => 'yanlis'])
            ->assertStatus(422);
    }
}
