import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
}

interface AuthState {
  token: string | null
  user: AdminUser | null
  setAuth: (token: string, user: AdminUser) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'teshop-admin-auth' },
  ),
)
