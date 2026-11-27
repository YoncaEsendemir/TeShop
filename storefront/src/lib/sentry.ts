import * as Sentry from '@sentry/react'

/**
 * Sentry başlatma — yalnızca VITE_SENTRY_DSN tanımlıysa.
 * DSN'i Yonca kendi Sentry hesabından alıp .env'e ekleyecek:
 *   VITE_SENTRY_DSN=https://....ingest.sentry.io/...
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return // DSN yoksa Sentry devre dışı (geliştirmede sorun değil)

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
  })
}
