<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'path' => $this->path,
            // Dış URL ise (örn. örnek görseller) olduğu gibi; değilse storage URL'si
            'url' => str_starts_with($this->path, 'http')
                ? $this->path
                : Storage::disk('public')->url($this->path),
            'variant_id' => $this->variant_id,
            'is_primary' => $this->is_primary,
            'sort_order' => $this->sort_order,
        ];
    }
}
