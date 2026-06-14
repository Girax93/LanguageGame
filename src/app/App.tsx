import { useState } from 'react';
import type { Route } from './routes';
import { getGame } from '../games/registry';
import { Home } from './Home';
import { Practice } from './Practice';
import { Progress } from './Progress';
import { Settings } from './Settings';

/**
 * App shell + screen router. Distinct screens (Home / Practice / Progress /
 * Settings + the game screens) keep each view calm and single-purpose.
 */
export function App() {
  const [route, setRoute] = useState<Route>('home');

  function renderGame(id: Route, back: Route) {
    const Game = getGame(id)?.component;
    if (!Game) return null;
    return (
      <Game onExit={() => setRoute(back)} onOpenSettings={() => setRoute('settings')} />
    );
  }

  const pinned = route === 'fill-in-the-blanks' || route === 'grammar';
  let screen;
  switch (route) {
    case 'practice':
      screen = <Practice onBack={() => setRoute('home')} onSelect={(id) => setRoute(id)} />;
      break;
    case 'progress':
      screen = <Progress onBack={() => setRoute('home')} />;
      break;
    case 'settings':
      screen = <Settings onBack={() => setRoute('home')} />;
      break;
    case 'learn':
      screen = renderGame('learn', 'home');
      break;
    case 'fill-in-the-blanks':
      screen = renderGame('fill-in-the-blanks', 'practice');
      break;
    case 'grammar':
      screen = renderGame('grammar', 'practice');
      break;
    default:
      screen = <Home onNavigate={setRoute} />;
  }

  return (
    <div className="h-full bg-page text-espresso">
      <div
        className={`mx-auto flex h-full w-full max-w-screen-sm flex-col px-5 pt-6 ${
          pinned ? 'overflow-hidden pb-4' : 'overflow-y-auto pb-10'
        }`}
      >
        {screen}
      </div>
    </div>
  );
}
