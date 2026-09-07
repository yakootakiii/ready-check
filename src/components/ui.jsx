// Shared controls. The panel/header primitives that used to live here have
// been superseded by the HUD set in hud.jsx, which every screen now uses; what
// remains is the button and the quiet empty state, which both aesthetics share.

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-base px-4 py-2 text-body-m ' +
  'font-medium transition-colors duration-100 disabled:opacity-40 ' +
  'disabled:pointer-events-none'

// `spin-ring` (index.css) sweeps a lit segment once around the outline on
// hover or keyboard focus. Ghost buttons sit inline as text-style controls and
// have no resting shape, so they are left out - a ring appearing around a word
// reads as noise rather than affordance.
const VARIANTS = {
  primary: 'spin-ring bg-signal text-base hover:bg-signal/85',
  secondary: 'spin-ring border border-line bg-raised text-ink hover:bg-line',
  ghost: 'text-ink-muted hover:bg-raised hover:text-ink',
}

// The lit segment has to read against the button's own fill.
const SPIN_COLOR = {
  primary: 'var(--color-ink)',
  secondary: 'var(--color-signal)',
}

export function Button({
  variant = 'secondary',
  className = '',
  as: Tag = 'button',
  style,
  ...rest
}) {
  const type = Tag === 'button' ? { type: 'button' } : {}
  return (
    <Tag
      {...type}
      className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}
      style={SPIN_COLOR[variant] ? { '--spin-color': SPIN_COLOR[variant], ...style } : style}
      {...rest}
    />
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-base border border-dashed border-line px-6 py-10 text-center">
      <p className="text-body-m text-ink">{title}</p>
      {hint && <p className="mt-1 text-body-s text-ink-muted">{hint}</p>}
    </div>
  )
}
