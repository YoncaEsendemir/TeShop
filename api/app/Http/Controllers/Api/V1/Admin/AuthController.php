<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/v1/admin/login
     * Admin girişi -> Sanctum token.
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        // Kullanıcı yok veya şifre yanlış
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Giriş bilgileri hatalı.'],
            ]);
        }

        // Sadece admin paneline girebilir
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Bu hesabın panel yetkisi yok.'], 403);
        }

        // 'admin' yeteneğiyle token üret
        $token = $user->createToken('admin-panel', ['admin'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * POST /api/v1/admin/logout — mevcut token'ı iptal eder.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Çıkış yapıldı.']);
    }

    /**
     * GET /api/v1/admin/me — giriş yapmış admin bilgisi.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }
}
