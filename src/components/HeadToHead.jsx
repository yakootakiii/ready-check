import { HudLabel, HudPanel } from './hud'
import { DeltaChip } from './DnaDimensions'
import { Sparkle } from './icons'

/**
 * What has actually happened when these two have met.
 *
 * The most direct evidence there is, and the place the learning loop becomes
 * legible over more than one match: the record, how many of those meetings the
 * model called, and how far the opponent has drifted since the first of them.
 *
 * That drift line is the point of the panel rather than a footnote. A raw
 * head-to-head record is the most confidently misread number in sport — three
 * wins over a side that has since rebuilt its whole tempo says very little, and
 * this is the one surface that can say so.
 *
 * Meetings that predate the model on this pairing are labelled. Coverage is
 * stated everywhere else in the product, and a head-to-head that quietly
 * back-filled predictions it never made would undo that.
 */
export default function HeadToHead({ h2h, className = '' }) {
  if (!h2h || h2h.meetings.length === 0) return null

  const { record, meetings, called, graded, drifted, opponent } = h2h

  return (
    <HudPanel className={`p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <HudLabel className="text-signal">Previous meetings</HudLabel>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className="font-display text-display-l font-bold text-ink">
              {record.won}–{record.lost}
            </span>
            <span className="text-body-m text-ink-muted">against {opponent.name}</span>
          </div>
        </div>
        {graded > 0 && (
          <div className="text-right">
            <HudLabel>Model called</HudLabel>
            <div className="mt-1 font-mono text-mono-l text-ink">
              {called}/{graded}
            </div>
          </div>
        )}
      </div>

      <ul className="mt-5 divide-y divide-surface border-t border-surface">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <span
              aria-hidden="true"
              className={`h-7 w-0.5 shrink-0 rounded-full ${meeting.won ? 'bg-edge' : 'bg-raised'}`}
            />
            <span
              className={`w-14 shrink-0 font-mono text-mono-m ${
                meeting.won ? 'text-edge' : 'text-ember'
              }`}
            >
              {meeting.won ? 'W' : 'L'} {meeting.score.join('–')}
            </span>
            <span className="min-w-32 flex-1">
              <span className="block truncate text-body-m text-ink">{meeting.event}</span>
              <span className="block truncate text-body-s text-ink-muted">{meeting.when}</span>
            </span>
            <span className="shrink-0 text-right text-body-s">
              {meeting.modelled ? (
                <>
                  <span className="text-ink-muted">Model gave you </span>
                  <span className="font-mono text-mono-m text-ink">{meeting.projected}%</span>
                  <span
                    className={`ml-2 ${
                      (meeting.projected >= 50) === meeting.won ? 'text-edge' : 'text-ember'
                    }`}
                  >
                    {(meeting.projected >= 50) === meeting.won ? 'called' : 'missed'}
                  </span>
                </>
              ) : (
                <span className="text-ink-muted">Before the model covered this pairing</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-surface pt-4">
        <p className="flex flex-wrap items-baseline gap-x-2 text-body-m text-ink-muted">
          Since the first of these, their{' '}
          <span className="text-ink">{drifted.label.toLowerCase()}</span> has moved
          <DeltaChip delta={drifted.shift} />
          <span>— a record alone would not show that.</span>
        </p>
        {h2h.discovery && (
          <p className="flex items-start gap-2 text-body-m text-ink-muted">
            <Sparkle className="mt-0.5 shrink-0 text-signal" />
            {h2h.discovery}
          </p>
        )}
      </div>
    </HudPanel>
  )
}
