// Small inline icon set - no icon dependency for a mockup.
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

export const Check = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8.5 6.5 12 13 4.5" />
  </svg>
)

export const Warn = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" />
    <path d="M8 6.5v3.2M8 11.8h.01" />
  </svg>
)

export const Fail = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2" />
  </svg>
)

export const Bell = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6.6a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" />
    <path d="M6.6 13a1.6 1.6 0 0 0 2.8 0" />
  </svg>
)

export const Home = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 7 8 2.5 13.5 7v6.5h-11V7Z" />
  </svg>
)

export const Grid = (p) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
    <rect x="8.5" y="2.5" width="5" height="5" rx="1" />
    <rect x="2.5" y="8.5" width="5" height="5" rx="1" />
    <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
  </svg>
)

export const Calendar = (p) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="3.5" width="11" height="10" rx="1" />
    <path d="M2.5 6.5h11M5.5 2v2M10.5 2v2" />
  </svg>
)

export const Film = (p) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
    <path d="M6 3.5v9M10 3.5v9" />
  </svg>
)

export const Heart = (p) => (
  <svg {...base} {...p}>
    <path d="M8 13S2.5 9.7 2.5 6.4A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.5 1.4C13.5 9.7 8 13 8 13Z" />
  </svg>
)

export const Bracket = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 3.5h4v4M2.5 12.5h4v-4M6.5 8h3M13.5 8h-4" />
  </svg>
)

export const Broadcast = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="1.75" />
    <path d="M4.6 4.6a4.8 4.8 0 0 0 0 6.8M11.4 11.4a4.8 4.8 0 0 0 0-6.8" />
  </svg>
)

export const Gauge = (p) => (
  <svg {...base} {...p}>
    <path d="M2.8 11.5a6 6 0 1 1 10.4 0" />
    <path d="M8 8.5 10.5 6" />
  </svg>
)

export const IdCard = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="3.5" width="12" height="9" rx="1" />
    <circle cx="6" cy="7.6" r="1.4" />
    <path d="M3.8 11c.5-1.1 1.3-1.6 2.2-1.6s1.7.5 2.2 1.6M10 6.8h2.4M10 9.2h2.4" />
  </svg>
)

export const Trophy = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 2.5h7v4a3.5 3.5 0 0 1-7 0v-4Z" />
    <path d="M4.5 4h-2v1a2 2 0 0 0 2 2M11.5 4h2v1a2 2 0 0 1-2 2" />
    <path d="M8 10v2M5.5 13.5h5" />
  </svg>
)

export const School = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2.5 14.5 5.5 8 8.5 1.5 5.5 8 2.5Z" />
    <path d="M4 7v4.2c0 .9 1.8 1.8 4 1.8s4-.9 4-1.8V7" />
  </svg>
)

export const Building = (p) => (
  <svg {...base} {...p}>
    <path d="M3 13.5v-10a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v10" />
    <path d="M10 6.5h2.5a1 1 0 0 1 1 1v6M1.5 13.5h13" />
    <path d="M5.2 5.2h2.6M5.2 8h2.6M5.2 10.8h2.6" />
  </svg>
)

export const Users = (p) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="6" r="2.4" />
    <path d="M2 13.2c.5-2.2 2-3.4 4-3.4s3.5 1.2 4 3.4" />
    <path d="M10.6 4.2a2.2 2.2 0 0 1 0 4M11.4 9.9c1.5.3 2.5 1.5 3 3.3" />
  </svg>
)

export const Search = (p) => (
  <svg {...base} {...p}>
    <circle cx="7.2" cy="7.2" r="4.2" />
    <path d="M10.4 10.4 13.5 13.5" />
  </svg>
)

export const Menu = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  </svg>
)

export const ArrowRight = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

export const Plus = (p) => (
  <svg {...base} {...p}>
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
)

export const Play = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M5.5 3.6 12 8l-6.5 4.4V3.6Z" />
  </svg>
)

export const Pause = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M5 3.5h2.2v9H5zM8.8 3.5H11v9H8.8z" />
  </svg>
)

/* --- The intelligence layer's own icons ----------------------------------- */

export const Dna = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 2c0 3.2 7 3.6 7 6s-7 2.8-7 6" />
    <path d="M11.5 2c0 3.2-7 3.6-7 6s7 2.8 7 6" />
    <path d="M5.4 4.5h5.2M5.4 11.5h5.2" />
  </svg>
)

export const Target = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15" />
  </svg>
)

export const Layers = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2 14 5.2 8 8.4 2 5.2 8 2Z" />
    <path d="M2.6 8.4 8 11.3l5.4-2.9M2.6 11.2 8 14.1l5.4-2.9" />
  </svg>
)

export const Trend = (p) => (
  <svg {...base} {...p}>
    <path d="M2 11.5 6 7l3 2.6 5-5.6" />
    <path d="M10.4 4h3.6v3.6" />
  </svg>
)

export const Cpu = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="4.5" width="7" height="7" rx="1" />
    <path d="M6.5 2v2.5M9.5 2v2.5M6.5 11.5V14M9.5 11.5V14M2 6.5h2.5M2 9.5h2.5M11.5 6.5H14M11.5 9.5H14" />
  </svg>
)


export const Sparkle = (p) => (
  <svg {...base} {...p}>
    <path d="M6.2 2.2 7.4 5.6 10.8 6.8 7.4 8 6.2 11.4 5 8 1.6 6.8 5 5.6 6.2 2.2Z" />
    <path d="M11.6 9.4 12.3 11.2 14.1 11.9 12.3 12.6 11.6 14.4 10.9 12.6 9.1 11.9 10.9 11.2 11.6 9.4Z" />
  </svg>
)

export const Radar = (p) => (
  <svg {...base} {...p}>
    <path d="M8 8 13 4.6" />
    <path d="M4.3 11.7a5.25 5.25 0 1 1 7.4 0" />
    <path d="M6.4 9.6a2.25 2.25 0 0 1 3.2 0" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const Shield = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2 13 4v4c0 3-2.2 5.1-5 6-2.8-.9-5-3-5-6V4l5-2Z" />
    <path d="M5.8 8.1 7.3 9.6l3-3.2" />
  </svg>
)

export const Clock = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M8 4.8V8.3l2.3 1.4" />
  </svg>
)
