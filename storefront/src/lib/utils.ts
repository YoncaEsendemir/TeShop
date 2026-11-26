// Küçük yardımcılar

/** TL fiyat biçimi: 299.90 -> "299,90 ₺" */
export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return (
    new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + ' ₺'
  )
}

/** Görsel tam URL'si (API path -> erişilebilir URL) */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000/storage'
  return `${base}/${path}`
}

/** Koşullu className birleştirici */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
