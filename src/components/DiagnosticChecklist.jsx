import { Check, Warn, Fail } from './icons'

// Plain check/warning icons, not a colored pill on every row - a warning
// should visually interrupt an otherwise-calm checklist (spec §5.4).
const STATES = {
  pass: { Icon: Check, className: 'text-ink-muted', srLabel: 'Passed' },
  warn: { Icon: Warn, className: 'text-ink-muted', srLabel: 'Warning' },
  fail: { Icon: Fail, className: 'text-ink-muted', srLabel: 'Failed' },
}

export default function DiagnosticChecklist({ items, className = '' }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 sm:grid-cols-2 ${className}`}>
      {items.map((item) => {
        const state = STATES[item.state]
        return (
          <li key={item.id} className="flex items-center gap-3">
            <state.Icon className={`shrink-0 ${state.className}`} />
            <span className="sr-only">{state.srLabel}:</span>
            <span className={`text-body-m ${item.state === 'pass' ? 'text-ink' : 'text-ink-muted'}`}>
              {item.label}
            </span>
            <span className="ml-auto font-mono text-mono-m text-ink-muted">{item.value}</span>
          </li>
        )
      })}
    </ul>
  )
}
