<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function customer(bool $verified): User
    {
        return User::forceCreate([
            'name' => 'C', 'email' => 'c@example.com', 'password' => Hash::make('x'),
            'role' => 'customer', 'email_verified_at' => $verified ? now() : null,
        ]);
    }

    /** @return array{0: Product, 1: ProductVariant} */
    private function product(): array
    {
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $p = Product::create(['category_id' => $cat->id, 'name' => 'Tişört', 'slug' => 'tisort', 'base_price' => 100, 'is_active' => true]);
        $v = ProductVariant::create(['product_id' => $p->id, 'sku' => 'T-S', 'size' => 'S', 'color' => 'Siyah', 'stock' => 10, 'is_active' => true]);

        return [$p, $v];
    }

    private function payload(Product $p, ProductVariant $v): array
    {
        return [
            'customer_name' => 'Ali Veli', 'customer_email' => 'ali@example.com',
            'address' => 'İstanbul, Örnek Mah.',
            'items' => [['product_id' => $p->id, 'variant_id' => $v->id, 'qty' => 2]],
        ];
    }

    public function test_unauthenticated_cannot_checkout(): void
    {
        [$p, $v] = $this->product();
        $this->postJson('/api/v1/checkout', $this->payload($p, $v))->assertUnauthorized();
    }

    public function test_unverified_customer_cannot_checkout(): void
    {
        Sanctum::actingAs($this->customer(false), ['*']);
        [$p, $v] = $this->product();
        $this->postJson('/api/v1/checkout', $this->payload($p, $v))->assertStatus(403);
    }

    public function test_verified_customer_checkout_creates_pending_order(): void
    {
        $user = $this->customer(true);
        Sanctum::actingAs($user, ['*']);
        [$p, $v] = $this->product();

        $this->postJson('/api/v1/checkout', $this->payload($p, $v))
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total', '229.90'); // 2*100 + 29.90 kargo

        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'pending']);
    }
}
