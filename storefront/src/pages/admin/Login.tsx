import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { adminLogin } from '../../services/adminApi'
import { useAuth } from '../../store/auth'
import Seo from '../../components/Seo'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setAuth = useAuth((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token, user } = await adminLogin(email, password)
      setAuth(token, user)
      navigate('/admin')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      setError(status === 403 ? t('admin.login.errForbidden') : t('admin.login.errAuth'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Seo title={t('admin.nav.subtitle')} />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
            <Lock size={20} className="text-text" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text">
            Te<span className="text-text-muted">Shop</span> Panel
          </h1>
          <p className="mt-1 text-sm text-text-muted">{t('admin.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-text-muted">
              {t('admin.login.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2.5 text-text placeholder:text-text-subtle focus:border-text-muted focus:outline-none"
              placeholder="admin@teshop.test"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-text-muted">
              {t('admin.login.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-bg px-3 py-2.5 text-text placeholder:text-text-subtle focus:border-text-muted focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-text transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-text"
          >
            {loading ? t('admin.login.loading') : t('admin.login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
