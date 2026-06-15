import { useState, type ReactNode } from 'react';
import { usePlayer } from '../../state/PlayerContext';
import { ECONOMY } from '../../state/economyConfig';
import { canStartLevel, timeToNextFocusMs } from '../../state/focus';
import { Button } from '../../components/ui/Button';
import { Hearts } from '../../components/ui/Hearts';
import { FocusPips } from '../../components/ui/FocusPips';
import { ChevronLeft, HomeIcon } from '../../components/ui/icons';

/** A board reports outcomes through these; LevelStage owns lives + flow. */
export interface BoardControls {
  /** A wrong guess: costs a life (LevelStage decides when lives run out). */
  onWrong: () => void;
  /** The puzzle was solved. */
  onSolved: () => void;
}

interface Props<T> {
  items: T[];
  onExit: () => void;
  onOpenSettings?: () => void;
  onMain?: () => void;
  /** When false, a win does not advance the unlock gate (used by Recap). */
  countsTowardGate?: boolean;
  /** Extra callback fired with the solved item when a level is won. */
  onWin?: (item: T) => void;
  renderBoard: (item: T, controls: BoardControls) => ReactNode;
}

type Phase = 'play' | 'win' | 'lose';

/** Shared focus-gated level flow with a minimal in-game HUD. */
export function LevelStage<T extends { id: string }>({
  items,
  onExit,
  onOpenSettings,
  onMain,
  countsTowardGate = true,
  onWin,
  renderBoard,
}: Props<T>) {
  const { state, now, recordLevel } = usePlayer();
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [lives, setLives] = useState(ECONOMY.livesPerLevel);

  const total = items.length;
  const cleared = index >= total;
  const item = cleared ? undefined : items[index];
  const isLast = index === total - 1;

  function handleResult(won: boolean) {
    recordLevel(won, countsTowardGate);
    if (won && item) onWin?.(item);
    setPhase(won ? 'win' : 'lose');
  }
  const controls: BoardControls = {
    onSolved: () => handleResult(true),
    onWrong: () => {
      const left = lives - 1;
      setLives(left);
      if (left <= 0) handleResult(false);
    },
  };
  function goNext() {
    setIndex((i) => i + 1);
    setAttempt(0);
    setLives(ECONOMY.livesPerLevel);
    setPhase('play');
  }
  function retry() {
    setAttempt((a) => a + 1);
    setLives(ECONOMY.livesPerLevel);
    setPhase('play');
  }
  function restart() {
    setIndex(0);
    setAttempt(0);
    setLives(ECONOMY.livesPerLevel);
    setPhase('play');
  }

  // Non-play screens: a single back chevron + a centered card.
  if (total === 0) {
    return (
      <Centered onBack={onExit} icon="❦" title="Nothing here yet"
        body="Learn more words to unlock puzzles for this mode."
        primary={{ label: 'Back', onClick: onExit }} />
    );
  }
  if (cleared) {
    return (
      <Centered onBack={onExit} icon="✦" title="All caught up"
        body="You cleared every available level. Learn more words to unlock harder ones."
        primary={{ label: 'Play again', onClick: restart }} />
    );
  }
  if (phase === 'win') {
    return (
      <Centered onBack={onExit} icon="✓" title="Level won" body="Success is free — no focus spent."
        primary={{ label: isLast ? 'Finish' : 'Next level', onClick: isLast ? onExit : goNext }} />
    );
  }
  if (phase === 'lose') {
    return (
      <Centered onBack={onExit} icon="○" title="Out of lives"
        body={state.subscribed ? 'Pro keeps your focus full.' : `That cost ${ECONOMY.focusCostOnFail} focus.`}
        primary={{ label: 'Try again', onClick: retry }} />
    );
  }
  if (!canStartLevel(state)) {
    const next = timeToNextFocusMs(state, now);
    return (
      <Centered onBack={onExit} icon="◴" title="Out of focus"
        body={
          next != null
            ? `Refill in Settings, or wait — next focus in ${fmt(next)}.`
            : 'Refill in Settings to keep playing.'
        }
        primary={
          onOpenSettings
            ? { label: 'Open settings', onClick: onOpenSettings }
            : { label: 'Back', onClick: onExit }
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* slim HUD: back · hearts · focus pips */}
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
        <div className="flex items-center gap-3">
          <Hearts total={ECONOMY.livesPerLevel} remaining={lives} />
          <FocusPips focus={state.focus} max={ECONOMY.focusMax} subscribed={state.subscribed} />
        </div>
        {onMain ? (
          <button
            onClick={onMain}
            aria-label="Main menu"
            className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
          >
            <HomeIcon />
          </button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      <div key={`${index}-${attempt}`} className="flex min-h-0 flex-1 flex-col">
        {item && renderBoard(item, controls)}
      </div>
    </div>
  );
}

function fmt(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function Centered({
  onBack,
  icon,
  title,
  body,
  primary,
}: {
  onBack: () => void;
  icon: string;
  title: string;
  body: string;
  primary: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center">
        <button
          onClick={onBack}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
        <div className="text-4xl text-brown">{icon}</div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">{title}</h2>
        <p className="mt-2 max-w-xs text-taupe">{body}</p>
        <Button className="mt-8 w-56" onClick={primary.onClick}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
