import { tier as tierOf } from '../tiers'

const accentClass = (accent) => {
  if (accent === 'signal') return 'bg-signal'
  // Legacy 'ember' accent is remapped to a neutral raised plate so the
  // visual language remains the three-color system (signal / edge / base).
  if (accent === 'ember') return 'bg-raised'
  if (accent === 'line') return 'bg-surface'
  return tierOf(accent).bg
}

/**
 * The single reusable home of the angular clip-path (spec §3).
 *
 * The cut belongs to exactly three places: the live-match banner, the
 * rank-badge frame, and the readiness-screen primary CTA. Keeping the
 * clip-path here means it stays a deliberate signal instead of spreading into
 * every card. Do not put `angular-cut` on elements outside this component.
 *
 * Structure is a 1px accent-colored plate with a clipped surface face on top,
 * which reads as a hairline frame with one beveled corner.
 *
 * @param accent 'signal' | 'ember' | 'line' | a rank-tier key
 * @param fill   background class for the inner face (default `bg-surface`)
 */
export default function AngularPanel({
  as: Tag = 'div',
  accent = 'signal',
  fill = 'bg-surface',
  className = '',
  innerClassName = '',
  children,
  ...rest
}) {
  return (
    <Tag className={`angular-cut p-px ${accentClass(accent)} ${className}`} {...rest}>
      <div className={`angular-cut h-full w-full ${fill} ${innerClassName}`}>{children}</div>
    </Tag>
  )
}
