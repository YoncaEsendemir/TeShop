<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCrudTest extends TestCase
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

    public function test_admin_can_create_category(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/categories', ['name' => 'Ayakkabı'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'ayakkabi');

        $this->assertDatabaseHas('categories', ['name' => 'Ayakkabı']);
    }

    public function test_admin_can_update_and_delete_category(): void
    {
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Eski', 'slug' => 'eski']);

        $this->putJson("/api/v1/admin/categories/{$cat->id}", ['name' => 'Yeni'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Yeni');

        $this->deleteJson("/api/v1/admin/categories/{$cat->id}")->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_admin_can_create_product(): void
    {
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);

        $this->postJson('/api/v1/admin/products', [
            'category_id' => $cat->id,
            'name' => 'Yeni Ürün',
            'base_price' => 199.90,
        ])->assertCreated()->assertJsonPath('data.slug', 'yeni-urun');
    }

    public function test_product_validation_rejects_missing_fields(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/products', ['name' => 'Eksik'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category_id', 'base_price']);
    }

    public function test_discount_price_must_be_less_than_base(): void
    {
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);

        $this->postJson('/api/v1/admin/products', [
            'category_id' => $cat->id,
            'name' => 'Hatalı İndirim',
            'base_price' => 100,
            'discount_price' => 150, // base'den büyük -> hata
        ])->assertStatus(422)->assertJsonValidationErrors(['discount_price']);
    }

    public function test_guest_cannot_create_product(): void
    {
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);

        $this->postJson('/api/v1/admin/products', [
            'category_id' => $cat->id,
            'name' => 'İzinsiz',
            'base_price' => 10,
        ])->assertUnauthorized(); // 401
    }

    public function test_image_upload_accepts_image_and_randomizes_name(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $product = Product::create(['category_id' => $cat->id, 'name' => 'Ü', 'slug' => 'u', 'base_price' => 10]);

        $file = UploadedFile::fake()->image('photo.jpg', 600, 800);

        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images", [
            'image' => $file,
            'is_primary' => true,
        ]);

        $res->assertCreated()->assertJsonPath('data.is_primary', true);
        // İsim randomize edilmeli (orijinal adı içermemeli)
        $this->assertStringNotContainsString('photo', $res->json('data.path'));
    }

    public function test_image_upload_rejects_non_image(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $product = Product::create(['category_id' => $cat->id, 'name' => 'Ü', 'slug' => 'u', 'base_price' => 10]);

        $file = UploadedFile::fake()->create('virus.pdf', 100, 'application/pdf');

        $this->postJson("/api/v1/admin/products/{$product->id}/images", ['image' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_can_add_variant_to_product(): void
    {
        $this->actingAsAdmin();
        $cat = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $product = Product::create(['category_id' => $cat->id, 'name' => 'Ü', 'slug' => 'u', 'base_price' => 10]);

        $this->postJson("/api/v1/admin/products/{$product->id}/variants", [
            'sku' => 'TEST-SKU-1',
            'size' => 'L',
            'color' => 'Siyah',
            'stock' => 5,
        ])->assertCreated()->assertJsonPath('data.stock', 5);
    }
}
