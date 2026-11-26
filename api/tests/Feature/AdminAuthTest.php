<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::forceCreate([
            'name' => 'Admin',
            'email' => 'admin@teshop.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }

    private function customer(): User
    {
        return User::create([
            'name' => 'Müşteri',
            'email' => 'musteri@teshop.test',
            'password' => Hash::make('password'),
        ]);
    }

    public function test_admin_can_login_and_receive_token(): void
    {
        $this->admin();

        $res = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@teshop.test',
            'password' => 'password',
        ]);

        $res->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->admin();

        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@teshop.test',
            'password' => 'yanlis',
        ])->assertStatus(422);
    }

    public function test_non_admin_cannot_login_to_panel(): void
    {
        $this->customer();

        $this->postJson('/api/v1/admin/login', [
            'email' => 'musteri@teshop.test',
            'password' => 'password',
        ])->assertStatus(403);
    }

    public function test_protected_route_requires_token(): void
    {
        $this->getJson('/api/v1/admin/me')->assertUnauthorized(); // 401
    }

    public function test_me_returns_admin_with_token(): void
    {
        $admin = $this->admin();
        $token = $admin->createToken('test', ['admin'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/me')
            ->assertOk()
            ->assertJsonPath('email', 'admin@teshop.test');
    }

    public function test_customer_token_cannot_access_admin_routes(): void
    {
        $customer = $this->customer();
        $token = $customer->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(403);
    }

    public function test_role_is_not_mass_assignable(): void
    {
        // Güvenlik: kullanıcı girdisinden 'role' atanamamalı (yetki yükseltme koruması)
        $user = User::create([
            'name' => 'Sahte',
            'email' => 'sahte@teshop.test',
            'password' => Hash::make('password'),
            'role' => 'admin', // enjekte denemesi
        ]);

        $this->assertSame('customer', $user->fresh()->role);
    }
}
