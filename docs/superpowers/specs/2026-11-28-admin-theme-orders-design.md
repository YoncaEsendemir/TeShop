# Admin Panel Derinleştirme — Tema · Siparişler · Grafikler · Ayarlar · Stok

Tarih: 2026-11-28 · Durum: ONAYLANDI (Yonca, 28.11.2026) — elle sipariş oluşturma formu DAHİL

## Amaç / Neden
Yonca panelin ve uygulamanın "sade/eksik" olduğunu söyledi. Senior seviyede,
eksiksiz tamamlanacak başlıklar: (1) açık/koyu tema (storefront + admin),
(2) gerçek bir mini sipariş sistemi, (3) dashboard grafikleri (stok + gerçek
gelir), (4) admin ayarları (tema, şifre, profil, mağaza bilgisi), (5) stok
yönetimi görünürlüğü.

## Hedefler
- **Tema:** açık/koyu, kullanıcı seçimi kalıcı (localStorage), ilk ziyarette
  `prefers-color-scheme`. Storefront + admin aynı token sistemiyle. FOUC yok.
- **Siparişler:** normalize `orders` + `order_items`, snapshot'lı; admin liste/detay/
  durum güncelleme; gerçekçi tohum veri (geçmiş siparişler) → gerçek gelir.
- **Grafikler:** gerçek veriden — aylık gelir, sipariş durumu, stok durumu,
  kategoriye göre stok/ürün, envanter değeri, çok satanlar. Bağımlılıksız SVG.
- **Ayarlar:** tema · şifre değiştir · profil (ad/e-posta) · mağaza bilgisi.
- **Stok:** envanter değeri + az/tükenen stok listesi (ürün düzenlemeye link).

## Hedef-olmayanlar (bu tur)
- Müşteri checkout akışı / self-register / e-posta doğrulama / şifre sıfırlama →
  **Faz 6**. (Siparişler şimdilik tohum + admin tarafından yönetilir/oluşturulur.)
- Ödeme entegrasyonu, kargo takibi, fatura.

NOT: Admin'de **elle sipariş oluşturma formu DAHİL** (Yonca onayı): ürün→varyant→
adet seçip sipariş kaydı. `POST /admin/orders`.

## Anti-hedefler
- Sahte **toplam/gelir sayıları** uydurmak. (Gelir hep gerçek order satırlarından
  hesaplanır; tohum veri gerçek order kaydıdır, aggregate sahtekârlığı değil.)
- Tema geçişinde renk token'ı dışında sabit hex; erişilebilir kontrast ihlali.
- Reduced-motion ihlali; FOUC (tema yüklenirken yanıp sönme).
- Şifre/endpoint'lerde yetki/rate-limit eksikliği.

## Kısıtlar
- Stack sabit: React 19 + TS + Tailwind v4 + zustand + TanStack Query +
  framer-motion; Laravel 12 + Sanctum. **Grafik için yeni bağımlılık yok**
  (birkaç basit grafik → el yapımı SVG, monokrom/tema uyumlu).
- Tüm renk token'dan; tema `data-theme` ile CSS değişkeni override.
- Admin endpoint'leri `auth:sanctum` + `admin`; şifre değiştirme ekstra doğrulama
  + token yenileme.
- artisan/npm Docker içinde.

## Yaklaşımlar (kararlar)
- **Tema — data-theme + CSS değişken override** (seçildi). Tailwind v4 @theme
  token'ları CSS değişkeni ürettiği için `:root[data-theme="light"]` altında
  değişkenleri ezince tüm utility'ler yeniden temalaşır; class'ları değiştirmeye
  gerek yok. Alternatif (Tailwind `dark:` variant'ı her element'e eklemek)
  elendi — yüzlerce class dokunuşu, DRY değil.
- **Grafik — el yapımı SVG** (seçildi). Alternatif recharts: birkaç basit grafik
  için ~bundle şişirir (zaten >500KB uyarısı var). SVG bar/donut/area bileşenleri
  küçük, tam kontrol, tema uyumlu.
- **Sipariş verisi — mini sistem + gerçekçi tohum** (kullanıcı 1+2 seçti).
  orders/order_items gerçek tablolar; ~50 geçmiş sipariş tohumlanır (admin
  yönetir). Gelir bu satırlardan aggregate edilir.
- **Mağaza bilgisi — settings (key/value) tablosu** (seçildi). Alternatif config
  dosyası elendi (admin'den düzenlenemez).

## Nasıl yapılacak — alt sistemler ve sıra

### A. Tema (açık/koyu) — temel
- `index.css`: @theme'deki koyu değerler varsayılan; `:root[data-theme="light"]`
  ve `:root[data-theme="dark"]` altında token override. Body radial gradyanı
  temaya göre. Light paleti: bg `#f7f7f8` surface `#ffffff` surface-2 `#f0f0f2`
  border `#e5e5ea` text `#17171a` muted `#55555c` subtle `#8a8a92` primary
  `#17171a` primary-text `#ffffff` accent `#2b2b2f`.
- `store/theme.ts` (zustand+persist, 'teshop-theme': 'light'|'dark'|'system'):
  seçimi `document.documentElement.dataset.theme`'e yazar; 'system' →
  matchMedia dinler.
- `index.html`: `<head>`e küçük inline script — React'ten önce data-theme'i
  localStorage/prefers'tan set eder (FOUC yok).
- `components/ThemeToggle.tsx` (sun/moon, lucide): storefront Navbar + admin
  topbar + Ayarlar'da. `prefers-reduced-motion` uyumlu.

### B. Siparişler (backend + tohum)
- Migration `orders`: id, order_number (uniq), customer_name, customer_email,
  status enum(pending,paid,shipped,delivered,cancelled) default pending,
  subtotal, shipping_fee, total (decimal 10,2), placed_at (timestamp), timestamps.
- Migration `order_items`: id, order_id FK cascade, product_id FK nullOnDelete,
  variant_id nullable, product_name (snapshot), unit_price, qty, line_total.
- Modeller `Order`(items, scopeRevenue = status != cancelled), `OrderItem`.
- `OrderResource` / `OrderItemResource`.
- `Admin\OrderController`: index (paginate + status filtre), show (items),
  store (POST — customer + items[], her kalemde product_id+variant_id+qty;
  unit_price/product_name sunucuda snapshot alınır, total hesaplanır),
  updateStatus (PATCH, enum doğrula). Routes admin grubunda.
- Frontend: admin'de **sipariş oluşturma formu** (ürün→varyant→adet ekle, canlı
  toplam) → `POST /admin/orders`.
- `DashboardController` genişlet: total_revenue, orders_count, avg_order_value,
  revenue_by_month (son 6 ay), orders_by_status, top_products (gelir/adet),
  recent_orders; + inventory_value (Σ stok×etkin fiyat), stock_by_category.
- `OrderSeeder`: ~50 sipariş, son ~6 ay, 1–4 kalem, ağırlıklı durum
  (çoğu delivered/paid, bir kısmı cancelled), snapshot fiyatlar; DatabaseSeeder'a
  eklenir. (Tohum = gerçek order kaydı.)

### C. Dashboard grafikleri (frontend)
- `components/charts/`: `BarChart.tsx`, `DonutChart.tsx`, `AreaChart.tsx` —
  bağımlılıksız SVG, responsive (viewBox), tema token renkli, erişilebilir
  (`<title>`, aria), reduced-motion'da animasyonsuz. dataviz skill kılavuzu.
- `pages/admin/Dashboard.tsx` yenile: gelir/sipariş/ort. sepet tile'ları, aylık
  gelir (area/bar), sipariş durumu (donut), stok durumu (donut), kategoriye göre
  stok (bar), çok satanlar + son siparişler listeleri.
- `services/adminApi.ts`: genişletilmiş stats + orders çağrıları.

### D. Admin Ayarlar
- Route `/admin/ayarlar` + nav. `pages/admin/Settings.tsx` bölümleri:
  - Tema (ThemeToggle).
  - Profil: ad/e-posta → `PUT /admin/profile` (validate, e-posta uniq).
  - Şifre: current_password + new_password (min 8, confirmed) →
    `PUT /admin/password` (Hash::check ile mevcut doğrula, güncelle, diğer
    token'ları iptal et).
  - Mağaza bilgisi: store_name, store_email, store_phone, store_address →
    `settings` key/value tablosu; `GET/PUT /admin/settings` + public `GET /settings`.
    Footer bu bilgiyi kullanır (yoksa mevcut varsayılan).
- Migration `settings` (key PK string, value text nullable) + varsayılan tohum.
- `Admin\ProfileController`, `Admin\PasswordController`, `SettingController`.

### E. Stok yönetimi (görünürlük)
- Dashboard'da envanter değeri tile + az-stok (1–5) ve tükenen varyant listeleri,
  her satır ürün düzenlemeye link. (Stok düzenleme zaten ürün formunda var.)

## Test / doğrulama
- Backend: Order model/aggregate + yeni endpoint'ler için PHPUnit feature test
  (orders list/updateStatus yetki+durum; password change doğru/yanlış current;
  profile update; settings get/put; stats revenue hesaplama). TDD.
- Frontend: chart saf yardımcıları (ölçek/segment hesapları) + theme store için
  Vitest; mevcut 44 test geçmeye devam.
- Tarayıcı turu: tema geçişi (storefront+admin, FOUC yok, reduced-motion),
  dashboard grafikleri gerçek veriyle, ayarlar akışları, mobil.

## Review Focus
- **Yetki:** yeni admin endpoint'leri auth+admin korumalı; public `GET /settings`
  yalnız whitelisted alanları döner (e-posta/telefon hassas değil ama seçili).
- **Şifre değiştirme:** yanlış current → 422; başarı sonrası diğer token iptal;
  rate-limit.
- **Order toplamları:** line_total = unit_price×qty; order.total = Σ + shipping;
  cancelled gelire girmez; revenue_by_month zaman dilimi doğru.
- **Tema FOUC & kontrast:** ilk boya doğru tema; açık temada metin kontrastı AA;
  reduced-motion'da geçiş animasyonu yok.
- **Boş veri:** sipariş yokken grafikler/averaj 0'a bölme olmadan boş durum gösterir.

## Builder'a bırakılanlar
- Chart eksen/segment ince ayarı, tile düzeni, tohum sipariş sayısı/dağılımı,
  ışık paleti son tonları (AA kontrast korunarak).

## Açık kararlar
- [x] Kapsam + sıra (A→E) onaylandı. Elle sipariş oluşturma formu DAHİL (Yonca).
