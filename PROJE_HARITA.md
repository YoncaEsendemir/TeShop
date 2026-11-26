# 🗺️ PROJE HARİTASI — TeShop (E-Ticaret)

> Bu dosya `PROJE.md`'nin özet/indeksidir. Amaç: bir bölüme ya da hataya hızlı ulaşmak.
> Kaynak: [`PROJE.md`](./PROJE.md) · Nerede kaldık: [`REMEMBER.md`](./REMEMBER.md)
> Son güncelleme: 26.11.2026

---

## ⚡ Hızlı Özet
Trendyol/Mavi tarzı, **koyu tema** (siyah/gri/beyaz), responsive, KVKK uyumlu, SEO güçlü e-ticaret sitesi.
- **Frontend:** React 19 + TypeScript + Vite + Tailwind (SPA) → klasör `storefront/`
- **Backend:** Laravel 12 (PHP 8.3+) + MySQL 8 + Sanctum → klasör `api/`
- **API:** REST `/api/v1/...` + API Resource (tutarlı JSON)
- **Yayın:** cPanel (İyiBuldum) + Let's Encrypt SSL
- **Çalışma tarzı:** Parça parça, faz faz; bir faz bitmeden diğerine geçilmez.

---

## 📑 Bölüm İndeksi (PROJE.md)

| Bölüm | Konu | Ne zaman lazım olur |
|------|------|---------------------|
| **1** | Teknoloji Yığını | Stack/sürüm kararı |
| **2** | Claude Code Skill'leri (4 adet) | Araç kurulumu |
| **3** | Frontend kütüphaneleri | Paket seçimi |
| **4** | 🎨 Tasarım Rehberi — Koyu Tema | UI/renk/font/bileşen |
| **5** | Özellikler (Storefront + Admin) | Ne yapılacak listesi |
| **6** | 🗄️ Veritabanı Şeması | Migration / model / ilişki hatası |
| **7** | API Endpoint'leri | Route / controller hatası |
| **8** | Güvenlik Önlemleri | Auth / validation / CORS |
| **9** | ⚖️ KVKK & Yasal | Çerez banner, yasal sayfalar |
| **10** | 🔍 SEO | Meta, JSON-LD, sitemap |
| **11** | 🌐 i18n (TR/DE/EN) | Çoklu dil |
| **12** | 🧪 Test | Pest + Vitest |
| **13** | 📊 Log & İzleme | Sentry |
| **14** | 🚀 Yayın (cPanel) | Deploy |
| **15** | 🔧 GitHub | Versiyon kontrol |
| **16** | Klasör Yapısı | Dosya yeri |
| **17** | 🛣️ Yol Haritası (Fazlar) | Sıradaki adım |
| **18** | Çalışma Şeklimiz | Süreç kuralları |

---

## 🎨 Bölüm 4 — Koyu Tema Token'ları (en çok bakılan)
```css
--bg:#0A0A0A · --surface:#151515 · --surface-2:#1F1F1F · --border:#2A2A2A
--text:#FAFAFA · --text-muted:#A1A1A1 · --text-subtle:#6B6B6B
--primary:#FFFFFF · --primary-text:#0A0A0A · --accent:#E5E5E5
--success:#22C55E · --danger:#EF4444
```
- **Başlık font:** Space Grotesk · **Gövde:** Inter
- Gölge YOK → derinliği surface katmanları + border ile ver.
- Vurgu rengi az (yeşil/kırmızı sadece stok durumu).

---

## 🗄️ Bölüm 6 — Veritabanı Tabloları (hata ararken)
`users` · `categories` (parent_id ile alt kategori) · `products` (stok YOK burada) ·
`product_variants` (**stok burada**, sku/size/color) · `product_images` (variant_id NULL=genel) ·
`addresses` · `orders` (teslimat snapshot) · `order_items` (ürün/varyant snapshot) ·
`reviews` (is_approved) · `wishlists` (UNIQUE user+product)

**Kural:** tablo adları çoğul+snake_case · PK `id` BIGINT · FK `<tekil>_id` · para `DECIMAL(10,2)` · durum `ENUM`.
**Bağımlılık:** `addresses/orders/reviews/wishlists` → müşteri-auth fazında (Faz 6) kodlanır.

---

## 🛣️ Bölüm 17 — Fazlar (yol haritası)
- **Faz 0 — Kurulum:** GitHub repo · Laravel+MySQL+Sanctum · Vite+React+TS+Tailwind · 4 skill
- **Faz 1 — Backend temeli:** Migration'lar · Model+ilişki+seed · Public API
- **Faz 2 — Admin backend:** Admin login · Kategori/Ürün/Varyant/Görsel CRUD · Sipariş yönetimi
- **Faz 3 — Storefront (koyu tema):** Layout/Navbar/Footer · Anasayfa/kategori/detay/sepet · Framer+SEO · Yorumlar
- **Faz 4 — Admin panel (frontend):** Giriş + korumalı route + CRUD ekranları
- **Faz 5 — KVKK/SEO/i18n/Test:** Yasal sayfalar · SEO (⏰ Yonca'nın SEO skill'i) · i18n · Test · Sentry
- **Faz 6 — En son:** Müşteri üyelik+adres+favori · Checkout+kargo · **Ödeme (Yonca'nın sağlayıcısı)** · cPanel yayın

---

## ⏰ Unutma / Hatırlatma Noktaları
- **SEO skill:** Yonca verecek → **Faz 5'te** kullanılacak.
- **Ödeme sağlayıcısı:** Yonca verecek (React-uyumlu) → **Faz 6**. ⚠️ Türkiye'de PayPal yasak.
- **Güvenlik:** Her fazdan sonra Cloudflare Security Audit skill çalıştır.
- **Test kuralı:** Bir özellik testleri yeşil olmadan "bitti" denmez.
- **Git:** Her fazı ayrı commit/branch; `.env` asla git'e girmez.
