<?php

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\Customer\AddressController as CustomerAddressController;
use App\Http\Controllers\Api\V1\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\V1\Customer\EmailVerificationController;
use App\Http\Controllers\Api\V1\Admin\PasswordController as AdminPasswordController;
use App\Http\Controllers\Api\V1\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ProductImageController as AdminImageController;
use App\Http\Controllers\Api\V1\Admin\ProductVariantController as AdminVariantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('locale')->group(function () {
    /*
    |----------------------------------------------------------------------
    | Public (kimlik doğrulama gerektirmez)
    |----------------------------------------------------------------------
    */
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/settings', [SettingController::class, 'show']);

    /*
    |----------------------------------------------------------------------
    | Müşteri (storefront hesabı)
    |----------------------------------------------------------------------
    */
    Route::post('/register', [CustomerAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [CustomerAuthController::class, 'login'])->middleware('throttle:10,1');
    // İmzalı doğrulama linki (Laravel VerifyEmail bu route adını kullanır)
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [CustomerAuthController::class, 'logout']);
        Route::get('/me', [CustomerAuthController::class, 'me']);
        Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
            ->middleware('throttle:6,1');

        // Adres defteri (owner-scoped)
        Route::get('/addresses', [CustomerAddressController::class, 'index']);
        Route::post('/addresses', [CustomerAddressController::class, 'store']);
        Route::put('/addresses/{id}', [CustomerAddressController::class, 'update']);
        Route::delete('/addresses/{id}', [CustomerAddressController::class, 'destroy']);
    });

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

            // Kategori CRUD (id ile bağlanır)
            Route::apiResource('categories', AdminCategoryController::class);

            // Ürün CRUD — admin id ile çalışır ({product:id}); public tarafta slug kullanılır
            Route::get('products', [AdminProductController::class, 'index']);
            Route::post('products', [AdminProductController::class, 'store']);
            Route::get('products/{product:id}', [AdminProductController::class, 'show']);
            Route::match(['put', 'patch'], 'products/{product:id}', [AdminProductController::class, 'update']);
            Route::delete('products/{product:id}', [AdminProductController::class, 'destroy']);

            // Varyantlar (ürüne id ile bağlı oluştur; tekil güncelle/sil)
            Route::post('products/{product:id}/variants', [AdminVariantController::class, 'store']);
            Route::put('variants/{variant}', [AdminVariantController::class, 'update']);
            Route::delete('variants/{variant}', [AdminVariantController::class, 'destroy']);

            // Görseller (ürüne id ile yükle; tekil sil)
            Route::post('products/{product:id}/images', [AdminImageController::class, 'store']);
            Route::delete('images/{image}', [AdminImageController::class, 'destroy']);

            // Siparişler
            Route::get('orders', [AdminOrderController::class, 'index']);
            Route::post('orders', [AdminOrderController::class, 'store']);
            Route::get('orders/{order}', [AdminOrderController::class, 'show']);
            Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

            // Ayarlar: profil / şifre / mağaza bilgisi
            Route::put('profile', [AdminProfileController::class, 'update']);
            Route::put('password', [AdminPasswordController::class, 'update']);
            Route::get('settings', [SettingController::class, 'index']);
            Route::put('settings', [SettingController::class, 'update']);
        });
    });
});
