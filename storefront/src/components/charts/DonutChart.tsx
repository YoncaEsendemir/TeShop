import { donutSegments } from './chartMath'

export interface DonutDatum {
  label: string
  value: number
}

const OPACITIES = [1, 0.72, 0.52, 0.36, 0.24]

/**
 * Monokrom donut (bağımlılıksız SVG). Dilimler currentColor'ın farklı
 * opaklıklarıyla ayrışır; yanında lejant.
 */
export default function DonutChart({
  data,
  title,
}: {
  data: DonutDatum[]
  title?: string
}) {
  const segments = donutSegments(data.map((d) => d.value))
  const total = data.reduce((a, d) => a + d.value, 0)

  if (total <= 0) {
    return <p className="py-8 text-center text-sm text-text-subtle">Veri yok</p>
  }

  const r = 40
  const c = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-6 text-text">
      <svg viewBox="0 0 100 100" role="img" aria-label={title} className="h-32 w-32 shrink-0">
        {title && <title>{title}</title>}
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="14" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeOpacity={OPACITIES[i % OPACITIES.length]}
              strokeWidth="14"
              strokeDasharray={`${s.length * c} ${c}`}
              strokeDashoffset={-s.offset * c}
            />
          ))}
        </g>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-text-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-current"
              style={{ opacity: OPACITIES[i % OPACITIES.length] }}
            />
            <span className="text-text">{d.label}</span>
            <span className="text-text-subtle">· {d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
