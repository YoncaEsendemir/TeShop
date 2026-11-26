// API veri tipleri (backend API Resource çıktılarıyla uyumlu)

export interface Category {
  id: number
  name: string
  slug: string
  image: string | null
  parent_id: number | null
  is_active: boolean
  children?: Category[]
  products_count?: number
}

export interface ProductVariant {
  id: number
  sku: string
  size: string | null
  color: string | null
  price: string | null // null = ürünün base_price'ı
  stock: number
  in_stock: boolean
  is_active: boolean
}

export interface ProductImage {
  id: number
  path: string
  url: string
  variant_id: number | null
  is_primary: boolean
  sort_order: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  base_price: string
  discount_price: string | null
  has_discount: boolean
  final_price: string
  is_active: boolean
  category?: Category
  variants?: ProductVariant[]
  images?: ProductImage[]
  total_stock?: number
}

// Laravel sayfalama yanıtı
export interface Paginated<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface ApiCollection<T> {
  data: T[]
}

export interface ApiItem<T> {
  data: T
}

// Sepet öğesi (frontend state)
export interface CartItem {
  productId: number
  variantId: number
  slug: string
  name: string
  variantLabel: string // "L / Siyah"
  price: number
  image: string | null
  quantity: number
  maxStock: number
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name'
