import { useTranslation } from 'react-i18next'
import { useReducedMotion } from 'framer-motion'

/**
 * Header üstü ince duyuru bandı. Üç kısa mesaj kesintisiz kayar (marquee);
 * hareket azaltma seçildiğinde statik, ortalı tek satıra düşer.
 */
export default function AnnouncementBar() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const items = [t('announce.shipping'), t('announce.season'), t('announce.secure')]

  const Dot = () => <span className="px-4 text-text-subtle">·</span>

  return (
    <div
      role="region"
      aria-label={t('announce.shipping')}
      className="label-caps overflow-hidden border-b border-border-subtle bg-surface-2 py-2 text-text-muted"
    >
      {reduce ? (
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 px-4 text-center">
          {items.map((it, i) => (
            <span key={i} className="inline-flex items-center">
              {i > 0 && <Dot />}
              {it}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {/* İçerik iki kez: dikişsiz döngü için */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
              {items.map((it, i) => (
                <span key={i} className="inline-flex items-center">
                  <Dot />
                  {it}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
