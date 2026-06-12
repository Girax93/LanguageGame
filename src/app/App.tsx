import { useState } from 'react';
import { getGame } from '../games/registry';
import { Home } from './Home';

/**
 * App shell + ultra-light router. We keep a single piece of state — the
 * active game id — instead of pulling in a router dependency. Each game
 * is a self-contained module from the registry.
 */
export function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const active = activeGameId ? getGame(activeGameId) : undefined;
  const GameComponent = active?.component;

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white">
      <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col px-5 pb-10 pt-8">
        {GameComponent ? (
          <GameComponent onExit={() => setActiveGameId(null)} />
        ) : (
          <Home onSelect={setActiveGameId} />
        )}
      </div>
    </div>
  );
}
