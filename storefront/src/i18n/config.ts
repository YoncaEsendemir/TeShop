import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from './locales/tr.json'
import en from './locales/en.json'
import de from './locales/de.json'

export const LANGUAGES = [
  { code: 'tr', label: 'TR' },
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
] as const

// Kayıtlı dili oku (yoksa TR)
let saved = 'tr'
try {
  saved = localStorage.getItem('teshop-lang') ?? 'tr'
} catch {
  /* yoksay */
}

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
  },
  lng: saved,
  fallbackLng: 'tr',
  interpolation: { escapeValue: false }, // React zaten kaçışlıyor
})

export default i18n
