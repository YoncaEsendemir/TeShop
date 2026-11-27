# Admin Tema · Siparişler · Grafikler · Ayarlar — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Açık/koyu tema (storefront+admin), gerçek mini sipariş sistemi, gerçek veriden dashboard grafikleri, admin ayarları (tema/şifre/profil/mağaza bilgisi) ve stok görünürlüğü ekle.

**Architecture:** Mevcut React 19 + Tailwind v4 (CSS değişken token) + zustand + TanStack Query + Laravel 12 + Sanctum mimarisini genişlet. Tema `data-theme` ile CSS değişken override. Grafikler bağımlılıksız SVG. Siparişler normalize orders/order_items + gerçekçi tohum.

**Tech Stack:** React 19, TS, Tailwind v4, zustand, TanStack Query, framer-motion, lucide; Laravel 12, Sanctum, PHPUnit; Vitest.

**Spec:** `docs/superpowers/specs/2026-11-28-admin-theme-orders-design.md`

## Global Constraints
- Yeni frontend bağımlılığı YOK (grafikler SVG).
- Tüm renk token'dan; tema `:root[data-theme="light"|"dark"]` ile.
- Animasyonlarda `useReducedMotion`/CSS reduced-motion dalı.
- Yeni admin endpoint'leri `auth:sanctum` + `admin`. Şifre değiştirme: mevcut şifre `Hash::check`, sonra diğer token'ları iptal.
- Gelir yalnız gerçek order satırlarından (status != cancelled). Sahte toplam yok.
- artisan/npm Docker içinde: `docker compose exec -T api php artisan ...`, `... -T storefront npm ...`.
- Para alanları decimal(10,2); line_total = unit_price×qty; order.total = subtotal + shipping_fee.

## Review Focus
- **Yetki/rate-limit:** yeni admin endpoint'leri korumalı; `PUT /admin/password` yanlış current → 422, başarı → diğer token iptal → T6 testi.
- **Order toplam tutarlılığı:** store'da unit_price/product_name sunucuda snapshot; cancelled gelire girmez; revenue_by_month doğru ay grubu → T2/T4 testleri.
- **Boş veri / sıfıra bölme:** sipariş yokken avg_order_value=0, grafikler boş durum → T4/T5 (helper testleri + boş-durum render).
- **Tema FOUC & kontrast:** ilk boyada doğru tema (inline script), açık temada AA kontrast → T1 (manuel tarayıcı + reduced-motion).
- **Public settings sızıntısı:** public `GET /settings` yalnız whitelist alan döner (store_name/email/phone/address), gizli alan yok → T6 testi.

---

### Task 1: Açık/Koyu tema (A)

**Files:**
- Modify: `storefront/src/index.css` (light/dark token override + gradyan)
- Create: `storefront/src/store/theme.ts`
- Create: `storefront/src/components/ThemeToggle.tsx`
- Modify: `storefront/index.html` (FOUC önleyen inline script)
- Modify: `storefront/src/components/Navbar.tsx` (toggle), `storefront/src/layouts/AdminLayout.tsx` (topbar'a toggle)
- Create: `storefront/src/store/theme.test.ts`

**Interfaces:**
- Produces: `useTheme()` zustand store → `{ theme: 'light'|'dark'|'system', setTheme(t), resolved: 'light'|'dark' }`; `applyTheme(theme)` saf fonksiyon `document.documentElement.dataset.theme` set eder ve resolved döner.

- [ ] **Step 1: Failing test** — `theme.test.ts`: `resolveTheme('light')==='light'`, `resolveTheme('dark')==='dark'`, `resolveTheme('system', prefersDark=true)==='dark'`, `resolveTheme('system', false)==='light'`.
- [ ] **Step 2: Fails** — `docker compose exec -T storefront npm test -- theme --run` → FAIL (resolveTheme yok).
- [ ] **Step 3: `resolveTheme(theme, prefersDark?)` + store** — `theme.ts`: saf `resolveTheme`, zustand persist ('teshop-theme'), setTheme → `document.documentElement.dataset.theme = resolved`.
- [ ] **Step 4: Passes** — aynı komut → PASS.
- [ ] **Step 5: index.css light/dark** — `:root[data-theme="dark"]{…koyu}`, `:root[data-theme="light"]{…açık palet}`; body gradyanı temaya göre.
- [ ] **Step 6: index.html inline script** — React'ten önce localStorage('teshop-theme')/prefers'tan `data-theme` set (FOUC yok).
- [ ] **Step 7: ThemeToggle + mount** — Navbar (dil switcher yanına) + AdminLayout topbar. lucide Sun/Moon, aria-label, reduced-motion uyumlu.
- [ ] **Step 8: Build + tarayıcı** — `npm run build` temiz; tarayıcıda storefront+admin tema geçişi, yenilemede kalıcı, FOUC yok.
- [ ] **Step 9: Commit** — `feat(ui): açık/koyu tema (storefront+admin) + ThemeToggle`

---

### Task 2: Siparişler backend + tohum (B-backend)

**Files:**
- Create: migration `orders`, migration `order_items`
- Create: `api/app/Models/Order.php`, `OrderItem.php`
- Create: `api/app/Http/Resources/OrderResource.php`, `OrderItemResource.php`
- Create: `api/app/Http/Requests/Admin/StoreOrderRequest.php`
- Create: `api/app/Http/Controllers/Api/V1/Admin/OrderController.php`
- Modify: `api/routes/api.php` (admin orders route'ları)
- Create: `api/database/seeders/OrderSeeder.php`; Modify `DatabaseSeeder.php`
- Test: `api/tests/Feature/AdminOrderTest.php`

**Interfaces:**
- Produces: `Order`(fields: order_number, customer_name, customer_email, status, subtotal, shipping_fee, total, placed_at; `items()` hasMany; `scopeRevenue`), `OrderItem`(product_name, unit_price, qty, line_total). Routes: `GET/POST /api/v1/admin/orders`, `GET /api/v1/admin/orders/{order}`, `PATCH /api/v1/admin/orders/{order}/status`. Store gövdesi: `{customer_name, customer_email, shipping_fee?, items:[{product_id, variant_id?, qty}]}` — unit_price/product_name sunucuda alınır.

- [ ] **Step 1: Failing tests** — `AdminOrderTest`: (a) token yok → `/admin/orders` 401; (b) admin store geçerli items → 201, DB'de order+items, total = Σ(unit_price×qty)+shipping; (c) updateStatus geçersiz status → 422, geçerli → 200 ve status değişir; (d) index status filtre çalışır.
- [ ] **Step 2: Fails** — `docker compose exec -T api php artisan test --filter=AdminOrderTest` → FAIL (route/model yok).
- [ ] **Step 3: Migration + modeller** — orders/order_items şema (FK, enum, decimal); Order/OrderItem ilişkiler + `scopeRevenue`.
- [ ] **Step 4: Request + Controller + routes + resources** — StoreOrderRequest doğrulama (items required|array, qty min:1); OrderController index/show/store/updateStatus (store: variant/product'tan unit_price+product_name snapshot, total hesapla, transaction); route'ları admin grubuna ekle.
- [ ] **Step 5: Passes** — aynı filter → PASS.
- [ ] **Step 6: OrderSeeder + DatabaseSeeder** — ~50 sipariş, son 6 ay (`placed_at` random), 1–4 kalem rastgele ürün/varyant, ağırlıklı status; `migrate:fresh --seed` sonrası `curl /admin/... ` yerine `php artisan tinker --execute="echo \App\Models\Order::count()"` ≈50.
- [ ] **Step 7: Yeniden seed + full BE test** — `migrate:fresh --seed` hatasız; `php artisan test` tüm yeşil.
- [ ] **Step 8: Commit** — `feat(orders): orders/order_items + admin CRUD + gerçekçi tohum`

---

### Task 3: Siparişler frontend (B-frontend)

**Files:**
- Create: `storefront/src/pages/admin/AdminOrders.tsx` (liste + status filtre + durum güncelle)
- Create: `storefront/src/pages/admin/AdminOrderCreate.tsx` (elle sipariş formu)
- Modify: `storefront/src/services/adminApi.ts` (orders çağrıları + tipler)
- Modify: `storefront/src/App.tsx` (route'lar), `storefront/src/layouts/AdminLayout.tsx` (nav: Siparişler)

**Interfaces:**
- Consumes: Task 2 route'ları ve OrderResource şekli.
- Produces: adminApi `fetchOrders(status?)`, `fetchOrder(id)`, `createOrder(payload)`, `updateOrderStatus(id, status)`.

- [ ] **Step 1: adminApi genişlet** — orders çağrıları + TS tipleri.
- [ ] **Step 2: AdminOrders sayfası** — tablo (no, müşteri, toplam, durum, tarih), status filtre, satırda durum değiştir (select → updateOrderStatus + invalidate). Boş durum.
- [ ] **Step 3: AdminOrderCreate formu** — müşteri ad/e-posta + kalem ekle (ürün seç → varyant seç → adet), canlı ara/genel toplam, kaydet → createOrder → listeye dön. Basit doğrulama (en az 1 kalem).
- [ ] **Step 4: Route + nav** — `/admin/siparisler`, `/admin/siparisler/yeni`; AdminLayout nav'a "Siparişler" (ShoppingCart ikon).
- [ ] **Step 5: Build + tarayıcı** — `npm run build` temiz; tarayıcıda liste dolu (tohum), durum değişiyor, yeni sipariş oluşturuluyor ve listede görünüyor.
- [ ] **Step 6: Commit** — `feat(admin): sipariş listesi + durum yönetimi + elle sipariş oluşturma`

---

### Task 4: Dashboard stats backend genişletme (C/E-backend)

**Files:**
- Modify: `api/app/Http/Controllers/Api/V1/Admin/DashboardController.php`
- Test: `api/tests/Feature/AdminStatsTest.php`

**Interfaces:**
- Produces: `stats` JSON ek alanlar: `total_revenue`, `orders_count`, `avg_order_value`, `revenue_by_month` ([{month, total}] son 6 ay), `orders_by_status` ([{status, count}]), `top_products` ([{name, qty, revenue}] ilk 5), `recent_orders` (son 5), `inventory_value`, `stock_by_category` ([{name, stock}]), ayrıca mevcut alanlar + `low_stock_items`/`out_of_stock_items` (ürün+varyant linkli liste).

- [ ] **Step 1: Failing test** — `AdminStatsTest`: tohum/oluşturulan order'larla `total_revenue` = Σ(non-cancelled total); cancelled hariç; sipariş yokken `avg_order_value===0` (sıfıra bölme yok); `revenue_by_month` 6 eleman.
- [ ] **Step 2: Fails** — `artisan test --filter=AdminStatsTest` → FAIL.
- [ ] **Step 3: stats genişlet** — aggregate sorgular (Order::revenue(), groupBy month; order_items join top_products; variants join category stock_by_category; inventory_value Σ stock×COALESCE(discount,base)).
- [ ] **Step 4: Passes** — filter → PASS.
- [ ] **Step 5: Commit** — `feat(stats): gelir/sipariş/stok aggregate alanları`

---

### Task 5: Dashboard grafikleri + stok görünürlüğü (C/E-frontend)

**Files:**
- Create: `storefront/src/components/charts/chartMath.ts` (+ `chartMath.test.ts`)
- Create: `storefront/src/components/charts/BarChart.tsx`, `DonutChart.tsx`, `AreaChart.tsx`
- Modify: `storefront/src/pages/admin/Dashboard.tsx`
- Modify: `storefront/src/services/adminApi.ts` (stats tipleri)

**Interfaces:**
- Produces: `niceMax(values)`, `barHeights(values, h)`, `donutSegments(values)` (→ [{offset, length}] / açılar). Bileşenler token renk, responsive viewBox, `<title>` + aria, reduced-motion'da animasyonsuz.

- [ ] **Step 1: Failing test** — `chartMath.test.ts`: `donutSegments([1,1,2])` oranları toplam=1/çember; `niceMax([3,7])>=7` ve yuvarlak; boş `[]` güvenli (0/empty).
- [ ] **Step 2: Fails** — `npm test -- chartMath --run` → FAIL.
- [ ] **Step 3: chartMath** — saf fonksiyonlar.
- [ ] **Step 4: Passes** — PASS.
- [ ] **Step 5: Chart bileşenleri** — BarChart/DonutChart/AreaChart (SVG, chartMath kullanır, tema token).
- [ ] **Step 6: Dashboard yenile** — gelir/sipariş/ort.sepet/envanter tile'ları; aylık gelir (Area/Bar); sipariş durumu + stok durumu (Donut); kategoriye göre stok (Bar); çok satanlar + son siparişler + az/tükenen stok listeleri (ürün düzenlemeye link). Boş durumlar.
- [ ] **Step 7: Build + tarayıcı** — `npm run build` temiz; dashboard gerçek veriyle grafikleri gösteriyor; boş-veri kırılmıyor.
- [ ] **Step 8: Commit** — `feat(admin): dashboard grafikleri (SVG) + stok görünürlüğü`

---

### Task 6: Ayarlar backend — profil/şifre/mağaza bilgisi (D-backend)

**Files:**
- Create: migration `settings` (key PK, value nullable) + default tohum (DatabaseSeeder veya migration)
- Create: `api/app/Models/Setting.php`
- Create: controllers `Admin\ProfileController`, `Admin\PasswordController`, `SettingController`
- Create: requests `Admin\UpdateProfileRequest`, `Admin\UpdatePasswordRequest`, `Admin\UpdateSettingsRequest`
- Modify: `api/routes/api.php`
- Test: `api/tests/Feature/AdminSettingsTest.php`

**Interfaces:**
- Produces: `PUT /admin/profile` ({name, email}), `PUT /admin/password` ({current_password, new_password, new_password_confirmation}), `GET/PUT /admin/settings`, public `GET /settings` (whitelist: store_name/email/phone/address). `Setting::get(key,default)`, `Setting::put(key,value)`.

- [ ] **Step 1: Failing tests** — `AdminSettingsTest`: password yanlış current → 422; doğru → 200 + yeni şifreyle login olur + eski token iptal; profile email benzersizlik; settings put sonra public get whitelist alanları döner, başka alan dönmez.
- [ ] **Step 2: Fails** — `artisan test --filter=AdminSettingsTest` → FAIL.
- [ ] **Step 3: settings migration+model, controller+request'ler, routes** — PasswordController: Hash::check(current) değilse 422, update + `tokens()->delete()` (mevcut hariç ya da hepsi + yeni token döndür); SettingController public show whitelist.
- [ ] **Step 4: Passes** — filter → PASS.
- [ ] **Step 5: Reseed + full BE test** — `migrate:fresh --seed` + `php artisan test` yeşil.
- [ ] **Step 6: Commit** — `feat(admin): profil/şifre/mağaza ayarları backend`

---

### Task 7: Ayarlar frontend + footer bağlama (D-frontend)

**Files:**
- Create: `storefront/src/pages/admin/Settings.tsx`
- Modify: `storefront/src/services/adminApi.ts`, `App.tsx`, `AdminLayout.tsx` (nav: Ayarlar)
- Modify: `storefront/src/components/Footer.tsx` (mağaza bilgisi), `storefront/src/services/api.ts` (public settings)

**Interfaces:**
- Consumes: Task 6 endpoint'leri.

- [ ] **Step 1: adminApi + api** — updateProfile/updatePassword/get+updateSettings, public fetchSettings.
- [ ] **Step 2: Settings sayfası** — bölümler: Tema (ThemeToggle), Profil formu, Şifre formu, Mağaza bilgisi formu; başarı/validation mesajları.
- [ ] **Step 3: Route + nav** — `/admin/ayarlar`, AdminLayout nav "Ayarlar" (Settings ikon).
- [ ] **Step 4: Footer bağla** — footer mağaza adı/iletişim bilgisini public settings'ten alır (yoksa mevcut varsayılan).
- [ ] **Step 5: Build + tarayıcı** — `npm run build` temiz; ayarlar akışları çalışır (şifre değişince yeni şifreyle giriş), footer mağaza bilgisini gösterir.
- [ ] **Step 6: Tam doğrulama** — `npm run build` + `npm test` + `php artisan test` hepsi yeşil; tarayıcı turu (tema, siparişler, dashboard grafikleri, ayarlar, mobil).
- [ ] **Step 7: Commit** — `feat(admin): ayarlar sayfası + footer mağaza bilgisi`
