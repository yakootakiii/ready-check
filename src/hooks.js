import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Eases a number up to `target`. `run` gates the start so a counter can wait
 * until its section scrolls into view.
 */
export function useCountUp(target, { duration = 900, run = true } = {}) {
  const [value, setValue] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    if (!run) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration, run])

  return value
}

/** Ticks a clock upward, for the mock live-match timers. */
export function useTickingClock(startSeconds) {
  const [seconds, setSeconds] = useState(startSeconds)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return seconds
}

/**
 * Advances an index on a timer, resetting the timer whenever the index changes
 * so a manual pick gets a full dwell before the next auto-advance.
 *
 * Auto-advance is suppressed under prefers-reduced-motion, and `paused` is
 * driven by hover/focus - content that moves itself is only acceptable when
 * the reader can stop it.
 */
export function useCarousel(length, { interval = 7000, paused = false } = {}) {
  const [index, setIndex] = useState(0)

  // Keep the index in range when the slide list changes underneath it.
  const safeIndex = length > 0 ? index % length : 0

  useEffect(() => {
    if (paused || length <= 1 || prefersReducedMotion()) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % length), interval)
    return () => clearTimeout(id)
  }, [safeIndex, length, interval, paused])

  return {
    index: safeIndex,
    setIndex,
    next: () => setIndex((i) => (i + 1) % length),
    prev: () => setIndex((i) => (i - 1 + length) % length),
  }
}
