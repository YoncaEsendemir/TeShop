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

        // --- Ek ana kategoriler ---
        $spor = Category::create(['name' => ['tr' => 'Spor', 'en' => 'Sport', 'de' => 'Sport'], 'slug' => 'spor']);
        $ayakkabi = Category::create(['name' => ['tr' => 'Ayakkabı', 'en' => 'Shoes', 'de' => 'Schuhe'], 'slug' => 'ayakkabi']);
        $aksesuar = Category::create(['name' => ['tr' => 'Aksesuar', 'en' => 'Accessories', 'de' => 'Accessoires'], 'slug' => 'aksesuar']);
        $indirim = Category::create(['name' => ['tr' => 'İndirim', 'en' => 'Sale', 'de' => 'Sale'], 'slug' => 'indirim']);

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

            // Spor
            [$spor, ['tr' => 'Dry-Fit Spor Tişört', 'en' => 'Dry-Fit Sports T-Shirt', 'de' => 'Dry-Fit Sportshirt'], 349.90, 299.90, ['S', 'M', 'L', 'XL'], ['Siyah', 'Gri'], $img('1571019613454-1cb2f99b2d8b')],
            [$spor, ['tr' => 'Eşofman Altı', 'en' => 'Sweatpants', 'de' => 'Jogginghose'], 599.90, null, ['S', 'M', 'L', 'XL'], ['Siyah', 'Antrasit'], $img('1552902865-b72c031ac5ea')],
            [$spor, ['tr' => 'Koşu Şortu', 'en' => 'Running Shorts', 'de' => 'Laufshorts'], 279.90, null, ['S', 'M', 'L', 'XL'], ['Siyah', 'Lacivert'], $img('1483721310020-03333e577078')],

            // Ayakkabı
            [$ayakkabi, ['tr' => 'Koşu Ayakkabısı', 'en' => 'Running Shoes', 'de' => 'Laufschuhe'], 1299.90, 999.90, ['39', '40', '41', '42', '43', '44'], ['Siyah', 'Beyaz'], $img('1542291026-7eec264c27ff')],
            [$ayakkabi, ['tr' => 'Günlük Sneaker', 'en' => 'Casual Sneakers', 'de' => 'Freizeit-Sneaker'], 899.90, null, ['39', '40', '41', '42', '43', '44'], ['Beyaz', 'Gri'], $img('1600185365483-26d7a4cc7519')],
            [$ayakkabi, ['tr' => 'Deri Bot', 'en' => 'Leather Boots', 'de' => 'Lederstiefel'], 1599.90, null, ['39', '40', '41', '42', '43', '44'], ['Siyah', 'Kahve'], $img('1608256246200-53e635b5b65f')],

            // Aksesuar
            [$aksesuar, ['tr' => 'Deri Kemer', 'en' => 'Leather Belt', 'de' => 'Ledergürtel'], 299.90, null, ['Std'], ['Siyah', 'Kahve'], $img('1624222247344-550fb60583dc')],
            [$aksesuar, ['tr' => 'Örgü Bere', 'en' => 'Knit Beanie', 'de' => 'Strickmütze'], 199.90, 149.90, ['Std'], ['Siyah', 'Gri'], $img('1510598969022-c4c6c5d05769')],
            [$aksesuar, ['tr' => 'Kanvas Sırt Çantası', 'en' => 'Canvas Backpack', 'de' => 'Canvas-Rucksack'], 499.90, null, ['Std'], ['Siyah', 'Haki'], $img('1547949003-9792a18a2601')],

            // İndirim (hepsi indirimli)
            [$indirim, ['tr' => 'Triko Panço', 'en' => 'Knit Poncho', 'de' => 'Strickponcho'], 749.90, 499.90, ['Std'], ['Bej', 'Gri'], $img('1434389677669-e08b4cac3105')],
            [$indirim, ['tr' => 'Klasik Gömlek', 'en' => 'Classic Shirt', 'de' => 'Klassisches Hemd'], 449.90, 299.90, ['S', 'M', 'L', 'XL'], ['Lacivert', 'Beyaz', 'Bordo'], $img('1602810318383-e386cc2a3ccf')],
            [$indirim, ['tr' => 'Deri Ceket', 'en' => 'Leather Jacket', 'de' => 'Lederjacke'], 1499.90, 999.90, ['M', 'L', 'XL'], ['Siyah', 'Kahve'], $img('1487222477894-8943e31ef7b2')],
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
