import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileTabBar from './components/MobileTabBar'
import TopBar from './components/TopBar'
import PolyBackdrop from './components/PolyBackdrop'
import { LiveMatchProvider } from './live'
import { GameProvider } from './gameContext'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import MatchAnalysis from './pages/MatchAnalysis'
import Performance from './pages/Performance'
import VodIntel from './pages/VodIntel'
import Condition from './pages/Condition'
import Matchup from './pages/Matchup'
import Opponents from './pages/Opponents'
import MatchCentre from './pages/MatchCentre'
import Tournaments from './pages/Tournaments'
import Scrims from './pages/Scrims'
import SetupCheck from './pages/SetupCheck'
import NetworkPlayers from './pages/NetworkPlayers'
import NetworkTeams from './pages/NetworkTeams'
import NetworkBackers from './pages/NetworkBackers'
import Talent from './pages/Talent'
import Passport from './pages/Passport'

export default function App() {
  const [railCollapsed, setRailCollapsed] = useState(false)
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  // `main` is the scroll container now, so the browser's own scroll restoration
  // no longer applies - a route change would otherwise land mid-page.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <GameProvider>
      <LiveMatchProvider>
      {/* No background here: the fixed PolyBackdrop paints behind everything
          and an opaque wrapper would cover it. body carries bg-base.

          The shell is a viewport-height column and `main` is the only thing
          that scrolls, which pins the top bar and the rail in place without
          either needing sticky offsets that would break when the live-match
          strip changes the top bar's height. */}
      <div className="flex h-dvh flex-col overflow-hidden">
        <PolyBackdrop />
        <TopBar
          onToggleRail={() => setRailCollapsed((v) => !v)}
          railCollapsed={railCollapsed}
        />

        {/* min-h-0 lets the row shrink so its children can scroll internally
            instead of stretching the column. */}
        <div className="flex min-h-0 flex-1">
          <Sidebar collapsed={railCollapsed} />

          {/* Bottom padding clears the mobile tab bar. */}
          <main
            ref={mainRef}
            className="min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6"
          >
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Analyze: what happened, and what it says about you. */}
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/analyze/matches" element={<MatchAnalysis />} />
              <Route path="/analyze/trends" element={<Performance />} />
              <Route path="/analyze/vod" element={<VodIntel />} />
              <Route path="/analyze/condition" element={<Condition />} />

              {/* Matchup: what that means against who is next. */}
              <Route path="/matchup" element={<Matchup />} />
              <Route path="/matchup/opponents" element={<Opponents />} />
              <Route path="/matchup/opponents/:teamId" element={<Opponents />} />

              {/* Compete: going and doing it. Tournaments drills down from
                  titles to a title's circuit to one event's draw. */}
              <Route path="/compete/matches" element={<MatchCentre />} />
              <Route path="/compete/tournaments" element={<Tournaments />} />
              <Route path="/compete/tournaments/:gameId" element={<Tournaments />} />
              <Route path="/compete/tournaments/:gameId/:eventId" element={<Tournaments />} />
              <Route path="/compete/scrims" element={<Scrims />} />
              <Route path="/compete/setup" element={<SetupCheck />} />

              {/* Network: the competitive graph - players, the teams they play
                  for, and the schools and companies behind those. */}
              <Route path="/network" element={<NetworkPlayers />} />
              <Route path="/network/teams" element={<NetworkTeams />} />
              <Route path="/network/teams/:teamId" element={<NetworkTeams />} />
              <Route path="/network/schools" element={<NetworkBackers kind="school" />} />
              <Route path="/network/schools/:backerId" element={<NetworkBackers kind="school" />} />
              <Route path="/network/orgs" element={<NetworkBackers kind="company" />} />
              <Route path="/network/orgs/:backerId" element={<NetworkBackers kind="company" />} />
              <Route path="/network/talent" element={<Talent />} />

              <Route path="/passport" element={<Passport />} />
              <Route path="/passport/:playerId" element={<Passport />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <MobileTabBar />
      </div>
      </LiveMatchProvider>
    </GameProvider>
  )
}
