import { useMemo } from 'react'

// Deterministic PRNG so the field is identical on every render and reload -
// a backdrop that reshuffles on navigation reads as a glitch.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const W = 1200
const H = 800
const COLS = 7
const ROWS = 5

function buildMesh() {
  const rand = rng(20260907)
  const cellW = W / COLS
  const cellH = H / ROWS
  const pt = (c, r) => {
    // Edge points stay pinned so the mesh reaches the viewport corners.
    const jx = c === 0 || c === COLS ? 0 : (rand() - 0.5) * cellW * 0.65
    const jy = r === 0 || r === ROWS ? 0 : (rand() - 0.5) * cellH * 0.65
    return [c * cellW + jx, r * cellH + jy]
  }

  const grid = []
  for (let r = 0; r <= ROWS; r += 1) {
    const row = []
    for (let c = 0; c <= COLS; c += 1) row.push(pt(c, r))
    grid.push(row)
  }

  const tris = []
  const vertices = []
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const a = grid[r][c]
      const b = grid[r][c + 1]
      const d = grid[r + 1][c]
      const e = grid[r + 1][c + 1]
      tris.push([a, b, d], [b, e, d])
      // Every third interior vertex gets a node, so the network reads without
      // lighting up the whole grid.
      if (r > 0 && c > 0 && (r * COLS + c) % 3 === 0) vertices.push(a)
    }
  }
  return { tris, vertices }
}

const ACCENTS = ['var(--color-signal)', 'var(--color-ember)', 'var(--color-diamond)']

function buildShards() {
  const rand = rng(776611)
  return Array.from({ length: 10 }, (_, i) => {
    const cx = rand() * W
    const cy = rand() * H
    const size = 40 + rand() * 110
    const rot = rand() * Math.PI * 2
    const points = [0, 1, 2]
      .map((k) => {
        const angle = rot + (k * Math.PI * 2) / 3 + rand() * 0.5
        return `${(cx + Math.cos(angle) * size).toFixed(1)},${(cy + Math.sin(angle) * size).toFixed(1)}`
      })
      .join(' ')
    return {
      id: i,
      points,
      fill: ACCENTS[i % ACCENTS.length],
      opacity: 0.03 + rand() * 0.05,
      duration: 14 + rand() * 16,
      delay: -rand() * 20,
    }
  })
}

function buildMotes() {
  const rand = rng(313377)
  return Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(rand() * 100).toFixed(1)}%`,
    top: `${(rand() * 100).toFixed(1)}%`,
    size: `${(1.5 + rand() * 3).toFixed(1)}px`,
    color: ACCENTS[i % ACCENTS.length],
    duration: 9 + rand() * 12,
    delay: -rand() * 18,
  }))
}

/**
 * Instrument rings. These are `div`s with a dashed border rather than stroked
 * SVG circles: an SVG transform animates on the main thread and repaints the
 * whole ring's box every frame, while a transformed div is handed to the
 * compositor. At this size that difference is the whole cost.
 */
const RINGS = [
  { size: '34rem', left: '72%', top: '10%', color: 'var(--color-signal)', opacity: 0.26, duration: '90s', reverse: false },
  { size: '24rem', left: '77%', top: '16%', color: 'var(--color-diamond)', opacity: 0.3, duration: '60s', reverse: true },
  { size: '20rem', left: '4%', top: '66%', color: 'var(--color-ember)', opacity: 0.24, duration: '75s', reverse: false },
]

/**
 * The app-wide backdrop: a low-poly mesh with waking nodes, drifting accent
 * shards and dust motes, two slow instrument rings, a periodic broadcast sweep,
 * and three colour blooms. Fixed and inert - it sits behind every route and
 * never takes pointer events.
 *
 * Everything animates transform or opacity only. Anything numerous or large is
 * a `div` rather than an SVG element, because SVG transforms animate on the
 * main thread and repaint their box each frame; only the mesh, its vertex
 * nodes and ten small shards stay in the SVG.
 *
 * The other rule that matters: no `backdrop-blur` anywhere over this, or every
 * frame re-rasterises the blurred regions and the page locks up. See CLAUDE.md.
 */
export default function PolyBackdrop() {
  const { tris, vertices } = useMemo(buildMesh, [])
  const shards = useMemo(buildShards, [])
  const motes = useMemo(buildMotes, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Colour blooms. */}
      <div
        className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-40 blur-2xl will-change-transform"
        style={{
          background: 'radial-gradient(circle, var(--color-signal) 0%, transparent 62%)',
          animation: 'drift 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-56 -right-32 h-[30rem] w-[30rem] rounded-full opacity-30 blur-2xl will-change-transform"
        style={{
          background: 'radial-gradient(circle, var(--color-ember) 0%, transparent 62%)',
          animation: 'drift 34s ease-in-out -8s infinite reverse',
        }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full opacity-25 blur-2xl will-change-transform"
        style={{
          background: 'radial-gradient(circle, var(--color-diamond) 0%, transparent 62%)',
          animation: 'drift 30s ease-in-out -14s infinite',
        }}
      />

      {/* Static halftone texture — grain without a single animated pixel. */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'radial-gradient(circle, color-mix(in oklab, var(--color-ink) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g opacity="0.7">
          {tris.map((tri, i) => (
            <polygon
              key={i}
              points={tri.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
              fill={i % 11 === 0 ? 'var(--color-raised)' : 'none'}
              fillOpacity={i % 11 === 0 ? 0.5 : 0}
              stroke="var(--color-line)"
              strokeWidth="1"
              strokeOpacity="0.55"
            />
          ))}
        </g>

        {/* Mesh nodes waking in sequence. */}
        {vertices.map(([x, y], i) => (
          <circle
            key={`n${i}`}
            cx={x}
            cy={y}
            r="2.5"
            fill="var(--color-signal)"
            style={{ animation: `node-pulse ${7 + (i % 5)}s ease-in-out ${-i * 1.3}s infinite` }}
          />
        ))}

        {shards.map((shard) => (
          <polygon
            key={shard.id}
            points={shard.points}
            fill={shard.fill}
            opacity={shard.opacity}
            style={{
              animation: `shard-float ${shard.duration}s ease-in-out ${shard.delay}s infinite`,
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
        ))}

      </svg>

      {/* Instrument rings. */}
      {RINGS.map((ring, i) => (
        <div
          key={`r${i}`}
          className="absolute rounded-full will-change-transform"
          style={{
            width: ring.size,
            height: ring.size,
            left: ring.left,
            top: ring.top,
            border: `1px dashed ${ring.color}`,
            opacity: ring.opacity,
            animation: `ring-spin ${ring.duration} linear infinite${ring.reverse ? ' reverse' : ''}`,
          }}
        />
      ))}

      {/* Dust motes. */}
      {motes.map((mote) => (
        <div
          key={`m${mote.id}`}
          className="absolute rounded-full will-change-transform"
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            backgroundColor: mote.color,
            animation: `mote ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
          }}
        />
      ))}

      {/* Broadcast sweep. */}
      <div
        className="absolute -inset-y-1/4 w-[30%] will-change-transform"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--color-signal) 7%, transparent) 45%, color-mix(in oklab, var(--color-ink) 4%, transparent) 55%, transparent 100%)',
          animation: 'scan-sweep 16s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        }}
      />

      {/* Vignette keeps text legible over the busiest part of the field. */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, transparent 20%, var(--color-base) 95%)',
          opacity: 0.75,
        }}
      />
    </div>
  )
}
