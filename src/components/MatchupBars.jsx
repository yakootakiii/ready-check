import { HudLabel } from './hud'

/**
 * Two Competitive DNA profiles read against each other, one dimension per row.
 *
 * The bars grow outward from a shared centre line rather than from a left
 * edge, because the quantity being read is the *gap*: with a common baseline
 * the eye has to compare two bar lengths, while from a centre line the
 * asymmetry is the answer. Your side is always on the left in signal, theirs
 * always on the right in ember - the same pairing every matchup surface uses,
 * so the colour alone says who is who before a label is read.
 *
 * Direction is not left to subtraction. Role reliance is the one dimension
 * where the higher number is the worse one, so `advantage` is computed by the
 * matchup model and passed in already signed.
 */

const FAVOUR = {
  you: { text: 'text-signal', label: 'You' },
  them: { text: 'text-ink-muted', label: 'Them' },
  even: { text: 'text-ink-muted', label: 'Even' },
}

export default function MatchupBars({
  dimensions,
  youLabel = 'You',
  themLabel = 'Them',
  className = '',
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <HudLabel className="text-signal">{youLabel}</HudLabel>
        <HudLabel className="text-ink-muted">Advantage</HudLabel>
        <HudLabel className="text-ink-muted">{themLabel}</HudLabel>
      </div>

      <ul className="space-y-3.5 sm:space-y-2.5">
        {dimensions.map((dim, i) => {
          const favour = FAVOUR[dim.favour]
          const gap = Math.round(dim.advantage)
          return (
            <li key={dim.key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {/* Narrow widths get the label and the gap on their own line
                  above the bar; from `sm` up the wrapper becomes `contents` and
                  its two children drop into the single row, ordered after the
                  numbers. Reordering rather than hiding matters here: a row of
                  two numbers and a bar with no dimension name attached is
                  unreadable, and this is the product's flagship screen. */}
              <span className="order-1 flex w-full items-baseline justify-between gap-3 sm:contents">
                <span className="min-w-0 truncate text-body-s text-ink-muted sm:order-4 sm:w-28 sm:shrink-0 sm:text-right">
                  {dim.label}
                </span>
                <span
                  className={`shrink-0 font-mono text-body-s ${favour.text} sm:order-5 sm:w-11 sm:text-right`}
                >
                  {gap > 0 ? '+' : gap < 0 ? '−' : '±'}
                  {Math.abs(gap)}
                </span>
              </span>

              <span className="order-2 w-9 shrink-0 text-right font-mono text-mono-m text-ink sm:order-1">
                {dim.you}
              </span>

              <div className="order-3 flex min-w-0 flex-1 items-center sm:order-2">
                <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-l-full bg-raised">
                  <div
                    className="animate-bar-left h-full rounded-l-full bg-signal"
                    style={{ width: `${dim.you}%`, animationDelay: `${100 + i * 45}ms` }}
                  />
                </div>
                <span aria-hidden="true" className="h-4 w-px shrink-0 bg-surface" />
                <div className="flex h-2 flex-1 overflow-hidden rounded-r-full bg-raised">
                  <div
                    className="animate-bar-right h-full rounded-r-full bg-ember"
                    style={{ width: `${dim.them}%`, animationDelay: `${100 + i * 45}ms` }}
                  />
                </div>
              </div>

              <span className="order-4 w-9 shrink-0 font-mono text-mono-m text-ink sm:order-3">
                {dim.them}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * The single-row form, for a card that has space for one dimension rather than
 * twelve. Used on opponent tiles and fixture rows.
 */
export function MatchupMeter({ dimension, className = '' }) {
  const favour = FAVOUR[dimension.favour]
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-body-s text-ink-muted">{dimension.label}</span>
        <span className={`font-mono text-body-s ${favour.text}`}>{favour.label}</span>
      </div>
      <div className="mt-1.5 flex items-center">
        <div className="flex h-1.5 flex-1 justify-end overflow-hidden rounded-l-full bg-raised">
          <div className="h-full rounded-l-full bg-signal" style={{ width: `${dimension.you}%` }} />
        </div>
        <span aria-hidden="true" className="h-3 w-px shrink-0 bg-surface" />
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-r-full bg-raised">
          <div className="h-full rounded-r-full bg-ember" style={{ width: `${dimension.them}%` }} />
        </div>
      </div>
    </div>
  )
}
