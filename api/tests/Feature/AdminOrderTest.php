<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        $admin = User::forceCreate([
            'name' => 'Admin',
            'email' => 'admin@teshop.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        Sanctum::actingAs($admin, ['admin']);

        return $admin;
    }

    /** @return array{0: Product, 1: ProductVariant} */
    private function makeProductWithVariant(float $price = 100): array
    {
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $p = Product::create([
            'category_id' => $cat->id,
            'name' => 'Tişört',
            'slug' => 'tisort',
            'base_price' => $price,
            'is_active' => true,
        ]);
        $v = ProductVariant::create([
            'product_id' => $p->id,
            'sku' => 'T-S',
            'size' => 'S',
            'color' => 'Siyah',
            'stock' => 10,
            'is_active' => true,
        ]);

        return [$p, $v];
    }

    public function test_unauthenticated_cannot_list_orders(): void
    {
        $this->getJson('/api/v1/admin/orders')->assertUnauthorized();
    }

    public function test_admin_can_create_order_and_total_is_computed(): void
    {
        $this->actingAsAdmin();
        [$p, $v] = $this->makeProductWithVariant(100);

        $this->postJson('/api/v1/admin/orders', [
            'customer_name' => 'Ali Veli',
            'customer_email' => 'ali@example.com',
            'shipping_fee' => 20,
            'items' => [
                ['product_id' => $p->id, 'variant_id' => $v->id, 'qty' => 2],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.total', '220.00') // 2*100 + 20
            ->assertJsonPath('data.customer_email', 'ali@example.com');

        $this->assertDatabaseHas('order_items', [
            'product_id' => $p->id,
            'qty' => 2,
            'unit_price' => 100.00,
            'line_total' => 200.00,
        ]);
    }

    public function test_order_store_requires_items(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/orders', [
            'customer_name' => 'Ali',
            'customer_email' => 'ali@example.com',
            'items' => [],
        ])->assertStatus(422);
    }

    public function test_admin_can_update_status_and_invalid_is_rejected(): void
    {
        $this->actingAsAdmin();
        $order = Order::create([
            'order_number' => 'ORD-TEST-1',
            'customer_name' => 'Ali',
            'customer_email' => 'ali@example.com',
            'status' => 'pending',
            'subtotal' => 100,
            'shipping_fee' => 0,
            'total' => 100,
            'placed_at' => now(),
        ]);

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'shipped'])
            ->assertOk()
            ->assertJsonPath('data.status', 'shipped');

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'nope'])
            ->assertStatus(422);
    }

    public function test_index_filters_by_status(): void
    {
        $this->actingAsAdmin();
        foreach (['pending', 'delivered', 'delivered'] as $i => $s) {
            Order::create([
                'order_number' => "ORD-$i",
                'customer_name' => 'X',
                'customer_email' => 'x@example.com',
                'status' => $s,
                'subtotal' => 10,
                'shipping_fee' => 0,
                'total' => 10,
                'placed_at' => now(),
            ]);
        }

        $this->getJson('/api/v1/admin/orders?status=delivered')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
