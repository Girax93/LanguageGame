import { useState } from 'react';
import { getGame } from '../games/registry';
import { Home } from './Home';

/**
 * App shell + ultra-light router. A single piece of state — the active game
 * id — instead of a router dependency. Each game is a registry module.
 */
export function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const active = activeGameId ? getGame(activeGameId) : undefined;
  const GameComponent = active?.component;

  return (
    <div className="min-h-full bg-page text-espresso">
      <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col px-5 pb-12 pt-9">
        {GameComponent ? (
          <GameComponent onExit={() => setActiveGameId(null)} />
        ) : (
          <Home onSelect={setActiveGameId} />
        )}
      </div>
    </div>
  );
}
