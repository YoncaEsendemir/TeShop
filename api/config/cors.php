<?php

return [
    // Yalnız API ve Sanctum yolları CORS kapsamında
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // GÜVENLİK: Yalnız kendi storefront adresimiz API'yi çağırabilir.
    // Yayında FRONTEND_URL (.env) prod domaine ayarlanır; dev'de localhost kalır.
    'allowed_origins' => array_values(array_unique(array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
    ]))),

    // Dev: her localhost portu (prod domaini FRONTEND_URL ile; uzak saldırgan localhost olamaz)
    'allowed_origins_patterns' => ['/^http:\/\/localhost:\d+$/'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Token tabanlı auth (cookie yok) -> credentials gerekmez
    'supports_credentials' => false,
];
