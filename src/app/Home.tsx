import type { ReactNode } from 'react';
import { games } from '../games/registry';
import type { GameModule } from '../games/types';
import { usePlayer } from '../state/PlayerContext';
import { ECONOMY } from '../state/economyConfig';
import { PROGRESSION } from '../state/progressionConfig';
import { SETS, ALL_WORDS } from '../content/vocab';
import {
  currentLearnSetIndex,
  modesUnlocked,
  gamesToNextSet,
} from '../state/progression';
import { FocusMeter } from '../components/ui/FocusMeter';

interface Props {
  onSelect: (gameId: string) => void;
}

export function Home({ onSelect }: Props) {
  const { state, buyFocus, setSubscribed } = usePlayer();
  const learnIdx = currentLearnSetIndex(state, SETS);
  const currentSet = learnIdx !== null ? SETS[learnIdx] : null;
  const modesOpen = modesUnlocked(state, SETS);
  const gamesProg = gamesToNextSet(state, SETS);
  const mastered = state.learnedWords.length;
  const setMastered = currentSet
    ? currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length
    : 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-8 mt-1 flex items-start justify-between">
        <div>
          <p className="eyebrow">Language Games</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-espresso">Deutsch</h1>
          <p className="mt-1.5 text-sm text-taupe">
            {mastered} of {ALL_WORDS.length} words mastered
          </p>
        </div>
        <FocusMeter />
      </header>

      {/* STEP 1 — learn the current set */}
      <Section step={1} label="Words to learn">
        {currentSet ? (
          <Card
            icon="✦"
            title={`Set ${currentSet.index + 1}`}
            subtitle="Master these to keep going"
            onClick={() => onSelect('learn')}
            progress={{
              value: setMastered / currentSet.words.length,
              label: `${setMastered}/${currentSet.words.length}`,
            }}
          />
        ) : gamesProg ? (
          <Card
            icon="✓"
            title="Set mastered"
            subtitle={`Clear ${gamesProg.needed} games to unlock the next set`}
            progress={{
              value: gamesProg.cleared / gamesProg.needed,
              label: `${gamesProg.cleared}/${gamesProg.needed} games`,
            }}
          />
        ) : (
          <Card icon="✶" title="All words learned" subtitle="You’ve mastered every set in this demo." />
        )}
      </Section>

      {/* STEP 2 — play games built from the mastered pool */}
      <Section
        step={2}
        label="Play"
        hint={
          modesOpen
            ? gamesProg
              ? `${gamesProg.cleared}/${gamesProg.needed} games cleared toward the next set`
              : 'Puzzles use every word you know.'
            : 'Finish Set 1 to unlock these.'
        }
      >
        <div className="grid gap-3">
          {games
            .filter((g) => g.id !== 'learn')
            .map((game) => (
              <GameCard
                key={game.id}
                game={game}
                locked={game.gate === 'modes-unlocked' && !modesOpen}
                onSelect={onSelect}
              />
            ))}
        </div>
      </Section>

      {/* Focus / monetization */}
      <section className="mt-8 card p-[22px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-espresso">
              {state.subscribed ? 'Unlimited focus (Pro)' : 'Focus'}
            </p>
            <p className="mt-0.5 text-xs text-taupe">
              {state.subscribed
                ? 'Thanks for subscribing.'
                : `Energy to start levels. Max ${ECONOMY.focusMax}. +1 every 20 min.`}
            </p>
          </div>
          <span className="font-serif text-2xl text-ochre">{state.subscribed ? '∞' : state.focus}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!state.subscribed && (
            <button
              onClick={buyFocus}
              className="rounded-xl bg-ochre px-3.5 py-2 text-sm font-semibold text-cream transition hover:opacity-90"
            >
              Refill · {ECONOMY.iap.refillPriceLabel}
            </button>
          )}
          <button
            onClick={() => setSubscribed(!state.subscribed)}
            className="rounded-xl border border-brown/40 px-3.5 py-2 text-sm font-semibold text-brown transition hover:bg-brown/5"
          >
            {state.subscribed ? 'Cancel Pro (demo)' : `Go Pro · ${ECONOMY.iap.subscriptionPriceLabel}`}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-taupe">Demo only — no real payment.</p>
      </section>

      <p className="mt-8 text-center text-xs text-taupe">
        learn {PROGRESSION.wordsPerSet} words → clear {PROGRESSION.gamesToAdvance} games → repeat
      </p>
    </div>
  );
}

function Section({
  step,
  label,
  hint,
  children,
}: {
  step: number;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sand text-[11px] font-bold text-brown">
          {step}
        </span>
        <h2 className="eyebrow">{label}</h2>
      </div>
      {children}
      {hint && <p className="mt-2.5 text-[11px] text-taupe">{hint}</p>}
    </section>
  );
}

function Chip({ icon }: { icon: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand font-serif text-2xl text-brown">
      <span aria-hidden>{icon}</span>
    </div>
  );
}

function Card({
  icon,
  title,
  subtitle,
  onClick,
  progress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
  progress?: { value: number; label: string };
}) {
  const interactive = !!onClick;
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={[
        'card w-full p-[22px] text-left transition',
        interactive ? 'hover:-translate-y-0.5 hover:bg-[#fdf9f1] active:scale-[0.99]' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <Chip icon={icon} />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-semibold text-espresso">{title}</h3>
          <p className="text-sm text-taupe">{subtitle}</p>
          {progress && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-brown"
                  style={{ width: `${Math.min(1, progress.value) * 100}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-taupe">{progress.label}</span>
            </div>
          )}
        </div>
        {interactive && <span className="text-brown/50">→</span>}
      </div>
    </button>
  );
}

function GameCard({
  game,
  locked,
  onSelect,
}: {
  game: GameModule;
  locked: boolean;
  onSelect: (id: string) => void;
}) {
  const disabled = game.status !== 'available' || locked;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(game.id)}
      className={[
        'card w-full p-[22px] text-left transition',
        disabled ? 'cursor-not-allowed opacity-70' : 'hover:-translate-y-0.5 hover:bg-[#fdf9f1] active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <Chip icon={game.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-lg font-semibold text-espresso">{game.title}</h3>
            {game.status === 'coming-soon' && <Badge>Soon</Badge>}
            {locked && game.status === 'available' && <Badge>Locked</Badge>}
          </div>
          <p className="text-sm font-medium text-brown/80">{game.subtitle}</p>
          <p className="mt-1 text-sm text-taupe">
            {locked && game.status === 'available' ? 'Finish Set 1 in Learn to unlock.' : game.description}
          </p>
        </div>
        {!disabled && <span className="mt-1 text-brown/50">→</span>}
      </div>
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-taupe">
      {children}
    </span>
  );
}
