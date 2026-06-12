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
  /** Render the per-level board; call onResult(true|false) when it ends. */
  renderBoard: (item: T, onResult: (won: boolean) => void) => ReactNode;
}

type Phase = 'play' | 'win' | 'lose';

/**
 * Shared level flow for focus-gated modes (cipher, grammar): focus gate at
 * start, lives handled by the board, win/lose screens, retry, and the
 * monetization stubs (refill / subscribe) when out of focus.
 */
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Back to home"
        >
          ←
        </button>
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300/70">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
        </div>
        <FocusMeter />
      </div>

      {total > 0 && !cleared && (
        <p className="mb-1 text-center text-xs text-white/40">
          Level {index + 1} / {total}
        </p>
      )}

      {total === 0 ? (
        <EmptyState onExit={onExit} />
      ) : cleared ? (
        <CenteredCard
          emoji="🎓"
          title="All caught up!"
          body="You cleared every available level. Learn more words to unlock harder ones."
          primary={{ label: 'Play again', onClick: restart }}
          secondary={{ label: 'Back to home', onClick: onExit }}
        />
      ) : phase === 'win' ? (
        <CenteredCard
          emoji="🎉"
          title="Level won!"
          body="Nice. Success is free — no focus spent."
          primary={{ label: isLast ? 'Finish' : 'Next level', onClick: goNext }}
          secondary={{ label: 'Back to home', onClick: onExit }}
        />
      ) : phase === 'lose' ? (
        <CenteredCard
          emoji="💔"
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
      <div className="text-6xl">⚡</div>
      <h3 className="mt-4 text-2xl font-extrabold">Out of focus</h3>
      <p className="mt-2 max-w-xs text-white/60">
        You need at least {ECONOMY.focusToStart} focus to start a level.
        {msToNext != null && (
          <>
            {' '}
            Next focus in <span className="font-semibold text-white">{fmt(msToNext)}</span>.
          </>
        )}
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button onClick={onBuy}>Refill now · {ECONOMY.iap.refillPriceLabel}</Button>
        <Button variant="ghost" onClick={onSubscribe}>
          Go Pro (unlimited) · {ECONOMY.iap.subscriptionPriceLabel}
        </Button>
        <button onClick={onExit} className="mt-1 text-sm text-white/40 hover:text-white/70">
          Back to home
        </button>
      </div>
      <p className="mt-4 text-[11px] text-white/30">Demo only — no real payment.</p>
    </div>
  );
}

function EmptyState({ onExit }: { onExit: () => void }) {
  return (
    <CenteredCard
      emoji="📚"
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
      <div className="text-6xl">{emoji}</div>
      <h3 className="mt-4 text-2xl font-extrabold">{title}</h3>
      <p className="mt-2 max-w-xs text-white/60">{body}</p>
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
