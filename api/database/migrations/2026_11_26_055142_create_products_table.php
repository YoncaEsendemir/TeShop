<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->json('name'); // çok dilli (spatie): {"tr":..,"en":..,"de":..}
            $table->string('slug')->unique();
            $table->json('description')->nullable(); // çok dilli
            $table->decimal('base_price', 10, 2);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            // Stok burada DEĞİL -> varyant seviyesinde (product_variants)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
