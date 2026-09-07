export function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Peso prize pools: ₱2.4M above a million, ₱850k below it. */
export function formatPrize(pesos) {
  return pesos >= 1_000_000
    ? `₱${(pesos / 1_000_000).toFixed(1)}M`
    : `₱${Math.round(pesos / 1000)}k`
}
