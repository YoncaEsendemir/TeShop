<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ProductImageController as AdminImageController;
use App\Http\Controllers\Api\V1\Admin\ProductVariantController as AdminVariantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    /*
    |----------------------------------------------------------------------
    | Public (kimlik doğrulama gerektirmez)
    |----------------------------------------------------------------------
    */
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    /*
    |----------------------------------------------------------------------
    | Admin
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        // Giriş — rate limit: dakikada 5 deneme (Bölüm 8)
        Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');

        // Korumalı: giriş yapmış + admin rolü
        Route::middleware(['auth:sanctum', 'admin'])->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/me', [AdminAuthController::class, 'me']);
            Route::get('/stats', [AdminDashboardController::class, 'stats']);

            // Kategori + Ürün CRUD
            Route::apiResource('categories', AdminCategoryController::class);
            Route::apiResource('products', AdminProductController::class);

            // Varyantlar (ürüne bağlı oluştur; tekil güncelle/sil)
            Route::post('products/{product}/variants', [AdminVariantController::class, 'store']);
            Route::put('variants/{variant}', [AdminVariantController::class, 'update']);
            Route::delete('variants/{variant}', [AdminVariantController::class, 'destroy']);

            // Görseller (ürüne yükle; tekil sil)
            Route::post('products/{product}/images', [AdminImageController::class, 'store']);
            Route::delete('images/{image}', [AdminImageController::class, 'destroy']);
        });
    });
});
