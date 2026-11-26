import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/cart'
import { formatPrice, imageUrl } from '../lib/utils'

export default function CartDrawer() {
  const reduce = useReducedMotion()
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCart()
  const subtotal = useCart((s) => s.subtotal())

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arka plan karartması */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60"
            aria-hidden="true"
          />

          {/* Çekmece */}
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface"
            role="dialog"
            aria-label="Sepet"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-text">Sepetim</h2>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag size={40} className="text-text-subtle" />
                <p className="text-text-muted">Sepetin henüz boş.</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-text transition-transform hover:scale-105"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border-subtle overflow-y-auto px-5">
                  {items.map((item) => {
                    const img = imageUrl(item.image)
                    return (
                      <li key={item.variantId} className="flex gap-4 py-4">
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
                          {img && (
                            <img
                              src={img}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/urun/${item.slug}`}
                            onClick={closeCart}
                            className="block truncate text-sm font-medium text-text hover:text-text-muted"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-text-muted">{item.variantLabel}</p>
                          <p className="mt-1 text-sm text-text">{formatPrice(item.price)}</p>

                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-border-subtle">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="p-1.5 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
                                aria-label="Azalt"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm text-text">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className="p-1.5 text-text-muted hover:text-text disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-text"
                                aria-label="Artır"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              className="text-text-subtle hover:text-danger focus-visible:outline-2 focus-visible:outline-text"
                              aria-label="Kaldır"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="border-t border-border-subtle px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-text-muted">Ara Toplam</span>
                    <span className="font-display text-lg font-semibold text-text">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-text transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Ödemeye Geç
                  </button>
                  <p className="mt-2 text-center text-xs text-text-subtle">
                    Ödeme adımı Faz 6'da eklenecek.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
