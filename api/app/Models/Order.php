<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'status',
        'subtotal',
        'shipping_fee',
        'total',
        'placed_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'placed_at' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Gelire sayılan siparişler (iptal hariç). */
    public function scopeRevenue(Builder $q): Builder
    {
        return $q->where('status', '!=', 'cancelled');
    }
}
