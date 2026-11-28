<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerOrderTest extends TestCase
{
    use RefreshDatabase;

    private function customer(string $email): User
    {
        return User::forceCreate(['name' => 'C', 'email' => $email, 'password' => Hash::make('x'), 'role' => 'customer']);
    }

    private function orderFor(?int $userId, string $no): Order
    {
        return Order::create([
            'order_number' => $no, 'user_id' => $userId,
            'customer_name' => 'X', 'customer_email' => 'x@example.com',
            'status' => 'pending', 'subtotal' => 100, 'shipping_fee' => 0, 'total' => 100, 'placed_at' => now(),
        ]);
    }

    public function test_unauthenticated_cannot_list_orders(): void
    {
        $this->getJson('/api/v1/my-orders')->assertUnauthorized();
    }

    public function test_customer_sees_only_own_orders(): void
    {
        $a = $this->customer('a@example.com');
        $b = $this->customer('b@example.com');
        $this->orderFor($a->id, 'A-1');
        $this->orderFor($b->id, 'B-1');
        $this->orderFor(null, 'GUEST-1');

        Sanctum::actingAs($a, ['*']);
        $this->getJson('/api/v1/my-orders')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_customer_cannot_view_others_order(): void
    {
        $a = $this->customer('a@example.com');
        $b = $this->customer('b@example.com');
        $ordA = $this->orderFor($a->id, 'A-1');

        Sanctum::actingAs($b, ['*']);
        $this->getJson("/api/v1/my-orders/{$ordA->id}")->assertNotFound();
    }
}
