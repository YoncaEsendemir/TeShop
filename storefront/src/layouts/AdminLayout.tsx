import { NavLink, Outlet, useNavigate, Navigate, Link } from 'react-router-dom'
import { LayoutDashboard, FolderTree, Package, LogOut, Store } from 'lucide-react'
import { useAuth } from '../store/auth'
import { adminLogout } from '../services/adminApi'
import { cn } from '../lib/utils'
import ThemeToggle from '../components/ThemeToggle'

const NAV = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree, end: false },
  { to: '/admin/urunler', label: 'Ürünler', icon: Package, end: false },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()

  // Korumalı: token yoksa girişe yönlendir
  if (!token) return <Navigate to="/admin/login" replace />

  async function handleLogout() {
    try {
      await adminLogout()
    } catch {
      // token zaten geçersiz olabilir, önemli değil
    }
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface md:flex">
        <div className="px-6 py-5">
          <Link to="/admin" className="font-display text-xl font-bold text-text">
            Te<span className="text-text-muted">Shop</span>
          </Link>
          <p className="mt-0.5 text-xs text-text-subtle">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-text',
                  isActive
                    ? 'bg-surface-2 text-text'
                    : 'text-text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <Store size={18} />
            Siteye Dön
          </a>
        </div>
      </aside>

      {/* İçerik */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-surface px-4 sm:px-6">
          {/* Mobil nav */}
          <nav className="flex gap-1 md:hidden">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg p-2 transition-colors',
                    isActive ? 'bg-surface-2 text-text' : 'text-text-muted',
                  )
                }
                aria-label={label}
              >
                <Icon size={20} />
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <span className="hidden text-sm text-text-muted sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-1.5 text-sm text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
            >
              <LogOut size={16} />
              Çıkış
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
