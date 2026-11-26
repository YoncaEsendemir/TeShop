<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /** GET /admin/products — tüm ürünler (aktif/pasif) + sayfalama */
    public function index(Request $request)
    {
        $query = Product::query()->with('category')->withCount('variants');

        if ($search = $request->query('search')) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        return ProductResource::collection($query->latest()->paginate(20)->withQueryString());
    }

    /** POST /admin/products */
    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $product = Product::create($data);

        return (new ProductResource($product->load('category')))->response()->setStatusCode(201);
    }

    /** GET /admin/products/{product} — detay (varyant + görsel) */
    public function show(Product $product)
    {
        $product->load('category', 'variants', 'images');

        return new ProductResource($product);
    }

    /** PUT/PATCH /admin/products/{product} */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);

        return new ProductResource($product->load('category'));
    }

    /** DELETE /admin/products/{product} */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Ürün silindi.']);
    }
}
