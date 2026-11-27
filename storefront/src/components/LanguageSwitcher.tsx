import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { LANGUAGES } from '../i18n/config'
import { cn } from '../lib/utils'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const qc = useQueryClient()
  const current = i18n.language

  function change(code: string) {
    i18n.changeLanguage(code)
    try {
      localStorage.setItem('teshop-lang', code)
    } catch {
      /* yoksay */
    }
    // Dil değişince ürün/kategori verisini yeni dilde çek
    qc.invalidateQueries()
  }

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Dil seçimi">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => change(lang.code)}
          aria-pressed={current === lang.code}
          className={cn(
            'rounded-md px-1.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-text',
            current === lang.code ? 'text-text' : 'text-text-subtle hover:text-text-muted',
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
