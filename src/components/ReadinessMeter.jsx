import { useEffect, useRef, useState } from 'react'
import Sparkline from './Sparkline'

// The count-up runs once per session, not on every mount (spec §7).
let hasCountedUp = false

function useCountUp(target) {
  const [value, setValue] = useState(() => (hasCountedUp ? target : 0))
  const frame = useRef(0)

  useEffect(() => {
    if (hasCountedUp || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hasCountedUp = true
      setValue(target)
      return
    }
    const start = performance.now()
    const duration = 700
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      // Only latch once the run finishes, so a cancelled run (StrictMode's
      // double-invoke in dev) doesn't leave the score stuck at zero.
      if (t < 1) frame.current = requestAnimationFrame(step)
      else hasCountedUp = true
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target])

  return value
}

/**
 * The hero element of Overview: one number built from sleep, practice load and
 * recent match stress, with a one-line plain-language reason under it - not a
 * jargon breakdown (spec §5.1).
 */
export default function ReadinessMeter({ readiness }) {
  const value = useCountUp(readiness.score)

  return (
    <div>
      <div className="text-body-s text-ink-muted">Readiness</div>

      <div className="mt-3 flex items-end gap-4">
        <div
          className="font-display text-display-xl font-bold tabular-nums text-ink"
          aria-label={`Readiness score ${readiness.score} out of 100`}
        >
          {value}
        </div>
        <div className="pb-1">
          <Sparkline points={readiness.trend} />
          <div className="mt-1 text-body-s text-signal">
            Trending {readiness.direction} this week
          </div>
        </div>
      </div>

      <p className="mt-3 text-body-m text-ink-muted">{readiness.reason}</p>
    </div>
  )
}
