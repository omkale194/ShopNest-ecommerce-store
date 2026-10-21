// Small stroke icon set, drawn on a 24px grid.
const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2.2l2 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.5-1.1L20 8.2H6.1" />
      <circle cx="9.5" cy="19.4" r="1.2" />
      <circle cx="17" cy="19.4" r="1.2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.6 20c.8-3.5 3.8-5.4 7.4-5.4s6.6 1.9 7.4 5.4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9.2H3z" />
      <path d="M14 9.5h4l3 3v3.2h-7" />
      <circle cx="7.5" cy="17.6" r="1.8" />
      <circle cx="17.5" cy="17.6" r="1.8" />
    </>
  ),
  return: (
    <>
      <path d="M4 9.5h10.5a4.8 4.8 0 0 1 0 9.6H8" />
      <path d="m7.6 5.5-3.8 4 3.8 4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.4c0 4.2 2.8 7.4 7 9.6 4.2-2.2 7-5.4 7-9.6V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 12h.01M17.5 12h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9.5 7V4.5h5V7" />
      <path d="m6.5 7 .9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  package: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H10" />
      <path d="M15 8l4 4-4 4M19 12H9.5" />
    </>
  ),
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="8" rx="1.5" />
      <rect x="13" y="4" width="7" height="5" rx="1.5" />
      <rect x="13" y="11" width="7" height="9" rx="1.5" />
      <rect x="4" y="14" width="7" height="6" rx="1.5" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.2 12 3.7h7.3a1 1 0 0 1 1 1V12l-8.5 8.5a1.4 1.4 0 0 1-2 0L3.5 14.2a1.4 1.4 0 0 1 0-2z" />
      <circle cx="16" cy="8" r="1.2" />
    </>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || null}
    </svg>
  );
}
