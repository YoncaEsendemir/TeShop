import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchProducts } from '../services/api'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import Seo from '../components/Seo'
import type { SortOption } from '../types'

const SORT_KEYS: Record<SortOption, string> = {
  newest: 'products.sortNewest',
  price_asc: 'products.sortPriceAsc',
  price_desc: 'products.sortPriceDesc',
  name: 'products.sortName',
}

export default function Products() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? undefined
  const sort = (searchParams.get('sort') as SortOption) ?? 'newest'
  const page = Number(searchParams.get('page') ?? '1')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { category: slug, search, sort, page }],
    queryFn: () => fetchProducts({ category: slug, search, sort, page }),
    placeholderData: keepPreviousData,
  })

  const products = data?.data ?? []
  const meta = data?.meta

  // Başlık
  let heading = t('products.all')
  if (search) heading = t('products.results', { q: search })
  else if (slug) heading = products[0]?.category?.name ?? slug

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    if (key !== 'page') next.delete('page') // filtre değişince sayfayı sıfırla
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Seo title={heading} description={`${heading} — TeShop koyu tema mağazası.`} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold capitalize text-text">
          {heading}
        </h1>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          {t('products.sort')}
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-text focus-visible:outline-2 focus-visible:outline-text"
          >
            {(Object.keys(SORT_KEYS) as SortOption[]).map((key) => (
              <option key={key} value={key} className="bg-surface">
                {t(SORT_KEYS[key])}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isError ? (
        <p className="py-20 text-center text-text-muted">{t('products.error')}</p>
      ) : isLoading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-text-muted">{t('products.none')}</p>
      ) : (
        <>
          <ProductGrid products={products} />

          {/* Sayfalama */}
          {meta && meta.last_page > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
                className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-text"
              >
                {t('products.prev')}
              </button>
              <span className="px-3 text-sm text-text-muted">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setParam('page', String(page + 1))}
                className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text disabled:opacity-40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-text"
              >
                {t('products.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
