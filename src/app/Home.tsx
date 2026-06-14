import type { ReactNode } from 'react';
import type { Route } from './routes';
import { usePlayer } from '../state/PlayerContext';
import { SETS, ALL_WORDS } from '../content/vocab';
import { currentLearnSetIndex, gamesToNextSet } from '../state/progression';
import { Button } from '../components/ui/Button';
import { ProgressIcon, SettingsIcon } from '../components/ui/icons';

interface Props {
  onNavigate: (route: Route) => void;
}

/** Calm start screen: one adaptive primary action + a quiet status line. */
export function Home({ onNavigate }: Props) {
  const { state } = usePlayer();
  const learnIdx = currentLearnSetIndex(state, SETS);
  const gamesProg = gamesToNextSet(state, SETS);

  let label: string;
  let route: Route;
  let status: string;

  if (learnIdx !== null) {
    const set = SETS[learnIdx];
    const mastered = set.words.filter((w) => state.learnedWords.includes(w.id)).length;
    label = learnIdx > 0 && mastered === 0 ? 'Continue' : 'Learn words';
    route = 'learn';
    status = `Word set ${learnIdx + 1} · ${mastered}/${set.words.length} learned`;
  } else if (gamesProg) {
    label = 'Practice';
    route = 'practice';
    status = `${gamesProg.cleared}/${gamesProg.needed} games cleared`;
  } else {
    label = 'Practice';
    route = 'practice';
    status = `All ${ALL_WORDS.length} words learned`;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-end gap-1">
        <IconButton label="Progress" onClick={() => onNavigate('progress')}>
          <ProgressIcon />
        </IconButton>
        <IconButton label="Settings" onClick={() => onNavigate('settings')}>
          <SettingsIcon />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
        <p className="eyebrow">Language Games</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold text-espresso">Deutsch</h1>
        <p className="mt-3 text-taupe">Learn German by playing.</p>

        <Button className="mt-10 w-56" onClick={() => onNavigate(route)}>
          {label}
        </Button>
        <p className="mt-4 text-sm text-taupe">{status}</p>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="rounded-full p-2.5 text-taupe transition hover:bg-sand hover:text-espresso"
    >
      {children}
    </button>
  );
}
