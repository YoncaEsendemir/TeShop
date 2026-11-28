# TeShop — cPanel'e Yayın Rehberi (adım adım, sade)

Bu rehber iki parçayı yayınlar:
- **Frontend (React)** → ana adresin: `https://SENINDOMAIN.com`
- **Backend (Laravel API)** → alt alan adı: `https://api.SENINDOMAIN.com`

> Neden alt alan adı? Laravel'in çalışması için sunucunun **`public` klasörünü** kök
> olarak görmesi gerekir. En kolay yol budur. `SENINDOMAIN.com` yerine kendi domainini yaz.

Gereken: cPanel erişimi + bir domain. Mümkünse cPanel'de **Terminal** (SSH) olsun
(komutlar için). Yoksa aşağıda "Terminal yoksa" notu var.

---

## 1) Veritabanı oluştur (cPanel → "MySQL Databases")
1. **Create New Database:** ad ver (ör. `teshop`). cPanel başına kullanıcı adı ekler: `kullanici_teshop`.
2. **Add New User:** kullanıcı + güçlü şifre oluştur. Şifreyi bir yere not et.
3. **Add User To Database:** kullanıcıyı veritabanına ekle, **ALL PRIVILEGES** ver.
4. Şunları not et: **DB adı, DB kullanıcı adı, DB şifresi** (birazdan `.env`'e yazacağız).

---

## 2) Backend (Laravel) yükle

### 2a. Dosyaları hazırla (kendi bilgisayarında)
- `api/` klasörünü **vendor klasörüyle birlikte** zip'le (Terminal yoksa vendor'ı da yükle).
  - Docker kullanıyorsan vendor zaten `api/vendor` içinde var.
- `api/.env` dosyasını **yükleme** (onu sunucuda oluşturacağız — şifreler var).

### 2b. Yükle ve alt alan adını bağla
1. cPanel → **File Manager** → `public_html` **dışında** bir klasör aç: `teshop-api`.
   (Örn: `/home/KULLANICI/teshop-api`) — güvenlik için public_html dışında olmalı.
2. Zip'i buraya yükle ve "Extract" ile çıkar.
3. cPanel → **Subdomains** (veya Domains) → yeni alt alan: `api` → `SENINDOMAIN.com`.
   - **Document Root'u** `teshop-api/public` olarak ayarla. (Çok önemli: `public` klasörü.)

### 2c. `.env` oluştur (sunucuda)
File Manager'da `teshop-api/.env.example`'ı kopyala, adını `.env` yap, içine şunları yaz:
```
APP_NAME=TeShop
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.SENINDOMAIN.com

# Frontend adresin (CORS + e-posta doğrulama yönlendirmesi için)
FRONTEND_URL=https://SENINDOMAIN.com

# 1. adımdaki veritabanı bilgileri
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kullanici_teshop
DB_USERNAME=kullanici_teshopuser
DB_PASSWORD=DB_SIFREN

# E-posta (Brevo — ücretsiz; kaydolup SMTP bilgini al)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=BREVO_SMTP_LOGIN
MAIL_PASSWORD=BREVO_SMTP_KEY
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@SENINDOMAIN.com
MAIL_FROM_NAME=TeShop
```
> **APP_DEBUG=false** zorunlu (hata detayları sızmasın). Brevo'yu sonra da ekleyebilirsin;
> boş bırakırsan e-posta doğrulama çalışmaz ama site çalışır.

### 2d. Kurulum komutları (cPanel → Terminal)
`teshop-api` klasöründe sırayla:
```
php artisan key:generate        # APP_KEY üretir
php artisan migrate --force     # tabloları kurar
php artisan db:seed --force     # admin + örnek ürünler + kategoriler
php artisan storage:link        # yüklenen görseller için
php artisan config:cache        # hız için
```
> **Terminal yoksa:** Hosting'inden SSH iste ya da "Setup Node/PHP App" aracını kullan.
> En kötü ihtimalle hosting destek'e "Laravel artisan komutlarını çalıştırır mısınız" de.
> `vendor`'ı yüklediysen `composer install`'a gerek yok.

### 2e. İzinler
`teshop-api/storage` ve `teshop-api/bootstrap/cache` klasörleri **yazılabilir** olmalı
(File Manager → sağ tık → Permissions → 755, içerik yazılabilir).

**Test:** `https://api.SENINDOMAIN.com/api/v1/products` adresini aç → ürün listesi (JSON) gelmeli.

---

## 3) Frontend (React) yükle

### 3a. Build al (kendi bilgisayarında)
1. `storefront/.env` içine production API adresini yaz:
   ```
   VITE_API_URL=https://api.SENINDOMAIN.com/api/v1
   ```
2. Build al:
   ```
   docker compose exec storefront npm run build
   ```
   → `storefront/dist/` klasörü oluşur (yayınlanacak dosyalar bunlar).

### 3b. Yükle
1. `storefront/dist/` **içindeki her şeyi** cPanel `public_html` klasörüne yükle
   (index.html, assets/, robots.txt, sitemap.xml ve **`.htaccess`**).
   - `.htaccess` gizli dosyadır; File Manager'da "Show Hidden Files" aç.
2. Bitti — `https://SENINDOMAIN.com` açılmalı.

### 3c. Son rötuşlar
- `public_html/robots.txt` ve `public_html/sitemap.xml` içindeki `example.com`'u
  kendi domaininle değiştir.

---

## 4) Admin paneli — "aynı bilgileri mi kullanacağım?"

**Evet.** `db:seed` çalıştığında aynı admin hesabı oluşur:
- Adres: `https://SENINDOMAIN.com/admin/login`
- E-posta: `admin@teshop.test`
- Şifre: `password`

> ⚠️ **İlk iş:** Giriş yap → **Ayarlar → Şifre Değiştir** ile güçlü bir şifre koy.
> İstersen Ayarlar → Profil'den e-postanı da gerçek adresinle değiştir.
> (Seed'deki `admin@teshop.test` sadece başlangıç; canlıda değiştir.)

---

## 5) İki dosyanın açıklaması

### `robots.txt` (zaten var — `public_html/robots.txt`)
Arama motoru botlarına **hangi sayfaları tarayabileceğini** söyler.
- `Allow: /` → her yeri tara.
- `Disallow: /admin` → admin panelini arama sonuçlarına koyma.
- `Sitemap: ...` → site haritanın adresi (Google daha iyi indeksler).
→ Yayında `example.com`'u kendi domaininle değiştir.

### `.htaccess` (sayfa yollarını yöneten dosya — senin "h ile başlayan" dosya)
Apache sunucusuna **kural** veren gizli dosya. İki tane var:
- **Frontend `public_html/.htaccess`** (yeni oluşturdum): `/urunler`, `/hesabim` gibi
  adresler **yenilenince 404 vermesin** diye hepsini `index.html`'e yönlendirir
  (React Router devralır). Ayrıca **gzip sıkıştırma + önbellek** ekler → site hızlanır.
- **Backend `teshop-api/public/.htaccess`** (Laravel'de hazır gelir): API isteklerini
  Laravel'e yönlendirir. Ona dokunma.

---

## Sık sorunlar
- **Site boş/beyaz:** `.htaccess` yüklenmemiş olabilir (gizli dosya — "Show Hidden Files").
- **Ürünler gelmiyor / CORS hatası:** API `.env`'de `FRONTEND_URL` yanlış. Doğru domaini yaz,
  sonra `php artisan config:cache` tekrar çalıştır.
- **500 hatası (API):** `storage`/`bootstrap/cache` yazılabilir değil, veya `APP_KEY` yok
  (`php artisan key:generate`).
- **E-posta gitmiyor:** Brevo SMTP bilgileri eksik/yanlış.
- **Değişiklik sonrası:** `.env` değişince `php artisan config:cache` tekrar çalıştır.
