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

  return (
    <div className="animate-fade-in">
      <header className="mb-5 mt-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300/80">
            Language Games
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Deutsch</h1>
          <p className="mt-1 text-xs text-white/40">
            {mastered}/{ALL_WORDS.length} words mastered
          </p>
        </div>
        <FocusMeter />
      </header>

      {/* STEP 1 — learn the current set */}
      <Section step={1} label="Words to learn">
        {currentSet ? (
          <Card
            icon="🌱"
            accent="from-lime-500 to-emerald-500"
            title={`Set ${currentSet.index + 1}`}
            subtitle="Master these to keep going"
            onClick={() => onSelect('learn')}
            progress={{
              value:
                currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length /
                currentSet.words.length,
              label: `${currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length}/${currentSet.words.length}`,
            }}
          />
        ) : gamesProg ? (
          <Card
            icon="✅"
            accent="from-emerald-500 to-teal-500"
            title="Set mastered"
            subtitle={`Clear ${gamesProg.needed} games to unlock the next set`}
            progress={{
              value: gamesProg.cleared / gamesProg.needed,
              label: `${gamesProg.cleared}/${gamesProg.needed} games`,
            }}
          />
        ) : (
          <Card
            icon="🏆"
            accent="from-amber-500 to-orange-500"
            title="All words learned"
            subtitle="You’ve mastered every set in this demo."
          />
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
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              {state.subscribed ? 'Unlimited focus (Pro)' : 'Focus'}
            </p>
            <p className="text-xs text-white/50">
              {state.subscribed
                ? 'Thanks for subscribing.'
                : `Energy to start levels. Max ${ECONOMY.focusMax}. +1 every 20 min.`}
            </p>
          </div>
          <span className="text-2xl">{state.subscribed ? '∞' : state.focus}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!state.subscribed && (
            <button
              onClick={buyFocus}
              className="rounded-xl bg-amber-400/90 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Refill · {ECONOMY.iap.refillPriceLabel}
            </button>
          )}
          <button
            onClick={() => setSubscribed(!state.subscribed)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {state.subscribed ? 'Cancel Pro (demo)' : `Go Pro · ${ECONOMY.iap.subscriptionPriceLabel}`}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/30">Demo only — no real payment.</p>
      </section>

      <p className="mt-8 text-center text-xs text-white/30">
        v0.4 · learn {PROGRESSION.wordsPerSet} words → clear {PROGRESSION.gamesToAdvance} games → repeat
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
    <section className="mb-6">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/70">
          {step}
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{label}</h2>
      </div>
      {children}
      {hint && <p className="mt-2 text-[11px] text-white/35">{hint}</p>}
    </section>
  );
}

function Card({
  icon,
  accent,
  title,
  subtitle,
  onClick,
  progress,
}: {
  icon: string;
  accent: string;
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
        'group relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition',
        interactive ? 'hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-[0.99]' : 'cursor-default',
      ].join(' ')}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl`}
      />
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-lg`}
        >
          <span aria-hidden>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-white/55">{subtitle}</p>
          {progress && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
                  style={{ width: `${Math.min(1, progress.value) * 100}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-white/50">{progress.label}</span>
            </div>
          )}
        </div>
        {interactive && (
          <span className="text-white/40 transition group-hover:translate-x-1 group-hover:text-white">→</span>
        )}
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
        'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition',
        disabled ? 'cursor-not-allowed opacity-70' : 'hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-[0.99]',
      ].join(' ')}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${game.accent} opacity-30 blur-2xl`}
      />
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${game.accent} text-2xl shadow-lg`}
        >
          <span aria-hidden>{game.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold">{game.title}</h3>
            {game.status === 'coming-soon' && <Badge>Soon</Badge>}
            {locked && game.status === 'available' && <Badge>🔒 Locked</Badge>}
          </div>
          <p className="text-sm font-medium text-sky-200/70">{game.subtitle}</p>
          <p className="mt-1 text-sm text-white/55">
            {locked && game.status === 'available' ? 'Finish Set 1 in Learn to unlock.' : game.description}
          </p>
        </div>
        {!disabled && (
          <span className="mt-1 text-white/40 transition group-hover:translate-x-1 group-hover:text-white">→</span>
        )}
      </div>
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
      {children}
    </span>
  );
}
