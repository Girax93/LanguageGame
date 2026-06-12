import type { GameModule } from '../types';
import { FillInTheBlanks } from './FillInTheBlanks';

/** German letter-cipher (cryptogram). Unlocks after Pack 1 is learned. */
export const fillInTheBlanksGame: GameModule = {
  id: 'fill-in-the-blanks',
  title: 'Letter Cipher',
  subtitle: 'German · Crack the code',
  description:
    'Each letter is a number. Decode sentences built from words you’ve learned. Difficulty rises as packs progress.',
  icon: '🔡',
  accent: 'from-sky-500 to-indigo-500',
  status: 'available',
  gate: 'modes-unlocked',
  component: FillInTheBlanks,
};
