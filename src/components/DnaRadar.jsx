/**
 * A Competitive DNA profile, drawn as a shape.
 *
 * This is the component the whole product leans on, so it earns a note: a
 * radar is the right form here for one specific reason. The thing being read
 * is not any single dimension but the *silhouette* - whether a competitor is
 * spiky or round, front-loaded or back-loaded, and how their outline sits
 * against someone else's. Twelve bars can be compared one at a time; two
 * overlaid outlines can be compared at a glance, which is what a player has
 * time for before a match.
 *
 * It never appears alone. A radar cannot be read to a precise value and should
 * not pretend otherwise, so every screen that uses one puts the numbered
 * dimension list beside it. That list is also what carries the profile to a
 * screen reader - the SVG itself is decorative by the time it is drawn twice.
 *
 * Two series maximum, on purpose. Three outlines on one polar grid stop being
 * a comparison and start being a plate of spaghetti.
 */

const TONE = {
  signal: { stroke: 'var(--color-signal)', fill: 'var(--color-signal)' },
  ember: { stroke: 'var(--color-ember)', fill: 'var(--color-ember)' },
  edge: { stroke: 'var(--color-edge)', fill: 'var(--color-edge)' },
  muted: { stroke: 'var(--color-ink-muted)', fill: 'var(--color-ink-muted)' },
}

const RINGS = [0.25, 0.5, 0.75, 1]

/** Polar to cartesian, with 0 at the top rather than at three o'clock. */
function point(cx, cy, radius, index, count) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]
}

const polygon = (values, dimensions, cx, cy, radius) =>
  dimensions
    .map((dim, i) => {
      const value = Math.max(0, Math.min(100, values[dim.key] ?? 0))
      const [x, y] = point(cx, cy, (value / 100) * radius, i, dimensions.length)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

export default function DnaRadar({
  dimensions,
  series,
  size = 300,
  labels = 'short',
  className = '',
}) {
  // Labels need room outside the plot, so the grid shrinks rather than the
  // labels being clipped by the viewBox.
  const pad = labels === 'none' ? 8 : labels === 'full' ? 62 : 26
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - pad

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      className={`overflow-visible ${className}`}
      style={{ maxWidth: size }}
      aria-hidden="true"
      focusable="false"
    >
      {/* Grid: rings first, then spokes, both quiet enough to read as
          measurement rather than as content. */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={dimensions
            .map((_, i) => point(cx, cy, radius * ring, i, dimensions.length).map((n) => n.toFixed(1)).join(','))
            .join(' ')}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={ring === 1 ? 1.25 : 1}
          opacity={ring === 1 ? 0.9 : 0.5}
        />
      ))}

      {dimensions.map((dim, i) => {
        const [x, y] = point(cx, cy, radius, i, dimensions.length)
        return (
          <line
            key={dim.key}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--color-line)"
            strokeWidth="1"
            opacity="0.45"
          />
        )
      })}

      {series.map((entry, seriesIndex) => {
        const tone = TONE[entry.tone] ?? TONE.signal
        const points = polygon(entry.values, dimensions, cx, cy, radius)
        const ghost = entry.ghost

        return (
          <g key={entry.key}>
            <polygon
              points={points}
              fill={tone.fill}
              opacity={ghost ? 0.06 : 0.16}
              className="animate-fade-in"
              style={{
                '--fade-to': ghost ? 0.06 : 0.16,
                animationDelay: `${seriesIndex * 160 + 240}ms`,
              }}
            />
            {/* `pathLength` normalises the outline to 1000 units whatever the
                radar's real size, so one dash length in CSS traces every
                instance of this component correctly. */}
            <polygon
              points={points}
              fill="none"
              stroke={tone.stroke}
              strokeWidth={ghost ? 1.25 : 2}
              strokeDasharray={ghost ? '4 4' : undefined}
              strokeLinejoin="round"
              pathLength={ghost ? undefined : 1000}
              className={ghost ? undefined : 'animate-trace'}
              style={ghost ? undefined : { '--trace-length': 1000, animationDelay: `${seriesIndex * 160}ms` }}
            />
            {!ghost &&
              dimensions.map((dim, i) => {
                const value = Math.max(0, Math.min(100, entry.values[dim.key] ?? 0))
                const [x, y] = point(cx, cy, (value / 100) * radius, i, dimensions.length)
                return (
                  <circle
                    key={dim.key}
                    cx={x}
                    cy={y}
                    r="2.75"
                    fill="var(--color-base)"
                    stroke={tone.stroke}
                    strokeWidth="1.75"
                    className="animate-fade-in"
                    style={{ animationDelay: `${700 + i * 30}ms` }}
                  />
                )
              })}
          </g>
        )
      })}

      {labels !== 'none' &&
        dimensions.map((dim, i) => {
          const [x, y] = point(cx, cy, radius + (labels === 'full' ? 20 : 13), i, dimensions.length)
          // Anchor from the point's side of the circle, so labels sit outside
          // the plot instead of overlapping the outline they describe.
          const anchor = x > cx + 4 ? 'start' : x < cx - 4 ? 'end' : 'middle'
          return (
            <text
              key={dim.key}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="var(--color-ink-muted)"
              className={labels === 'full' ? 'font-body text-[11px]' : 'font-mono text-[10px]'}
            >
              {labels === 'full' ? dim.label : dim.short}
            </text>
          )
        })}
    </svg>
  )
}

/** The key beneath a radar. Two series need naming; one does not. */
export function RadarLegend({ series, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {series.map((entry) => {
        const tone = TONE[entry.tone] ?? TONE.signal
        return (
          <span key={entry.key} className="flex items-center gap-2 text-body-s text-ink-muted">
            <span
              aria-hidden="true"
              className="h-0.5 w-5 rounded-full"
              style={{
                backgroundColor: tone.stroke,
                opacity: entry.ghost ? 0.5 : 1,
              }}
            />
            {entry.label}
          </span>
        )
      })}
    </div>
  )
}
