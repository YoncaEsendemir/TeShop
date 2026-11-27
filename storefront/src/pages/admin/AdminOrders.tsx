import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import {
  fetchOrders,
  updateOrderStatus,
  ORDER_STATUSES,
  type OrderStatus,
} from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import Seo from '../../components/Seo'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminOrders() {
  const qc = useQueryClient()
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status, page }],
    queryFn: () => fetchOrders({ status: status || undefined, page }),
    placeholderData: keepPreviousData,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: number; s: OrderStatus }) => updateOrderStatus(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <Seo title="Siparişler" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text">Siparişler</h1>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-text"
            aria-label="Duruma göre filtrele"
          >
            <option value="">Tüm durumlar</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <Link
            to="/admin/siparisler/yeni"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-text transition-transform hover:scale-105"
          >
            <Plus size={16} /> Yeni Sipariş
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Sipariş No</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Toplam</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-bg">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">Yükleniyor…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">Sipariş yok.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="text-text">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-text-subtle">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(o.placed_at)}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, s: e.target.value as OrderStatus })}
                      className="rounded-lg border border-border-subtle bg-surface px-2 py-1 text-xs text-text focus-visible:outline-2 focus-visible:outline-text"
                      aria-label={`${o.order_number} durumu`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40">Önceki</button>
          <span className="px-3 text-sm text-text-muted">{meta.current_page} / {meta.last_page}</span>
          <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40">Sonraki</button>
        </div>
      )}
    </div>
  )
}
