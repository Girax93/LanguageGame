import type { GameModule } from '../types';
import { Hurdle } from './HurdleGame';

/** Wordle-style word speller. Drill a block's words letter by letter. */
export const hurdleGame: GameModule = {
  id: 'hurdle',
  title: 'Hurdle',
  subtitle: 'German · Spell the word',
  description:
    'Guess the German word from its meaning, one row at a time. Green = right spot, amber = wrong spot. Longer words give more tries.',
  icon: '🟩',
  accent: 'from-lime-500 to-green-600',
  status: 'available',
  gate: 'modes-unlocked',
  component: Hurdle,
};
