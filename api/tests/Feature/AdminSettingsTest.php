<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(string $password = 'password'): User
    {
        $admin = User::forceCreate([
            'name' => 'Admin', 'email' => 'admin@teshop.test',
            'password' => Hash::make($password), 'role' => 'admin',
        ]);
        Sanctum::actingAs($admin, ['admin']);

        return $admin;
    }

    public function test_password_change_requires_correct_current(): void
    {
        $this->admin();

        $this->putJson('/api/v1/admin/password', [
            'current_password' => 'wrong',
            'new_password' => 'yenisifre123',
            'new_password_confirmation' => 'yenisifre123',
        ])->assertStatus(422);

        $this->putJson('/api/v1/admin/password', [
            'current_password' => 'password',
            'new_password' => 'yenisifre123',
            'new_password_confirmation' => 'yenisifre123',
        ])->assertOk();

        // Yeni şifreyle giriş yapılabilmeli
        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@teshop.test',
            'password' => 'yenisifre123',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    public function test_profile_update_rejects_taken_email(): void
    {
        $this->admin();
        User::forceCreate([
            'name' => 'Diğer', 'email' => 'other@example.com',
            'password' => Hash::make('x'), 'role' => 'admin',
        ]);

        $this->putJson('/api/v1/admin/profile', [
            'name' => 'Yeni Ad', 'email' => 'other@example.com',
        ])->assertStatus(422);

        $this->putJson('/api/v1/admin/profile', [
            'name' => 'Yeni Ad', 'email' => 'admin@teshop.test',
        ])->assertOk()->assertJsonPath('name', 'Yeni Ad');
    }

    public function test_settings_put_and_public_get_whitelist(): void
    {
        $this->admin();

        $this->putJson('/api/v1/admin/settings', [
            'store_name' => 'TeShop Mağaza',
            'store_email' => 'info@teshop.test',
            'store_phone' => '+90 212 000 00 00',
            'store_address' => 'İstanbul',
        ])->assertOk();

        $this->getJson('/api/v1/settings')
            ->assertOk()
            ->assertJsonPath('store_name', 'TeShop Mağaza')
            ->assertJsonPath('store_email', 'info@teshop.test');
    }
}
