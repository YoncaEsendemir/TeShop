<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id ?? null;

        return [
            'category_id' => ['sometimes', 'required', 'integer', Rule::exists('categories', 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            // Not: base_price ile birlikte gönderilirse lt kontrolü ekle (kısmi güncellemede sorun çıkmasın)
            'discount_price' => ['nullable', 'numeric', 'min:0', Rule::when($this->has('base_price'), ['lt:base_price'])],
            'is_active' => ['boolean'],
        ];
    }
}
