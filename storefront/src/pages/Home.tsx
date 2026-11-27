import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { fetchProducts } from '../services/api'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import HeroCarousel, { type HeroSlide } from '../components/HeroCarousel'
import Seo from '../components/Seo'
import { imageUrl } from '../lib/utils'
import type { Product } from '../types'

function productImage(p: Product): string | null {
  const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0]
  return imageUrl(primary?.path)
}

export default function Home() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['products', { sort: 'newest' }],
    queryFn: () => fetchProducts({ sort: 'newest' }),
  })

  const featured = data?.data.slice(0, 8) ?? []
  const withImage = featured.filter((p) => productImage(p))

  // 1. slide marka mesajı; sonraki slide'lar öne çıkan ürünler
  const slides: HeroSlide[] = withImage.slice(0, 5).map((p, i) =>
    i === 0
      ? {
          img: productImage(p)!,
          eyebrow: t('home.newSeason'),
          title: `${t('home.title1')} ${t('home.title2')}`,
          cta: t('home.shopNow'),
          href: '/urunler',
        }
      : {
          img: productImage(p)!,
          eyebrow: p.category?.name,
          title: p.name,
          cta: t('home.review'),
          href: `/urun/${p.slug}`,
        },
  )

  return (
    <>
      <Seo
        title="TeShop"
        description="Modern, minimal ve monokrom giyim. Özenle seçilmiş premium parçalar, koyu tema bir alışveriş deneyimi."
      />

      {/* Hero carousel */}
      {isLoading ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="h-[72vh] min-h-[460px] max-h-[760px] animate-pulse rounded-2xl border border-border-subtle bg-surface" />
        </div>
      ) : (
        <HeroCarousel slides={slides} />
      )}

      {/* Öne çıkan ürünler */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
            {t('home.featured')}
          </h2>
          <Link
            to="/urunler"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
          >
            {t('home.seeAll')}
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={featured} />}
      </section>
    </>
  )
}
