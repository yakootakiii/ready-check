import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileTabBar from './components/MobileTabBar'
import TopBar from './components/TopBar'
import PolyBackdrop from './components/PolyBackdrop'
import { LiveMatchProvider } from './live'
import { GameProvider } from './gameContext'
import Home from './pages/Home'
import Overview from './pages/Overview'
import Scrims from './pages/Scrims'
import VodReview from './pages/VodReview'
import Wellness from './pages/Wellness'
import Brackets from './pages/Brackets'
import Live from './pages/Live'
import Diagnostics from './pages/Diagnostics'
import League from './pages/League'
import LeagueBackers from './pages/LeagueBackers'
import MyCard from './pages/MyCard'
import OrgSearch from './pages/OrgSearch'

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
              <Route path="/overview" element={<Overview />} />
              <Route path="/prep/scrims" element={<Scrims />} />
              <Route path="/prep/vod" element={<VodReview />} />
              <Route path="/prep/wellness" element={<Wellness />} />
              {/* Brackets drills down: titles -> a title's live feed and
                  running tournaments -> one tournament's draw. */}
              <Route path="/compete/brackets" element={<Brackets />} />
              <Route path="/compete/brackets/:gameId" element={<Brackets />} />
              <Route path="/compete/brackets/:gameId/:eventId" element={<Brackets />} />
              <Route path="/compete/live" element={<Live />} />
              <Route path="/compete/diagnostics" element={<Diagnostics />} />
              {/* League: teams, and the schools and companies behind them. */}
              <Route path="/league" element={<League />} />
              <Route path="/league/team/:teamId" element={<League />} />
              <Route path="/league/schools" element={<LeagueBackers kind="school" />} />
              <Route path="/league/schools/:backerId" element={<LeagueBackers kind="school" />} />
              <Route path="/league/orgs" element={<LeagueBackers kind="company" />} />
              <Route path="/league/orgs/:backerId" element={<LeagueBackers kind="company" />} />
              <Route path="/recruit/card" element={<MyCard />} />
              <Route path="/recruit/orgs" element={<OrgSearch />} />
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
