import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, FolderTree, Layers, Package } from 'lucide-react'
import { fetchStats } from '../../services/adminApi'
import Seo from '../../components/Seo'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
  })

  const cards = [
    { label: 'Ürün', value: data?.products, sub: `${data?.active_products ?? 0} aktif`, icon: Package },
    { label: 'Kategori', value: data?.categories, icon: FolderTree },
    { label: 'Varyant', value: data?.variants, icon: Layers },
  ]

  return (
    <div>
      <Seo title="Panel" />
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Genel Bakış</h1>

      {/* İstatistik kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border-subtle bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">{c.label}</span>
              <c.icon size={18} className="text-text-subtle" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-text">
              {isLoading ? '—' : (c.value ?? 0)}
            </p>
            {c.sub && <p className="mt-1 text-xs text-text-subtle">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Stok uyarıları */}
      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-text">
        Stok Durumu
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
            <AlertTriangle size={18} className="text-text-muted" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-text">
              {isLoading ? '—' : (data?.low_stock ?? 0)}
            </p>
            <p className="text-sm text-text-muted">Az kalan varyant (1–5 adet)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-text">
              {isLoading ? '—' : (data?.out_of_stock ?? 0)}
            </p>
            <p className="text-sm text-text-muted">Tükenen varyant</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/admin/urunler"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-text transition-transform hover:scale-105"
        >
          Ürünleri Yönet
        </Link>
        <Link
          to="/admin/kategoriler"
          className="rounded-full border border-border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          Kategorileri Yönet
        </Link>
      </div>
    </div>
  )
}
