import { HudLabel, HudPanel } from './hud'
import { ArrowRight } from './icons'

/**
 * One thing the system worked out, stated in language a player can act on.
 *
 * The tone is the classification, not the decoration - and it is the same
 * three-way split the whole product uses: signal is something the model
 * learned, edge is an advantage you hold, ember is something to worry about.
 * A reader scanning a column of these gets the shape of their week from the
 * left-hand rules alone.
 *
 * Every insight carries its source. An unattributed claim about how an
 * opponent plays is exactly the thing this product is trying not to be.
 */

export const INSIGHT_TONES = {
  signal: { rule: 'bg-signal', text: 'text-signal', glow: 'signal' },
  edge: { rule: 'bg-edge', text: 'text-edge', glow: 'edge' },
  ember: { rule: 'bg-raised', text: 'text-ink-muted', glow: 'signal' },
  muted: { rule: 'bg-surface', text: 'text-ink-muted', glow: 'signal' },
}

export default function InsightCard({
  tone = 'signal',
  eyebrow,
  title,
  body,
  source,
  action,
  onAction,
  size = 'm',
  className = '',
}) {
  const t = INSIGHT_TONES[tone] ?? INSIGHT_TONES.signal
  const interactive = Boolean(onAction)

  return (
    <HudPanel
      as={interactive ? 'button' : 'div'}
      interactive={interactive}
      corners={false}
      glow={t.glow}
      onClick={onAction}
      className={`flex w-full gap-4 text-left ${size === 'l' ? 'p-6' : 'p-4'} ${className}`}
    >
      {/* The tone rule, not a coloured pill: it marks the row without
          competing with the sentence, which is the part worth reading. */}
      <span aria-hidden="true" className={`w-0.5 shrink-0 rounded-full ${t.rule}`} />

      <span className="min-w-0 flex-1">
        {eyebrow && <HudLabel className={t.text}>{eyebrow}</HudLabel>}
        <span
          className={`mt-1.5 block font-display font-semibold leading-snug text-ink ${
            size === 'l' ? 'text-display-m' : 'text-body-l'
          }`}
        >
          {title}
        </span>
        {body && <span className="mt-1.5 block text-body-m text-ink-muted">{body}</span>}
        {(source || action) && (
          <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {source && <span className="text-body-s text-ink-muted">{source}</span>}
            {action && (
              <span className={`flex items-center gap-1.5 text-body-s ${t.text}`}>
                {action}
                <ArrowRight />
              </span>
            )}
          </span>
        )}
      </span>
    </HudPanel>
  )
}

/**
 * The dense form: a bullet with a tone rule, for lists of tendencies inside a
 * panel that already has a heading.
 */
export function InsightBullet({ tone = 'signal', children, className = '' }) {
  const t = INSIGHT_TONES[tone] ?? INSIGHT_TONES.signal
  return (
    <li className={`flex gap-3 ${className}`}>
      <span aria-hidden="true" className={`mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 ${t.rule}`} />
      <span className="min-w-0 flex-1 text-body-m text-ink-muted">{children}</span>
    </li>
  )
}
