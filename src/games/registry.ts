import type { GameModule } from './types';
import { learnGame } from './learn';
import { fillInTheBlanksGame } from './fill-in-the-blanks';
import { grammarGame } from './grammar';
import { crosswordGame } from './crossword';
import { hurdleGame } from './hurdle';

/**
 * Master list of games (order = home-screen order). The home screen applies
 * each module's `gate` against player progress to decide lock state.
 */
export const games: GameModule[] = [
  learnGame,
  fillInTheBlanksGame,
  grammarGame,
  crosswordGame,
  hurdleGame,
  {
    id: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Spaced & gamified',
    description: 'Gamified spaced-repetition review of everything you know.',
    icon: '⚡',
    accent: 'from-fuchsia-500 to-pink-500',
    status: 'coming-soon',
  },
];

export function getGame(id: string): GameModule | undefined {
  return games.find((g) => g.id === id);
}
