<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Yalnız resim, max 4MB (Bölüm 8 güvenlik)
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            // İsteğe bağlı: görseli belirli bir varyanta (renge) bağla
            'variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')],
            'is_primary' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
