import type { Product } from '../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

/** Yükleniyor iskeleti */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-surface" />
          <div className="mt-3 h-3 w-3/4 rounded bg-surface" />
          <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
        </div>
      ))}
    </div>
  )
}
