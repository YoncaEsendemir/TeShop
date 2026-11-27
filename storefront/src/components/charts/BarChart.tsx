import { niceMax } from './chartMath'

export interface BarDatum {
  label: string
  value: number
}

/**
 * Basit dikey bar grafik — HTML/CSS (SVG distorsiyonu yok). currentColor ile
 * temalı; etiketler kırpılır, tam değer tooltip'te (title).
 */
export default function BarChart({
  data,
  height = 160,
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
  const barArea = height - 22 // etiket için altta pay

  return (
    <div className="flex items-end gap-1.5 text-text" style={{ height }} role="img" aria-label={title}>
      {data.map((d, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full max-w-10 rounded-t bg-current opacity-85"
            style={{ height: Math.max((d.value / max) * barArea, 2) }}
            title={`${d.label}: ${formatValue(d.value)}`}
          />
          <span className="w-full truncate text-center text-[10px] text-text-subtle" title={d.label}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
