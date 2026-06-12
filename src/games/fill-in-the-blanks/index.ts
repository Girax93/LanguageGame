import type { GameModule } from '../types';
import { FillInTheBlanks } from './FillInTheBlanks';

/**
 * Module definition for the German fill-in-the-blanks game.
 * Registered in src/games/registry.ts.
 */
export const fillInTheBlanksGame: GameModule = {
  id: 'fill-in-the-blanks',
  title: 'Fill in the Blanks',
  subtitle: 'German · Beginner',
  description:
    'Complete each German sentence by choosing the missing word. Build a streak!',
  icon: '✍️',
  accent: 'from-sky-500 to-indigo-500',
  status: 'available',
  component: FillInTheBlanks,
};
