import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/** Seçimi gerçek temaya çevirir. system → sistem tercihine göre. */
export function resolveTheme(choice: ThemeChoice, prefersDark?: boolean): ResolvedTheme {
  if (choice === 'light' || choice === 'dark') return choice
  const dark =
    prefersDark ??
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  return dark ? 'dark' : 'light'
}

/** <html data-theme> set eder ve çözümlenen temayı döner. */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(choice)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolved
  }
  return resolved
}

interface ThemeState {
  theme: ThemeChoice
  resolved: ResolvedTheme
  setTheme: (t: ThemeChoice) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      resolved: 'dark',
      setTheme: (t) => set({ theme: t, resolved: applyTheme(t) }),
    }),
    {
      name: 'teshop-theme',
      // Yeniden yüklemede kayıtlı seçimi DOM'a uygula (system için canlı çözümle)
      onRehydrateStorage: () => (state) => {
        if (state) state.resolved = applyTheme(state.theme)
      },
    },
  ),
)
