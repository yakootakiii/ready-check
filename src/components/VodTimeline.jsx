import { formatClock } from '../format'

/**
 * The core interaction of VOD review: markers on the scrubber, click to seek
 * (spec §5.3). The scrubber itself stays plain - the value is in the tagging
 * layer, not custom video chrome.
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
              title={`${formatClock(tag.at)} — ${tag.label}`}
              aria-label={`Jump to ${formatClock(tag.at)}, ${tag.label}`}
              style={{ left: `${(tag.at / duration) * 100}%` }}
              className="absolute top-0 -translate-x-1/2"
            >
              <span
                aria-hidden="true"
                className="block h-0 w-0 border-x-4 border-b-[6px] border-x-transparent border-b-ember transition-transform duration-100 hover:scale-125"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
