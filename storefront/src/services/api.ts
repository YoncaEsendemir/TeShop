import axios from 'axios'
import type {
  ApiCollection,
  ApiItem,
  Category,
  Paginated,
  Product,
  SortOption,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
})

// Seçili dili her isteğe ekle -> backend çok dilli içeriği o dilde döndürür
api.interceptors.request.use((config) => {
  let lang = 'tr'
  try {
    lang = localStorage.getItem('teshop-lang') ?? 'tr'
  } catch {
    /* yoksay */
  }
  config.params = { ...config.params, lang }
  return config
})

// --- Kategoriler ---
export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiCollection<Category>>('/categories')
  return data.data
}

// --- Ürünler ---
export interface ProductFilters {
  category?: string
  search?: string
  sort?: SortOption
  page?: number
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<Paginated<Product>> {
  const { data } = await api.get<Paginated<Product>>('/products', {
    params: filters,
  })
  return data
}

export async function fetchProduct(slug: string): Promise<Product> {
  const { data } = await api.get<ApiItem<Product>>(`/products/${slug}`)
  return data.data
}

// --- Mağaza ayarları (public) ---
export interface StoreSettings {
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
}

export async function fetchSettings(): Promise<StoreSettings> {
  const { data } = await api.get<StoreSettings>('/settings')
  return data
}

export default api
