<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(array $attrs = [], int $stock = 10): Product
    {
        $category = Category::firstOrCreate(
            ['slug' => $attrs['category_slug'] ?? 'kadin'],
            ['name' => 'Kadın'],
        );
        $product = Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Test Ürün',
            'slug' => 'test-urun',
            'base_price' => 100,
            'is_active' => true,
        ], collect($attrs)->except('category_slug')->all()));

        ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-'.$product->id,
            'size' => 'M',
            'color' => 'Siyah',
            'stock' => $stock,
        ]);

        return $product;
    }

    public function test_categories_endpoint_returns_only_active_top_level_with_children(): void
    {
        $parent = Category::create(['name' => 'Kadın', 'slug' => 'kadin', 'is_active' => true]);
        Category::create(['name' => 'Üst', 'slug' => 'kadin-ust', 'parent_id' => $parent->id, 'is_active' => true]);
        Category::create(['name' => 'Pasif', 'slug' => 'pasif', 'is_active' => false]);

        $res = $this->getJson('/api/v1/categories');

        $res->assertOk()
            ->assertJsonCount(1, 'data') // sadece 1 aktif ana kategori
            ->assertJsonPath('data.0.slug', 'kadin')
            ->assertJsonCount(1, 'data.0.children');
    }

    public function test_products_list_is_paginated_and_only_active(): void
    {
        $this->makeProduct(['name' => 'Aktif', 'slug' => 'aktif']);
        $this->makeProduct(['name' => 'Pasif', 'slug' => 'pasif', 'is_active' => false]);

        $res = $this->getJson('/api/v1/products');

        $res->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.per_page', 12);
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        $this->makeProduct(['name' => 'Kadın Ürün', 'slug' => 'kadin-urun', 'category_slug' => 'kadin']);
        $this->makeProduct(['name' => 'Erkek Ürün', 'slug' => 'erkek-urun', 'category_slug' => 'erkek']);

        $res = $this->getJson('/api/v1/products?category=erkek');

        $res->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'erkek-urun');
    }

    public function test_products_can_be_searched(): void
    {
        $this->makeProduct(['name' => 'Siyah Tişört', 'slug' => 'siyah-tisort']);
        $this->makeProduct(['name' => 'Mavi Pantolon', 'slug' => 'mavi-pantolon']);

        $res = $this->getJson('/api/v1/products?search=tişört');

        $res->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'siyah-tisort');
    }

    public function test_products_sort_by_price_ascending(): void
    {
        $this->makeProduct(['name' => 'Pahalı', 'slug' => 'pahali', 'base_price' => 500]);
        $this->makeProduct(['name' => 'Ucuz', 'slug' => 'ucuz', 'base_price' => 50]);

        $res = $this->getJson('/api/v1/products?sort=price_asc');

        $res->assertOk()->assertJsonPath('data.0.slug', 'ucuz');
    }

    public function test_product_detail_returns_variants_and_category(): void
    {
        $this->makeProduct(['name' => 'Detay', 'slug' => 'detay-urun']);

        $res = $this->getJson('/api/v1/products/detay-urun');

        $res->assertOk()
            ->assertJsonPath('data.slug', 'detay-urun')
            ->assertJsonCount(1, 'data.variants')
            ->assertJsonPath('data.variants.0.in_stock', true);
    }

    public function test_product_detail_404_for_inactive_or_missing(): void
    {
        $this->makeProduct(['name' => 'Gizli', 'slug' => 'gizli', 'is_active' => false]);

        $this->getJson('/api/v1/products/gizli')->assertNotFound();
        $this->getJson('/api/v1/products/yok-boyle')->assertNotFound();
    }

    public function test_discount_fields_are_computed(): void
    {
        $this->makeProduct(['name' => 'İndirimli', 'slug' => 'indirimli', 'base_price' => 200, 'discount_price' => 150]);

        $this->getJson('/api/v1/products/indirimli')
            ->assertOk()
            ->assertJsonPath('data.has_discount', true)
            ->assertJsonPath('data.final_price', '150.00');
    }
}
