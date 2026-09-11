// The HUD primitives every screen is built from. `Button` and `EmptyState`
// still live in ui.jsx; everything panel- or header-shaped is here.
import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks'

/** All-caps HUD eyebrow. */
export function HudLabel({ className = '', children }) {
  return <div className={`hud-label text-ink-muted opacity-95 ${className}`}>{children}</div>
}

/** A pulsing live indicator. `currentColor` drives the pulse ring. */
export function LivePip({ className = 'text-ember' }) {
  return (
    <span
      aria-hidden="true"
      className={`animate-pip inline-block h-2 w-2 rounded-full bg-current ${className}`}
    />
  )
}

/**
 * The bold card: translucent so the polygon backdrop reads through it, with
 * broadcast corner ticks and a lift-and-glow on hover.
 */
export function HudPanel({
  as: Tag = 'div',
  corners = true,
  glow = 'signal',
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  const glowClass =
    glow === 'ember'
      ? 'hover:border-ember hover:shadow-glow-ember'
      : glow === 'edge'
        ? 'hover:border-edge hover:shadow-glow-edge'
        : 'hover:border-signal hover:shadow-glow-signal'

  return (
    <Tag
      className={[
        'relative rounded-base border border-surface bg-surface',
        'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025),inset_0_1px_0_rgba(255,255,255,0.02)]',
        'transition-[transform,border-color,box-shadow] duration-200',
        corners ? 'hud-corners' : '',
        interactive ? `sheen -translate-y-0 hover:-translate-y-1 ${glowClass}` : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** A number that eases up once its section is on screen. */
export function AnimatedNumber({ value, decimals = 0, suffix = '', run = true, className = '' }) {
  const current = useCountUp(value, { run })
  return (
    <span className={`tabular-nums ${className}`}>
      {current.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** A rank/score bar that grows from zero when revealed. */
export function StatBar({ pct, color = 'bg-signal', delay = 0 }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
      <div
        className={`animate-bar h-full rounded-full ${color}`}
        style={{ width: `${pct}%`, animationDelay: `${delay}ms` }}
      />
    </div>
  )
}

/**
 * An infinite horizontal ticker. The track holds the children twice and slides
 * by exactly half its width, so the loop is seamless. Pauses on hover.
 */
export function Ticker({ children, className = '' }) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div className="animate-marquee flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
      {/* Fade the ends so items enter and leave instead of popping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-base to-transparent" />
    </div>
  )
}

/** Counts down to a fixed offset from mount, formatted as d/h/m/s blocks. */
export function Countdown({ seconds: initial }) {
  const [left, setLeft] = useState(initial)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(ref.current)
  }, [])

  const d = Math.floor(left / 86400)
  const h = Math.floor((left % 86400) / 3600)
  const m = Math.floor((left % 3600) / 60)
  const s = left % 60

  const blocks = [
    { label: 'Days', value: d },
    { label: 'Hrs', value: h },
    { label: 'Min', value: m },
    { label: 'Sec', value: s },
  ]

  return (
    <div className="flex gap-2">
      {blocks.map((block) => (
        <div
          key={block.label}
          className="min-w-14 rounded-base border border-surface bg-base px-2 py-1.5 text-center"
        >
          <div className="font-mono text-mono-l text-ink">
            {String(block.value).padStart(2, '0')}
          </div>
          <div className="hud-label text-ink-muted">{block.label}</div>
        </div>
      ))}
    </div>
  )
}

/**
 * The standard page opener across every screen: HUD eyebrow, display title,
 * optional right-hand action. Replaces `PageHeader` from ui.jsx on screens
 * that carry the hub aesthetic.
 */
export function HudPageHeader({ eyebrow, title, subtitle, action, className = '' }) {
  return (
    <header className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <HudLabel className="text-signal">{eyebrow}</HudLabel>}
        <h1 className="mt-1 font-display text-display-l font-bold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-body-m text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

/** Section opener inside a page - same rhythm as the header, one step down. */
export function HudSection({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <HudLabel className="text-signal">{eyebrow}</HudLabel>}
        <h2 className="mt-1 font-display text-display-m font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/**
 * A 270° radial readout. The arc and the number ease up together, so the
 * score arriving reads as one gesture rather than two.
 */
export function Gauge({ value, max = 100, size = 168, tone = 'signal', run = true, children }) {
  const eased = useCountUp(value, { run, duration: 1100 })
  const stroke = 12
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const arc = circumference * 0.75
  const pct = Math.min(Math.max(eased / max, 0), 1)
  const color = tone === 'ember' ? 'var(--color-ember)' : 'var(--color-signal)'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-raised)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc * pct} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

/**
 * Win/loss chips for a recent-form readout.
 *
 * A win is `edge`, not `signal`. Signal means "you" everywhere else in the
 * product, and a form row is read against opponents as often as against your
 * own team — colouring a win as "you" would make an opponent's win streak read
 * as yours.
 */
export function FormRow({ form, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {form.map((result, i) => (
        <span
          key={i}
          title={result === 'w' ? 'Win' : 'Loss'}
          className={`flex h-5 w-5 items-center justify-center rounded-[2px] font-mono text-body-s ${
            result === 'w' ? 'bg-edge text-ink' : 'bg-raised text-ink-muted'
          }`}
        >
          {result.toUpperCase()}
        </span>
      ))}
    </div>
  )
}
