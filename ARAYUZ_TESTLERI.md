# ✅ Arayüz (Manuel) Test Listesi — Yonca

> Otomatik testler (39 adet) GEÇTİ. Bunlar senin tarayıcıda **elle** kontrol edeceğin şeyler.
> Başlamadan: `docker compose up -d` çalışıyor olsun.
> Storefront: http://localhost:5173 · Panel: http://localhost:5173/admin/login
> Admin giriş: **admin@teshop.test / password**

Her maddeyi dene, sağdaki kutuya ✅/❌ koy. Takıldığın yeri bana söyle, düzeltelim.

---

## 🛍️ A. Storefront (müşteri tarafı)

### A1. Ana sayfa
- [ ] http://localhost:5173 açılıyor, koyu tema, "Monokrom. Zamansız." hero görünüyor
- [ ] "Öne Çıkanlar" altında ürünler geliyor (İNDİRİM rozetleri, fiyatlar)
- [ ] "Alışverişe Başla" → ürünler sayfasına gidiyor

### A2. Ürün listesi & filtre
- [ ] /urunler tüm ürünleri gösteriyor
- [ ] Navbar'dan "Kadın" / "Erkek" → sadece o kategori ürünleri
- [ ] Sıralama menüsü (En Yeni / Fiyat artan-azalan / İsim) çalışıyor
- [ ] Navbar arama kutusuna "jean" yazıp Enter → ilgili ürün(ler)
- [ ] Çok ürün olunca "Önceki/Sonraki" sayfalama (şimdilik 6 ürün var, tek sayfa)

### A3. Ürün detay & varyant
- [ ] Bir ürüne tıkla → detay açılıyor (breadcrumb, fiyat, açıklama)
- [ ] Renk seç + Beden seç → buton "Seçim yapın" → "Sepete Ekle" oluyor
- [ ] Stok 0 olan beden/renk kombinasyonu seçilemiyor (üstü çizili/pasif)
- [ ] "Stokta (x adet)" / "Tükendi" doğru görünüyor

### A4. Sepet
- [ ] "Sepete Ekle" → sağdan çekmece açılıyor, ürün görünüyor
- [ ] Navbar sepet ikonundaki sayı artıyor
- [ ] Çekmecede adet +/- çalışıyor (stok sınırını aşamıyor)
- [ ] Çöp kutusu ile ürün siliniyor
- [ ] Ara toplam doğru hesaplanıyor
- [ ] Sayfayı yenile (F5) → sepet KORUNUYOR (localStorage)
- [ ] "Ödemeye Geç" → şimdilik sadece buton (ödeme Faz 6)

### A5. Responsive (mobil)
- [ ] Tarayıcıyı daralt (veya F12 → mobil görünüm): Navbar hamburger menüye dönüyor
- [ ] Hamburger menü açılıyor, kategoriler + arama var
- [ ] Ürün grid'i mobilde 2 sütun, düzgün görünüyor

### A6. Erişilebilirlik / animasyon
- [ ] Hover'da ürün kartı hafifçe yukarı kalkıyor, çekmece kayarak açılıyor
- [ ] (İsteğe bağlı) İşletim sisteminde "hareketi azalt"ı açarsan animasyonlar kısılıyor

---

## 🎛️ B. Admin Panel

### B1. Giriş güvenliği
- [ ] /admin/login → yanlış şifre ile "Giriş bilgileri hatalı" uyarısı
- [ ] Doğru bilgi (admin@teshop.test / password) → panele giriyor
- [ ] Giriş yapmadan /admin'e gitmeye çalış → otomatik /admin/login'e atıyor
- [ ] Sağ üstten "Çıkış" → girişe dönüyor

### B2. Dashboard
- [ ] Ürün / Kategori / Varyant sayıları görünüyor
- [ ] "Az kalan" ve "Tükenen" varyant sayıları görünüyor

### B3. Kategori yönetimi
- [ ] /admin/kategoriler → kategori listesi (ürün sayılarıyla)
- [ ] "Yeni Kategori" → ad gir, kaydet → listeye ekleniyor
- [ ] Bir kategoriyi düzenle (kalem) → ad değiştir, kaydet → güncelleniyor
- [ ] Sil (çöp) → onay sorusu → siliniyor
- [ ] Yeni/değişen kategori storefront navbar'ında da görünüyor (yenile)

### B4. Ürün yönetimi (ÖNEMLİ — burada bir bug bulundu, düzeltildi)
- [ ] /admin/urunler → ürün listesi (varyant sayıları, fiyat, durum)
- [ ] "Yeni Ürün" → form doldur (ad, kategori, fiyat), oluştur → düzenleme ekranına geçiyor
- [ ] **Varyant ekle**: SKU + beden + renk + stok gir → "Ekle" → tabloya ekleniyor
- [ ] **Stok düzenle**: bir varyantın stok kutusunu değiştir, başka yere tıkla → kaydediliyor
- [ ] **Varyant sil**: çöp → siliniyor
- [ ] **Görsel yükle**: "Görsel Yükle" → bir .jpg/.png seç → yükleniyor, önizleme çıkıyor
- [ ] İlk görsel otomatik "Kapak" oluyor; görsel silme çalışıyor
- [ ] Yüklediğin görsel storefront ürün kartında/detayında görünüyor (yenile)
- [ ] Ürün adını değiştir → kaydet → listede güncel
- [ ] Ürün sil → onay → siliniyor

### B5. Yetki
- [ ] (İleri test) Çıkış yaptıktan sonra elle /admin/urunler yazınca girişe atıyor

---

## 🐞 Bu turda otomatik testlerin yakaladığı bug
- **Sorun:** Admin'de ürüne bağlı işlemler (varyant ekle, görsel yükle, ürün güncelle/sil)
  API'ye ürün **id**'si gönderiyordu ama route **slug** bekliyordu → 404 (panelde çalışmazdı).
- **Düzeltildi:** Admin ürün route'ları artık **id** ile bağlanıyor; frontend de id kullanıyor.
- **Bu yüzden B4'ü özellikle dikkatli test et** (varyant/görsel işlemleri).

---

## ▶️ Testleri yeniden çalıştırma (istersen)
- Backend: `docker compose exec api php artisan test`
- Frontend: `docker compose exec storefront npm test`
