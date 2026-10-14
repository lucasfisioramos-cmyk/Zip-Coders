// Ícones de linha simples (sem libs externas), stroke = currentColor.
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
)

export const BoardIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></svg>
)

export const ChartIcon = (p) => (
  <svg {...base} {...p}><path d="M4 20V10M11 20V4M18 20v-7" /><path d="M2 20h20" /></svg>
)

export const BookIcon = (p) => (
  <svg {...base} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /></svg>
)

export const BellIcon = (p) => (
  <svg {...base} {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
)

export const MenuIcon = (p) => (
  <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)

export const IconCalendar = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
)

export const IconBox = (p) => (
  <svg {...base} {...p}><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8M12 13v8" /></svg>
)

export const IconBook = (p) => (
  <svg {...base} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /></svg>
)

export const IconCode = (p) => (
  <svg {...base} {...p}><path d="M8 4L2 12l6 8M16 4l6 8-6 8" /></svg>
)

export const IconUsers = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" /><path d="M16.5 8.2a3 3 0 1 1 0 6" /><path d="M19 14c2.6 0 4.5 2 4.5 5" /></svg>
)
