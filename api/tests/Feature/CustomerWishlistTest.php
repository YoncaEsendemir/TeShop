<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerWishlistTest extends TestCase
{
    use RefreshDatabase;

    private function customer(): User
    {
        return User::forceCreate(['name' => 'C', 'email' => 'c@example.com', 'password' => Hash::make('x'), 'role' => 'customer']);
    }

    private function product(): Product
    {
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);

        return Product::create(['category_id' => $cat->id, 'name' => 'Tişört', 'slug' => 'tisort', 'base_price' => 100, 'is_active' => true]);
    }

    public function test_unauthenticated_cannot_access_wishlist(): void
    {
        $this->getJson('/api/v1/wishlist')->assertUnauthorized();
    }

    public function test_toggle_adds_then_removes(): void
    {
        $c = $this->customer();
        $p = $this->product();
        Sanctum::actingAs($c, ['*']);

        $this->postJson('/api/v1/wishlist/toggle', ['product_id' => $p->id])
            ->assertOk()->assertJsonPath('in_wishlist', true);
        $this->assertDatabaseHas('wishlists', ['user_id' => $c->id, 'product_id' => $p->id]);

        $this->postJson('/api/v1/wishlist/toggle', ['product_id' => $p->id])
            ->assertOk()->assertJsonPath('in_wishlist', false);
        $this->assertDatabaseMissing('wishlists', ['user_id' => $c->id, 'product_id' => $p->id]);
    }

    public function test_index_returns_own_wishlist(): void
    {
        $c = $this->customer();
        $p = $this->product();
        Sanctum::actingAs($c, ['*']);
        $this->postJson('/api/v1/wishlist/toggle', ['product_id' => $p->id])->assertOk();

        $this->getJson('/api/v1/wishlist')->assertOk()->assertJsonCount(1, 'data');
    }
}
