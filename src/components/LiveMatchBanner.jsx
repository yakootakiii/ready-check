import AngularPanel from './AngularPanel'
import { Button } from './ui'

/**
 * One of the three angular-cut moments (spec §3). The border pulses briefly
 * when the match goes live, then settles.
 */
export default function LiveMatchBanner({ match, onOpenComms, onViewBracket }) {
  return (
    <AngularPanel
      accent="signal"
      className="animate-live-pulse w-full"
      innerClassName="p-6"
      aria-label="Live match"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-body-s font-medium text-signal">
            <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-signal" />
            Live — {match.unitLabel}
          </div>
          <div className="mt-2 font-display text-display-l font-bold text-ink">
            vs. {match.sides[1]}
          </div>
        </div>

        <div className="flex items-end gap-8">
          <div>
            <div className="text-body-s text-ink-muted">Score</div>
            <div className="font-mono text-mono-l text-ink">
              {match.score[0]} — {match.score[1]}
            </div>
          </div>
          <div>
            <div className="text-body-s text-ink-muted">Clock</div>
            <div className="font-mono text-mono-l text-ink">{match.clock}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onViewBracket}>View bracket</Button>
        <Button onClick={onOpenComms}>Open comms</Button>
      </div>
    </AngularPanel>
  )
}
