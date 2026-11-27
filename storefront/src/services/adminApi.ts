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
export interface StockItem {
  product_id: number
  product_name: string
  size: string | null
  color: string | null
  stock: number
}

export interface AdminStats {
  products: number
  active_products: number
  categories: number
  variants: number
  low_stock: number
  out_of_stock: number
  inventory_value: number
  stock_by_category: { name: string; stock: number }[]
  low_stock_items: StockItem[]
  out_of_stock_items: StockItem[]
  total_revenue: number
  orders_count: number
  avg_order_value: number
  revenue_by_month: { month: string; label: string; total: number }[]
  orders_by_status: { status: string; count: number }[]
  top_products: { name: string; qty: number; revenue: number }[]
  recent_orders: {
    order_number: string
    customer_name: string
    total: string
    status: string
    placed_at: string | null
  }[]
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

export async function adminProduct(id: number): Promise<Product> {
  const { data } = await adminApi.get<ApiItem<Product>>(`/admin/products/${id}`)
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

// --- Siparişler ---
export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface AdminOrderItem {
  id: number
  product_id: number | null
  variant_id: number | null
  product_name: string
  unit_price: string
  qty: number
  line_total: string
}

export interface AdminOrder {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  status: OrderStatus
  subtotal: string
  shipping_fee: string
  total: string
  placed_at: string | null
  items_count?: number
  items?: AdminOrderItem[]
}

export async function fetchOrders(params: { status?: string; page?: number } = {}) {
  const { data } = await adminApi.get<Paginated<AdminOrder>>('/admin/orders', { params })
  return data
}

export async function fetchOrder(id: number): Promise<AdminOrder> {
  const { data } = await adminApi.get<ApiItem<AdminOrder>>(`/admin/orders/${id}`)
  return data.data
}

export interface OrderItemInput {
  product_id: number
  variant_id?: number | null
  qty: number
}

export interface CreateOrderInput {
  customer_name: string
  customer_email: string
  shipping_fee?: number
  items: OrderItemInput[]
}

export async function createOrder(input: CreateOrderInput): Promise<AdminOrder> {
  const { data } = await adminApi.post<ApiItem<AdminOrder>>('/admin/orders', input)
  return data.data
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
  const { data } = await adminApi.patch<ApiItem<AdminOrder>>(`/admin/orders/${id}/status`, { status })
  return data.data
}

// --- Ayarlar ---
export async function updateProfile(input: { name: string; email: string }): Promise<AdminUser> {
  const { data } = await adminApi.put<AdminUser>('/admin/profile', input)
  return data
}

export async function updatePassword(input: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}): Promise<void> {
  await adminApi.put('/admin/password', input)
}

export interface StoreSettings {
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
}

export async function fetchAdminSettings(): Promise<StoreSettings> {
  const { data } = await adminApi.get<StoreSettings>('/admin/settings')
  return data
}

export async function updateSettings(input: StoreSettings): Promise<StoreSettings> {
  const { data } = await adminApi.put<StoreSettings>('/admin/settings', input)
  return data
}

export default adminApi
