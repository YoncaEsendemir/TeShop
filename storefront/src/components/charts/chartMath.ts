/** Eksen için maksimumu kapsayan "yuvarlak" değer (1/2/5 × 10ⁿ). */
export function niceMax(values: number[]): number {
  const max = Math.max(0, ...values)
  if (max <= 0) return 0
  const pow = Math.pow(10, Math.floor(Math.log10(max)))
  const n = max / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

/** Değerleri piksel yüksekliğine ölçekler. */
export function barHeights(values: number[], h: number): number[] {
  const max = niceMax(values)
  if (max <= 0) return values.map(() => 0)
  return values.map((v) => Math.round((v / max) * h))
}

/** Donut dilimleri: her biri {offset, length} (0–1 kesir). */
export function donutSegments(values: number[]): { offset: number; length: number }[] {
  const total = values.reduce((a, b) => a + b, 0)
  if (total <= 0) return []
  let offset = 0
  return values.map((v) => {
    const length = v / total
    const seg = { offset, length }
    offset += length
    return seg
  })
}
