# Storefront Ana Sayfa & Header Yeniden Tasarımı — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ana sayfaya tam genişlik animasyonlu foto carousel + üst duyuru bandı ekle, kataloğu 4 yeni kategori ve 12 ürünle (başlığa uygun telifsiz görsel) zenginleştir.

**Architecture:** Mevcut React 19 + Tailwind v4 + framer-motion mimarisini genişlet; carousel'i yeni kütüphane eklemeden framer-motion `AnimatePresence` ile yaz. Kategori/ürün verisi Laravel `ShopSeeder`'a eklenir. Tema token'ları ve i18n mevcut desenle kullanılır.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, framer-motion, react-i18next, Vitest; Laravel 12 seeder (Docker içinde artisan).

**Spec:** `docs/superpowers/specs/2026-11-27-storefront-redesign-design.md`

## Global Constraints
- Yeni frontend bağımlılığı YOK (carousel framer-motion ile).
- Tüm renkler `index.css` token'larından; çıplak hex kullanma.
- Her animasyonda `useReducedMotion` dalı: reduced-motion'da otomatik hareket/geçiş kapalı.
- Görseller yalnız Unsplash lisansı (`images.unsplash.com/photo-...`); KULLANMADAN önce her URL curl ile HTTP 200 + içerik gözle doğrulanır (başlığa uygun mu).
- Çok dilli içerik tr/de/en (spatie translatable); yeni UI metni 3 dile de eklenir.
- artisan/npm komutları Docker içinde: `docker compose exec -T api php artisan ...`, `docker compose exec -T storefront npm ...`.
- overflow-x taşması olmamalı; carousel sabit yükseklikli (CLS yok).

## Review Focus
- **Reduced-motion:** kullanıcı hareket azaltma seçtiğinde carousel otomatik geçmemeli, duyuru bandı kaymamalı → Task 3 testi `nextSlide` + reduced dalını, Task 2 statik bandı doğrular.
- **Kırık görsel:** bir Unsplash URL'i 200 dönmezse kart fallback'e düşmeli (ProductCard'da `onError` zaten var) → Task 1'de her URL curl ile doğrulanır.
- **Tek ürünlü/az slide:** carousel 1 slide ile de patlamamalı (dots tek, otomatik geçiş no-op) → Task 3 `nextSlide(0,1)===0` testi.
- **Mobil header taşması:** 6 kategori + arama dar ekranda yatay taşma yapmamalı → Task 2 tarayıcı doğrulamasında mobil genişlik kontrolü.
- **İndirim tutarlılığı:** İndirim kategorisindeki 3 ürünün hepsi `discount_price` içermeli → Task 1 seed verisi.

---

### Task 1: Katalog genişletme — 4 kategori + 12 ürün + doğrulanmış görseller

**Files:**
- Modify: `api/database/seeders/ShopSeeder.php`

**Interfaces:**
- Consumes: mevcut `$img` helper (`photo-{id}` → tam Unsplash URL), `Category/Product/ProductVariant/ProductImage` modelleri, mevcut ürün-oluşturma döngüsü.
- Produces: DB'de 6 top-level kategori (Kadın, Erkek, Spor, Ayakkabı, Aksesuar, İndirim) ve toplam 18 ürün; public API `GET /api/v1/categories` 6 top-level, `GET /api/v1/products` 18 ürün döner.

Yeni kategoriler (çok dilli ad + slug): Spor/`spor`, Ayakkabı/`ayakkabi`, Aksesuar/`aksesuar`, İndirim/`indirim`.

Yeni ürünler (kategori · ad TR · fiyat · indirim · bedenler · renkler) — görsel ID'leri uygulamada doğrulanıp doldurulur:
- Spor: Dry-Fit Spor Tişört 349.90/299.90 [S,M,L,XL] [Siyah,Gri]; Eşofman Altı 599.90/– [S,M,L,XL] [Siyah,Antrasit]; Spor Şort 279.90/– [S,M,L,XL] [Siyah,Lacivert]
- Ayakkabı: Koşu Ayakkabısı 1299.90/999.90 [39,40,41,42,43,44] [Siyah,Beyaz]; Günlük Sneaker 899.90/– [39,40,41,42,43,44] [Beyaz,Gri]; Deri Bot 1599.90/– [39,40,41,42,43,44] [Siyah,Kahve]
- Aksesuar: Deri Kemer 299.90/– [Std] [Siyah,Kahve]; Örgü Bere 199.90/149.90 [Std] [Siyah,Gri]; Kanvas Sırt Çantası 499.90/– [Std] [Siyah,Haki]
- İndirim (hepsi indirimli): Oversize Hırka 749.90/499.90 [S,M,L,XL] [Bej,Gri]; Kareli Gömlek 449.90/299.90 [S,M,L,XL] [Kırmızı,Lacivert]; Mont 1499.90/999.90 [M,L,XL] [Siyah,Haki]

(DE/EN adları seeder'da verilecek; açıklama mevcut `$desc` şablonuyla.)

- [ ] **Step 1: Görselleri bul ve doğrula** — her 12 ürün için başlığa uygun Unsplash foto ID'si seç; `curl -s -o f.jpg -w "%{http_code}" "https://images.unsplash.com/photo-{id}?w=400&h=500&fit=crop"` ile 200 kontrol et ve Read ile görsel içeriğin başlığa uyduğunu gözle teyit et. Uymayanı değiştir.
- [ ] **Step 2: Seeder'a kategorileri ve ürün dizisini ekle** — 4 `Category::create` + yeni ürünleri mevcut `foreach ($urunler ...)` desenine uygun şekilde ekle (her ürüne doğrulanmış `$img('{id}')`). Aksesuar beden `Std`.
- [ ] **Step 3: Yeniden seed et** — Run: `docker compose exec -T api php artisan migrate:fresh --seed` · Expected: hatasız, "ShopSeeder ... DONE".
- [ ] **Step 4: API doğrula** — Run: `curl -s localhost:8000/api/v1/categories` (6 top-level) ve `curl -s "localhost:8000/api/v1/products?per_page=100"` ya da sayfalama meta `total:18`. Expected: 6 kategori, 18 ürün; İndirim ürünlerinde `has_discount:true`.
- [ ] **Step 5: Commit** — `git add api/database/seeders/ShopSeeder.php && git commit -m "feat(seed): 4 yeni kategori + 12 ürün (başlığa uygun telifsiz görseller)"`

---

### Task 2: Üst duyuru bandı (AnnouncementBar)

**Files:**
- Create: `storefront/src/components/AnnouncementBar.tsx`
- Modify: `storefront/src/layouts/RootLayout.tsx` (bandı Navbar'ın üstüne mount et) — gerçek yol uygulamada teyit edilir; Navbar nerede render ediliyorsa onun hemen üstü.
- Modify: `storefront/src/i18n/locales/{tr,de,en}.json`

**Interfaces:**
- Produces: `<AnnouncementBar />` — props yok; i18n `announce.text` okur.

- [ ] **Step 1: i18n anahtarı ekle** — `announce.text` (tr: "Tüm siparişlerde ücretsiz kargo · Yeni sezon indirimde", de/en karşılıkları).
- [ ] **Step 2: AnnouncementBar bileşenini yaz** — ince şerit, token renkleri (`bg-surface-2`/`text-text-muted` veya aksan), ortalanmış metin; opsiyonel hafif marquee animasyonu `useReducedMotion` ile kapanır (reduced → statik, ortalı metin). `focus-visible` gerektiren interaktif eleman yoksa sade `<div role="region" aria-label>`.
- [ ] **Step 3: Layout'a mount et** — RootLayout'ta Navbar'ın üstüne `<AnnouncementBar />`.
- [ ] **Step 4: Build** — Run: `docker compose exec -T storefront npm run build` · Expected: hatasız.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(ui): üst duyuru bandı + i18n"`

---

### Task 3: Hero carousel (HeroCarousel) + Home'a bağla

**Files:**
- Create: `storefront/src/components/HeroCarousel.tsx`
- Create: `storefront/src/components/heroCarousel.ts` (pür `nextSlide` helper)
- Create: `storefront/src/components/heroCarousel.test.ts` (Vitest)
- Modify: `storefront/src/pages/Home.tsx:27-60` (eski hero bloğunu carousel ile değiştir; öne çıkan ürünler bölümü kalır)

**Interfaces:**
- Consumes: Task 1'den gelen ürün görselleri (Home zaten `fetchProducts({sort:'newest'})` çağırıyor; ilk 3–5 ürünün primary görseli slide olur), `imageUrl` util, `useReducedMotion`.
- Produces: `export function nextSlide(current: number, length: number): number` (length<=1 → 0, yoksa `(current+1)%length`); `export default function HeroCarousel({ slides }: { slides: { img: string; title: string; href: string }[] })`.

- [ ] **Step 1: Failing test yaz** — `heroCarousel.test.ts`: `nextSlide(0,3)===1`, `nextSlide(2,3)===0`, `nextSlide(0,1)===0`, `nextSlide(0,0)===0`.
- [ ] **Step 2: Testin düştüğünü gör** — Run: `docker compose exec -T storefront npm test -- heroCarousel` · Expected: FAIL (nextSlide tanımsız).
- [ ] **Step 3: `nextSlide`'ı yaz** — `heroCarousel.ts` içinde yukarıdaki imza.
- [ ] **Step 4: Test geçsin** — Run: `docker compose exec -T storefront npm test -- heroCarousel` · Expected: PASS.
- [ ] **Step 5: HeroCarousel bileşenini yaz** — tam genişlik (max-w-7xl içinde büyük yuvarlak köşeli panel), sabit `min-h` (~70vh/clamp), `AnimatePresence` ile aktif slide çapraz geçiş; her slide: `<img object-cover>` + koyu gradyan overlay + başlık(`font-display`) + CTA butonu (mevcut hero buton stilleri). Tıklanabilir dots (`aria-label`, aktif belirgin). `useReducedMotion` → otomatik `setInterval` kurma, geçiş animasyonu kapalı, ilk slide statik. Hover'da interval durur.
- [ ] **Step 6: Home'a bağla** — `Home.tsx`'te eski `{/* Hero */}` bölümünü `<HeroCarousel slides={...} />` ile değiştir; slide'ları öne çıkan ürünlerden türet (görsel + ad + `/urun/{slug}`). CTA'lar + "Yeni Sezon/Monokrom" başlığı korunur (en az ilk slide marka mesajı). i18n metinleri kullan.
- [ ] **Step 7: Build + görsel doğrulama** — Run: `docker compose exec -T storefront npm run build` (hatasız). Tarayıcıda ana sayfa: carousel geçiyor, dots çalışıyor, mobilde taşma yok; reduced-motion'da statik.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat(ui): tam genişlik animasyonlu hero carousel"`

---

### Task 4: Tasarım cilası + bütünsel doğrulama (ui skilleri)

**Files:** gerektiğinde Task 2–3 bileşenleri + `index.css` (yalnız token/utility).

- [ ] **Step 1: Tasarım geçişi** — ui-ux-pro-max + ui-styling + banner-design skill'leriyle hero/band/kart hiyerarşisini gözden geçir (boşluk, kontrast, tipografi ölçeği, aksan kullanımı). hallmark Floor kurallarına uygunluğu koru.
- [ ] **Step 2: Erişilebilirlik/hareket** — tüm yeni animasyonlarda reduced-motion teyidi; focus-visible; renk kontrastı.
- [ ] **Step 3: Tam doğrulama** — Run: `docker compose exec -T storefront npm run build` + `docker compose exec -T storefront npm test` + `docker compose exec -T api php artisan test` · Expected: build temiz, 39+ test geçer.
- [ ] **Step 4: Tarayıcı turu** — ana sayfa (hero, band, yeni kategoriler nav'da, yeni ürünler+görseller), 1 ürün detay, mobil genişlik, dil değişimi. Ekran görüntüsü al.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "polish(ui): tasarım cilası + erişilebilirlik"`
