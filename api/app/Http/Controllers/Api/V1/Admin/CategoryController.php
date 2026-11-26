<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /** GET /admin/categories — tüm kategoriler (aktif/pasif) */
    public function index()
    {
        $categories = Category::query()
            ->with('parent')
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    /** POST /admin/categories */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $category = Category::create($data);

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    /** GET /admin/categories/{category} */
    public function show(Category $category)
    {
        $category->load('parent', 'children')->loadCount('products');

        return new CategoryResource($category);
    }

    /** PUT/PATCH /admin/categories/{category} */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return new CategoryResource($category);
    }

    /** DELETE /admin/categories/{category} */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Kategori silindi.']);
    }
}
