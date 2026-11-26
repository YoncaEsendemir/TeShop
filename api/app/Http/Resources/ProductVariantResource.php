<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'size' => $this->size,
            'color' => $this->color,
            // Varyant fiyatı (null = ürünün base_price'ı kullanılır)
            'price' => $this->price,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'is_active' => $this->is_active,
        ];
    }
}
