import { niceMax } from './chartMath'

export interface BarDatum {
  label: string
  value: number
}

/**
 * Basit dikey bar grafik — HTML/CSS (SVG distorsiyonu yok). currentColor ile
 * temalı; taban çizgisi + altta net etiketler, tam değer tooltip'te (title).
 */
export default function BarChart({
  data,
  height = 150,
  formatValue = (v: number) => String(v),
  title,
}: {
  data: BarDatum[]
  height?: number
  formatValue?: (v: number) => string
  title?: string
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-subtle">Veri yok</p>
  }

  const max = niceMax(data.map((d) => d.value)) || 1

  return (
    <div role="img" aria-label={title}>
      <div
        className="flex items-end gap-2 border-b border-border-subtle text-text"
        style={{ height }}
      >
        {data.map((d, i) => (
          <div key={i} className="flex min-w-0 flex-1 justify-center">
            <div
              className="w-full max-w-12 rounded-t bg-current opacity-80 transition-opacity hover:opacity-100"
              style={{ height: Math.max((d.value / max) * (height - 4), 2) }}
              title={`${d.label}: ${formatValue(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <span
            key={i}
            className="min-w-0 flex-1 truncate text-center text-[11px] text-text-muted"
            title={d.label}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
