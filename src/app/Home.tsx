import { games } from '../games/registry';
import type { GameModule } from '../games/types';

interface Props {
  onSelect: (gameId: string) => void;
}

export function Home({ onSelect }: Props) {
  return (
    <div className="animate-fade-in">
      <header className="mb-8 mt-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300/80">
          Language Games
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          Learn by playing.
        </h1>
        <p className="mt-2 text-white/60">
          A growing set of bite-sized games. Pick one to start.
        </p>
      </header>

      <div className="grid gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelect} />
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-white/30">
        More games on the way · v0.1
      </p>
    </div>
  );
}

function GameCard({
  game,
  onSelect,
}: {
  game: GameModule;
  onSelect: (id: string) => void;
}) {
  const disabled = game.status !== 'available';

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
      {/* accent glow */}
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
            <h2 className="truncate text-lg font-bold">{game.title}</h2>
            {disabled && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                Soon
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-sky-200/70">{game.subtitle}</p>
          <p className="mt-1 text-sm text-white/55">{game.description}</p>
        </div>
        {!disabled && (
          <span className="mt-1 translate-x-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-white">
            →
          </span>
        )}
      </div>
    </button>
  );
}
