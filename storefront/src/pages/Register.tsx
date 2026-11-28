import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { register } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import Seo from '../components/Seo'

const input = 'w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-text placeholder:text-text-subtle focus:border-text-muted focus:outline-none'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useCustomerAuth((s) => s.setAuth)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await register(form)
      setAuth(token, user)
      navigate('/hesabim')
    } catch {
      setError(t('auth.errRegister'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <Seo title={t('auth.registerTitle')} />
      <h1 className="mb-6 text-center font-display text-2xl font-bold text-text">{t('auth.registerTitle')}</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border-subtle bg-surface p-6">
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.name')}</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.email')}</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.password')}</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-muted">{t('auth.passwordConfirm')}</label>
          <input type="password" required value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} className={input} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-text transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-text">
          {loading ? t('auth.submitting') : t('auth.register')}
        </button>
        <p className="text-center text-sm text-text-muted">
          {t('auth.haveAccount')} <Link to="/giris" className="text-text underline">{t('auth.login')}</Link>
        </p>
      </form>
    </div>
  )
}
