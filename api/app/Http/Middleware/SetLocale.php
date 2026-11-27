<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['tr', 'en', 'de'];

    /**
     * Dili ?lang parametresinden veya Accept-Language başlığından ayarlar.
     * spatie/laravel-translatable bu locale'e göre çeviri döndürür.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $lang = $request->query('lang')
            ?? substr((string) $request->header('Accept-Language'), 0, 2);

        if (in_array($lang, self::SUPPORTED, true)) {
            app()->setLocale($lang);
        }

        return $next($request);
    }
}
