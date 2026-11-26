<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories
     * Aktif ana kategoriler + alt kategorileri + ürün sayısı.
     */
    public function index()
    {
        $categories = Category::query()
            ->whereNull('parent_id')      // sadece ana kategoriler
            ->where('is_active', true)
            ->with(['children' => fn ($q) => $q->where('is_active', true)->withCount('products')])
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}
