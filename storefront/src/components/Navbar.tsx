import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { fetchCategories } from '../services/api'
import { useCart } from '../store/cart'
import { cn } from '../lib/utils'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  const totalItems = useCart((s) => s.totalItems())
  const openCart = useCart((s) => s.openCart)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) {
      navigate(`/urunler?search=${encodeURIComponent(q)}`)
      setMobileOpen(false)
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm transition-colors hover:text-text',
      isActive ? 'text-text' : 'text-text-muted',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Mobil menü düğmesi */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-2 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text md:hidden"
          aria-label="Menü"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Wordmark */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-text"
        >
          Te<span className="text-text-muted">Shop</span>
        </Link>

        {/* Masaüstü kategori linkleri */}
        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <NavLink to="/urunler" className={navLinkClass} end>
              {t('nav.all')}
            </NavLink>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <NavLink to={`/kategori/${c.slug}`} className={navLinkClass}>
                {c.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sağ: arama + sepet */}
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden sm:block">
            <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5 focus-within:border-text-muted">
              <Search size={16} className="text-text-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('nav.search')}
                className="w-28 bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none lg:w-40"
              />
            </div>
          </form>

          <ThemeToggle />

          <LanguageSwitcher />

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
            aria-label={t('nav.cartLabel', { count: totalItems })}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-text">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobil açılır menü */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-border-subtle bg-surface md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <form onSubmit={submitSearch} className="mb-3">
                <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-bg px-3 py-2">
                  <Search size={16} className="text-text-subtle" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('nav.search')}
                    className="w-full bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none"
                  />
                </div>
              </form>
              <Link
                to="/urunler"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-2 py-2 text-text hover:bg-surface-2"
              >
                {t('nav.all')}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/kategori/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-2 py-2 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
