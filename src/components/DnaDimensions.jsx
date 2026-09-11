import { INVERTED_DIMENSIONS } from '../data/dna'
import { HudLabel } from './hud'

/**
 * The numbered read of a Competitive DNA profile.
 *
 * Always shipped alongside a radar rather than instead of it: the radar gives
 * the shape, this gives the values, and this is the one a screen reader gets.
 * Each row carries what the dimension means, because a number called
 * "Adaptability: 74" is only useful to someone who already knows what the
 * model counted.
 */

const toneFor = (value, key) => {
  const strength = INVERTED_DIMENSIONS.has(key) ? 100 - value : value
  if (strength >= 78) return { text: 'text-edge', bar: 'bg-edge' }
  if (strength >= 55) return { text: 'text-ink', bar: 'bg-signal' }
  if (strength >= 38) return { text: 'text-ink-muted', bar: 'bg-raised' }
  return { text: 'text-ink-muted', bar: 'bg-raised' }
}

/** A signed change chip. Neutral below the model's own noise floor. */
export function DeltaChip({ delta, className = '' }) {
  if (delta === undefined || delta === null) return null
  const quiet = Math.abs(delta) < 2
  const tone = quiet ? 'text-ink-muted' : delta > 0 ? 'text-edge' : 'text-ink-muted'
  return (
    <span className={`font-mono text-body-s ${tone} ${className}`}>
      {delta > 0 ? '+' : delta < 0 ? '−' : '±'}
      {Math.abs(delta)}
    </span>
  )
}

export default function DnaDimensions({
  dna,
  dimensions,
  deltas,
  showBlurb = false,
  className = '',
}) {
  const rows = dimensions ?? dna.ordered

  return (
    <ul className={`space-y-3 ${className}`}>
      {rows.map((dim, i) => {
        const value = dim.value ?? dna.values[dim.key]
        const tone = toneFor(value, dim.key)
        const delta = deltas?.[dim.key]

        return (
          <li key={dim.key}>
            <div className="flex items-baseline gap-3">
              <span className="min-w-0 flex-1 truncate text-body-m text-ink">{dim.label}</span>
              {delta !== undefined && <DeltaChip delta={delta} />}
              <span className={`w-8 text-right font-mono text-mono-m ${tone.text}`}>{value}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-raised">
              <div
                className={`animate-bar h-full rounded-full ${tone.bar}`}
                style={{ width: `${value}%`, animationDelay: `${120 + i * 55}ms` }}
              />
            </div>
            {showBlurb && dim.blurb && (
              <p className="mt-1.5 text-body-s text-ink-muted">{dim.blurb}</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The compact form: the six core dimensions as a strip. Used where a profile
 * has to be legible inside a card - a candidate row, an opponent tile - and
 * there is no room for a radar.
 */
export function DnaStrip({ dna, className = '' }) {
  const core = dna.ordered.filter((d) => d.core)
  return (
    <div className={`grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6 ${className}`}>
      {core.map((dim) => {
        const tone = toneFor(dim.value, dim.key)
        return (
          <div key={dim.key}>
            <HudLabel className="truncate">{dim.short}</HudLabel>
            <div className={`mt-0.5 font-mono text-mono-m ${tone.text}`}>{dim.value}</div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-raised">
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${dim.value}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
