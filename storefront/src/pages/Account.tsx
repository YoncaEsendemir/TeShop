import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { logout as apiLogout, resendVerification } from '../services/customerApi'
import { useCustomerAuth } from '../store/customerAuth'
import Seo from '../components/Seo'

export default function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, logout } = useCustomerAuth()
  const [sent, setSent] = useState(false)

  if (!token) return <Navigate to="/giris" replace />

  async function handleLogout() {
    try { await apiLogout() } catch { /* yoksay */ }
    logout()
    navigate('/')
  }

  async function resend() {
    try { await resendVerification(); setSent(true) } catch { /* yoksay */ }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={t('auth.account')} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">{t('auth.account')}</h1>
        <button onClick={handleLogout} className="rounded-full border border-border-subtle px-4 py-2 text-sm text-text-muted hover:text-text">
          {t('auth.logout')}
        </button>
      </div>

      {user && !user.email_verified && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {t('auth.notVerifiedBanner')}{' '}
          {sent ? (
            <span className="text-success">{t('auth.resendSent')}</span>
          ) : (
            <button onClick={resend} className="underline">{t('auth.resend')}</button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <h2 className="mb-3 font-medium text-text">{t('auth.profile')}</h2>
        <p className="text-sm text-text-muted">{user?.name}</p>
        <p className="text-sm text-text-muted">{user?.email}</p>
      </div>

      {/* Adresler ve sipariş geçmişi sonraki adımda eklenecek */}
    </div>
  )
}
