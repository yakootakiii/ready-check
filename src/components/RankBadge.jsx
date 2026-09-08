import AngularPanel from './AngularPanel'
import { tier as tierOf } from '../tiers'

/**
 * Tier ramp color + angular frame. Used on the profile, the leaderboard and
 * scrim rows. The label is always rendered - tier is never color alone (§8).
 */
export default function RankBadge({ tier, size = 'm', className = '' }) {
  const t = tierOf(tier)
  const pad = size === 's' ? 'px-2 py-0.5' : 'px-3 py-1'
  const type = size === 's' ? 'text-body-s' : 'text-body-m'

  return (
    <AngularPanel
      accent={tier}
      fill="bg-raised"
      className={`inline-block ${className}`}
      innerClassName={`flex items-center gap-2 ${pad}`}
    >
      <span aria-hidden="true" className={`h-2 w-2 rotate-45 ${t.bg}`} />
      <span className={`font-display font-semibold tracking-wide ${type} ${t.text}`}>
        {t.label}
      </span>
    </AngularPanel>
  )
}
