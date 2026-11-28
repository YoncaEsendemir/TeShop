import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Boxes, FolderTree, Layers, Package, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { fetchStats } from '../../services/adminApi'
import { formatPrice } from '../../lib/utils'
import BarChart from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import Seo from '../../components/Seo'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={'rounded-xl border border-border-subtle bg-surface p-5 ' + className}>{children}</div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchStats })

  const kpis = [
    { label: t('admin.dash.totalRevenue'), value: data ? formatPrice(data.total_revenue) : '—', icon: TrendingUp },
    { label: t('admin.dash.orders'), value: data?.orders_count ?? '—', icon: ShoppingCart },
    { label: t('admin.dash.avgOrder'), value: data ? formatPrice(data.avg_order_value) : '—', icon: Wallet },
    { label: t('admin.dash.inventoryValue'), value: data ? formatPrice(data.inventory_value) : '—', icon: Boxes },
  ]
  const catalog = [
    { to: '/admin/urunler', label: t('admin.dash.product'), value: data?.products, sub: `${data?.active_products ?? 0} ${t('admin.dash.active')}`, icon: Package },
    { to: '/admin/kategoriler', label: t('admin.dash.category'), value: data?.categories, icon: FolderTree },
    { to: '/admin/urunler', label: t('admin.dash.variant'), value: data?.variants, icon: Layers },
  ]

  const inStock = data ? Math.max(data.variants - data.low_stock - data.out_of_stock, 0) : 0
  const st = (s: string) => t(`admin.status.${s}`, s)

  return (
    <div>
      <Seo title={t('admin.dash.title')} />
      <h1 className="mb-6 font-display text-2xl font-bold text-text">{t('admin.dash.title')}</h1>

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
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.monthlyRevenue')}</h2>
          <BarChart
            data={(data?.revenue_by_month ?? []).map((m) => ({ label: m.label, value: m.total }))}
            formatValue={formatPrice}
            title={t('admin.dash.monthlyRevenue')}
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.stockByCategory')}</h2>
          <BarChart
            data={(data?.stock_by_category ?? []).map((s) => ({ label: s.name, value: s.stock }))}
            title={t('admin.dash.stockByCategory')}
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.orderStatus')}</h2>
          <DonutChart
            data={(data?.orders_by_status ?? [])
              .filter((s) => s.count > 0)
              .map((s) => ({ label: st(s.status), value: s.count }))}
            title={t('admin.dash.orderStatus')}
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.stockStatus')}</h2>
          <DonutChart
            data={[
              { label: t('admin.dash.inStock'), value: inStock },
              { label: t('admin.dash.lowStock'), value: data?.low_stock ?? 0 },
              { label: t('admin.dash.outOfStock'), value: data?.out_of_stock ?? 0 },
            ]}
            title={t('admin.dash.stockStatus')}
          />
        </Card>
      </div>

      {/* Listeler */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.topProducts')}</h2>
          {data && data.top_products.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.top_products.map((p) => (
                <li key={p.name} className="flex items-center justify-between">
                  <span className="text-text">{p.name}</span>
                  <span className="text-text-muted">{p.qty} {t('admin.dash.units')} · {formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">{t('admin.dash.noSales')}</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center justify-between font-medium text-text">
            {t('admin.dash.recentOrders')}
            <Link to="/admin/siparisler" className="text-xs text-text-muted hover:text-text">{t('admin.dash.seeAll')}</Link>
          </h2>
          {data && data.recent_orders.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {data.recent_orders.map((o) => (
                <li key={o.order_number} className="flex items-center justify-between">
                  <span className="text-text">{o.customer_name}</span>
                  <span className="text-text-muted">{formatPrice(o.total)} · {st(o.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">{t('admin.orders.none')}</p>
          )}
        </Card>
      </div>

      {/* Stok uyarıları — ilk ~5 görünür, sonra scroll */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.lowStockTitle')}</h2>
          {data && data.low_stock_items.length > 0 ? (
            <ul className="max-h-56 space-y-2 overflow-y-auto pr-1 text-sm">
              {data.low_stock_items.map((v, i) => (
                <li key={i} className="flex items-center justify-between">
                  <Link to={`/admin/urunler/${v.product_id}/duzenle`} className="text-text hover:underline">
                    {v.product_name} <span className="text-text-subtle">{[v.size, v.color].filter(Boolean).join('/')}</span>
                  </Link>
                  <span className="text-text-muted">{v.stock} {t('admin.dash.units')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">{t('admin.dash.noLowStock')}</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-medium text-text">{t('admin.dash.outOfStockTitle')}</h2>
          {data && data.out_of_stock_items.length > 0 ? (
            <ul className="max-h-56 space-y-2 overflow-y-auto pr-1 text-sm">
              {data.out_of_stock_items.map((v, i) => (
                <li key={i} className="flex items-center justify-between">
                  <Link to={`/admin/urunler/${v.product_id}/duzenle`} className="text-text hover:underline">
                    {v.product_name} <span className="text-text-subtle">{[v.size, v.color].filter(Boolean).join('/')}</span>
                  </Link>
                  <span className="text-danger">{t('admin.dash.soldOut')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-subtle">{t('admin.dash.noOutOfStock')}</p>
          )}
        </Card>
      </div>

      {/* Katalog özeti — tıklanabilir */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {catalog.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl border border-border-subtle bg-surface p-5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-text"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">{c.label}</span>
              <c.icon size={18} className="text-text-subtle" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-text">{isLoading ? '—' : (c.value ?? 0)}</p>
            {c.sub && <p className="mt-1 text-xs text-text-subtle">{c.sub}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
