import { useState } from 'react'
import AngularPanel from '../components/AngularPanel'
import GameTile from '../components/GameTile'
import VodTimeline from '../components/VodTimeline'
import Reveal from '../components/Reveal'
import { HudLabel, HudPageHeader, HudPanel, HudSection } from '../components/hud'
import { Button } from '../components/ui'
import { Film, Pause, Play, Plus } from '../components/icons'
import { formatClock } from '../format'
import { player, vod } from '../data/mock'
import { useGame } from '../gameContext'
import { GAMES_BY_ID, genreOf } from '../data/games'
import { teamsFor } from '../data/generate'

export default function VodReview() {
  const { game } = useGame()
  const active = game ?? GAMES_BY_ID[player.primaryGameId]
  const teams = teamsFor(active.id)
  // A VOD is one unit of play, and titles disagree on what that is called.
  const title = `${teams[0].name} vs. ${teams[1].name} — ${active.unit} 2`

  const [position, setPosition] = useState(vod.positionSeconds)
  const [playing, setPlaying] = useState(false)
  const [tags, setTags] = useState(vod.tags)
  const [draft, setDraft] = useState('')

  const addTag = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    setTags((list) =>
      [...list, { id: `t${Date.now()}`, at: position, label: draft.trim() }].sort(
        (a, b) => a.at - b.at,
      ),
    )
    setDraft('')
  }

  return (
    <div>
      <HudPageHeader
        eyebrow={`${active.name} · ${genreOf(active).label}`}
        title="VOD review"
        subtitle={`${title} · recorded ${vod.recorded}`}
        action={
          <span className="flex items-center gap-2 rounded-base border border-line bg-surface/85 px-3 py-2 text-body-m text-ink-muted">
            <GameTile game={active} size="s" />
            {tags.length} tags
          </span>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Reveal>
          <AngularPanel accent="signal" fill="bg-surface/85" innerClassName="overflow-hidden">
            {/* The stage stays plain - the value is in the tagging layer, not
                custom video chrome. */}
            <div className="scanlines relative flex aspect-video items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3 text-center">
                <Film className="h-7 w-7 text-signal" />
                <span className="font-display text-display-m font-semibold text-ink">{title}</span>
                <span className="text-body-s text-ink-muted">{active.unit} footage</span>
              </div>
              <div className="absolute left-4 top-4 rounded-base border border-line bg-base/70 px-2.5 py-1">
                <span className="hud-label text-ink-muted">Review</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-line px-4 py-2">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-label={playing ? 'Pause' : 'Play'}
                className="rounded-base p-2 text-ink transition-colors duration-100 hover:bg-raised"
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <span className="font-mono text-mono-m text-ink-muted">
                {formatClock(position)} / {vod.durationLabel}
              </span>
              <span className="ml-auto text-body-s text-ink-muted">
                Click a marker to jump
              </span>
            </div>

            <VodTimeline
              duration={vod.durationSeconds}
              position={position}
              tags={tags}
              onSeek={setPosition}
            />
          </AngularPanel>
        </Reveal>

        <Reveal delay={90}>
          <HudPanel className="flex h-full flex-col p-4">
            <HudSection eyebrow="Notes" title="Tags on this VOD" />

            <ul className="flex-1 divide-y divide-line">
              {tags.map((tag) => {
                const current = Math.abs(tag.at - position) < 3
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onClick={() => setPosition(tag.at)}
                      className="flex w-full items-baseline gap-3 py-2.5 text-left transition-colors duration-100 hover:text-signal"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-4 w-0.5 shrink-0 ${current ? 'bg-signal' : 'bg-ember/70'}`}
                      />
                      <span className="font-mono text-mono-m text-ink-muted">
                        {formatClock(tag.at)}
                      </span>
                      <span className={`text-body-m ${current ? 'text-signal' : 'text-ink'}`}>
                        {tag.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <form onSubmit={addTag} className="mt-4 border-t border-line pt-4">
              <HudLabel>Note at {formatClock(position)}</HudLabel>
              <input
                id="tag-note"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What happened here?"
                className="mt-2 w-full rounded-base border border-line bg-raised px-3 py-2 text-body-m text-ink placeholder:text-ink-muted"
              />
              <Button variant="primary" className="mt-3 w-full" onClick={addTag}>
                <Plus />
                Add tag at {formatClock(position)}
              </Button>
            </form>
          </HudPanel>
        </Reveal>
      </div>
    </div>
  )
}
