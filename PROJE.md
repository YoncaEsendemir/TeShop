# 🛍️ E-Ticaret Projesi — Proje Şartnamesi (PRD)

> **Amaç:** Trendyol / Mavi tarzında; modern, responsive, güvenli, KVKK uyumlu ve SEO açısından güçlü bir e-ticaret web sitesi. **Koyu (siyah/gri/beyaz) tema.** Kullanıcı tarafı (storefront) + güçlü yönetim paneli (admin).
>
> **Geliştirici:** Yonca Esendemir · **GitHub repo:** github.com/YoncaEsendemir (proje burada tutulacak)
> **Güncelleme:** 26.11.2026 — skiller, koyu tema, tam & tutarlı veritabanı, i18n, test, Sentry eklendi.

---

## 1. Teknoloji Yığını

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| **Frontend** | React 19 + TypeScript | Tip güvenliği, modern ekosistem |
| **Build** | Vite | Hızlı dev-server, TS hazır |
| **Stil** | Tailwind CSS | Hızlı, tutarlı, koyu tema kolay |
| **Backend** | Laravel 12 (PHP 8.3+) | Güçlü, güvenli API |
| **API** | REST (`/api/v1/...`) | Frontend ↔ Backend ayrımı net |
| **Veritabanı** | MySQL 8 | İlişkisel yapı |
| **Auth** | Laravel Sanctum (token) | Admin + (sonra) müşteri girişi |
| **Yayın** | **cPanel** (İyiBuldum) | Hem Laravel API hem React build burada (Bölüm 14) |
| **Yerel ortam** | Docker (opsiyonel) | İstersen tutarlı geliştirme ortamı |

> **Karar verildi:** Frontend **React + TypeScript (Vite, SPA)**. SEO, SPA için elden gelenin en iyisi yapılacak (meta + JSON-LD + prerender) ve **Yonca'nın vereceği SEO skill'i** ile güçlendirilecek — Bölüm 10. Her şey **cPanel'de** yayınlanacak.

---

## 2. Geliştirme Araçları & Skill'ler (Claude Code)

Bu 4 skill **senin kodlama asistanını (Claude Code / VS Code)** güçlendirir — sitenin içine girmez. Hepsi ücretsiz. Kurulumları:

| Skill | Ne yapar | Kurulum (VS Code terminali / Claude Code içinde) |
|-------|----------|--------------------------------------------------|
| **Superpowers** | Planlama + TDD + inceleme disiplini verir | `/plugin install superpowers@claude-plugins-official` |
| **Ponytail** | Gereksiz karmaşık kodu (over-engineering) engeller | `/plugin marketplace add DietrichGebert/ponytail` → sonra `/plugin install ponytail@ponytail` (iki ayrı mesaj) |
| **Cloudflare Security Audit** | Kodda istismar edilebilir güvenlik açıklarını bulur | `npx -y skills add cloudflare/security-audit-skill --skill security-audit --agent claude-code` |
| **hallmark** | Jenerik olmayan, kaliteli UI tasarımı + `audit` ile test | `npx skills add nutlope/hallmark` |

**Notlar:**
- **Superpowers & Ponytail:** `/plugin` ile kurulur, **global** — bir kez kur, tüm projelerde geçerli. Ponytail için Node.js PATH'te olmalı (sende var) ve Claude Code 2.1.290+.
- **Cloudflare:** projenin `.claude/skills/` klasörüne kurulur → her projede o komutu bir kez çalıştır.
- **hallmark:** `~/.claude/skills/hallmark/` altına kurulur (global). Kontrol: `ls ~/.claude/skills/hallmark/`. Kullanım: `hallmark redesign`, `hallmark audit ./src`.
- **Çakışma uyarısı:** Superpowers süreç ekler, Ponytail kodu sadeleştirir — birlikte iyi çalışır, ama Ponytail bazen Superpowers'ın test adımlarını kısabilir; kod yazarken dengeye dikkat ederiz.

---

## 3. Önerilen Kütüphaneler (Frontend)

Tailwind CSS · **shadcn/ui** (özelleştirilebilir bileşenler) · **Framer Motion** (geçişler/animasyon) · **TanStack Query** (veri çekme/cache) · **Zustand** (sepet/oturum state) · React Router · **React Hook Form + Zod** (form+doğrulama) · **Lucide** (ikon) · **Swiper** (slider) · **Axios** (HTTP + token interceptor) · **react-helmet-async** (SEO meta) · **react-i18next** (çoklu dil).

---

## 4. 🎨 Tasarım Rehberi — Koyu Tema (Siyah / Gri / Beyaz)

Premium, minimal, koyu bir giyim sitesi havası (Mavi'nin sadeliği + lüks monokrom his). hallmark skill'i bu tarzı "jenerik AI tasarımı"ndan uzak tutmak için kullanılacak.

### 4.1 Renk Paleti (CSS değişkenleri)
```css
--bg:          #0A0A0A;  /* ana arka plan — tam siyah değil, göz yormaz */
--surface:     #151515;  /* kart / panel */
--surface-2:   #1F1F1F;  /* yükseltilmiş yüzey, hover */
--border:      #2A2A2A;  /* ince ayraç çizgileri */
--text:        #FAFAFA;  /* ana metin — tam beyaz değil */
--text-muted:  #A1A1A1;  /* ikincil metin (gri) */
--text-subtle: #6B6B6B;  /* en silik (placeholder, dipnot) */
--primary:     #FFFFFF;  /* ana buton: beyaz zemin + siyah yazı */
--primary-text:#0A0A0A;
--accent:      #E5E5E5;  /* hover / vurgu */
--success:     #22C55E;  /* "stokta var" durumu (çok az kullan) */
--danger:      #EF4444;  /* hata / "stok yok" */
```
> Monokrom kalıyoruz. İstersen tek bir vurgu rengi (örn. "Sepete Ekle" için) sonradan ekleriz; şimdilik beyaz buton zaten koyu zeminde patlıyor.

### 4.2 Tipografi
- **Başlık:** `Space Grotesk` (modern, geometrik, koyu zeminde şık) — alternatif: `Clash Display`.
- **Gövde:** `Inter` (400/500) — okunabilirlik önceliği.
- **Etiket/rozet:** büyük harf + harf aralığı (`letter-spacing: 0.08em`), küçük punto.
- Geniş satır yüksekliği, bol boşluk (negatif alan koyu temada premium his verir).

### 4.3 Koyu Tema Detayları (dikkat edilecekler)
- **Kontrast:** Tam siyah `#000` ve tam beyaz `#FFF` yerine `#0A0A0A` / `#FAFAFA` → göz yorgunluğunu azaltır, erişilebilirlik (WCAG) kontrastını korur.
- **Gölge yerine yüzey + çizgi:** Koyu temada gölge görünmez; derinliği `--surface`/`--surface-2` katmanları ve `--border` ile ver.
- **Ürün görselleri:** Açık/nötr zeminli ürün fotoğrafları koyu temada öne çıkar — çekim/retouch buna göre.
- **Hover:** Ürün kartında hafif yukarı kalkma + kenarlık parlaması (Framer Motion).
- **Vurgu az:** Yeşil/kırmızı sadece durum için (stok), tasarımın geneli siyah-gri-beyaz.

### 4.4 Bileşenler
Navbar · Footer · HeroSlider · ProductCard · ProductGrid · CategoryMenu · ProductDetail (galeri+zoom) · VariantSelector (beden/renk) · CartDrawer · Checkout · Breadcrumb · Pagination · ReviewList/ReviewForm · Loader/Skeleton · Toast · CookieBanner (KVKK) · LanguageSwitcher (i18n).

---

## 5. Özellikler

### 5.1 Storefront
Ana sayfa (banner + öne çıkan ürünler) · kategori + filtre/sıralama · ürün detay (galeri, zoom, **beden/renk varyant seçimi**, stok, adet) · arama · **ürün yorumları & puan** · sepet (Zustand + localStorage) · **checkout + adres + kargo** · **favoriler** · çoklu dil · çerez banner + KVKK sayfaları · responsive.
> **Sonra eklenecek (en son — Bölüm 17, Faz 6):** müşteri üyelik/giriş ve **ödeme**. Ödeme sağlayıcısı: Yonca'nın vereceği **React-uyumlu sağlayıcı** (daha önce kullandığı). ⚠️ Türkiye'de PayPal yasak olduğundan tam adını netleştireceğiz.

### 5.2 Admin Panel
Güvenli giriş (Sanctum) · dashboard (ürün/kategori/sipariş sayısı, stok uyarısı) · **kategori CRUD** · **ürün CRUD** (ad, açıklama, fiyat, indirimli fiyat, **çoklu görsel**, **varyantlar: beden/renk + her birinin stoğu**, kategori, aktif/pasif, slug) · **sipariş yönetimi** (durum güncelleme) · **yorum onaylama** · görsel yükleme (güvenli).

---

## 6. 🗄️ Veritabanı Şeması (MySQL) — Tam & Tutarlı

### 6.1 Kurallar (her tabloda aynı)
- Tüm tablolar: **çoğul, snake_case** (örn. `product_variants`).
- Birincil anahtar: **`id`** `BIGINT UNSIGNED AUTO_INCREMENT`.
- Yabancı anahtar: **`<tekil>_id`** `BIGINT UNSIGNED` (örn. `product_id`, `user_id`).
- Para: `DECIMAL(10,2)` · Mantıksal: `is_*` `BOOLEAN` · Zaman: `created_at`, `updated_at`.
- Durum alanları: `ENUM` · Metin: `VARCHAR`/`TEXT` · Slug/sku/email: `UNIQUE`.

### 6.2 Tablolar

**`users`** — id · name · email (UNIQUE) · email_verified_at (NULL) · password · role ENUM('admin','customer') default 'customer' · remember_token · timestamps

**`categories`** — id · name · slug (UNIQUE) · **parent_id → categories.id** (NULL, alt kategori) · image (NULL) · is_active (default true) · timestamps

**`products`** — id · **category_id → categories.id** · name · slug (UNIQUE) · description (TEXT) · base_price DECIMAL(10,2) · discount_price DECIMAL(10,2) (NULL) · is_active (default true) · timestamps
> Stok burada DEĞİL — stok **varyant** seviyesinde (aşağıda). Varyantsız ürün için tek bir varsayılan varyant açılır.

**`product_variants`** — id · **product_id → products.id** · sku (UNIQUE) · size (NULL) · color (NULL) · price DECIMAL(10,2) (NULL = ürünün base_price'ı) · stock INT UNSIGNED default 0 · is_active (default true) · timestamps
> Beden+renk kombinasyonu + her kombinasyonun kendi stoğu burada tutulur.

**`product_images`** — id · **product_id → products.id** · **variant_id → product_variants.id** (NULL = ürünün geneli; dolu = o renge ait) · path · is_primary (default false) · sort_order INT default 0 · timestamps

**`addresses`** — id · **user_id → users.id** · title (örn. "Ev") · full_name · phone · city · district · full_address (TEXT) · postal_code (NULL) · is_default (default false) · timestamps

**`orders`** — id · **user_id → users.id** (NULL = misafir) · order_number (UNIQUE) · status ENUM('pending','processing','shipped','delivered','cancelled') default 'pending' · subtotal DECIMAL(10,2) · shipping_cost DECIMAL(10,2) default 0 · discount_total DECIMAL(10,2) default 0 · total DECIMAL(10,2) · payment_status ENUM('unpaid','paid','refunded') default 'unpaid' · payment_method (NULL) · shipping_name · shipping_phone · shipping_city · shipping_district · shipping_address (TEXT) · shipping_postal_code (NULL) · timestamps
> Teslimat bilgisi sipariş anında **kopyalanır (snapshot)** — adres sonradan değişse bile geçmiş sipariş bozulmaz.

**`order_items`** — id · **order_id → orders.id** · **product_id → products.id** · **variant_id → product_variants.id** (NULL) · product_name (snapshot) · variant_label (snapshot, örn. "L / Siyah") · unit_price DECIMAL(10,2) · quantity INT UNSIGNED · line_total DECIMAL(10,2) · timestamps

**`reviews`** — id · **product_id → products.id** · **user_id → users.id** · rating TINYINT (1–5) · comment (TEXT, NULL) · is_approved (default false) · timestamps

**`wishlists`** — id · **user_id → users.id** · **product_id → products.id** · timestamps · **UNIQUE(user_id, product_id)**

> **Not (i18n):** Çok dilli ürün/kategori için `name`/`description` çevrilebilir hale gelir — Bölüm 12. Şifre sıfırlama için Laravel'in hazır `password_reset_tokens` tablosu kullanılır.

### 6.3 İlişkiler (Eloquent) — tutarlı
- **Category**: `hasMany(Product)` · `hasMany(Category 'children')` / `belongsTo(Category 'parent')`
- **Product**: `belongsTo(Category)` · `hasMany(ProductVariant)` · `hasMany(ProductImage)` · `hasMany(Review)` · `belongsToMany(User)` *(favori, wishlists üzerinden)*
- **ProductVariant**: `belongsTo(Product)` · `hasMany(ProductImage)` · `hasMany(OrderItem)`
- **User**: `hasMany(Address)` · `hasMany(Order)` · `hasMany(Review)` · `belongsToMany(Product)` *(favori)*
- **Order**: `belongsTo(User)` · `hasMany(OrderItem)`
- **OrderItem**: `belongsTo(Order)` · `belongsTo(Product)` · `belongsTo(ProductVariant)`
- **Review**: `belongsTo(Product)` · `belongsTo(User)`
- **Address**: `belongsTo(User)`

> **Bağımlılık:** `addresses`, `orders`, `reviews`, `wishlists` tabloları **müşteri girişine** bağlı → şema şimdi tam tanımlı, ama bu özellikler müşteri-auth fazıyla birlikte (Bölüm 18) kodlanır.

---

## 7. API Endpoint'leri (`/api/v1`)

**Public:** `GET /categories` · `GET /products` · `GET /products/{slug}` · `GET /products?category=&sort=&search=` · `GET /products/{slug}/reviews`
**Müşteri (sonra, auth):** `POST /register` · `POST /login` · adres CRUD · `POST /orders` · `GET /orders` · `POST /reviews` · favori ekle/çıkar
**Admin (`auth:sanctum` + admin):** `POST /admin/login` · kategori CRUD · ürün CRUD · varyant CRUD · `POST /admin/products/{id}/images` · `GET/PUT /admin/orders` · yorum onay/sil
> Tüm yanıtlar **API Resource** ile tutarlı JSON.

---

## 8. Güvenlik Önlemleri (Laravel)

Sanctum token + expiry + ability · Form Request doğrulama · Rate limiting (login'de dk/5) · admin rol/Policy · CORS sadece frontend domain'i · HTTPS + HSTS · dosya yükleme (yalnız resim, boyut limiti, isim randomize) · Eloquent (SQL injection koruması) · Hash/bcrypt şifre · secrets `.env`'de (git'e asla) · production `APP_DEBUG=false`.
> Ayrıca **Cloudflare Security Audit skill** ile her fazdan sonra güvenlik denetimi (Bölüm 13).

---

## 9. ⚖️ KVKK & Yasal Uyumluluk (Türkiye)

**KVKK:** Aydınlatma Metni · Açık Rıza (ön-işaretli olmayan onay) · Çerez Politikası + Banner (zorunlu olmayan çerezler varsayılan reddedilir) · ilgili kişi hakları (erişme/düzeltme/silme) · veri minimizasyonu · güvenli saklama.
**Mesafeli satış/tüketici:** Gizlilik Politikası · Mesafeli Satış Sözleşmesi · İade & Cayma Hakkı (14 gün) · Teslimat/İptal koşulları · satıcı bilgileri (footer).
**Teknik:** `CookieBanner` (rıza localStorage) · statik sayfalar `/gizlilik`, `/kvkk`, `/cerez-politikasi`, `/mesafeli-satis`, `/iade` · footer linkleri · formlarda açık rıza onayı.

---

## 10. 🔍 SEO — Google'da Üst Sıralar

- **Mimari:** React + TS (Vite, SPA). SPA olduğu için SEO'yu şununla güçlendiririz: **`react-helmet-async`** (sayfa başına title/description) + **prerender** (`react-snap` / vite prerender ile botlara statik HTML) → cPanel'de sorunsuz çalışır.
- **⏰ SEO skill:** Yonca kendi SEO skill'ini verecek — **Faz 5'te** onu kullanacağız (hatırlat!).
- **On-page:** her sayfaya özel title/description · tek `<h1>` · SEO slug · görsel `alt` + WebP + lazy-load · iç linkleme.
- **Yapılandırılmış veri (JSON-LD):** `Product`+`Offer` (fiyat/stok), `AggregateRating` (yorum puanı — artık `reviews` tablosu var ✅), `BreadcrumbList`, `Organization`.
- **Teknik:** `sitemap.xml` + `robots.txt` · Core Web Vitals (kod bölme, görsel opt., cache) · mobile-first · HTTPS · Google Search Console.
> Site yayına girince gerçek SEO denetimi/hız raporu yaparız.

---

## 11. 🌐 Çoklu Dil (i18n) — TR / DE / EN

- **Frontend:** `react-i18next` — arayüz metinleri `locales/tr.json`, `de.json`, `en.json`.
- **İçerik (ürün/kategori):** `name`/`description` çevrilebilir → **`spatie/laravel-translatable`** (JSON kolonlar) ile; ayrı çeviri tablosu gerekmez, şema sade kalır.
- **URL + SEO:** dil ön eki (`/tr/...`, `/de/...`) + **hreflang** etiketleri.
- **LanguageSwitcher** bileşeni navbar'da. Varsayılan: TR.

---

## 12. 🧪 Test Stratejisi

- **Backend (Laravel):** **Pest** (veya PHPUnit) — feature testleri (API uçları, auth, sipariş akışı) + unit testleri (fiyat/stok hesapları).
- **Frontend (React):** **Vitest + React Testing Library** — bileşen ve sepet mantığı testleri.
- **Güvenlik testi:** **Cloudflare Security Audit skill** ile her fazdan sonra denetim; bulguları düzelt.
- Kural: Bir özellik "bitti" demeden önce ilgili testler yeşil olacak (Superpowers bu disiplini destekler).

---

## 13. 📊 Loglama & İzleme

- **Hata takibi:** **Sentry** (Laravel + React entegrasyonu) — production'da hataları yakalar.
- Laravel log kanalları (daily), kritik olaylar loglanır.
- (İleride) basit uptime/performans izleme.

---

## 14. 🚀 Yayınlama (cPanel — İyiBuldum)

Her şey mevcut **cPanel** hostingde yayınlanacak (PHP destekli):
- **Laravel API:** cPanel'e yüklenir; proje bir klasöre konur, Laravel'in `public/` içeriği `public_html`'e (veya alt alan `api.yoncaesendemir.com.tr`'ye) yönlendirilir. `.env` ve DB cPanel'den ayarlanır (MySQL cPanel'de hazır gelir).
- **React build:** `npm run build` → oluşan `dist/` klasörü `public_html`'e (veya kök domaine) yüklenir — statik dosyalar, Node gerektirmez, cPanel'de sorunsuz çalışır.
- **SSL:** cPanel'in ücretsiz **Let's Encrypt / AutoSSL** özelliğiyle HTTPS.
- **Yerel geliştirme (opsiyonel):** Docker (Laravel Sail) ile tutarlı ortam — ama yayın cPanel'de.
> Not: cPanel paylaşımlı hosting ileride büyük trafikte sınırlı kalırsa VPS'e taşınabilir; şimdilik cPanel yeterli.

---

## 15. 🔧 Sürüm Kontrol / GitHub

- Proje **GitHub reposunda** tutulacak (github.com/YoncaEsendemir).
- Akış: repo oluştur → her fazı ayrı **commit/branch** ile ilerlet → anlamlı commit mesajları → en sonda Docker ile VPS'e deploy.
- `.gitignore`: `.env`, `node_modules`, `vendor`, build çıktıları, yükleme klasörü.
- (İleride) GitHub Actions ile otomatik test + deploy.

---

## 16. Klasör Yapısı

**Frontend (`storefront/`)** — `components/ · pages/ · layouts/ · store/ (Zustand) · services/ (api.ts, axios) · hooks/ · types/ · locales/ (i18n) · lib/`
**Backend (`api/`)** — `app/Http/Controllers/Api/V1/ · Http/Requests/ · Http/Resources/ · Models/ · Policies/ · database/migrations/ · routes/api.php · tests/`
**Kök** — `docker-compose.yml · docker-compose.prod.yml · Dockerfile'lar · .gitignore · README.md`

---

## 17. Geliştirme Yol Haritası (Adım Adım)

> Sen skilleri kurarsın, Claude Code kodlar, sen kendi editöründe yazarsın; her adımda ben açıklarım.

**Faz 0 — Kurulum**
1. GitHub repo + Laravel 12 + MySQL + Sanctum (yerelde; opsiyonel Docker/Sail)
2. Frontend kurulumu: **Vite + React + TypeScript + Tailwind**
3. 4 skill'i kur (Bölüm 2)

**Faz 1 — Backend temeli**
4. Migration'lar (users, categories, products, product_variants, product_images)
5. Model + ilişkiler + seed
6. Public API (kategori/ürün/varyant) + API Resource

**Faz 2 — Admin backend**
7. Admin login (Sanctum + rate limit + Policy)
8. Kategori CRUD + Ürün CRUD + varyant + görsel yükleme
9. Sipariş yönetimi (orders/order_items) + durum güncelleme

**Faz 3 — Storefront (koyu tema)**
10. Layout + Navbar + Footer + routing + koyu tema token'ları
11. Ana sayfa + kategori + ürün detay (varyant seçimi) + sepet
12. Framer Motion + responsive + SEO meta/JSON-LD
13. Ürün yorumları (liste/puan görünümü)

**Faz 4 — Admin panel (frontend)**
14. Admin giriş + korumalı route + kategori/ürün/varyant/sipariş/yorum ekranları

**Faz 5 — KVKK, SEO, i18n, Test**
15. Çerez banner + yasal sayfalar (Bölüm 9)
16. SEO: react-helmet meta + prerender + JSON-LD + sitemap/robots + Search Console (Bölüm 10)
    ⏰ **Yonca'nın SEO skill'ini burada kullan** (hatırlat!)
17. i18n (TR/DE/EN) + hreflang (Bölüm 11)
18. Testler (Pest + Vitest) + güvenlik denetimi (Cloudflare skill)
19. Sentry entegrasyonu

**Faz 6 — En son: müşteri + ödeme + yayın**  ⟵ *senin "en son" dediğin kısım*
20. Müşteri üyelik/giriş + adres yönetimi + favoriler
21. Checkout akışı + kargo
22. **Ödeme entegrasyonu** (Yonca'nın vereceği React-uyumlu sağlayıcı)
23. cPanel'e yayın (Laravel API + React build) + SSL

---

## 18. Çalışma Şeklimiz
- Kodu birlikte, **parça parça**: ben her satırı açıklarım, sen kendi editörüne yazarsın.
- Tasarımda **hallmark** prensipleri; sen `hallmark`/`hallmark audit`, güvenlikte **Cloudflare Security Audit** çalıştırırsın.
- Bir fazı bitirmeden diğerine geçmeyiz; takıldığın yerde dururuz.

---

> **Kararlar netleşti:** Frontend **React + TS (Vite)** · Yayın **cPanel** · Ödeme **Yonca'nın vereceği React-uyumlu sağlayıcı** (Faz 6) · SEO skill'i Faz 5'te eklenecek.
