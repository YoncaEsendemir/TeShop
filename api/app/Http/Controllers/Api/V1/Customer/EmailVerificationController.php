<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * GET /api/v1/email/verify/{id}/{hash} — imzalı doğrulama linki.
     * Laravel'in VerifyEmail bildirimi bu route'u (verification.verify) üretir.
     * Doğruladıktan sonra storefront'a yönlendirir.
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);
        $front = env('FRONTEND_URL', 'http://localhost:5173');

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect($front.'/giris?verified=0');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect($front.'/giris?verified=1');
    }

    /** POST /api/v1/email/verification-notification — doğrulama e-postasını tekrar gönder. */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-posta zaten doğrulanmış.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Doğrulama e-postası gönderildi.']);
    }
}
