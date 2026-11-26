<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'discount_price' => $this->discount_price,
            // İndirim var mı + etkin fiyat (kolaylık için)
            'has_discount' => ! is_null($this->discount_price),
            'final_price' => $this->discount_price ?? $this->base_price,
            'is_active' => $this->is_active,
            // İlişkiler yalnızca yüklendiyse
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            // Varyant toplam stoğu (yüklendiyse)
            'total_stock' => $this->when(
                $this->relationLoaded('variants'),
                fn () => (int) $this->variants->sum('stock')
            ),
        ];
    }
}
