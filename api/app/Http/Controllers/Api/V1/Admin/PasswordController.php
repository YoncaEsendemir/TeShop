<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /** PUT /api/v1/admin/password — şifre değiştir (mevcut doğrulanır). */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mevcut şifre hatalı.'],
            ]);
        }

        // password cast 'hashed' -> otomatik hash'lenir
        $user->update(['password' => $validated['new_password']]);

        // Güvenlik: diğer oturumların token'larını iptal et (mevcut hariç)
        $current = $user->currentAccessToken();
        $user->tokens()
            ->when($current && isset($current->id), fn ($q) => $q->where('id', '!=', $current->id))
            ->delete();

        return response()->json(['message' => 'Şifre güncellendi.']);
    }
}
