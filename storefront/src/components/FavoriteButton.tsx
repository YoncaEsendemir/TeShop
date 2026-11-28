import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fetchWishlist, toggleWishlist } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'

/** Ürünü favoriye ekle/çıkar. Giriş yoksa /giris'e yönlendirir. */
export default function FavoriteButton({ productId, className = '' }: { productId: number; className?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const user = useCustomerAuth((s) => s.user)

  const { data: wishlist = [] } = useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: fetchWishlist,
    enabled: !!user,
  })
  const inWishlist = wishlist.some((p) => p.id === productId)

  const m = useMutation({
    mutationFn: () => toggleWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', 'wishlist'] }),
  })

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/giris')
    m.mutate()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('auth.wishlist')}
      aria-pressed={inWishlist}
      className={
        'rounded-full bg-bg/80 p-2 backdrop-blur transition-colors focus-visible:outline-2 focus-visible:outline-text ' +
        (inWishlist ? 'text-danger' : 'text-text-muted hover:text-text') + ' ' + className
      }
    >
      <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
    </button>
  )
}
