import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { adminProducts, deleteProduct } from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import Seo from '../../components/Seo'

export default function AdminProducts() {
  const qc = useQueryClient()
  const { t } = useTranslation()
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
      <Seo title={t('admin.products.title')} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text">{t('admin.products.title')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5">
            <Search size={16} className="text-text-subtle" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('admin.products.search')}
              className="w-32 bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none sm:w-44"
            />
          </div>
          <Link
            to="/admin/urunler/yeni"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-text transition-transform hover:scale-105"
          >
            <Plus size={16} /> {t('admin.products.newProduct')}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t('admin.products.product')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.products.category')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.products.price')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.products.variant')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.products.status')}</th>
              <th className="px-4 py-3 font-medium text-right">{t('admin.products.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-bg">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">{t('admin.products.loading')}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">{t('admin.products.none')}</td></tr>
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
                      {p.is_active ? t('admin.products.active') : t('admin.products.passive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/urunler/${p.id}/duzenle`}
                        className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-text"
                        aria-label={t('admin.products.edit')}
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(t('admin.products.confirmDelete', { name: p.name }))) deleteMutation.mutate(p.id)
                        }}
                        className="rounded-md p-2 text-text-muted hover:bg-surface hover:text-danger"
                        aria-label={t('admin.products.delete')}
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
            {t('admin.products.prev')}
          </button>
          <span className="px-3 text-sm text-text-muted">{meta.current_page} / {meta.last_page}</span>
          <button
            type="button"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40"
          >
            {t('admin.products.next')}
          </button>
        </div>
      )}
    </div>
  )
}
