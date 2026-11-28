import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Customer {
  id: number
  name: string
  email: string
  email_verified: boolean
}

interface CustomerAuthState {
  token: string | null
  user: Customer | null
  setAuth: (token: string, user: Customer) => void
  setUser: (user: Customer) => void
  logout: () => void
}

export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'teshop-customer' },
  ),
)
