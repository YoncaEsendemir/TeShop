<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'price',
        'stock',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** Bağlı olduğu ürün */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** Bu varyanta (renge) ait görseller */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'variant_id');
    }

    /** Etkin fiyat: varyant fiyatı yoksa ürünün base_price'ı */
    public function effectivePrice(): string
    {
        return $this->price ?? $this->product->base_price;
    }
}
