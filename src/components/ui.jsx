// Shared controls. The panel/header primitives that used to live here have
// been superseded by the HUD set in hud.jsx, which every screen now uses; what
// remains is the button and the quiet empty state, which both aesthetics share.

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-base px-4 py-2 text-body-m ' +
  'font-medium transition-all duration-200 ease-[cubic-bezier(0.2,0,0.2,1)] ' +
  'disabled:opacity-40 disabled:pointer-events-none btn-press'

// `spin-ring` (index.css) sweeps a lit segment once around the outline on
// hover or keyboard focus. Ghost buttons sit inline as text-style controls and
// have no resting shape, so they are left out - a ring appearing around a word
// reads as noise rather than affordance.
const VARIANTS = {
  primary:
    'spin-ring bg-ember text-base shadow-[0_0_0_1px_rgba(231,255,112,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-12px_rgba(231,255,112,0.8)]',
  secondary:
    'spin-ring border border-edge bg-raised text-ink hover:-translate-y-0.5 hover:border-signal hover:bg-[rgba(123,140,255,0.12)] hover:text-ink hover:shadow-[0_10px_18px_-12px_rgba(93,109,255,0.9)]',
  ghost: 'text-ink-muted hover:-translate-y-0.5 hover:bg-raised hover:text-ink',
}

// The lit segment has to read against the button's own fill.
const SPIN_COLOR = {
  primary: 'var(--color-base)',
  secondary: 'var(--color-edge)',
}

export function Button({
  variant = 'secondary',
  className = '',
  as: Tag = 'button',
  style,
  loading = false,
  ...rest
}) {
  const type = Tag === 'button' ? { type: 'button' } : {}
  return (
    <Tag
      {...type}
      className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`}
      style={SPIN_COLOR[variant] ? { '--spin-color': SPIN_COLOR[variant], ...style } : style}
      aria-busy={loading || undefined}
      {...rest}
    />
  )
}

export function ButtonContent({ children, loading }) {
  return (
    <>
      {loading && <span className="spinner" aria-hidden="true" />}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>{children}</span>
    </>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card text-center">
      <p className="text-body-m text-ink">{title}</p>
      {hint && <p className="mt-1 text-body-s text-ink-muted">{hint}</p>}
    </div>
  )
}

export function Card({ children, className = '', quiet = false, ...rest }) {
  return (
    <div className={`card ${quiet ? 'card--quiet' : ''} ${className}`} {...rest}>
      {children}
    </div>
  )
}
