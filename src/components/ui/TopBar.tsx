import { ChevronLeft, HomeIcon } from './icons';

interface Props {
  title?: string;
  onBack?: () => void;
  onMain?: () => void;
}

/** Shared top bar: optional back chevron (left) + main-menu button (right). */
export function TopBar({ title, onBack, onMain }: Props) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-1">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
          >
            <ChevronLeft />
          </button>
        )}
        {title && (
          <h1 className="truncate font-serif text-2xl font-semibold text-espresso">{title}</h1>
        )}
      </div>
      {onMain && (
        <button
          onClick={onMain}
          aria-label="Main menu"
          className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <HomeIcon />
        </button>
      )}
    </div>
  );
}
