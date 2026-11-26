import axios from 'axios'
import { useAuth, type AdminUser } from '../store/auth'
import type {
  ApiCollection,
  ApiItem,
  Category,
  Paginated,
  Product,
  ProductImage,
  ProductVariant,
} from '../types'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
})

// Her isteğe token ekle
adminApi.interceptors.request.use((config) => {
  const token = useAuth.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 -> oturumu kapat (token geçersiz/süresi dolmuş)
adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout()
    }
    return Promise.reject(error)
  },
)

// --- Auth ---
export async function adminLogin(email: string, password: string) {
  const { data } = await adminApi.post<{ token: string; user: AdminUser }>(
    '/admin/login',
    { email, password },
  )
  return data
}

export async function adminLogout() {
  await adminApi.post('/admin/logout')
}

// --- Dashboard ---
export interface AdminStats {
  products: number
  active_products: number
  categories: number
  variants: number
  low_stock: number
  out_of_stock: number
}

export async function fetchStats(): Promise<AdminStats> {
  const { data } = await adminApi.get<AdminStats>('/admin/stats')
  return data
}

// --- Kategoriler ---
export async function adminCategories(): Promise<Category[]> {
  const { data } = await adminApi.get<ApiCollection<Category>>('/admin/categories')
  return data.data
}

export interface CategoryInput {
  name: string
  slug?: string
  parent_id?: number | null
  is_active?: boolean
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await adminApi.post<ApiItem<Category>>('/admin/categories', input)
  return data.data
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category> {
  const { data } = await adminApi.put<ApiItem<Category>>(`/admin/categories/${id}`, input)
  return data.data
}

export async function deleteCategory(id: number): Promise<void> {
  await adminApi.delete(`/admin/categories/${id}`)
}

// --- Ürünler ---
export async function adminProducts(params: { search?: string; page?: number } = {}) {
  const { data } = await adminApi.get<Paginated<Product>>('/admin/products', { params })
  return data
}

export async function adminProduct(slug: string): Promise<Product> {
  const { data } = await adminApi.get<ApiItem<Product>>(`/admin/products/${slug}`)
  return data.data
}

export interface ProductInput {
  category_id: number
  name: string
  slug?: string
  description?: string | null
  base_price: number
  discount_price?: number | null
  is_active?: boolean
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await adminApi.post<ApiItem<Product>>('/admin/products', input)
  return data.data
}

export async function updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await adminApi.put<ApiItem<Product>>(`/admin/products/${id}`, input)
  return data.data
}

export async function deleteProduct(id: number): Promise<void> {
  await adminApi.delete(`/admin/products/${id}`)
}

// --- Varyantlar ---
export interface VariantInput {
  sku: string
  size?: string | null
  color?: string | null
  price?: number | null
  stock: number
  is_active?: boolean
}

export async function createVariant(productId: number, input: VariantInput): Promise<ProductVariant> {
  const { data } = await adminApi.post<ApiItem<ProductVariant>>(
    `/admin/products/${productId}/variants`,
    input,
  )
  return data.data
}

export async function updateVariant(variantId: number, input: Partial<VariantInput>): Promise<ProductVariant> {
  const { data } = await adminApi.put<ApiItem<ProductVariant>>(`/admin/variants/${variantId}`, input)
  return data.data
}

export async function deleteVariant(variantId: number): Promise<void> {
  await adminApi.delete(`/admin/variants/${variantId}`)
}

// --- Görseller ---
export async function uploadImage(
  productId: number,
  file: File,
  opts: { is_primary?: boolean; variant_id?: number | null } = {},
): Promise<ProductImage> {
  const form = new FormData()
  form.append('image', file)
  if (opts.is_primary) form.append('is_primary', '1')
  if (opts.variant_id) form.append('variant_id', String(opts.variant_id))
  const { data } = await adminApi.post<ApiItem<ProductImage>>(
    `/admin/products/${productId}/images`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

export async function deleteImage(imageId: number): Promise<void> {
  await adminApi.delete(`/admin/images/${imageId}`)
}

export default adminApi
