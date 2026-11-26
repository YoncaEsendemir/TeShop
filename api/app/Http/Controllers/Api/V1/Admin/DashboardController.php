<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/admin/stats — panel özet sayıları.
     */
    public function stats()
    {
        return response()->json([
            'products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'categories' => Category::count(),
            'variants' => ProductVariant::count(),
            // Stok uyarıları
            'low_stock' => ProductVariant::whereBetween('stock', [1, 5])->count(),
            'out_of_stock' => ProductVariant::where('stock', 0)->count(),
        ]);
    }
}
