<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /** Düzenlenebilir/herkese açık ayar anahtarları ve varsayılanları. */
    public const WHITELIST = [
        'store_name' => 'TeShop',
        'store_email' => 'info@teshop.test',
        'store_phone' => '',
        'store_address' => '',
    ];

    private function payload(): array
    {
        $out = [];
        foreach (self::WHITELIST as $key => $default) {
            $out[$key] = Setting::get($key, $default);
        }

        return $out;
    }

    /** GET /api/v1/settings — public (yalnız whitelist). */
    public function show()
    {
        return response()->json($this->payload());
    }

    /** GET /api/v1/admin/settings — admin düzenleme için. */
    public function index()
    {
        return response()->json($this->payload());
    }

    /** PUT /api/v1/admin/settings — yalnız whitelist anahtarları güncellenir. */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => ['nullable', 'string', 'max:255'],
            'store_email' => ['nullable', 'email', 'max:255'],
            'store_phone' => ['nullable', 'string', 'max:50'],
            'store_address' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated as $key => $value) {
            if (array_key_exists($key, self::WHITELIST)) {
                Setting::put($key, $value);
            }
        }

        return response()->json($this->payload());
    }
}
