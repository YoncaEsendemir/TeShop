import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from './cart'
import type { CartItem } from '../types'

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 1,
    variantId: 10,
    slug: 'urun',
    name: 'Ürün',
    variantLabel: 'M / Siyah',
    price: 100,
    image: null,
    quantity: 1,
    maxStock: 5,
    ...overrides,
  }
}

describe('cart store', () => {
  beforeEach(() => {
    useCart.setState({ items: [], isOpen: false })
    localStorage.clear()
  })

  it('ürün ekler ve sepeti açar', () => {
    useCart.getState().addItem(item())
    const s = useCart.getState()
    expect(s.items).toHaveLength(1)
    expect(s.isOpen).toBe(true)
    expect(s.totalItems()).toBe(1)
  })

  it('aynı varyantı tekrar eklerse adedi artırır (stok sınırını aşmaz)', () => {
    const { addItem } = useCart.getState()
    addItem(item({ quantity: 1, maxStock: 2 }))
    addItem(item({ quantity: 1, maxStock: 2 }))
    addItem(item({ quantity: 1, maxStock: 2 })) // 3. kez ama maxStock 2
    const line = useCart.getState().items[0]
    expect(line.quantity).toBe(2) // sınırlandı
  })

  it('farklı varyant ayrı satır olur', () => {
    const { addItem } = useCart.getState()
    addItem(item({ variantId: 10 }))
    addItem(item({ variantId: 11 }))
    expect(useCart.getState().items).toHaveLength(2)
  })

  it('ürünü sepetten çıkarır', () => {
    const { addItem, removeItem } = useCart.getState()
    addItem(item({ variantId: 10 }))
    removeItem(10)
    expect(useCart.getState().items).toHaveLength(0)
  })

  it('adedi günceller (1..maxStock arası sınırlar)', () => {
    const { addItem, updateQuantity } = useCart.getState()
    addItem(item({ variantId: 10, maxStock: 3 }))
    updateQuantity(10, 10) // maxStock 3
    expect(useCart.getState().items[0].quantity).toBe(3)
    updateQuantity(10, 0) // en az 1
    expect(useCart.getState().items[0].quantity).toBe(1)
  })

  it('ara toplam ve toplam adet doğru hesaplanır', () => {
    const { addItem } = useCart.getState()
    addItem(item({ variantId: 10, price: 100, quantity: 2 }))
    addItem(item({ variantId: 11, price: 50, quantity: 1 }))
    const s = useCart.getState()
    expect(s.totalItems()).toBe(3)
    expect(s.subtotal()).toBe(250)
  })

  it('clear sepeti boşaltır', () => {
    const { addItem, clear } = useCart.getState()
    addItem(item())
    clear()
    expect(useCart.getState().items).toHaveLength(0)
  })
})
