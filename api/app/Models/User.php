<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // GÜVENLİK: 'role' kasıtlı olarak fillable DEĞİL.
        // Yetki yükseltmeyi önler (müşteri kaydında role=admin enjekte edilemez).
        // Rolü hep sunucu tarafında açıkça ata (forceFill / forceCreate).
    ];

    /** Kullanıcı admin mi? */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /** Müşterinin siparişleri */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** Müşterinin adresleri */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /** Müşterinin favorileri */
    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
