import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { LockIcon } from './icons';

export interface MenuItem {
  /** A string is rendered as an emoji (e.g. language flags); a node is a line icon. */
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  locked?: boolean;
  onClick?: () => void;
  /** Optional progress bar (0..1) shown under the sublabel. */
  progress?: number;
  /** Optional low-emphasis status line next to the progress bar. */
  status?: string;
  /** Render as the featured primary card (ochre border, slightly larger). */
  emphasis?: boolean;
}

interface Props {
  title?: string;
  intro?: string;
  items: MenuItem[];
  /** Optional content rendered above the items (e.g. a reminder banner). */
  banner?: ReactNode;
  /** Optional content rendered below the items (e.g. a completion panel). */
  footer?: ReactNode;
  onBack?: () => void;
  onMain?: () => void;
}

/** A calm list-of-cards menu, reused for every menu level. */
export function MenuScreen({ title, intro, items, banner, footer, onBack, onMain }: Props) {
  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title={title} onBack={onBack} onMain={onMain} />
      {intro && <p className="mb-5 -mt-1 text-taupe">{intro}</p>}
      {banner}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <Card key={i} item={item} index={i} />
        ))}
      </div>
      {footer}
    </div>
  );
}

/** The icon disc to the left of a card. Keeps the real icon even when locked
 *  (just muted), so identity is preserved while reading as "not yet". */
function IconTile({ item }: { item: MenuItem }) {
  if (item.icon === undefined) return null;
  const isEmoji = typeof item.icon === 'string';
  const big = item.emphasis;
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-2xl',
        big ? 'h-16 w-16' : 'h-14 w-14',
        item.locked ? 'bg-sand/60 text-given' : 'bg-sand text-brown',
      ].join(' ')}
    >
      <span aria-hidden className={isEmoji ? 'text-2xl' : ''}>
        {item.icon}
      </span>
    </div>
  );
}

/** A single tappable menu card. Exported so the Home screen can reuse it. */
export function Card({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const disabled = item.locked || !item.onClick;
  const hasProgress = item.progress !== undefined || item.status !== undefined;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={item.onClick}
      style={{ animationDelay: `${index * 45}ms`, animationFillMode: 'backwards' }}
      className={[
        item.emphasis ? 'card-primary' : 'card',
        'flex animate-slide-up items-center gap-4 text-left transition',
        item.emphasis ? 'p-6' : 'p-[22px]',
        item.locked
          ? 'cursor-not-allowed'
          : disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:-translate-y-0.5 hover:bg-[#fdf9f1] active:scale-[0.99]',
      ].join(' ')}
    >
      <IconTile item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2
            className={[
              'truncate font-serif font-semibold text-espresso',
              item.emphasis ? 'text-xl' : 'text-lg',
            ].join(' ')}
          >
            {item.label}
          </h2>
          {item.badge && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-taupe">
              {item.locked && <LockIcon size={11} className="text-taupe" />}
              {item.badge}
            </span>
          )}
        </div>
        {item.sublabel && <p className="mt-0.5 text-sm text-taupe">{item.sublabel}</p>}
        {hasProgress && (
          <div className="mt-2 flex items-center gap-2">
            {item.progress !== undefined && (
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-brown"
                  style={{ width: `${Math.min(1, Math.max(0, item.progress)) * 100}%` }}
                />
              </div>
            )}
            {item.status && (
              <span className="shrink-0 text-xs font-medium tabular-nums text-taupe">{item.status}</span>
            )}
          </div>
        )}
      </div>
      {!disabled && <span className="self-start text-brown/50">→</span>}
    </button>
  );
}
