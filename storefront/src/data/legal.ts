// Yasal sayfa içerikleri (TR). ⚠️ [köşeli parantez] alanlarını gerçek bilgilerle doldur.
// Not: Bu metinler şablondur; yayından önce bir hukukçuya kontrol ettirmen önerilir.

export interface LegalSection {
  heading?: string
  body: string[]
}

export interface LegalDoc {
  title: string
  description: string
  updated: string
  sections: LegalSection[]
}

const COMPANY = '[Firma Ünvanı]'
const CONTACT = 'E-posta: [e-posta] · Telefon: [telefon] · Adres: [açık adres]'

export const legalDocs: Record<string, LegalDoc> = {
  gizlilik: {
    title: 'Gizlilik Politikası',
    description: 'TeShop gizlilik politikası ve kişisel verilerin korunması.',
    updated: '2026',
    sections: [
      { body: [`${COMPANY} ("TeShop") olarak gizliliğinize önem veriyoruz. Bu politika, kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.`] },
      { heading: 'Topladığımız Veriler', body: ['Ad-soyad, iletişim ve teslimat bilgileri, sipariş geçmişi ve site kullanım verileri (çerezler aracılığıyla).'] },
      { heading: 'Kullanım Amacı', body: ['Siparişlerin işlenmesi, teslimat, müşteri desteği, yasal yükümlülükler ve onay verdiyseniz pazarlama iletişimi.'] },
      { heading: 'Veri Paylaşımı', body: ['Verileriniz yalnızca hizmetin sağlanması için gerekli iş ortaklarıyla (kargo, ödeme sağlayıcı) ve yasal zorunluluk hâlinde yetkili mercilerle paylaşılır.'] },
      { heading: 'Haklarınız', body: ['KVKK kapsamındaki haklarınızı kullanmak için bizimle iletişime geçebilirsiniz: ' + CONTACT] },
    ],
  },
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu aydınlatma metni.',
    updated: '2026',
    sections: [
      { body: [`${COMPANY} tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla hazırlanmıştır.`] },
      { heading: 'İşlenen Kişisel Veriler', body: ['Kimlik, iletişim, müşteri işlem ve işlem güvenliği verileri.'] },
      { heading: 'İşleme Amaçları', body: ['Sözleşmenin kurulması/ifası, yasal yükümlülükler, talep ve şikayet yönetimi, açık rıza hâlinde pazarlama.'] },
      { heading: 'Hukuki Sebep', body: ['KVKK m.5-6 kapsamında sözleşmenin ifası, hukuki yükümlülük ve açık rıza.'] },
      { heading: 'İlgili Kişi Hakları (m.11)', body: ['Verilerinize erişme, düzeltme, silme, işlemeye itiraz ve diğer haklarınız için: ' + CONTACT] },
    ],
  },
  'cerez-politikasi': {
    title: 'Çerez Politikası',
    description: 'TeShop web sitesinde kullanılan çerezler hakkında bilgi.',
    updated: '2026',
    sections: [
      { body: ['Çerezler, siteyi ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.'] },
      { heading: 'Çerez Türleri', body: ['Zorunlu çerezler (sitenin çalışması için gerekli) ve isteğe bağlı çerezler (analiz/pazarlama). İsteğe bağlı çerezler yalnızca onayınızla çalışır.'] },
      { heading: 'Çerez Tercihleri', body: ['Site ilk ziyaretinizde çerez tercihinizi sorarız. Tarayıcı ayarlarından da çerezleri yönetebilirsiniz.'] },
    ],
  },
  'mesafeli-satis': {
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'TeShop mesafeli satış sözleşmesi koşulları.',
    updated: '2026',
    sections: [
      { body: [`İşbu sözleşme, ${COMPANY} (SATICI) ile elektronik ortamda sipariş veren ALICI arasında, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında düzenlenmiştir.`] },
      { heading: 'Satıcı Bilgileri', body: [COMPANY + ' — ' + CONTACT] },
      { heading: 'Sözleşme Konusu', body: ['ALICI’nın sipariş ettiği ürünün nitelikleri, satış fiyatı ve teslimat koşulları sipariş sayfasında belirtilir.'] },
      { heading: 'Teslimat', body: ['Ürünler, onaylanan adrese kargo ile teslim edilir. Teslimat süresi ve ücreti sipariş sırasında gösterilir.'] },
      { heading: 'Cayma Hakkı', body: ['ALICI, teslimden itibaren 14 gün içinde cayma hakkına sahiptir. Ayrıntılar İade & Cayma sayfasındadır.'] },
    ],
  },
  iade: {
    title: 'İade & Cayma Hakkı',
    description: 'TeShop iade ve cayma hakkı koşulları.',
    updated: '2026',
    sections: [
      { body: ['Ürünlerinizi, teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz.'] },
      { heading: 'Cayma Hakkı Koşulları', body: ['Ürünün kullanılmamış, etiketleri sökülmemiş ve yeniden satılabilir durumda olması gerekir.'] },
      { heading: 'İade Süreci', body: ['İade talebinizi ' + CONTACT + ' üzerinden iletin. Onay sonrası ürünü kargoya verin; bedel yasal süre içinde iade edilir.'] },
      { heading: 'İstisnalar', body: ['Mevzuat gereği cayma hakkı kapsamı dışında kalan ürünler (örn. iç giyim/hijyen) için koşullar farklı olabilir.'] },
    ],
  },
  kargo: {
    title: 'Kargo & Teslimat',
    description: 'TeShop kargo ve teslimat bilgileri.',
    updated: '2026',
    sections: [
      { body: ['Siparişleriniz anlaşmalı kargo firmasıyla gönderilir.'] },
      { heading: 'Teslimat Süresi', body: ['Siparişler genellikle [X] iş günü içinde kargoya verilir.'] },
      { heading: 'Kargo Ücreti', body: ['[Tutar] ve üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde [ücret] uygulanır.'] },
    ],
  },
  iletisim: {
    title: 'İletişim',
    description: 'TeShop ile iletişime geçin.',
    updated: '2026',
    sections: [
      { body: ['Her türlü soru, talep ve şikayetiniz için bize ulaşın.'] },
      { heading: 'İletişim Bilgileri', body: [COMPANY, CONTACT] },
    ],
  },
}
