/**
 * Active-language alphabet/keyboard access for the game runtime (cipher board,
 * hurdle, crossword, grammar boards + keyboards). These follow whichever
 * language is active. Content modules that precompute ALL languages at load use
 * each pack's own `toUpper`/`isLetter` instead (not these).
 */
import { getActiveLang } from './registry';
import type { KeyState } from '../../games/fill-in-the-blanks/cipher';

export function toUpperActive(s: string): string {
  return getActiveLang().toUpper(s);
}
export function isLetterActive(c: string): boolean {
  return getActiveLang().isLetter(c);
}
export function activeAlphabet(): string[] {
  return getActiveLang().alphabet;
}
export function activeKeyboardRows(): string[][] {
  return getActiveLang().keyboardRows;
}
export type { KeyState };
