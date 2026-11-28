import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { checkout, fetchAddresses, resendVerification, fetchMe } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import { useCart } from '../store/cart'
import { formatPrice } from '../lib/utils'
import Seo from '../components/Seo'

const inp = 'w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-sm text-text focus:border-text-muted focus:outline-none'

export default function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, setUser } = useCustomerAuth()
  // Doğrulama durumu güncel olsun diye açılışta /me'den tazele
  const { data: me } = useQuery({ queryKey: ['customer', 'me'], queryFn: fetchMe, enabled: !!token })
  useEffect(() => { if (me) setUser(me) }, [me]) // eslint-disable-line react-hooks/exhaustive-deps
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.subtotal())
  const clear = useCart((s) => s.clear)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [address, setAddress] = useState('')
  const [sent, setSent] = useState(false)

  const { data: addresses = [] } = useQuery({ queryKey: ['customer', 'addresses'], queryFn: fetchAddresses, enabled: !!token })
  useEffect(() => {
    if (addresses.length && !address) {
      const a = addresses[0]
      setAddress(`${a.full_name}, ${a.line1}, ${a.city} ${a.postal_code ?? ''} · ${a.phone}`)
    }
  }, [addresses]) // eslint-disable-line react-hooks/exhaustive-deps

  const shipping = subtotal >= 500 ? 0 : 29.9
  const total = subtotal + shipping

  const m = useMutation({
    mutationFn: () =>
      checkout({
        customer_name: name,
        customer_email: email,
        address,
        items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId, qty: i.quantity })),
      }),
    onSuccess: () => { clear(); navigate('/hesabim') },
  })

  if (!token) return <Navigate to="/giris" replace />

  async function resend() {
    try { await resendVerification(); setSent(true) } catch { /* yoksay */ }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Seo title={t('auth.checkoutTitle')} />
      <h1 className="mb-6 font-display text-2xl font-bold text-text">{t('auth.checkoutTitle')}</h1>

      {user && !user.email_verified && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {t('auth.checkoutVerify')}{' '}
          {sent ? <span className="text-success">{t('auth.resendSent')}</span>
                : <button onClick={resend} className="underline">{t('auth.resend')}</button>}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-text-muted">{t('auth.emptyCart')}</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); m.mutate() }} className="space-y-5">
          {/* Sepet özeti */}
          <div className="rounded-xl border border-border-subtle bg-surface p-5">
            <ul className="divide-y divide-border-subtle text-sm">
              {items.map((i) => (
                <li key={i.variantId} className="flex items-center justify-between py-2">
                  <span className="text-text">{i.name} <span className="text-text-subtle">· {i.variantLabel} × {i.quantity}</span></span>
                  <span className="text-text-muted">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-border-subtle pt-3 text-sm">
              <div className="flex justify-between text-text-muted"><span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-text-muted"><span>{t('auth.shippingLabel')}</span><span>{shipping === 0 ? '—' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-display text-lg font-bold text-text"><span>{t('admin.orderNew.total')}</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>

          {/* Teslimat */}
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} className={inp} />
            <input type="email" required placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
          </div>
          <textarea required rows={3} placeholder={t('auth.addrLine')} value={address} onChange={(e) => setAddress(e.target.value)} className={inp} />

          {m.isError && <p className="text-sm text-danger">{t('auth.checkoutErr')}</p>}

          <button type="submit" disabled={m.isPending || (user ? !user.email_verified : true)}
            className="w-full rounded-full bg-primary py-3 font-medium text-primary-text transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-text">
            {m.isPending ? t('auth.submitting') : t('auth.placeOrder')}
          </button>
        </form>
      )}
    </div>
  )
}
