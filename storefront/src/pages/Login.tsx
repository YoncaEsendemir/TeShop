import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import Seo from '../components/Seo'

const input = 'w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-text placeholder:text-text-subtle focus:border-text-muted focus:outline-none'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useCustomerAuth((s) => s.setAuth)
  const [params] = useSearchParams()
  const verified = params.get('verified')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await login(email, password)
      setAuth(token, user)
      navigate('/hesabim')
    } catch {
      setError(t('auth.errLogin'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <Seo title={t('auth.loginTitle')} />
      <h1 className="mb-6 text-center font-display text-2xl font-bold text-text">{t('auth.loginTitle')}</h1>
      {verified === '1' && (
        <p className="mb-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{t('auth.verifiedOk')}</p>
      )}
      {verified === '0' && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{t('auth.verifiedFail')}</p>
      )}
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.password')}</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-text transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-text">
          {loading ? t('auth.submitting') : t('auth.login')}
        </button>
        <p className="text-center text-sm text-text-muted">
          {t('auth.noAccount')} <Link to="/kayit" className="text-text underline">{t('auth.register')}</Link>
        </p>
      </form>
    </div>
  )
}
