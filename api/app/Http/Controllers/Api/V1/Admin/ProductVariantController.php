<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVariantRequest;
use App\Http\Requests\Admin\UpdateVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantController extends Controller
{
    /** POST /admin/products/{product}/variants */
    public function store(StoreVariantRequest $request, Product $product)
    {
        $variant = $product->variants()->create($request->validated());

        return (new ProductVariantResource($variant))->response()->setStatusCode(201);
    }

    /** PUT/PATCH /admin/variants/{variant} */
    public function update(UpdateVariantRequest $request, ProductVariant $variant)
    {
        $variant->update($request->validated());

        return new ProductVariantResource($variant);
    }

    /** DELETE /admin/variants/{variant} */
    public function destroy(ProductVariant $variant)
    {
        $variant->delete();

        return response()->json(['message' => 'Varyant silindi.']);
    }
}
