# 🛍️ TeShop

Modern, minimal ve **monokrom (koyu tema)** bir e-ticaret platformu. Trendyol/Mavi tarzı bir
mağaza deneyimi: hızlı, responsive, KVKK uyumlu, SEO dostu ve çok dilli (TR/DE/EN).

Proje iki parçadan oluşur: müşteri tarafı **storefront** (React) ve güçlü bir **yönetim paneli** (admin),
ikisi de aynı Laravel REST API üzerinden çalışır. Tüm geliştirme ortamı **Docker** ile ayağa kalkar.

---

## ✨ Özellikler

### Storefront (müşteri)
- Koyu tema, premium monokrom tasarım (Space Grotesk + Inter)
- Ana sayfa (hero + öne çıkan ürünler)
- Kategori sayfaları + **filtre, arama, sıralama, sayfalama**
- Ürün detay: galeri + **beden/renk varyant seçimi** + stok durumu
- **Sepet** (Zustand + localStorage; sayfa yenilense de korunur)
- **Çok dilli** (TR/DE/EN) — arayüz + ürün/kategori içerikleri çevrilir
- **KVKK**: çerez banner (zorunlu olmayan çerezler varsayılan reddedilir) + yasal sayfalar
- **SEO**: sayfa bazlı meta (react-helmet), JSON-LD (Product/Organization), robots.txt, sitemap.xml
- Framer Motion animasyonları + **`prefers-reduced-motion`** desteği (erişilebilirlik)
- Tam responsive (mobile-first)

### Admin Panel
- Güvenli giriş (Laravel Sanctum token + rate limit + rol tabanlı yetki)
- Dashboard: ürün/kategori/varyant sayıları + stok uyarıları
- **Kategori CRUD**, **Ürün CRUD**
- **Varyant yönetimi** (beden/renk + stok) ve **güvenli görsel yükleme** (yalnız resim, boyut limiti, isim randomize)

---

## 🧱 Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| State / Veri | Zustand, TanStack Query, Axios |
| i18n | react-i18next (TR/DE/EN) |
| Backend | Laravel 12 (PHP 8.3) + MySQL 8 |
| Auth | Laravel Sanctum |
| Çok dilli içerik | spatie/laravel-translatable |
| İzleme | Sentry (opsiyonel) |
| Ortam | Docker (frontend + api + mysql) |

---

## 🚀 Kurulum & Çalıştırma

Gereksinim: **Docker Desktop**.

```bash
# 1) Ortam dosyaları
cp api/.env.example api/.env
cp storefront/.env.example storefront/.env

# 2) Tüm servisleri başlat (frontend + api + mysql)
docker compose up -d --build

# 3) Laravel kurulumu (ilk sefer)
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate:fresh --seed
docker compose exec api php artisan storage:link
```

Adresler:
- Storefront → http://localhost:5173
- API → http://localhost:8000
- MySQL → localhost:3306

> Geliştirme admin hesabı (seed): `admin@teshop.test` / `password`

---

## 🧪 Testler

```bash
# Backend (PHPUnit)
docker compose exec api php artisan test

# Frontend (Vitest)
docker compose exec storefront npm test
```

---

## 📁 Proje Yapısı

```
TeShop/
├─ api/          # Laravel 12 REST API (/api/v1)
│  ├─ app/Http/Controllers/Api/V1
│  ├─ app/Models · app/Http/Requests · app/Http/Resources
│  └─ database/migrations · database/seeders
├─ storefront/   # React + TS (Vite)
│  └─ src/ (components, pages, layouts, store, services, i18n, lib, types)
└─ docker-compose.yml
```

---

## 🌐 Çoklu Dil

Arayüz metinleri `storefront/src/i18n/locales/*.json` dosyalarında; ürün ve kategori içerikleri
veritabanında JSON (çevrilebilir) olarak tutulur. İstek dili `?lang=` parametresi veya
`Accept-Language` başlığı ile belirlenir.

---

## 📄 Lisans

Bu depo özel bir projeye aittir. Örnek ürün görselleri [Lorem Picsum](https://picsum.photos)
(açık lisans) üzerinden sağlanır ve yayında gerçek ürün görselleriyle değiştirilmelidir.
