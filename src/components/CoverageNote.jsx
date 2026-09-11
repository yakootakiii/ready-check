import { coverageOf } from '../data/games'
import { HudLabel } from './hud'

/**
 * How deep the model actually runs on the title being viewed.
 *
 * The product models one game properly and is calibrating on four more. A
 * platform that showed the same confident profile for all twenty-five would be
 * lying about the thing it is selling, so coverage is stated wherever an
 * intelligence surface is scoped to a title.
 */
export function CoverageBadge({ game, className = '' }) {
  const coverage = coverageOf(game)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-body-s ${coverage.text} ${
        coverage.key === 'planned' ? 'border-surface' : `${coverage.border}/50`
      } ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${coverage.bg}`} />
      {coverage.label}
    </span>
  )
}

/** The full note, for the top of a screen whose whole content depends on it. */
export default function CoverageNote({ game, className = '' }) {
  const coverage = coverageOf(game)
  if (coverage.key === 'full') return null

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-base border border-surface bg-surface px-4 py-2.5 ${className}`}
    >
      <HudLabel className={coverage.text}>{coverage.label}</HudLabel>
      <span className="min-w-0 flex-1 text-body-s text-ink-muted">
        {coverage.note} {game.name} is not the title the model was trained on first.
      </span>
    </div>
  )
}
