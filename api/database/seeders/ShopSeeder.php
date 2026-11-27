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
        // --- Ana kategoriler (çok dilli) ---
        $kadin = Category::create(['name' => ['tr' => 'Kadın', 'en' => 'Women', 'de' => 'Damen'], 'slug' => 'kadin']);
        $erkek = Category::create(['name' => ['tr' => 'Erkek', 'en' => 'Men', 'de' => 'Herren'], 'slug' => 'erkek']);

        // --- Alt kategoriler ---
        $top = ['tr' => 'Üst Giyim', 'en' => 'Tops', 'de' => 'Oberteile'];
        $bottom = ['tr' => 'Alt Giyim', 'en' => 'Bottoms', 'de' => 'Unterteile'];
        $kadinUst = Category::create(['name' => $top, 'slug' => 'kadin-ust-giyim', 'parent_id' => $kadin->id]);
        $kadinAlt = Category::create(['name' => $bottom, 'slug' => 'kadin-alt-giyim', 'parent_id' => $kadin->id]);
        $erkekUst = Category::create(['name' => $top, 'slug' => 'erkek-ust-giyim', 'parent_id' => $erkek->id]);
        $erkekAlt = Category::create(['name' => $bottom, 'slug' => 'erkek-alt-giyim', 'parent_id' => $erkek->id]);

        // açıklama şablonu (dile göre)
        $desc = fn (array $n): array => [
            'tr' => $n['tr'].' — premium kumaş, modern kesim. Koyu tema mağazamızın öne çıkan parçası.',
            'en' => $n['en'].' — premium fabric, modern cut. A standout piece from our dark-theme store.',
            'de' => $n['de'].' — Premium-Stoff, moderner Schnitt. Ein Highlight aus unserem Dark-Theme-Shop.',
        ];

        // Başlığa uygun örnek görseller (Unsplash lisansı: ticari kullanım serbest, atıf gerekmez).
        // Gerçek ürün fotoğrafları admin panelinden yüklenebilir.
        $img = fn (string $id): string => "https://images.unsplash.com/photo-{$id}?w=800&h=1000&fit=crop&q=80";

        // --- Ürünler: [kategori, çok dilli ad, fiyat, indirim, bedenler, renkler, görsel] ---
        $urunler = [
            [$kadinUst, ['tr' => 'Oversize Basic Tişört', 'en' => 'Oversize Basic T-Shirt', 'de' => 'Oversize Basic T-Shirt'], 299.90, 249.90, ['S', 'M', 'L', 'XL'], ['Siyah', 'Beyaz', 'Gri'], $img('1581655353564-df123a1eb820')],
            [$kadinUst, ['tr' => 'Crop Sweatshirt', 'en' => 'Crop Sweatshirt', 'de' => 'Crop-Sweatshirt'], 549.90, null, ['S', 'M', 'L'], ['Siyah', 'Bej'], $img('1515886657613-9f3515b0c78f')],
            [$kadinAlt, ['tr' => 'Yüksek Bel Mom Jean', 'en' => 'High-Waist Mom Jeans', 'de' => 'High-Waist Mom-Jeans'], 799.90, 649.90, ['36', '38', '40', '42'], ['Mavi', 'Siyah'], $img('1542272604-787c3835535d')],
            [$erkekUst, ['tr' => 'Regular Fit Tişört', 'en' => 'Regular Fit T-Shirt', 'de' => 'Regular-Fit T-Shirt'], 279.90, null, ['S', 'M', 'L', 'XL'], ['Siyah', 'Beyaz', 'Lacivert'], $img('1562157873-818bc0726f68')],
            [$erkekUst, ['tr' => 'Kapüşonlu Sweatshirt', 'en' => 'Hooded Sweatshirt', 'de' => 'Kapuzen-Sweatshirt'], 699.90, 599.90, ['M', 'L', 'XL'], ['Siyah', 'Antrasit'], $img('1556821840-3a63f95609a7')],
            [$erkekAlt, ['tr' => 'Slim Fit Chino Pantolon', 'en' => 'Slim Fit Chino Trousers', 'de' => 'Slim-Fit Chino-Hose'], 649.90, null, ['30', '32', '34', '36'], ['Siyah', 'Bej', 'Lacivert'], $img('1473966968600-fa801b869a1a')],
        ];

        foreach ($urunler as [$kategori, $ad, $fiyat, $indirim, $bedenler, $renkler, $gorsel]) {
            $slug = Str::slug($ad['tr']);
            $product = Product::create([
                'category_id' => $kategori->id,
                'name' => $ad,
                'slug' => $slug,
                'description' => $desc($ad),
                'base_price' => $fiyat,
                'discount_price' => $indirim,
                'is_active' => true,
            ]);

            foreach ($renkler as $renk) {
                foreach ($bedenler as $beden) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::slug($ad['tr'])).'-'.Str::upper(Str::substr($renk, 0, 3)).'-'.$beden,
                        'size' => $beden,
                        'color' => $renk,
                        'price' => null,
                        'stock' => rand(0, 25),
                        'is_active' => true,
                    ]);
                }
            }

            ProductImage::create([
                'product_id' => $product->id,
                'variant_id' => null,
                'path' => $gorsel,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
