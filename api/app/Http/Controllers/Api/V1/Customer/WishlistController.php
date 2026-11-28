<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /** GET /wishlist — favori ürünler. */
    public function index(Request $request)
    {
        $ids = $request->user()->wishlist()->pluck('product_id');
        $products = Product::whereIn('id', $ids)
            ->with(['category', 'images'])
            ->withCount('variants')
            ->get();

        return ProductResource::collection($products);
    }

    /** POST /wishlist/toggle {product_id} — favoriye ekle/çıkar. */
    public function toggle(Request $request)
    {
        $data = $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);

        $existing = $request->user()->wishlist()->where('product_id', $data['product_id'])->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['in_wishlist' => false]);
        }

        $request->user()->wishlist()->create(['product_id' => $data['product_id']]);

        return response()->json(['in_wishlist' => true]);
    }
}
