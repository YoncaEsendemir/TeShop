import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '../types'
import { formatPrice, imageUrl } from '../lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion()
  const [imgError, setImgError] = useState(false)

  const primary =
    product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const img = imageUrl(primary?.path)
  const outOfStock = product.total_stock === 0

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link
        to={`/urun/${product.slug}`}
        className="block rounded-xl focus-visible:outline-2 focus-visible:outline-text"
      >
        {/* Görsel */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border-subtle bg-surface">
          {img && !imgError ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Fallback: monokrom yer tutucu (gerçek görseller Faz 2 admin yüklemesiyle)
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-2">
              <span className="font-display text-3xl font-bold text-text-subtle">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Rozetler */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.has_discount && (
              <span className="label-caps rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-text">
                İndirim
              </span>
            )}
            {outOfStock && (
              <span className="label-caps rounded-full bg-surface-2 px-2.5 py-1 font-semibold text-text-muted">
                Tükendi
              </span>
            )}
          </div>
        </div>

        {/* Bilgi */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-text">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-text-subtle">{product.category.name}</p>
          )}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm font-semibold text-text">
              {formatPrice(product.final_price)}
            </span>
            {product.has_discount && (
              <span className="text-xs text-text-subtle line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
