import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fetchProducts } from '../services/api'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import Seo from '../components/Seo'

export default function Home() {
  const reduce = useReducedMotion()
  const { data, isLoading } = useQuery({
    queryKey: ['products', { sort: 'newest' }],
    queryFn: () => fetchProducts({ sort: 'newest' }),
  })

  const featured = data?.data.slice(0, 8) ?? []

  return (
    <>
      <Seo
        title="TeShop"
        description="Modern, minimal ve monokrom giyim. Özenle seçilmiş premium parçalar, koyu tema bir alışveriş deneyimi."
      />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[80vh] flex-col justify-center py-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="label-caps text-text-subtle">Yeni Sezon</span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight text-text sm:text-7xl">
              Monokrom.
              <br />
              <span className="text-text-muted">Zamansız.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-text-muted">
              Siyahın, grinin ve beyazın sadeliğinde tasarlanmış parçalar. Az ama
              öz bir gardırop için.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/urunler"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-text transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-text"
              >
                Alışverişe Başla
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/kategori/kadin"
                className="inline-flex items-center rounded-full border border-border-subtle bg-surface px-6 py-3 font-medium text-text transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-text"
              >
                Kadın Koleksiyonu
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Öne çıkan ürünler */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
            Öne Çıkanlar
          </h2>
          <Link
            to="/urunler"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
          >
            Tümünü gör
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid products={featured} />
        )}
      </section>
    </>
  )
}
