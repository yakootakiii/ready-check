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
