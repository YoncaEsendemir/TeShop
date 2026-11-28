import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchWishlist } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import Seo from '../components/Seo'

export default function Wishlist() {
  const { t } = useTranslation()
  const token = useCustomerAuth((s) => s.token)

  const { data = [], isLoading } = useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: fetchWishlist,
    enabled: !!token,
  })

  if (!token) return <Navigate to="/giris" replace />

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Seo title={t('auth.wishlist')} />
      <h1 className="mb-8 font-display text-2xl font-bold text-text sm:text-3xl">{t('auth.wishlist')}</h1>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : data.length === 0 ? (
        <p className="text-text-muted">{t('auth.wishlistNone')}</p>
      ) : (
        <ProductGrid products={data} />
      )}
    </div>
  )
}
