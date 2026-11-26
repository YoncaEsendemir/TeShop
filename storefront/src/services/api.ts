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

export default api
