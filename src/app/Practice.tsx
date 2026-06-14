import type { Route } from './routes';
import { usePlayer } from '../state/PlayerContext';
import { getGame } from '../games/registry';
import { SETS } from '../content/vocab';
import { CIPHER_ITEMS } from '../content/cipherItems';
import { GRAMMAR_ITEMS } from '../content/grammarItems';
import { isItemEligible, gamesToNextSet } from '../state/progression';
import { ChevronLeft } from '../components/ui/icons';

interface Props {
  onBack: () => void;
  onSelect: (route: Route) => void;
}

/** Practice hub: choose a game built from words you've learned. */
export function Practice({ onBack, onSelect }: Props) {
  const { state } = usePlayer();
  const cipherOpen = CIPHER_ITEMS.some((i) => isItemEligible(i, state));
  const grammarOpen = GRAMMAR_ITEMS.some((i) => isItemEligible(i, state));
  const gp = gamesToNextSet(state, SETS);

  const cipher = getGame('fill-in-the-blanks')!;
  const grammar = getGame('grammar')!;

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Practice" onBack={onBack} />

      <p className="mt-2 text-taupe">
        Built only from words you’ve learned.
        {gp ? ` Clear ${gp.needed} to unlock the next set — ${gp.cleared}/${gp.needed} done.` : ''}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <ModeCard
          icon={cipher.icon}
          title={cipher.title}
          desc="Decode a sentence where every letter is a number."
          locked={!cipherOpen}
          onClick={() => onSelect('fill-in-the-blanks')}
        />
        <ModeCard
          icon={grammar.icon}
          title={grammar.title}
          desc="Recall the right article ending — der, die, das."
          locked={!grammarOpen}
          onClick={() => onSelect('grammar')}
        />
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  locked,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={[
        'card flex items-center gap-5 p-6 text-left transition',
        locked ? 'cursor-not-allowed opacity-55' : 'hover:-translate-y-0.5 hover:bg-[#fdf9f1] active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand font-serif text-3xl text-brown">
        <span aria-hidden>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-xl font-semibold text-espresso">{title}</h2>
        <p className="mt-1 text-sm text-taupe">{locked ? 'Learn more words to unlock.' : desc}</p>
      </div>
    </button>
  );
}

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <button
        onClick={onBack}
        aria-label="Back"
        className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
      >
        <ChevronLeft />
      </button>
      <h1 className="font-serif text-2xl font-semibold text-espresso">{title}</h1>
    </div>
  );
}
