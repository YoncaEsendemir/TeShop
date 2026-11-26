import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronRight, ShoppingBag } from 'lucide-react'
import { fetchProduct } from '../services/api'
import { useCart } from '../store/cart'
import { formatPrice, imageUrl } from '../lib/utils'
import Seo from '../components/Seo'
import type { ProductVariant } from '../types'

export default function ProductDetail() {
  const { slug = '' } = useParams()
  const reduce = useReducedMotion()
  const addItem = useCart((s) => s.addItem)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  })

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)

  const variants = product?.variants ?? []

  // Benzersiz renk ve bedenler
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[],
    [variants],
  )
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[],
    [variants],
  )

  // Seçili varyant
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    return variants.find(
      (v) =>
        (colors.length === 0 || v.color === selectedColor) &&
        (sizes.length === 0 || v.size === selectedSize),
    )
  }, [variants, selectedColor, selectedSize, colors.length, sizes.length])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="aspect-[3/4] rounded-2xl bg-surface" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded bg-surface" />
            <div className="h-6 w-1/3 rounded bg-surface" />
            <div className="h-24 w-full rounded bg-surface" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-text-muted">Ürün bulunamadı.</p>
        <Link to="/urunler" className="mt-4 inline-block text-text underline">
          Tüm ürünlere dön
        </Link>
      </div>
    )
  }

  const primary = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const img = imageUrl(primary?.path)

  // Fiyat: varyant fiyatı varsa o, yoksa ürünün final_price'ı
  const price = selectedVariant?.price
    ? parseFloat(selectedVariant.price)
    : parseFloat(product.final_price)

  const needsColor = colors.length > 0 && !selectedColor
  const needsSize = sizes.length > 0 && !selectedSize
  const canAdd = !!selectedVariant && selectedVariant.in_stock && !needsColor && !needsSize

  function handleAdd() {
    if (!canAdd || !selectedVariant || !product) return
    const label = [selectedVariant.size, selectedVariant.color]
      .filter(Boolean)
      .join(' / ')
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      variantLabel: label || 'Standart',
      price,
      image: primary?.path ?? null,
      quantity: 1,
      maxStock: selectedVariant.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // JSON-LD (SEO — Product + Offer)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: product.final_price,
      priceCurrency: 'TRY',
      availability:
        (product.total_stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title={product.name}
        description={product.description ?? `${product.name} — TeShop`}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-subtle" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-text">Ana Sayfa</Link>
        <ChevronRight size={14} />
        <Link to="/urunler" className="hover:text-text">Ürünler</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/kategori/${product.category.slug}`} className="hover:text-text">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galeri */}
        <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-border-subtle bg-surface">
          {img && !imgError ? (
            <img
              src={img}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-2">
              <span className="font-display text-6xl font-bold text-text-subtle">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Bilgi + seçim */}
        <div>
          {product.category && (
            <span className="label-caps text-text-subtle">{product.category.name}</span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl">
            {product.name}
          </h1>

          {/* Fiyat */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-text">{formatPrice(price)}</span>
            {product.has_discount && !selectedVariant?.price && (
              <span className="text-lg text-text-subtle line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 leading-relaxed text-text-muted">{product.description}</p>
          )}

          {/* Renk seçimi */}
          {colors.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-medium text-text">
                Renk{selectedColor && <span className="text-text-muted"> · {selectedColor}</span>}
              </h2>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={
                      'rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-text ' +
                      (selectedColor === color
                        ? 'border-text bg-surface-2 text-text'
                        : 'border-border-subtle text-text-muted hover:border-text-muted')
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Beden seçimi */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-medium text-text">
                Beden{selectedSize && <span className="text-text-muted"> · {selectedSize}</span>}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  // Bu beden seçili renkte stokta mı?
                  const variant = variants.find(
                    (v) => v.size === size && (!selectedColor || v.color === selectedColor),
                  )
                  const disabled = selectedColor ? !variant || !variant.in_stock : false
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedSize(size)}
                      className={
                        'min-w-12 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-text ' +
                        (selectedSize === size
                          ? 'border-text bg-surface-2 text-text'
                          : 'border-border-subtle text-text-muted hover:border-text-muted') +
                        (disabled ? ' cursor-not-allowed opacity-30 line-through' : '')
                      }
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stok durumu */}
          {selectedVariant && (
            <p className="mt-4 text-sm">
              {selectedVariant.in_stock ? (
                <span className="text-success">Stokta ({selectedVariant.stock} adet)</span>
              ) : (
                <span className="text-danger">Bu seçenek tükendi</span>
              )}
            </p>
          )}

          {/* Sepete ekle */}
          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            whileTap={reduce || !canAdd ? undefined : { scale: 0.97 }}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-medium text-primary-text transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-text sm:w-auto sm:px-10"
          >
            {added ? (
              <>
                <Check size={18} /> Sepete Eklendi
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                {needsColor || needsSize ? 'Seçim yapın' : 'Sepete Ekle'}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
