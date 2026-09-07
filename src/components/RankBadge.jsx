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

/**
 * The scannable, non-hero form: a colored dot plus the label. Used in dense
 * list rows where the angular frame would be noise (spec §5.2).
 */
export function RankDot({ tier, className = '' }) {
  const t = tierOf(tier)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${t.bg}`} />
      <span className={`text-body-m ${t.text}`}>{t.label}</span>
    </span>
  )
}
