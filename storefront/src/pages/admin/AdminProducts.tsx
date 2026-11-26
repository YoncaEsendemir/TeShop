import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { adminProducts, deleteProduct } from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import Seo from '../../components/Seo'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { search, page }],
    queryFn: () => adminProducts({ search: search || undefined, page }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const products = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <Seo title="Ürünler" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text">Ürünler</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5">
            <Search size={16} className="text-text-subtle" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Ara…"
              className="w-32 bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none sm:w-44"
            />
          </div>
          <Link
            to="/admin/urunler/yeni"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-text transition-transform hover:scale-105"
          >
            <Plus size={16} /> Yeni Ürün
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Fiyat</th>
              <th className="px-4 py-3 font-medium">Varyant</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-bg">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Yükleniyor…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Ürün yok.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="text-text">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-text-muted">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {formatPrice(p.final_price)}
                    {p.has_discount && (
                      <span className="ml-2 text-xs text-text-subtle line-through">
                        {formatPrice(p.base_price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.variants_count ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={p.is_active ? 'text-success' : 'text-text-subtle'}>
                      {p.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/urunler/${p.id}/duzenle`}
                        className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-text"
                        aria-label="Düzenle"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`"${p.name}" ürünü silinsin mi?`)) deleteMutation.mutate(p.id)
                        }}
                        className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-danger"
                        aria-label="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="px-3 text-sm text-text-muted">{meta.current_page} / {meta.last_page}</span>
          <button
            type="button"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
