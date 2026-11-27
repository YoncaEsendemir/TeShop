<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /** GET /admin/orders — liste (status filtre + sayfalama). */
    public function index(Request $request)
    {
        $query = Order::query()->withCount('items')->latest('placed_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return OrderResource::collection($query->paginate(20));
    }

    /** GET /admin/orders/{order} — detay + kalemler. */
    public function show(Order $order)
    {
        return new OrderResource($order->load('items'));
    }

    /** POST /admin/orders — elle sipariş oluştur (fiyat/ad sunucuda snapshot). */
    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        $order = DB::transaction(function () use ($data) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = ! empty($item['variant_id'])
                    ? ProductVariant::find($item['variant_id'])
                    : null;

                // Etkin fiyat: varyant fiyatı > ürün indirimli fiyatı > ürün fiyatı
                $unitPrice = $variant?->price
                    ?? $product->discount_price
                    ?? $product->base_price;

                $qty = (int) $item['qty'];
                $lineTotal = round((float) $unitPrice * $qty, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'unit_price' => $unitPrice,
                    'qty' => $qty,
                    'line_total' => $lineTotal,
                ];
            }

            $shipping = round((float) ($data['shipping_fee'] ?? 0), 2);

            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(5)),
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

        return (new OrderResource($order->load('items')))
            ->response()
            ->setStatusCode(201);
    }

    /** PATCH /admin/orders/{order}/status — durum güncelle. */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ]);

        $order->update(['status' => $validated['status']]);

        return new OrderResource($order);
    }
}
