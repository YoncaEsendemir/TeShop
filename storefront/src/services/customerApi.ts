import axios from 'axios'
import { useCustomerAuth, type Customer } from '../store/customerAuth'
import type { Product } from '../types'

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
})

customerApi.interceptors.request.use((config) => {
  const token = useCustomerAuth.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  let lang = 'tr'
  try {
    lang = localStorage.getItem('teshop-lang') ?? 'tr'
  } catch {
    /* yoksay */
  }
  config.params = { ...config.params, lang }
  return config
})

customerApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) useCustomerAuth.getState().logout()
    return Promise.reject(error)
  },
)

interface AuthResponse {
  token: string
  user: Customer
}

export async function register(input: { name: string; email: string; password: string; password_confirmation: string }) {
  const { data } = await customerApi.post<AuthResponse>('/register', input)
  return data
}

export async function login(email: string, password: string) {
  const { data } = await customerApi.post<AuthResponse>('/login', { email, password })
  return data
}

export async function logout() {
  await customerApi.post('/logout')
}

export async function fetchMe(): Promise<Customer> {
  const { data } = await customerApi.get<Customer>('/me')
  return data
}

export async function resendVerification() {
  await customerApi.post('/email/verification-notification')
}

// --- Adresler ---
export interface Address {
  id: number
  title: string
  full_name: string
  phone: string
  line1: string
  city: string
  postal_code: string | null
  is_default: boolean
}
export type AddressInput = Omit<Address, 'id' | 'is_default'> & { is_default?: boolean }

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await customerApi.get<{ data: Address[] }>('/addresses')
  return data.data
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const { data } = await customerApi.post<{ data: Address }>('/addresses', input)
  return data.data
}

export async function updateAddress(id: number, input: AddressInput): Promise<Address> {
  const { data } = await customerApi.put<{ data: Address }>(`/addresses/${id}`, input)
  return data.data
}

export async function deleteAddress(id: number): Promise<void> {
  await customerApi.delete(`/addresses/${id}`)
}

// --- Sipariş geçmişi ---
export interface MyOrder {
  id: number
  order_number: string
  status: string
  total: string
  placed_at: string | null
  items_count?: number
}

export async function fetchMyOrders(): Promise<MyOrder[]> {
  const { data } = await customerApi.get<{ data: MyOrder[] }>('/my-orders')
  return data.data
}

// --- Favoriler ---
export async function fetchWishlist(): Promise<Product[]> {
  const { data } = await customerApi.get<{ data: Product[] }>('/wishlist')
  return data.data
}

export async function toggleWishlist(productId: number): Promise<boolean> {
  const { data } = await customerApi.post<{ in_wishlist: boolean }>('/wishlist/toggle', { product_id: productId })
  return data.in_wishlist
}

export default customerApi
