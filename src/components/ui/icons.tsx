import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

function svg(path: ReactNode, size: number, className: string) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {path}
    </svg>
  );
}

export function ChevronLeft({ className = '', size = 22 }: IconProps) {
  return svg(<path d="M15 18l-6-6 6-6" />, size, className);
}

export function HomeIcon({ className = '', size = 22 }: IconProps) {
  return svg(
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </>,
    size,
    className,
  );
}

export function ProgressIcon({ className = '', size = 20 }: IconProps) {
  return svg(
    <>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </>,
    size,
    className,
  );
}

export function SettingsIcon({ className = '', size = 20 }: IconProps) {
  return svg(
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>,
    size,
    className,
  );
}

// ── Menu / action icons ──────────────────────────────────────────────────────
// A coherent line set in `currentColor` (rendered brown in the menu tiles),
// replacing the old emoji. Languages keep their flag emoji.

export function BookIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <path d="M12 6.5C10 5 7 5 4 5.5v13C7 18 10 18 12 19.5" />
      <path d="M12 6.5C14 5 17 5 20 5.5v13C17 18 14 18 12 19.5" />
      <line x1="12" y1="6.5" x2="12" y2="19.5" />
    </>,
    size,
    className,
  );
}

export function TargetIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>,
    size,
    className,
  );
}

export function RepeatIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>,
    size,
    className,
  );
}

export function SunIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
    </>,
    size,
    className,
  );
}

/** Cipher / decode — a key. */
export function KeyIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2L20 3" />
      <path d="M16 7l3 3" />
      <path d="M13 10l2.5 2.5" />
    </>,
    size,
    className,
  );
}

/** Grammar — lines of "rules" / text. */
export function GrammarIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="10" x2="13" y2="10" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <line x1="4" y1="18" x2="11" y2="18" />
    </>,
    size,
    className,
  );
}

/** Crossword — a grid. */
export function GridIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </>,
    size,
    className,
  );
}

/** Hurdle — a row of letter tiles. */
export function TilesIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <rect x="2.5" y="9" width="5.5" height="6" rx="1.2" />
      <rect x="9.25" y="9" width="5.5" height="6" rx="1.2" />
      <rect x="16" y="9" width="5.5" height="6" rx="1.2" />
    </>,
    size,
    className,
  );
}

export function TrophyIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4" />
      <path d="M17 6h2.5a2.5 2.5 0 0 1-2.5 4" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <path d="M9 20h6" />
      <path d="M9.5 20l.5-3h4l.5 3" />
    </>,
    size,
    className,
  );
}

export function StoreIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <>
      <path d="M6 7h12l1 13H5z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </>,
    size,
    className,
  );
}

export function FlameIcon({ className = '', size = 18 }: IconProps) {
  return svg(
    <path d="M12 3c.6 2.8 3.5 4 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.2.5-2.1 1.2-2.8C9.3 10 8.5 7 12 3z" />,
    size,
    className,
  );
}

export function PlayIcon({ className = '', size = 24 }: IconProps) {
  return svg(<path d="M7 4.5l12 7.5-12 7.5z" />, size, className);
}

export function LockIcon({ className = '', size = 16 }: IconProps) {
  return svg(
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>,
    size,
    className,
  );
}

export function SparkleIcon({ className = '', size = 24 }: IconProps) {
  return svg(
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
    size,
    className,
  );
}
