import type { GameModule } from '../types';
import { Learn } from './Learn';

/** Vocabulary acquisition. Always available; feeds the word gate. */
export const learnGame: GameModule = {
  id: 'learn',
  title: 'Learn',
  subtitle: 'Acquire new words',
  description:
    'Pick up new German words with quick recognition and recall checks. Learned words unlock the other modes.',
  icon: '🌱',
  accent: 'from-lime-500 to-emerald-500',
  status: 'available',
  gate: 'always',
  component: Learn,
};
