<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * POST /admin/products/{product}/images
     * Güvenli yükleme: yalnız resim, boyut limiti (Request'te), isim randomize (store()).
     */
    public function store(StoreImageRequest $request, Product $product)
    {
        // store() otomatik rastgele isim verir -> storage/app/public/products/<hash>.jpg
        $path = $request->file('image')->store('products', 'public');

        $isPrimary = $request->boolean('is_primary');

        // Yeni görsel birincil ise, diğerlerinin birincilliğini kaldır
        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'variant_id' => $request->input('variant_id'),
            'path' => $path,
            'is_primary' => $isPrimary,
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return (new ProductImageResource($image))->response()->setStatusCode(201);
    }

    /**
     * DELETE /admin/images/{image}
     */
    public function destroy(ProductImage $image)
    {
        // Diskteki dosyayı da sil
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Görsel silindi.']);
    }
}
