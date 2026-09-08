import { formatClock } from '../format'

/**
 * The core interaction of VOD review: markers on the scrubber, click to seek.
 * The scrubber itself stays plain - the value is in the tagging layer, not in
 * custom video chrome.
 *
 * Markers are coloured by who put them there. The model's own flags read in
 * signal, the ones a player added read in ember, and the difference is not
 * decoration: a reviewer has to be able to tell what the system proposed from
 * what a human confirmed, or "AI VOD analysis" becomes unfalsifiable.
 */
export default function VodTimeline({ duration, position, tags, onSeek }) {
  return (
    <div className="px-4 pb-4 pt-2">
      <div className="relative">
        <input
          type="range"
          min={0}
          max={duration}
          value={position}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Seek"
          className="w-full accent-signal"
        />

        {/* Markers sit under the track so they never block the thumb. */}
        <div className="relative mt-1 h-4">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onSeek(tag.at)}
              title={`${formatClock(tag.at)} — ${tag.label}${
                tag.source === 'model' ? ' (model flagged)' : ''
              }`}
              aria-label={`Jump to ${formatClock(tag.at)}, ${tag.label}`}
              style={{ left: `${(tag.at / duration) * 100}%` }}
              className="absolute top-0 -translate-x-1/2"
            >
              <span
                aria-hidden="true"
                className={`block h-0 w-0 border-x-4 border-b-[6px] border-x-transparent transition-transform duration-100 hover:scale-125 ${
                tag.source === 'model' ? 'border-b-signal' : 'border-b-ember'
              }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
