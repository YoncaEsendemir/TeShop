<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // --- Ana kategoriler ---
        $kadin = Category::create(['name' => 'Kadın', 'slug' => 'kadin']);
        $erkek = Category::create(['name' => 'Erkek', 'slug' => 'erkek']);

        // --- Alt kategoriler ---
        $kadinUst = Category::create(['name' => 'Üst Giyim', 'slug' => 'kadin-ust-giyim', 'parent_id' => $kadin->id]);
        $kadinAlt = Category::create(['name' => 'Alt Giyim', 'slug' => 'kadin-alt-giyim', 'parent_id' => $kadin->id]);
        $erkekUst = Category::create(['name' => 'Üst Giyim', 'slug' => 'erkek-ust-giyim', 'parent_id' => $erkek->id]);
        $erkekAlt = Category::create(['name' => 'Alt Giyim', 'slug' => 'erkek-alt-giyim', 'parent_id' => $erkek->id]);

        // --- Ürünler (kategori, ad, fiyat, indirim, bedenler, renkler) ---
        $urunler = [
            [$kadinUst, 'Oversize Basic Tişört', 299.90, 249.90, ['S', 'M', 'L', 'XL'], ['Siyah', 'Beyaz', 'Gri']],
            [$kadinUst, 'Crop Sweatshirt', 549.90, null, ['S', 'M', 'L'], ['Siyah', 'Bej']],
            [$kadinAlt, 'Yüksek Bel Mom Jean', 799.90, 649.90, ['36', '38', '40', '42'], ['Mavi', 'Siyah']],
            [$erkekUst, 'Regular Fit Tişört', 279.90, null, ['S', 'M', 'L', 'XL'], ['Siyah', 'Beyaz', 'Lacivert']],
            [$erkekUst, 'Kapüşonlu Sweatshirt', 699.90, 599.90, ['M', 'L', 'XL'], ['Siyah', 'Antrasit']],
            [$erkekAlt, 'Slim Fit Chino Pantolon', 649.90, null, ['30', '32', '34', '36'], ['Siyah', 'Bej', 'Lacivert']],
        ];

        foreach ($urunler as [$kategori, $ad, $fiyat, $indirim, $bedenler, $renkler]) {
            $product = Product::create([
                'category_id' => $kategori->id,
                'name' => $ad,
                'slug' => Str::slug($ad),
                'description' => $ad.' — premium kumaş, modern kesim. Koyu tema mağazamızın öne çıkan parçası.',
                'base_price' => $fiyat,
                'discount_price' => $indirim,
                'is_active' => true,
            ]);

            // Her beden + renk kombinasyonu bir varyant (kendi stoğuyla)
            foreach ($renkler as $renk) {
                foreach ($bedenler as $beden) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::slug($ad)).'-'.Str::upper(Str::substr($renk, 0, 3)).'-'.$beden,
                        'size' => $beden,
                        'color' => $renk,
                        'price' => null, // base_price kullanılır
                        'stock' => rand(0, 25),
                        'is_active' => true,
                    ]);
                }
            }

            // Ürün geneli bir kapak görseli (placeholder yol — gerçek yükleme Faz 2'de)
            ProductImage::create([
                'product_id' => $product->id,
                'variant_id' => null,
                'path' => 'products/placeholder-'.$product->id.'.jpg',
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
