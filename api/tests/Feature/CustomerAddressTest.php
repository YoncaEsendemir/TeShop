<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerAddressTest extends TestCase
{
    use RefreshDatabase;

    private function customer(string $email = 'c@example.com'): User
    {
        return User::forceCreate(['name' => 'C', 'email' => $email, 'password' => Hash::make('x'), 'role' => 'customer']);
    }

    private array $valid = [
        'title' => 'Ev', 'full_name' => 'Ali Veli', 'phone' => '05000000000',
        'line1' => 'Örnek Mah. 1. Sk No 2', 'city' => 'İstanbul', 'postal_code' => '34000',
    ];

    public function test_unauthenticated_cannot_list_addresses(): void
    {
        $this->getJson('/api/v1/addresses')->assertUnauthorized();
    }

    public function test_customer_can_create_and_list_own_address(): void
    {
        Sanctum::actingAs($this->customer(), ['*']);

        $this->postJson('/api/v1/addresses', $this->valid)
            ->assertCreated()->assertJsonPath('data.city', 'İstanbul');

        $this->getJson('/api/v1/addresses')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_customer_cannot_access_others_address(): void
    {
        $a = $this->customer('a@example.com');
        $b = $this->customer('b@example.com');
        $addr = Address::create($this->valid + ['user_id' => $a->id]);

        Sanctum::actingAs($b, ['*']);

        $this->getJson('/api/v1/addresses')->assertOk()->assertJsonCount(0, 'data');
        $this->putJson("/api/v1/addresses/{$addr->id}", $this->valid)->assertNotFound();
        $this->deleteJson("/api/v1/addresses/{$addr->id}")->assertNotFound();
    }

    public function test_customer_can_delete_own_address(): void
    {
        $c = $this->customer();
        $addr = Address::create($this->valid + ['user_id' => $c->id]);
        Sanctum::actingAs($c, ['*']);

        $this->deleteJson("/api/v1/addresses/{$addr->id}")->assertOk();
        $this->assertDatabaseMissing('addresses', ['id' => $addr->id]);
    }
}
