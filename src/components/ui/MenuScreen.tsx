import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

export interface MenuItem {
  icon: string;
  label: string;
  sublabel?: string;
  badge?: string;
  locked?: boolean;
  onClick?: () => void;
  /** Optional progress bar (0..1) shown under the sublabel. */
  progress?: number;
  /** Optional low-emphasis status line next to the progress bar. */
  status?: string;
}

interface Props {
  title?: string;
  intro?: string;
  items: MenuItem[];
  /** Optional content rendered below the items (e.g. a completion panel). */
  footer?: ReactNode;
  onBack?: () => void;
  onMain?: () => void;
}

/** A calm list-of-cards menu, reused for every menu level. */
export function MenuScreen({ title, intro, items, footer, onBack, onMain }: Props) {
  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title={title} onBack={onBack} onMain={onMain} />
      {intro && <p className="mb-5 -mt-1 text-taupe">{intro}</p>}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </div>
      {footer}
    </div>
  );
}

function Card({ item }: { item: MenuItem }) {
  const disabled = item.locked || !item.onClick;
  const hasProgress = item.progress !== undefined || item.status !== undefined;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={item.onClick}
      className={[
        'card flex items-center gap-4 p-[22px] text-left transition',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-0.5 hover:bg-[#fdf9f1] active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand text-2xl text-brown">
        <span aria-hidden>{item.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-serif text-lg font-semibold text-espresso">{item.label}</h2>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-taupe">
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
