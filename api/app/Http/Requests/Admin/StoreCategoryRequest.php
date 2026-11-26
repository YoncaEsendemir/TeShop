<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // yetki kontrolü route middleware'inde (admin)
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')],
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
