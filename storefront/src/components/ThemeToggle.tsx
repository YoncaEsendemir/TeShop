import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../store/theme'

/** Açık/koyu tema geçişi (tek dokunuş). 3'lü seçim (system dahil) Ayarlar'da. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { resolved, setTheme } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
      className={
        'rounded-full p-2 text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-text ' +
        className
      }
    >
      {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
