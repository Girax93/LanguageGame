import { useState, type ReactNode } from 'react';
import { usePlayer } from '../../state/PlayerContext';
import { ECONOMY } from '../../state/economyConfig';
import { canStartLevel, timeToNextFocusMs } from '../../state/focus';
import { Button } from '../../components/ui/Button';
import { Hearts } from '../../components/ui/Hearts';
import { ChevronLeft, HomeIcon } from '../../components/ui/icons';

/** A board reports outcomes through these; LevelStage owns lives + flow. */
export interface BoardControls {
  onWrong: () => void;
  onSolved: () => void;
  /** DEV/TESTING: skip the current item as if solved (boards place a button). */
  onSkip: () => void;
}

interface Props<T> {
  items: T[];
  onExit: () => void;
  onOpenSettings?: () => void;
  onMain?: () => void;
  countsTowardGate?: boolean;
  onWin?: (item: T) => void;
  /** Fired once when the LAST item in the set is solved (the session is done). */
  onComplete?: () => void;
  renderWin?: (item: T) => ReactNode;
  /** Replaces the final win screen when the whole session is cleared. */
  renderComplete?: () => ReactNode;
  renderBoard: (item: T, controls: BoardControls) => ReactNode;
  /** Lives (tries) for an item; defaults to ECONOMY.livesPerLevel. Lets a game
   *  vary the number per item (e.g. Hurdle scales tries by word length). */
  livesForItem?: (item: T) => number;
  /** Replace the hearts HUD (remaining, total) — e.g. Hurdle shows tries left. */
  renderHud?: (remaining: number, total: number) => ReactNode;
  /** Title on the out-of-lives screen (default "Out of lives"). */
  loseTitle?: string;
  /** Extra content on the lose screen, above the focus-drop (e.g. reveal the answer). */
  renderLoseExtra?: (item: T) => ReactNode;
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
  onComplete,
  renderWin,
  renderComplete,
  renderBoard,
  livesForItem,
  renderHud,
  loseTitle,
  renderLoseExtra,
}: Props<T>) {
  const { state, now, recordLevel } = usePlayer();
  const livesFor = (it: T | undefined): number =>
    it && livesForItem ? livesForItem(it) : ECONOMY.livesPerLevel;
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [lives, setLives] = useState(() => livesFor(items[0]));

  const total = items.length;
  const cleared = index >= total;
  const item = cleared ? undefined : items[index];
  const isLast = index === total - 1;
  const livesTotal = livesFor(item);

  function handleResult(won: boolean) {
    recordLevel(won, countsTowardGate);
    if (won && item) onWin?.(item);
    if (won && isLast) onComplete?.();
    setPhase(won ? 'win' : 'lose');
  }
  function goNext() {
    setIndex((i) => i + 1);
    setAttempt(0);
    setLives(livesFor(items[index + 1]));
    setPhase('play');
  }
  // DEV/TESTING: treat the current item as solved and jump straight on.
  function skip() {
    recordLevel(true, countsTowardGate);
    if (item) onWin?.(item);
    if (isLast) {
      onComplete?.();
      if (renderComplete) setPhase('win');
      else onExit();
    } else {
      goNext();
    }
  }
  const controls: BoardControls = {
    onSolved: () => handleResult(true),
    onWrong: () => {
      const left = lives - 1;
      setLives(left);
      if (left <= 0) handleResult(false);
    },
    onSkip: skip,
  };
  function retry() {
    setAttempt((a) => a + 1);
    setLives(livesFor(item));
    setPhase('play');
  }
  function restart() {
    setIndex(0);
    setAttempt(0);
    setLives(livesFor(items[0]));
    setPhase('play');
  }

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
    if (isLast && renderComplete) return <>{renderComplete()}</>;
    return (
      <Centered onBack={onExit} icon="✓" title="Level won" body="Success is free — no focus spent."
        extra={item ? renderWin?.(item) : undefined}
        primary={{ label: isLast ? 'Finish' : 'Next level', onClick: isLast ? onExit : goNext }} />
    );
  }
  if (phase === 'lose') {
    return (
      <Centered onBack={onExit} icon="○" title={loseTitle ?? 'Out of lives'}
        body={state.subscribed ? 'Pro keeps your focus full.' : `That cost ${ECONOMY.focusCostOnFail} focus.`}
        extra={
          <>
            {item && renderLoseExtra?.(item)}
            {!state.subscribed && <FocusDrop focus={state.focus} max={ECONOMY.focusMax} />}
          </>
        }
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
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
        <div className="flex items-center gap-3">
          {renderHud ? renderHud(lives, livesTotal) : <Hearts total={livesTotal} remaining={lives} />}
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
  extra,
  primary,
}: {
  onBack: () => void;
  icon: string;
  title: string;
  body: string;
  extra?: ReactNode;
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
        {extra}
        <Button className="mt-8 w-56" onClick={primary.onClick}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}

function FocusDrop({ focus, max }: { focus: number; max: number }) {
  return (
    <div className="mt-6 flex items-center gap-2" aria-label={`Focus dropped to ${focus} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={[
            'h-2.5 w-2.5 rounded-full',
            i < focus ? 'bg-ochre' : i === focus ? 'bg-ochre animate-focus-drop' : 'bg-given/40',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

/** Small dev/testing "skip this round" button. Boards place it directly above
 *  their keyboard so it never overlaps a key. */
export function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Skip this round (testing)"
      className="rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-taupe transition hover:bg-sand hover:text-espresso active:scale-95"
    >
      Skip ⏭
    </button>
  );
}
