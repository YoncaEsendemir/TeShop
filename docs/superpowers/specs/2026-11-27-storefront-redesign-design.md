# TeShop Storefront — Ana Sayfa & Header Yeniden Tasarımı

Tarih: 2026-11-27 · Durum: ONAYLANDI (Yonca, 27.11.2026) — Kategoriler: Spor, Ayakkabı, Aksesuar, İndirim

## Amaç / Neden
Yonca mevcut ana sayfa tasarımını beğenmiyor: hero'nun sağ yarısı boş, header
çok sade, ürün/kategori sayısı az. Mağazanın Mavi/Koton gibi "dolu, canlı,
modern" bir izlenim vermesi isteniyor — animasyonlu bir üst bölüm ve daha zengin
bir katalog ile.

## Hedefler
- Hero: tam genişlik, otomatik geçen **foto carousel** + başlık/CTA (ürün
  fotoğraflarını kullanır).
- Header: **üst duyuru bandı** + nav'ın daha fazla kategoriyle dolması.
- **4 yeni kategori** (Spor, Ayakkabı, Aksesuar, İndirim) — çok dilli.
- Her yeni kategoriye **3 ürün** (varyant + başlığa uygun telifsiz görsel).
- Mevcut animasyon kalitesini koru; `prefers-reduced-motion` zorunlu.

## Hedef-olmayanlar (bu turda yok)
- Mega-menü (hover'da açılan büyük kategori paneli) — fazla iş, nav'daki düz
  kategori linkleri yeterli. (İstenirse ayrı tur.)
- "İndirim" için ayrı filtre/route — İndirim basitçe gerçek bir kategori olarak
  3 indirimli ürün tutar (şema `category_id` zaten böyle çalışıyor).
- Alt kategori ekleme — yeni 4 kategori ana (top-level) seviyede.
- Gerçek ürün fotoğraf çekimi — admin panelinden sonradan yüklenebilir.

## Anti-hedefler (yapılırsa başarısızlık)
- Jenerik "AI yapımı" görünüm (hallmark kuralları ihlali).
- Hareket azaltmayı seçen kullanıcıda dönen/kayan animasyon.
- Ürünle alakasız veya telifi şüpheli görsel.
- Carousel'in CLS/layout kaymasına yol açması.

## Kısıtlar
- Stack sabit: React 19 + TS + Tailwind v4 + framer-motion + react-i18next;
  backend Laravel 12 seeder. Yeni bağımlılık **yok** (carousel'i framer-motion
  `AnimatePresence` ile kendimiz yazarız).
- Tema token'ları `index.css`'ten gelir; renk hep token'dan.
- Görseller Unsplash lisansı (ticari serbest, atıf gerekmez) → KVKK/telif temiz.
- Her görsel kullanılmadan önce HTTP 200 + içerik gözüyle doğrulanır.

## Yaklaşımlar
**Hero (Yonca seçti): Tam genişlik otomatik carousel.** Alternatifler: (a) kayan
foto şeridi + yan metin, (b) ızgara foto duvarı. Carousel seçildi çünkü Mavi/Koton
ana sayfa hissine en yakını ve kampanya vurgusuna uygun. Diğerleri daha "editoryal"
kalıp kampanya etkisini vermiyordu.

**Genel inşa: mevcut mimariyi genişlet** (tek makul yol). Yeni sayfa/kütüphane
yerine `Home.tsx` + `Navbar.tsx`'i düzenle, `ShopSeeder`'a kategori/ürün ekle.
Carousel'i hazır kütüphane yerine framer-motion ile yazmak bağımlılık eklemeyi
önler (birkaç slide için fazlası gereksiz).

## Nasıl yapılacak (kararlar)

### 1. Hero carousel — `components/HeroCarousel.tsx` (yeni) + `Home.tsx`
- Tam genişlik (`100vw` değil; `max-w-7xl` içinde yuvarlak köşeli büyük panel,
  overflow-x riski yok), ~`70vh`/`min-h` sabit yükseklik → CLS yok.
- Slide'lar: öne çıkan ürün görselleri (ör. ilk 4 ürün foto'su) üzerine koyu
  gradyan + başlık + CTA.
- Otomatik geçiş ~5sn, `AnimatePresence` ile çapraz geçiş; alt noktalar (dots)
  tıklanabilir. `useReducedMotion` → otomatik geçiş ve animasyon kapalı, ilk
  slide statik gösterilir.
- Erişilebilirlik: dots `aria-label`, pause-on-hover, odak görünür.

### 2. Header — `components/AnnouncementBar.tsx` (yeni) + `Navbar.tsx`
- Üst duyuru bandı: ince, tema-aksan arkaplan, i18n metin (ör. "Tüm siparişlerde
  ücretsiz kargo · Yeni sezon indirimde"). İsteğe bağlı hafif kayan (marquee)
  animasyon, reduced-motion'da statik.
- Nav: değişiklik gerekmez — kategori linkleri zaten API'den map'leniyor; 4 yeni
  kategori otomatik dolduracak. (Mobilde taşarsa yatay kaydırma/compact ayarı.)

### 3. Kategoriler + ürünler — `database/seeders/ShopSeeder.php`
- 4 yeni top-level kategori (çok dilli ad + slug):
  Spor (`spor`), Ayakkabı (`ayakkabi`), Aksesuar (`aksesuar`), İndirim (`indirim`).
- Her birine 3 ürün: çok dilli ad/açıklama, fiyat, bazılarında indirim, beden/renk
  varyantları (mevcut ürün desenini yeniden kullan), 1 primary görsel.
- Toplam 12 yeni ürün → 12 başlığa-uygun Unsplash görseli (tek tek doğrulanacak).
- Beden mantığı: ayakkabı/spor ayakkabı için numara (39–44), aksesuar için "Std".

### 4. i18n
- Yeni metin anahtarları (duyuru bandı) `locales/{tr,de,en}.json`'a eklenir.
- Kategori/ürün içeriği çok dilli (spatie) — seeder'da tr/de/en.

## Test / doğrulama
- Mevcut testler kendi fixture'ını kurar, seeder'a bağımlı değil → bozulmaz.
- Build temiz olmalı (`npm run build`), 39 test geçmeye devam etmeli.
- Tarayıcıda görsel doğrulama: hero carousel geçişi, yeni kategoriler nav'da,
  yeni ürünler + görseller, reduced-motion davranışı.
- Yeni mantık (carousel otomatik geçiş + reduced-motion dalı) için küçük bir
  Vitest testi veya kod içi assert.

## Builder'a bırakılanlar
- Carousel slide sayısı/süre ince ayarı, duyuru bandı metninin son hali.
- Her ürünün tam fiyat/renk/beden değerleri (mevcut desene uygun makul değerler).
- Yeni ürün görsellerinin seçimi (kategoriye uygun, doğrulanmış).

## Açık kararlar (Yonca onayı)
- [ ] Kategoriler: **Spor, Ayakkabı, Aksesuar, İndirim** mi? ("spor ayakkabı"yı
      Spor + Ayakkabı diye ayırdım; tek "Spor Ayakkabı" istersen 3 kategori olur.)
