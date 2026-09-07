import { createContext, useContext, useMemo, useState } from 'react'
import { getGame } from './data/games'

/**
 * The selected title, held above the router because it scopes every module:
 * the hub, the scrim finder, org search and the player card all read it.
 * `'all'` is a first-class value - the hub is worth browsing across every
 * scene, not just one.
 */
const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [gameId, setGameId] = useState('all')

  const value = useMemo(
    () => ({
      gameId,
      setGameId,
      game: gameId === 'all' ? null : getGame(gameId),
      isAll: gameId === 'all',
    }),
    [gameId],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => useContext(GameContext)
