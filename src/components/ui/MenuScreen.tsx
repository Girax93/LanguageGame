import { TopBar } from './TopBar';

export interface MenuItem {
  icon: string;
  label: string;
  sublabel?: string;
  badge?: string;
  locked?: boolean;
  onClick?: () => void;
}

interface Props {
  title?: string;
  intro?: string;
  items: MenuItem[];
  onBack?: () => void;
  onMain?: () => void;
}

/** A calm list-of-cards menu, reused for every menu level. */
export function MenuScreen({ title, intro, items, onBack, onMain }: Props) {
  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title={title} onBack={onBack} onMain={onMain} />
      {intro && <p className="mb-5 -mt-1 text-taupe">{intro}</p>}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function Card({ item }: { item: MenuItem }) {
  const disabled = item.locked || !item.onClick;
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
      </div>
      {!disabled && <span className="text-brown/50">→</span>}
    </button>
  );
}
