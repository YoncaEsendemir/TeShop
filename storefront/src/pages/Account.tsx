import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus } from 'lucide-react'
import {
  logout as apiLogout,
  resendVerification,
  fetchAddresses,
  createAddress,
  deleteAddress,
  fetchMyOrders,
  fetchMe,
  type AddressInput,
} from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import { formatPrice } from '../lib/utils'
import Seo from '../components/Seo'

const EMPTY: AddressInput = { title: '', full_name: '', phone: '', line1: '', city: '', postal_code: '' }
const inp = 'w-full rounded-lg border border-border-subtle bg-bg px-3 py-2 text-sm text-text focus:border-text-muted focus:outline-none'

export default function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, token, logout, setUser } = useCustomerAuth()
  const [sent, setSent] = useState(false)

  // Doğrulama durumu güncel olsun diye /me'den tazele
  const { data: me } = useQuery({ queryKey: ['customer', 'me'], queryFn: fetchMe, enabled: !!token })
  useEffect(() => { if (me) setUser(me) }, [me]) // eslint-disable-line react-hooks/exhaustive-deps
  const [form, setForm] = useState<AddressInput>(EMPTY)
  const [showForm, setShowForm] = useState(false)

  const { data: addresses = [] } = useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: fetchAddresses,
    enabled: !!token,
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: fetchMyOrders,
    enabled: !!token,
  })

  const addM = useMutation({
    mutationFn: () => createAddress(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer', 'addresses'] }); setForm(EMPTY); setShowForm(false) },
  })
  const delM = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', 'addresses'] }),
  })

  if (!token) return <Navigate to="/giris" replace />

  async function handleLogout() {
    try { await apiLogout() } catch { /* yoksay */ }
    logout()
    navigate('/')
  }
  async function resend() {
    try { await resendVerification(); setSent(true) } catch { /* yoksay */ }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={t('auth.account')} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">{t('auth.account')}</h1>
        <button onClick={handleLogout} className="rounded-full border border-border-subtle px-4 py-2 text-sm text-text-muted hover:text-text">
          {t('auth.logout')}
        </button>
      </div>

      {user && !user.email_verified && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {t('auth.notVerifiedBanner')}{' '}
          {sent ? <span className="text-success">{t('auth.resendSent')}</span>
                : <button onClick={resend} className="underline">{t('auth.resend')}</button>}
        </div>
      )}

      {/* Profil */}
      <div className="mb-6 rounded-xl border border-border-subtle bg-surface p-5">
        <h2 className="mb-3 font-medium text-text">{t('auth.profile')}</h2>
        <p className="text-sm text-text-muted">{user?.name}</p>
        <p className="text-sm text-text-muted">{user?.email}</p>
      </div>

      {/* Sipariş geçmişi */}
      <div className="mb-6 rounded-xl border border-border-subtle bg-surface p-5">
        <h2 className="mb-4 font-medium text-text">{t('auth.myOrders')}</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-text-subtle">{t('auth.ordersNone')}</p>
        ) : (
          <ul className="divide-y divide-border-subtle text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-mono text-xs text-text-muted">{o.order_number}</span>
                  <span className="ml-3 text-text-subtle">{o.placed_at ? new Date(o.placed_at).toLocaleDateString('tr-TR') : ''}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-text-muted">{t(`admin.status.${o.status}`, o.status)}</span>
                  <span className="font-medium text-text">{formatPrice(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Adresler */}
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-text">{t('auth.myAddresses')}</h2>
          <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-text">
            <Plus size={14} /> {t('auth.addrAdd')}
          </button>
        </div>

        {showForm && (
          <form onSubmit={(e) => { e.preventDefault(); addM.mutate() }} className="mb-5 grid gap-3 rounded-lg border border-border-subtle p-4 sm:grid-cols-2">
            <input required placeholder={t('auth.addrTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
            <input required placeholder={t('auth.addrName')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inp} />
            <input required placeholder={t('auth.addrPhone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
            <input required placeholder={t('auth.addrCity')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
            <input required placeholder={t('auth.addrLine')} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className={inp + ' sm:col-span-2'} />
            <input placeholder={t('auth.addrPostal')} value={form.postal_code ?? ''} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className={inp} />
            <div className="sm:col-span-2">
              <button type="submit" disabled={addM.isPending} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-text disabled:opacity-50">{t('auth.addrSave')}</button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-text-subtle">{t('auth.addrNone')}</p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between rounded-lg border border-border-subtle p-3 text-sm">
                <div>
                  <p className="font-medium text-text">{a.title} · {a.full_name}</p>
                  <p className="text-text-muted">{a.line1}, {a.city} {a.postal_code}</p>
                  <p className="text-text-subtle">{a.phone}</p>
                </div>
                <button onClick={() => delM.mutate(a.id)} aria-label={t('auth.addrDelete')} className="rounded-md p-1.5 text-text-muted hover:text-danger">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sipariş geçmişi sonraki adımda eklenecek */}
    </div>
  )
}
