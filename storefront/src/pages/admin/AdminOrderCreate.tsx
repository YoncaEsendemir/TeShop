import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { adminProducts, adminProduct, createOrder } from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import Seo from '../../components/Seo'

interface Line {
  product_id: number
  variant_id: number | null
  label: string
  unit_price: number
  qty: number
}

function priceOf(base: string, discount: string | null, variantPrice: string | null): number {
  if (variantPrice) return parseFloat(variantPrice)
  if (discount) return parseFloat(discount)
  return parseFloat(base)
}

export default function AdminOrderCreate() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [shipping, setShipping] = useState('0')
  const [lines, setLines] = useState<Line[]>([])
  const [error, setError] = useState('')

  const [selProduct, setSelProduct] = useState<number | ''>('')
  const [selVariant, setSelVariant] = useState<number | ''>('')
  const [qty, setQty] = useState(1)

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products', 'picker'],
    queryFn: () => adminProducts({ page: 1 }),
  })
  const products = productsData?.data ?? []

  const { data: detail } = useQuery({
    queryKey: ['admin', 'product', selProduct],
    queryFn: () => adminProduct(selProduct as number),
    enabled: !!selProduct,
  })
  const variants = detail?.variants ?? []

  function addLine() {
    if (!selProduct || !detail) return
    const variant = variants.find((v) => v.id === selVariant) ?? null
    const unit = priceOf(detail.base_price, detail.discount_price ?? null, variant?.price ?? null)
    const label =
      detail.name + (variant ? ` · ${[variant.size, variant.color].filter(Boolean).join('/')}` : '')
    setLines((ls) => [
      ...ls,
      { product_id: detail.id, variant_id: variant?.id ?? null, label, unit_price: unit, qty },
    ])
    setSelVariant('')
    setQty(1)
  }

  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.qty, 0)
  const total = subtotal + (parseFloat(shipping) || 0)

  const createMutation = useMutation({
    mutationFn: () =>
      createOrder({
        customer_name: name,
        customer_email: email,
        shipping_fee: parseFloat(shipping) || 0,
        items: lines.map((l) => ({ product_id: l.product_id, variant_id: l.variant_id, qty: l.qty })),
      }),
    onSuccess: () => navigate('/admin/siparisler'),
    onError: () => setError(t('admin.orderNew.errFailed')),
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim()) return setError(t('admin.orderNew.errRequired'))
    if (lines.length === 0) return setError(t('admin.orderNew.errItems'))
    createMutation.mutate()
  }

  const input = 'w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-text'

  return (
    <div className="max-w-3xl">
      <Seo title={t('admin.orderNew.title')} />
      <h1 className="mb-6 font-display text-2xl font-bold text-text">{t('admin.orderNew.title')}</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Müşteri */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted">{t('admin.orderNew.customerName')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">{t('admin.orderNew.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
        </div>

        {/* Ürün ekleme */}
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-medium text-text">{t('admin.orderNew.addProduct')}</h2>
          <div className="grid gap-3 sm:grid-cols-[2fr_1.5fr_auto_auto]">
            <select value={selProduct} onChange={(e) => { setSelProduct(Number(e.target.value) || ''); setSelVariant('') }} className={input} aria-label={t('admin.orderNew.product')}>
              <option value="">{t('admin.orderNew.selectProduct')}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select value={selVariant} onChange={(e) => setSelVariant(Number(e.target.value) || '')} className={input} aria-label={t('admin.orderNew.variantOpt')} disabled={!selProduct}>
              <option value="">{t('admin.orderNew.variantOpt')}</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{[v.size, v.color].filter(Boolean).join(' / ') || v.sku}</option>
              ))}
            </select>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className={input + ' w-20'} aria-label={t('admin.orderNew.qty')} />
            <button type="button" onClick={addLine} disabled={!selProduct}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-text disabled:opacity-40">
              <Plus size={16} /> {t('admin.orderNew.add')}
            </button>
          </div>
        </div>

        {/* Kalemler */}
        {lines.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">{t('admin.orderNew.product')}</th>
                  <th className="px-4 py-2 font-medium">{t('admin.orderNew.unit')}</th>
                  <th className="px-4 py-2 font-medium">{t('admin.orderNew.qty')}</th>
                  <th className="px-4 py-2 font-medium">{t('admin.orderNew.amount')}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg text-text">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{l.label}</td>
                    <td className="px-4 py-2 text-text-muted">{formatPrice(l.unit_price)}</td>
                    <td className="px-4 py-2">{l.qty}</td>
                    <td className="px-4 py-2 font-medium">{formatPrice(l.unit_price * l.qty)}</td>
                    <td className="px-4 py-2 text-right">
                      <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                        className="rounded-md p-1.5 text-text-muted hover:text-danger" aria-label={t('admin.orderNew.remove')}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Toplam */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">{t('admin.orderNew.shippingFee')}</label>
            <input type="number" min={0} step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} className={input + ' w-40'} />
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">{t('admin.orderNew.subtotal')}: {formatPrice(subtotal)}</p>
            <p className="font-display text-xl font-bold text-text">{t('admin.orderNew.total')}: {formatPrice(total)}</p>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-text transition-transform hover:scale-105 disabled:opacity-50">
            {createMutation.isPending ? t('admin.orderNew.creating') : t('admin.orderNew.create')}
          </button>
          <button type="button" onClick={() => navigate('/admin/siparisler')}
            className="rounded-full border border-border-subtle bg-surface px-6 py-2.5 text-sm text-text">
            {t('admin.orderNew.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
