import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Boxes, FolderTree, Layers, Package, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { fetchStats } from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import BarChart from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import Seo from '../../components/Seo'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim',
  cancelled: 'İptal',
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={'rounded-xl border border-border-subtle bg-surface p-5 ' + className}>{children}</div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchStats })

  const kpis = [
    { label: 'Toplam Gelir', value: data ? formatPrice(data.total_revenue) : '—', icon: TrendingUp },
    { label: 'Sipariş', value: data?.orders_count ?? '—', icon: ShoppingCart },
    { label: 'Ort. Sepet', value: data ? formatPrice(data.avg_order_value) : '—', icon: Wallet },
    { label: 'Envanter Değeri', value: data ? formatPrice(data.inventory_value) : '—', icon: Boxes },
  ]
  const catalog = [
    { label: 'Ürün', value: data?.products, sub: `${data?.active_products ?? 0} aktif`, icon: Package },
    { label: 'Kategori', value: data?.categories, icon: FolderTree },
    { label: 'Varyant', value: data?.variants, icon: Layers },
  ]

  const inStock = data ? Math.max(data.variants - data.low_stock - data.out_of_stock, 0) : 0

  return (
    <div>
      <Seo title="Panel" />
      <h1 className="mb-6 font-display text-2xl font-bold text-text">Genel Bakış</h1>

      {/* KPI'lar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">{c.label}</span>
              <c.icon size={18} className="text-text-subtle" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-text">{isLoading ? '—' : c.value}</p>
          </Card>
        ))}
      </div>

      {/* Grafikler */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium text-text">Aylık Gelir (son 6 ay)</h2>
          <BarChart
            data={(data?.revenue_by_month ?? []).map((m) => ({ label: m.label, value: m.total }))}
            formatValue={formatPrice}
            title="Aylık gelir"
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">Kategoriye Göre Stok</h2>
          <BarChart
            data={(data?.stock_by_category ?? []).map((s) => ({ label: s.name, value: s.stock }))}
            title="Kategoriye göre stok"
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">Sipariş Durumu</h2>
          <DonutChart
            data={(data?.orders_by_status ?? [])
              .filter((s) => s.count > 0)
              .map((s) => ({ label: STATUS_LABEL[s.status] ?? s.status, value: s.count }))}
            title="Sipariş durumu"
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">Stok Durumu</h2>
          <DonutChart
            data={[
              { label: 'Stokta', value: inStock },
              { label: 'Az kalan', value: data?.low_stock ?? 0 },
              { label: 'Tükenen', value: data?.out_of_stock ?? 0 },
            ]}
            title="Stok durumu"
          />
        </Card>
      </div>

      {/* Listeler */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Çok satanlar */}
        <Card>
          <h2 className="mb-4 font-medium text-text">Çok Satanlar</h2>
          {data && data.top_products.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.top_products.map((p) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span className="text-text">{p.name}</span>
                  <span className="text-text-muted">{p.qty} adet · {formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">Henüz satış yok.</p>
          )}
        </Card>

        {/* Son siparişler */}
        <Card>
          <h2 className="mb-4 flex items-center justify-between font-medium text-text">
            Son Siparişler
            <Link to="/admin/siparisler" className="text-xs text-text-muted hover:text-text">Tümü →</Link>
          </h2>
          {data && data.recent_orders.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.recent_orders.map((o) => (
                <li key={o.order_number} className="flex items-center justify-between">
                  <span className="text-text">{o.customer_name}</span>
                  <span className="text-text-muted">{formatPrice(o.total)} · {STATUS_LABEL[o.status] ?? o.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">Sipariş yok.</p>
          )}
        </Card>
      </div>

      {/* Stok uyarıları */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium text-text">Az Kalan Stok (1–5)</h2>
          {data && data.low_stock_items.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.low_stock_items.map((v, i) => (
                <li key={i} className="flex items-center justify-between">
                  <Link to={`/admin/urunler/${v.product_id}/duzenle`} className="text-text hover:underline">
                    {v.product_name} <span className="text-text-subtle">{[v.size, v.color].filter(Boolean).join('/')}</span>
                  </Link>
                  <span className="text-text-muted">{v.stock} adet</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">Az kalan stok yok.</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">Tükenen Stok</h2>
          {data && data.out_of_stock_items.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.out_of_stock_items.map((v, i) => (
                <li key={i} className="flex items-center justify-between">
                  <Link to={`/admin/urunler/${v.product_id}/duzenle`} className="text-text hover:underline">
                    {v.product_name} <span className="text-text-subtle">{[v.size, v.color].filter(Boolean).join('/')}</span>
                  </Link>
                  <span className="text-danger">Tükendi</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">Tükenen ürün yok.</p>
          )}
        </Card>
      </div>

      {/* Katalog özeti */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {catalog.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">{c.label}</span>
              <c.icon size={18} className="text-text-subtle" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-text">{isLoading ? '—' : (c.value ?? 0)}</p>
            {c.sub && <p className="mt-1 text-xs text-text-subtle">{c.sub}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
