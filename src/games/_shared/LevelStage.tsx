import { useState, type ReactNode } from 'react';
import { usePlayer } from '../../state/PlayerContext';
import { ECONOMY } from '../../state/economyConfig';
import { canStartLevel, timeToNextFocusMs } from '../../state/focus';
import { Button } from '../../components/ui/Button';
import { FocusMeter } from '../../components/ui/FocusMeter';

interface Props<T> {
  items: T[];
  title: string;
  subtitle?: string;
  onExit: () => void;
  renderBoard: (item: T, onResult: (won: boolean) => void) => ReactNode;
}

type Phase = 'play' | 'win' | 'lose';

/** Shared focus-gated level flow for cipher & grammar. */
export function LevelStage<T extends { id: string }>({
  items,
  title,
  subtitle,
  onExit,
  renderBoard,
}: Props<T>) {
  const { state, now, recordLevel, buyFocus, setSubscribed } = usePlayer();
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');

  const total = items.length;
  const cleared = index >= total;
  const item = cleared ? undefined : items[index];
  const isLast = index === total - 1;

  function handleResult(won: boolean) {
    recordLevel(won);
    setPhase(won ? 'win' : 'lose');
  }
  function goNext() {
    setIndex((i) => i + 1);
    setAttempt(0);
    setPhase('play');
  }
  function retry() {
    setAttempt((a) => a + 1);
    setPhase('play');
  }
  function restart() {
    setIndex(0);
    setAttempt(0);
    setPhase('play');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onExit}
          className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
          aria-label="Back to home"
        >
          ←
        </button>
        <div className="text-center">
          <h2 className="eyebrow">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-taupe">{subtitle}</p>}
        </div>
        <FocusMeter />
      </div>

      {total > 0 && !cleared && (
        <p className="mb-2 text-center text-xs text-taupe">
          Level {index + 1} of {total}
        </p>
      )}

      {total === 0 ? (
        <EmptyState onExit={onExit} />
      ) : cleared ? (
        <CenteredCard
          emoji="✶"
          title="All caught up"
          body="You cleared every available level. Learn more words to unlock harder ones."
          primary={{ label: 'Play again', onClick: restart }}
          secondary={{ label: 'Back to home', onClick: onExit }}
        />
      ) : phase === 'win' ? (
        <CenteredCard
          emoji="✓"
          title="Level won"
          body="Success is free — no focus spent."
          primary={{ label: isLast ? 'Finish' : 'Next level', onClick: goNext }}
          secondary={{ label: 'Back to home', onClick: onExit }}
        />
      ) : phase === 'lose' ? (
        <CenteredCard
          emoji="○"
          title="Out of lives"
          body={
            state.subscribed
              ? 'Level failed. Pro keeps your focus full.'
              : `Level failed — that cost ${ECONOMY.focusCostOnFail} focus.`
          }
          primary={{ label: 'Try again', onClick: retry }}
          secondary={{ label: 'Back to home', onClick: onExit }}
        />
      ) : canStartLevel(state) ? (
        <div key={`${index}-${attempt}`} className="flex flex-1 flex-col">
          {item && renderBoard(item, handleResult)}
        </div>
      ) : (
        <OutOfFocus
          msToNext={timeToNextFocusMs(state, now)}
          onBuy={buyFocus}
          onSubscribe={() => setSubscribed(true)}
          onExit={onExit}
        />
      )}
    </div>
  );
}

function fmt(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function OutOfFocus({
  msToNext,
  onBuy,
  onSubscribe,
  onExit,
}: {
  msToNext: number | null;
  onBuy: () => void;
  onSubscribe: () => void;
  onExit: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
      <div className="text-5xl text-ochre">⬣</div>
      <h3 className="mt-5 font-serif text-2xl font-semibold text-espresso">Out of focus</h3>
      <p className="mt-2 max-w-xs text-taupe">
        You need at least {ECONOMY.focusToStart} focus to start a level.
        {msToNext != null && (
          <>
            {' '}
            Next focus in <span className="font-semibold text-espresso">{fmt(msToNext)}</span>.
          </>
        )}
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button onClick={onBuy}>Refill now · {ECONOMY.iap.refillPriceLabel}</Button>
        <Button variant="ghost" onClick={onSubscribe}>
          Go Pro (unlimited) · {ECONOMY.iap.subscriptionPriceLabel}
        </Button>
        <button onClick={onExit} className="mt-1 text-sm text-taupe hover:text-espresso">
          Back to home
        </button>
      </div>
      <p className="mt-4 text-[11px] text-taupe">Demo only — no real payment.</p>
    </div>
  );
}

function EmptyState({ onExit }: { onExit: () => void }) {
  return (
    <CenteredCard
      emoji="❦"
      title="Nothing here yet"
      body="Learn more words to unlock puzzles for this mode."
      primary={{ label: 'Back to home', onClick: onExit }}
    />
  );
}

function CenteredCard({
  emoji,
  title,
  body,
  primary,
  secondary,
}: {
  emoji: string;
  title: string;
  body: string;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
      <div className="text-4xl text-brown">{emoji}</div>
      <h3 className="mt-5 font-serif text-2xl font-semibold text-espresso">{title}</h3>
      <p className="mt-2 max-w-xs text-taupe">{body}</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button onClick={primary.onClick}>{primary.label}</Button>
        {secondary && (
          <Button variant="ghost" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  );
}
