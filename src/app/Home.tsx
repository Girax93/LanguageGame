import type { ReactNode } from 'react';
import { games } from '../games/registry';
import type { GameModule } from '../games/types';
import { usePlayer } from '../state/PlayerContext';
import { ECONOMY } from '../state/economyConfig';
import { PACKS } from '../content/vocab';
import {
  completedPackCount,
  availablePackCount,
  modesUnlocked,
} from '../state/progression';
import { FocusMeter } from '../components/ui/FocusMeter';
import { Button } from '../components/ui/Button';

interface Props {
  onSelect: (gameId: string) => void;
}

export function Home({ onSelect }: Props) {
  const { state, buyFocus, setSubscribed } = usePlayer();
  const completed = completedPackCount(state, PACKS);
  const available = availablePackCount(state, PACKS);
  const modesOpen = modesUnlocked(state, PACKS);

  return (
    <div className="animate-fade-in">
      <header className="mb-5 mt-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300/80">
            Language Games
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Deutsch</h1>
        </div>
        <FocusMeter />
      </header>

      {/* Focus / monetization panel */}
      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
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
          <span className="text-2xl">{state.subscribed ? '∞' : `${state.focus}`}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!state.subscribed && (
            <button
              onClick={buyFocus}
              className="rounded-xl bg-amber-400/90 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Refill focus · {ECONOMY.iap.refillPriceLabel}
            </button>
          )}
          <button
            onClick={() => setSubscribed(!state.subscribed)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {state.subscribed
              ? 'Cancel Pro (demo)'
              : `Go Pro · ${ECONOMY.iap.subscriptionPriceLabel}`}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/30">
          Demo only — no real payment. (IAP would wrap these buttons.)
        </p>
      </section>

      {/* Pack progress */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Word Packs
        </h2>
        <div className="space-y-2">
          {PACKS.map((pack, i) => {
            const learned = pack.words.filter((w) =>
              state.learnedWords.includes(w.id),
            ).length;
            const isComplete = learned === pack.words.length;
            const isAvailable = i < available;
            return (
              <div
                key={pack.pack}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  isAvailable ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] opacity-60'
                }`}
              >
                <span className="text-lg">
                  {isComplete ? '✅' : isAvailable ? '📘' : '🔒'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{pack.name}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
                      style={{ width: `${(learned / pack.words.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs tabular-nums text-white/50">
                  {learned}/{pack.words.length}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          {modesOpen
            ? `Win cipher & grammar levels to unlock the next pack (${completed} learned).`
            : 'Finish Pack 1 in Learn to unlock Cipher & Grammar.'}
        </p>
      </section>

      {/* Modes */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Modes
        </h2>
        <div className="grid gap-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              locked={game.gate === 'modes-unlocked' && !modesOpen}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-white/30">v0.3 · more games soon</p>
    </div>
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
        'group relative overflow-hidden rounded-3xl p-5 text-left transition',
        'border border-white/10 bg-white/[0.04] backdrop-blur',
        disabled
          ? 'cursor-not-allowed opacity-70'
          : 'hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.99]',
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
            {game.status === 'coming-soon' && (
              <Badge>Soon</Badge>
            )}
            {locked && game.status === 'available' && <Badge>🔒 Locked</Badge>}
          </div>
          <p className="text-sm font-medium text-sky-200/70">{game.subtitle}</p>
          <p className="mt-1 text-sm text-white/55">
            {locked && game.status === 'available'
              ? 'Finish Pack 1 in Learn to unlock.'
              : game.description}
          </p>
        </div>
        {!disabled && (
          <span className="mt-1 text-white/40 transition group-hover:translate-x-1 group-hover:text-white">
            →
          </span>
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
