<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin kullanıcı (panel girişi için)
        // forceCreate: 'role' fillable olmadığı için (güvenlik) burada açıkça atanır.
        User::forceCreate([
            'name' => 'Yonca Admin',
            'email' => 'admin@teshop.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Mağaza verisi: kategoriler + ürünler + varyantlar + görseller
        $this->call(ShopSeeder::class);
    }
}
