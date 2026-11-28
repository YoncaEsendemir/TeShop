# Faz 6 — Müşteri Tarafı (Ödeme Hariç)

Tarih: 2026-11-28 · Durum: ONAYLANDI (Yonca — 4 özellik + dev log/prod SMTP Brevo)

## Amaç
Mağazaya müşteri hesabı katmanı: kayıt/giriş + e-posta doğrulama, adres defteri,
sipariş geçmişi, favoriler ve ödemesiz checkout (sipariş `pending` oluşur, mevcut
orders sistemine bağlanır). Ödeme entegrasyonu KAPSAM DIŞI (müşteri sunumundan sonra).

## Hedefler
- Müşteri kayıt/giriş (Sanctum token, admin'den ayrı) + **e-posta doğrulama**
  (Laravel `MustVerifyEmail`; dev'de `log` mailer, prod'da Brevo SMTP — sadece `.env`).
- Adres defteri (CRUD) + sipariş geçmişi ("Hesabım").
- Favoriler (ürün favorile/çıkar + favoriler sayfası).
- Checkout: sepet → `POST /checkout` → order (`pending`, `user_id` ile bağlı).

## Hedef-olmayanlar
- Ödeme/kargo entegrasyonu, fatura. Şifre sıfırlama (opsiyonel, sonra).

## Kısıtlar / güvenlik
- Müşteri endpoint'leri `auth:sanctum` (admin DEĞİL). Müşteri yalnız KENDİ
  adres/sipariş/favorisine erişir (owner kontrolü — cross-tenant yok).
- `role` fillable değil (yetki yükseltme engeli korunur); register rol atamaz.
- register/login rate-limit. Fiyatlar checkout'ta sunucuda hesaplanır.
- Token: storefront müşteri token'ı `teshop-cart`'tan ayrı `teshop-customer` store.

## Veri modeli (migration'lar — `api/database/migrations/`)
- `..._add_user_id_to_orders_table.php`: orders'a `user_id` nullable FK (nullOnDelete).
- `..._create_addresses_table.php`: id, user_id FK cascade, title, full_name, phone,
  line1, city, postal_code, is_default, timestamps.
- `..._create_wishlists_table.php`: id, user_id FK cascade, product_id FK cascade,
  unique(user_id, product_id), timestamps.

## Dosya haritası (NEREYE)

### Backend (`api/`)
- `app/Models/User.php` — `implements MustVerifyEmail`; `addresses()`, `wishlist()`, `orders()`.
- `app/Models/Address.php` (yeni), `app/Models/Wishlist.php` (yeni).
- `app/Models/Order.php` — `user_id` fillable + `user()`.
- `app/Http/Controllers/Api/V1/Customer/AuthController.php` (yeni) — register/login/logout/me.
- `app/Http/Controllers/Api/V1/Customer/EmailVerificationController.php` (yeni) — verify/resend.
- `app/Http/Controllers/Api/V1/Customer/AddressController.php` (yeni) — CRUD (owner).
- `app/Http/Controllers/Api/V1/Customer/WishlistController.php` (yeni) — index/toggle.
- `app/Http/Controllers/Api/V1/Customer/OrderController.php` (yeni) — index/show (owner).
- `app/Http/Controllers/Api/V1/Customer/CheckoutController.php` (yeni) — store (sepet→order).
- `app/Http/Requests/Customer/` (yeni) — Register, StoreAddress, Checkout.
- `app/Http/Resources/AddressResource.php` (yeni).
- `routes/api.php` — public `register`/`login` (+throttle) ve e-posta verify; `auth:sanctum`
  müşteri grubu (me/logout/addresses/wishlist/orders/checkout/resend).
- `config/mail.php` zaten var; `.env` `MAIL_MAILER=log` (dev — ayarlı).
- `database/seeders/DatabaseSeeder.php` — 1 örnek doğrulanmış müşteri (test için).

### Frontend (`storefront/src/`)
- `store/customerAuth.ts` (yeni) — zustand persist (`teshop-customer`: token+user).
- `services/customerApi.ts` (yeni) — register/login/me/logout/verify + address/wishlist/order/checkout.
- `pages/Register.tsx`, `pages/Login.tsx`, `pages/VerifyNotice.tsx` (yeni).
- `pages/Account.tsx` (yeni) — profil + adresler + sipariş geçmişi (sekmeli).
- `pages/Wishlist.tsx` (yeni) — favoriler.
- `pages/Checkout.tsx` (yeni) — sepet özeti + adres seç/ekle → sipariş oluştur.
- `components/Navbar.tsx` — hesap/giriş linki + favori ikonu.
- `components/ProductCard.tsx` + `pages/ProductDetail.tsx` — favori (kalp) butonu.
- `App.tsx` — yeni route'lar; `store/cart.ts` — checkout sonrası temizle.
- i18n: `locales/{tr,de,en}.json` — `account`/`auth` anahtarları.

## E-posta doğrulama akışı
- Register → user oluşur (doğrulanmamış) → `sendEmailVerificationNotification()` → dev'de
  link `storage/logs/laravel.log`'a düşer. Kullanıcı linke tıklar → backend signed route
  doğrular → storefront'a redirect. Doğrulanmamış kullanıcı giriş yapar ama checkout
  "e-posta doğrula" uyarısı görür (checkout `verified` ister). Resend endpoint'i var.

## Test / doğrulama
- Backend PHPUnit: register (doğrulanmamış + verification gönderilir), login, owner
  izolasyonu (başkasının adresi/siparişi 403/404), checkout order oluşturur + user_id,
  wishlist toggle, verified olmadan checkout engeli.
- Frontend Vitest: customerAuth store + küçük saf yardımcılar.
- Tarayıcı turu: kayıt→log'dan doğrula→giriş→favori→sepet→checkout→hesabım'da sipariş.

## Builder'a bırakılan
- Adres alanlarının son listesi, hesabım sekme düzeni, favori ikon yerleşimi.

## Sıra (plan)
1. Müşteri auth backend (register/login/verify) 2. Auth frontend
3. Adresler (be+fe) 4. Sipariş geçmişi (orders.user_id + be+fe)
5. Favoriler (be+fe) 6. Checkout (be+fe)
