import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const STORAGE_KEY = 'teshop-cookie-consent'

type Consent = 'accepted' | 'rejected'

/**
 * KVKK çerez banner'ı.
 * Zorunlu olmayan çerezler VARSAYILAN olarak reddedilir (kullanıcı seçene kadar gösterilir).
 * Seçim localStorage'da saklanır.
 */
export default function CookieBanner() {
  const reduce = useReducedMotion()
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== 'accepted' && saved !== 'rejected') setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function decide(choice: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* localStorage yoksa yoksay */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4"
          role="dialog"
          aria-label="Çerez bildirimi"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-lg sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-text-muted">
              {t('cookie.text')}{' '}
              <Link to="/cerez-politikasi" className="text-text underline">
                {t('cookie.policy')}
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide('rejected')}
                className="rounded-full border border-border-subtle px-5 py-2.5 text-sm text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-text"
              >
                {t('cookie.reject')}
              </button>
              <button
                type="button"
                onClick={() => decide('accepted')}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-text transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-text"
              >
                {t('cookie.accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
