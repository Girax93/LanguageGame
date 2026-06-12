import type { GameModule } from '../types';
import { Grammar } from './Grammar';

/** German article-ending drill. Unlocks after Pack 1 is learned. */
export const grammarGame: GameModule = {
  id: 'grammar',
  title: 'Grammar',
  subtitle: 'German · der/die/das',
  description:
    'Recall the right article ending (der/die/das, eine…). No number to deduce from — you have to remember the gender.',
  icon: '🧠',
  accent: 'from-violet-500 to-purple-500',
  status: 'available',
  gate: 'modes-unlocked',
  component: Grammar,
};
