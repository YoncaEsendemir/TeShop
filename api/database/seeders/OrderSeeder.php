<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::with('variants')->get();
        if ($products->isEmpty()) {
            return;
        }

        // Ağırlıklı durum dağılımı (çoğu tamamlanmış, bir kısmı iptal)
        $statuses = ['delivered', 'delivered', 'delivered', 'paid', 'paid', 'shipped', 'pending', 'cancelled'];

        $adlar = ['Ayşe Yılmaz', 'Mehmet Demir', 'Elif Kaya', 'Can Öztürk', 'Zeynep Şahin',
            'Burak Aydın', 'Deniz Arslan', 'Selin Doğan', 'Emre Çelik', 'Merve Koç'];

        for ($i = 0; $i < 55; $i++) {
            $placed = now()->subDays(rand(0, 179))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            $itemCount = rand(1, 4);
            $lines = [];
            $subtotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $variant = $product->variants->isNotEmpty() ? $product->variants->random() : null;
                $unit = $variant?->price ?? $product->discount_price ?? $product->base_price;
                $qty = rand(1, 3);
                $line = round((float) $unit * $qty, 2);
                $subtotal += $line;

                $lines[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->getTranslation('name', 'tr'),
                    'unit_price' => $unit,
                    'qty' => $qty,
                    'line_total' => $line,
                ];
            }

            $shipping = $subtotal >= 500 ? 0 : 29.90;
            $ad = $adlar[array_rand($adlar)];

            $order = Order::create([
                'order_number' => 'ORD-'.$placed->format('ymd').'-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'customer_name' => $ad,
                'customer_email' => Str::slug($ad, '.').'@example.com',
                'status' => $statuses[array_rand($statuses)],
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'total' => round($subtotal + $shipping, 2),
                'placed_at' => $placed,
                'created_at' => $placed,
                'updated_at' => $placed,
            ]);

            $order->items()->createMany($lines);
        }
    }
}
