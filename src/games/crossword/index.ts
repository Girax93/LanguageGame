import type { GameModule } from '../types';
import { Crossword } from './CrosswordGame';

/** German vocabulary crossword. Draws from the whole mastered pool (Recap). */
export const crosswordGame: GameModule = {
  id: 'crossword',
  title: 'Crossword',
  subtitle: 'German · Interlocking words',
  description:
    'Fill interlocking grids built from words you have learned. Each clue is the answer’s English meaning.',
  icon: '🧩',
  accent: 'from-emerald-500 to-teal-500',
  status: 'available',
  gate: 'modes-unlocked',
  component: Crossword,
};
