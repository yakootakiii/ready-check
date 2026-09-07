import { createContext, useContext, useState } from 'react'

/**
 * Live-match state lives above the router because the top bar is the one place
 * a live match persists no matter which module you are in (spec §4).
 */
const LiveMatchContext = createContext(null)

export function LiveMatchProvider({ children }) {
  const [isLive, setIsLive] = useState(false)
  return (
    <LiveMatchContext.Provider value={{ isLive, setIsLive }}>{children}</LiveMatchContext.Provider>
  )
}

export const useLiveMatch = () => useContext(LiveMatchContext)
