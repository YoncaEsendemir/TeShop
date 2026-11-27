<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasFactory, HasTranslations;

    /** Çok dilli alanlar (TR/EN/DE) */
    public array $translatable = ['name', 'description'];

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'discount_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /** Ürünün kategorisi */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Beden/renk varyantları (stok burada) */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** Ürün görselleri */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /** Toplam stok (tüm varyantların toplamı) */
    public function totalStock(): int
    {
        return (int) $this->variants()->sum('stock');
    }

    /** URL'lerde id yerine slug kullan */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
