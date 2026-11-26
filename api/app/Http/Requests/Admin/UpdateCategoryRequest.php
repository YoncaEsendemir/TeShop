<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')->id ?? null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($categoryId)],
            // Kendini üst kategori yapamaz
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id'), Rule::notIn([$categoryId])],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
