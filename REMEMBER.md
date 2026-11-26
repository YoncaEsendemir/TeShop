# 📌 REMEMBER — Nerede Kaldık?

> Her oturumun başında ve sonunda buna bak/güncelle.
> Harita: [`PROJE_HARITA.md`](./PROJE_HARITA.md) · Şartname: [`PROJE.md`](./PROJE.md)
> Son güncelleme: 26.11.2026 (akşam — gün kapatıldı)

---

## ✅ FAZ 0 TAMAMLANDI (26.11.2026)
- 3 servis Docker'da çalışıyor: storefront (5173) + api (8000) + mysql (3306) — hepsi HTTP 200.
- Komutlar: `docker compose up -d` (başlat) · `docker compose stop` (durdur) · `docker compose ps` (durum)
- **ÖNEMLİ:** Yerel PHP'de openssl kapalı → composer/artisan işlerini DOCKER içinde yap:
  `docker compose exec api php artisan ...`

## 🎯 Şu an neredeyiz
**Faz 3 — Storefront (koyu tema)** ✅ ÇEKİRDEK BİTTİ → sırada Faz 4 (Admin panel frontend)

### Faz 3'te yapılanlar (26.11.2026)
- Kütüphaneler (container'a): react-router-dom, @tanstack/react-query, zustand, axios,
  framer-motion, react-helmet-async, lucide-react
- Mimari (Bölüm 16): `types/ services/ store/ lib/ components/ pages/ layouts/`
- `services/api.ts` (axios, VITE_API_URL) + `store/cart.ts` (Zustand + localStorage persist)
- Router (BrowserRouter) + TanStack Query + HelmetProvider (`main.tsx`, `App.tsx`)
- Sayfalar: Home (hero + öne çıkanlar), Products (filtre/sıralama/sayfalama),
  ProductDetail (galeri + renk/beden varyant seçimi + sepete ekle + JSON-LD), NotFound
- Bileşenler: Navbar (kategori menü + arama + sepet, mobil uyumlu), Footer, CartDrawer
  (animasyonlu, adet kontrolü), ProductCard (hover + indirim rozeti + fallback görsel),
  ProductGrid (+ skeleton), Seo (helmet + JSON-LD)
- **Tasarım:** hallmark Floor kuralları uygulandı (token'lar, transform/opacity animasyon,
  focus-visible, overflow-x:clip, minmax grid) + **reduced-motion** her animasyonda
- ✅ Tarayıcıda doğrulandı: ana sayfa render, ürün grid (gerçek API verisi), ürün detay
  varyant seçimi (Seçim yapın→Sepete Ekle), sepete ekle→Sepet(1), çekmece açıldı. Konsol hatası yok.
- NOT: Görseller henüz yer tutucu (baş harf fallback) — gerçek görseller admin yüklemesiyle gelecek.
- NOT: `localhost:5173` sekmesi Yonca'nın Chrome'unda AÇIK bırakıldı (storefront'u görsün diye).

### Faz 2'de yapılanlar (26.11.2026)
- `EnsureUserIsAdmin` middleware + `bootstrap/app.php`'de `admin` alias
- Admin Auth (`Admin\AuthController`): login (Sanctum token, 'admin' ability) / logout / me
  - **rate limit: throttle:5,1** login'de (Bölüm 8) · sadece role=admin girebilir
- Form Request'ler (`app/Http/Requests/Admin/`): Login, Store/Update Category, Product, Variant, Image
- Admin CRUD controller'ları (`Api\V1\Admin\`): Category, Product, ProductVariant, ProductImage
- **Güvenli görsel yükleme:** yalnız image (jpg/png/webp), max 4MB, isim randomize (`store()`), storage:link yapıldı
- Route'lar: `POST /v1/admin/login` (public, throttle) + `auth:sanctum`+`admin` korumalı grup (18 route)
- ✅ Test edildi: token yok→401, yanlış şifre→422, login→token, me→ok, CRUD→201,
  resim-olmayan→422, admin-olmayan→403. Hepsi doğru.
- ⏸️ Sipariş yönetimi (orders) Faz 6'ya ertelendi (checkout olmadan test edilemez; Bölüm 6 notu da öyle diyor).
- Admin giriş: **admin@teshop.test / password**

### Faz 1'de yapılanlar (26.11.2026)
- Migration'lar: `users`(+role enum), `categories`(parent_id self-ref), `products`,
  `product_variants`(stok burada), `product_images`(variant_id null=genel). FK sırası düzeltildi.
- Modeller + ilişkiler (Bölüm 6.3): Category/Product/ProductVariant/ProductImage + User.isAdmin()
  - Product: `getRouteKeyName()=slug`, `totalStock()`
- Seeder: `ShopSeeder` (2 ana + 4 alt kategori, 6 ürün, beden×renk varyantları, rastgele stok)
  + admin user: **admin@teshop.test / password** (role=admin)
- API Resource'lar: Category/Product/ProductVariant/ProductImage (tutarlı JSON, whenLoaded)
- Public API (`routes/api.php`, prefix `v1`):
  - `GET /api/v1/categories` (iç içe alt kategori + products_count)
  - `GET /api/v1/products?category=&search=&sort=` (price_asc/price_desc/name/newest) + paginate(12)
  - `GET /api/v1/products/{slug}` (kategori + varyant + görsel)
- ✅ Hepsi test edildi: HTTP 200, filtre/arama/sıralama/sayfalama çalışıyor.
- ⏳ YAPILMADI (opsiyonel): her faz sonrası Cloudflare **security-audit** denetimi (Bölüm 13).

## ✅ Yapıldı
- [x] `PROJE.md` okundu (tüm şartname)
- [x] `PROJE_HARITA.md` oluşturuldu (bölüm indeksi)
- [x] `REMEMBER.md` oluşturuldu (bu dosya)
- [x] Skill: **Superpowers** kuruldu (global)
- [x] Skill: **Ponytail** kuruldu (global)
- [x] Skill: **hallmark** kuruldu (`.agents/skills/hallmark`)
- [x] Skill: **Cloudflare Security Audit** kuruldu (`.claude/skills/security-audit`)
- [x] **4 skill'in tamamı kurulu** ✅

- [x] `git init` (lokal) + kök `.gitignore`
- [x] **Frontend kuruldu** (`storefront/`): Vite + React 19 + TS + Tailwind v4
- [x] Koyu tema token'ları (`src/index.css`, @theme) + fontlar (Space Grotesk/Inter)
- [x] **reduced-motion** media query eklendi (erişilebilirlik)
- [x] **Docker:** `storefront/Dockerfile.dev` + kök `docker-compose.yml` (storefront + mysql)
- [x] `docker compose up` ✅ → storefront HTTP 200 (localhost:5173), mysql running (3306)
- [x] `npm run build` ✅ TypeScript + Tailwind derleniyor

- [x] **Backend kuruldu:** Laravel **12.74.0** (`api/`), PHP 8.3 Docker imajı (gd/pdo_mysql/mbstring/zip/bcmath/intl)
      - ⚠️ Not: iskelet önce Laravel 13 (PHP 8.4) indi → Yonca kararıyla **Laravel 12'ye** sabitlendi.
      - `composer.json` → `config.platform.php = 8.3.37` (lock hep 8.3'e göre çözülür; Symfony 7.x)
- [x] `api/.env`: APP_NAME=TeShop + MySQL bağlantısı (DB_HOST=mysql, teshop/teshop_secret)
- [x] **Sanctum kuruldu** (`install:api`, laravel/sanctum ^4.0) + `routes/api.php` + `personal_access_tokens`
- [x] `User` modeline `HasApiTokens` trait eklendi (`app/Models/User.php`)
- [x] `docker compose up --build` ✅ → api/storefront/mysql hepsi HTTP 200, migration'lar çalıştı

## 🔜 SIRADAKİ (Faz 4 — Admin panel frontend)
1. [ ] Admin giriş sayfası (token sakla) + korumalı route (admin layout)
2. [ ] Dashboard (ürün/kategori/sipariş sayısı, stok uyarısı)
3. [ ] Kategori/Ürün/Varyant yönetim ekranları (CRUD, admin API'ye bağlı)
4. [ ] Görsel yükleme arayüzü (admin)
- Faz 3 polish (sonra): çoklu görsel galerisi, kategori alt-filtreleri, çerez banner (Faz 5)
- [ ] (Yonca) GitHub remote aç + ilk commit/push

## 🔐 GÜVENLİK TARAMASI (26.11.2026, Faz 1+2 kodu — kaynak incelemesi)
- [x] ✅ DÜZELTİLDİ: `User.role` fillable'dan çıkarıldı (Faz 6 register'da yetki yükseltme önlendi);
      admin seeder `forceCreate` ile role atıyor.
- [ ] ⏳ Faz 5/prod ÖNCESİ yapılacaklar (şimdi dev'de sorun değil):
  - CORS: `config/cors.php` yayınla, `allowed_origins`'i sadece storefront domaini yap (Bölüm 8).
    (Şu an token tabanlı/cookie yok → kritik değil ama prod'da daralt.)
  - `APP_DEBUG=false` + güçlü `APP_KEY` + admin şifresini değiştir (prod .env).
  - Login: admin-olmayan geçerli hesapta 403 yerine generic 422 dönmek kullanıcı sızıntısını azaltır (düşük).
- Not: SQL injection yok (Eloquent bound), dosya yükleme güvenli (image+mimes+max+randomize),
  admin route'ları auth:sanctum+admin korumalı, login rate-limit'li. Kritik/yüksek bulgu YOK.

## 📋 Sonraki fazlar (kısa)
Faz 1: Backend temeli (migration + model + public API)
Faz 2: Admin backend · Faz 3: Storefront · Faz 4: Admin frontend
Faz 5: KVKK/SEO/i18n/Test · Faz 6: Müşteri + Ödeme + Yayın

---

## 📝 Notlar / Kararlar
- **Çalışma tarzı (GÜNCEL):** Claude Code geliştirir, her adımda ne yaptığını anlatır;
  Yonca sonra dosyalara bakıp kontrol eder. Bir faz bitmeden diğerine geçilmez.
- **🐳 TÜM PROJE DOCKER ÜZERİNDEN:** frontend + backend (Laravel+Sanctum) + MySQL hepsi
  container'da. Kök `docker-compose.yml` + servis Dockerfile'ları. Yonca hep Docker'dan geliştiriyor.
- **Sıra:** ÖNCE frontend, sonra backend.
- **Git:** lokal `git init` yapıldı, GitHub remote'u sonra Yonca açacak.

## 🎨 TASARIM KURALLARI (her UI işinde uy!)
- **hallmark** skill'i ile tasarla — jenerik AI görünümü YASAK.
- Çok **modern**, çok **responsive** (mobile-first), **kullanıcı dostu**.
- **Animasyonlu** ve akıcı (Framer Motion) — ama abartısız, zarif.
- ⚠️ **`prefers-reduced-motion`** DESTEĞİ ZORUNLU: hareket azaltmayı seçen kullanıcıda
  animasyonları kapat/azalt. Yoksa EKLE — bu önemli (erişilebilirlik).

## 🐞 Açık sorunlar / takıldığımız yerler
- (yok)
