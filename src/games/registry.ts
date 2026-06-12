import type { GameModule } from './types';
import { fillInTheBlanksGame } from './fill-in-the-blanks';

/**
 * The master list of games. Order here is the order shown on the home
 * screen. To add a game, import its module and drop it into this array.
 *
 * 'coming-soon' entries are placeholders for the planned series and
 * render as disabled cards until a `component` is supplied and the
 * status is flipped to 'available'.
 */
export const games: GameModule[] = [
  fillInTheBlanksGame,
  {
    id: 'crossword',
    title: 'Crossword',
    subtitle: 'Vocabulary, interlocked',
    description: 'Solve themed crosswords built from your vocabulary lists.',
    icon: '🧩',
    accent: 'from-emerald-500 to-teal-500',
    status: 'coming-soon',
  },
  {
    id: 'number-fill',
    title: 'Number Fill-ins',
    subtitle: 'Hear it, write it',
    description: 'Practice numbers, dates and prices by filling in what you hear.',
    icon: '🔢',
    accent: 'from-amber-500 to-orange-500',
    status: 'coming-soon',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Spaced & gamified',
    description: 'Gamified flashcards with streaks, levels and smart review.',
    icon: '⚡',
    accent: 'from-fuchsia-500 to-pink-500',
    status: 'coming-soon',
  },
];

export function getGame(id: string): GameModule | undefined {
  return games.find((g) => g.id === id);
}
