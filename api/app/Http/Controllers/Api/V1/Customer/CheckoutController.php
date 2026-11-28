<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * POST /checkout — sepetten sipariş oluşturur (pending).
     * Fiyatlar sunucuda hesaplanır (client'a güvenilmez). Yalnız doğrulanmış
     * e-postalı giriş yapmış kullanıcı (route'ta auth:sanctum + verified).
     */
    public function store(CheckoutRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        $order = DB::transaction(function () use ($data, $user) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = ! empty($item['variant_id']) ? ProductVariant::find($item['variant_id']) : null;
                $unit = $variant?->price ?? $product->discount_price ?? $product->base_price;
                $qty = (int) $item['qty'];
                $line = round((float) $unit * $qty, 2);
                $subtotal += $line;

                $lines[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'unit_price' => $unit,
                    'qty' => $qty,
                    'line_total' => $line,
                ];
            }

            // 500 TL üzeri ücretsiz kargo, altı 29.90
            $shipping = $subtotal >= 500 ? 0 : 29.90;

            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(5)),
                'user_id' => $user->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'total' => round($subtotal + $shipping, 2),
                'placed_at' => now(),
            ]);

            $order->items()->createMany($lines);

            return $order;
        });

        return (new OrderResource($order->load('items')))->response()->setStatusCode(201);
    }
}
