<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products?category=&search=&sort=
     * Aktif ürünler — filtre, arama, sıralama + sayfalama.
     */
    public function index(Request $request)
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['category', 'images', 'variants' => fn ($q) => $q->where('is_active', true)]);

        // Kategori filtresi (slug) — ana kategori seçilirse alt kategoriler de dahil
        if ($slug = $request->query('category')) {
            $category = Category::where('slug', $slug)->first();
            if ($category) {
                $ids = $category->children()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $ids);
            } else {
                $query->whereRaw('1 = 0'); // bilinmeyen kategori -> boş sonuç
            }
        }

        // Arama (ürün adı)
        if ($search = $request->query('search')) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        // Sıralama
        match ($request->query('sort')) {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            default => $query->latest(), // en yeni
        };

        $products = $query->paginate(12)->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * GET /api/v1/products/{slug}
     * Tek ürün detayı — kategori, varyantlar, görseller.
     */
    public function show(string $slug)
    {
        $product = Product::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->with([
                'category',
                'images',
                'variants' => fn ($q) => $q->where('is_active', true),
            ])
            ->firstOrFail();

        return new ProductResource($product);
    }
}
