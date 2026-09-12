import { useId, useState } from 'react'
import { Info } from './icons'

/**
 * A small "i" affordance for the one sentence of methodology worth keeping
 * next to a metric, without spending a paragraph on it. Hover, focus or tap
 * reveals it; the trigger and the popover stay linked via `aria-describedby`
 * so it reads correctly without the hover.
 */
export default function InfoTip({ text, className = '' }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink"
      >
        <Info />
        <span className="sr-only">More information</span>
      </button>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-base border border-surface bg-raised p-2.5 text-body-s leading-snug text-ink-muted transition-opacity duration-150 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {text}
      </span>
    </span>
  )
}
