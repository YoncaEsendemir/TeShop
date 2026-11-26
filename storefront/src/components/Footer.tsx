import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-border-subtle bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-xl font-bold text-text">
              Te<span className="text-text-muted">Shop</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              Modern, minimal ve monokrom giyim. Özenle seçilmiş parçalar.
            </p>
          </div>

          <nav aria-label="Alışveriş">
            <h2 className="mb-3 text-sm font-medium text-text">Alışveriş</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/urunler" className="hover:text-text">Tüm Ürünler</Link></li>
              <li><Link to="/kategori/kadin" className="hover:text-text">Kadın</Link></li>
              <li><Link to="/kategori/erkek" className="hover:text-text">Erkek</Link></li>
            </ul>
          </nav>

          <nav aria-label="Kurumsal">
            <h2 className="mb-3 text-sm font-medium text-text">Kurumsal</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/gizlilik" className="hover:text-text">Gizlilik Politikası</Link></li>
              <li><Link to="/kvkk" className="hover:text-text">KVKK Aydınlatma</Link></li>
              <li><Link to="/mesafeli-satis" className="hover:text-text">Mesafeli Satış</Link></li>
              <li><Link to="/iade" className="hover:text-text">İade & Cayma</Link></li>
            </ul>
          </nav>

          <nav aria-label="Yardım">
            <h2 className="mb-3 text-sm font-medium text-text">Yardım</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/kargo" className="hover:text-text">Kargo & Teslimat</Link></li>
              <li><Link to="/iletisim" className="hover:text-text">İletişim</Link></li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-border-subtle pt-6 text-sm text-text-subtle">
          © {year} TeShop. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  )
}
