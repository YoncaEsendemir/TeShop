<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminStatsTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): void
    {
        $admin = User::forceCreate([
            'name' => 'Admin', 'email' => 'admin@teshop.test',
            'password' => Hash::make('password'), 'role' => 'admin',
        ]);
        Sanctum::actingAs($admin, ['admin']);
    }

    private function makeOrder(string $status, float $total): void
    {
        Order::create([
            'order_number' => 'ORD-'.uniqid(),
            'customer_name' => 'X', 'customer_email' => 'x@example.com',
            'status' => $status, 'subtotal' => $total, 'shipping_fee' => 0,
            'total' => $total, 'placed_at' => now(),
        ]);
    }

    public function test_revenue_excludes_cancelled_and_computes_average(): void
    {
        $this->actingAsAdmin();
        $this->makeOrder('paid', 100);
        $this->makeOrder('delivered', 100);
        $this->makeOrder('cancelled', 50); // gelire girmez

        $res = $this->getJson('/api/v1/admin/stats')->assertOk();

        $this->assertEquals(200, $res->json('total_revenue'));
        $this->assertEquals(100, $res->json('avg_order_value')); // 200 / 2
        $this->assertCount(6, $res->json('revenue_by_month'));
    }

    public function test_empty_state_has_no_division_by_zero(): void
    {
        $this->actingAsAdmin();

        $res = $this->getJson('/api/v1/admin/stats')->assertOk();

        $this->assertEquals(0, $res->json('total_revenue'));
        $this->assertEquals(0, $res->json('avg_order_value'));
        $this->assertCount(6, $res->json('revenue_by_month'));
    }
}
