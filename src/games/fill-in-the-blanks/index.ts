import type { GameModule } from '../types';
import { FillInTheBlanks } from './FillInTheBlanks';

/**
 * Module definition for the German letter-cipher (cryptogram) game.
 * Kept as the "fill-in-the-blanks" module id for the registry/architecture.
 */
export const fillInTheBlanksGame: GameModule = {
  id: 'fill-in-the-blanks',
  title: 'Letter Cipher',
  subtitle: 'German · Crack the code',
  description:
    'Each letter is a number. Decode German sentences one letter at a time using the on-screen keyboard.',
  icon: '🔡',
  accent: 'from-sky-500 to-indigo-500',
  status: 'available',
  component: FillInTheBlanks,
};
