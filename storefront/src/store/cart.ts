import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: number) => void
  updateQuantity: (variantId: number, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  // Türetilmiş
  totalItems: () => number
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            // Zaten sepette -> adedi artır (stok sınırını aşma)
            const quantity = Math.min(existing.quantity + item.quantity, item.maxStock)
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity } : i,
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, item], isOpen: true }
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'teshop-cart',
      // Sadece sepet içeriğini kalıcı tut (açık/kapalı durumu değil)
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
