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
  them: { text: 'text-ember', label: 'Them' },
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
        <HudLabel className="text-ember">{themLabel}</HudLabel>
      </div>

      <ul className="space-y-2.5">
        {dimensions.map((dim, i) => {
          const favour = FAVOUR[dim.favour]
          const gap = Math.round(dim.advantage)
          return (
            <li key={dim.key} className="flex items-center gap-3">
              <span className="w-9 shrink-0 text-right font-mono text-mono-m text-ink">
                {dim.you}
              </span>

              <div className="flex min-w-0 flex-1 items-center">
                <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-l-full bg-raised">
                  <div
                    className="animate-bar-left h-full rounded-l-full bg-signal"
                    style={{ width: `${dim.you}%`, animationDelay: `${100 + i * 45}ms` }}
                  />
                </div>
                <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line" />
                <div className="flex h-2 flex-1 overflow-hidden rounded-r-full bg-raised">
                  <div
                    className="animate-bar-right h-full rounded-r-full bg-ember"
                    style={{ width: `${dim.them}%`, animationDelay: `${100 + i * 45}ms` }}
                  />
                </div>
              </div>

              <span className="w-9 shrink-0 font-mono text-mono-m text-ink">{dim.them}</span>

              <span className="hidden w-28 shrink-0 text-right sm:block">
                <span className="text-body-s text-ink-muted">{dim.label}</span>
              </span>
              <span className={`w-11 shrink-0 text-right font-mono text-body-s ${favour.text}`}>
                {gap > 0 ? '+' : gap < 0 ? '−' : '±'}
                {Math.abs(gap)}
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
        <span aria-hidden="true" className="h-3 w-px shrink-0 bg-line" />
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-r-full bg-raised">
          <div className="h-full rounded-r-full bg-ember" style={{ width: `${dimension.them}%` }} />
        </div>
      </div>
    </div>
  )
}
