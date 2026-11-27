import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings } from '../services/api'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const { data: store } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  return (
    <footer className="mt-24 border-t border-border-subtle bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-xl font-bold text-text">
              Te<span className="text-text-muted">Shop</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-muted">{t('footer.tagline')}</p>
          </div>

          <nav aria-label={t('footer.shopping')}>
            <h2 className="mb-3 text-sm font-medium text-text">{t('footer.shopping')}</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/urunler" className="hover:text-text">{t('footer.all')}</Link></li>
              <li><Link to="/kategori/kadin" className="hover:text-text">{t('footer.women')}</Link></li>
              <li><Link to="/kategori/erkek" className="hover:text-text">{t('footer.men')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('footer.corporate')}>
            <h2 className="mb-3 text-sm font-medium text-text">{t('footer.corporate')}</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/gizlilik" className="hover:text-text">{t('footer.privacy')}</Link></li>
              <li><Link to="/kvkk" className="hover:text-text">{t('footer.kvkk')}</Link></li>
              <li><Link to="/mesafeli-satis" className="hover:text-text">{t('footer.distance')}</Link></li>
              <li><Link to="/iade" className="hover:text-text">{t('footer.returns')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('footer.help')}>
            <h2 className="mb-3 text-sm font-medium text-text">{t('footer.help')}</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/kargo" className="hover:text-text">{t('footer.shipping')}</Link></li>
              <li><Link to="/iletisim" className="hover:text-text">{t('footer.contact')}</Link></li>
              {store?.store_email && (
                <li><a href={`mailto:${store.store_email}`} className="hover:text-text">{store.store_email}</a></li>
              )}
              {store?.store_phone && <li className="text-text-subtle">{store.store_phone}</li>}
              {store?.store_address && <li className="text-text-subtle">{store.store_address}</li>}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-border-subtle pt-6 text-sm text-text-subtle">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  )
}
