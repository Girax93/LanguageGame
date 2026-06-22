/**
 * Pure logic for Hurdle — a Wordle-style single-word guesser. No React here so
 * it can be unit-tested and reused by the board.
 *
 * The player is shown a word's English meaning and a row of empty tiles. They
 * guess the spelling a whole word at a time; each submitted guess is scored
 * Wordle-style (correct / present / absent). Instead of hearts, the player gets
 * a number of TRIES that scales with word length.
 *
 * Multi-byte letters (German Ä/Ö/Ü/ß, Norwegian Æ/Ø/Å) are single letters, so we
 * count/compare by code point (`[...word]`), never via .length, and uppercase
 * via the active language so ß is not expanded to "SS".
 */
import { toUpperActive, isLetterActive } from '../../content/lang/alphabet';

/** Floor on tries — even a 1–2 letter word gets this many. */
export const HURDLE_MIN_TRIES = 5;
/** Tries above the letter count (so a 5-letter word gets 5 + 3 = 8). */
export const HURDLE_EXTRA_TRIES = 3;

/** Number of letters in an answer (umlauts/ß/æøå count as one). */
export function answerLength(answer: string): number {
  return [...answer].length;
}

/**
 * Tries for a word: letters + a few, floored at HURDLE_MIN_TRIES, no ceiling.
 */
export function triesFor(answer: string): number {
  return Math.max(HURDLE_MIN_TRIES, answerLength(answer) + HURDLE_EXTRA_TRIES);
}

export type TileState = 'correct' | 'present' | 'absent';

/**
 * Score a guess against the answer (both same length, uppercased).
 */
export function scoreGuess(guess: string, answer: string): TileState[] {
  const g = [...guess];
  const a = [...answer];
  const res: TileState[] = g.map(() => 'absent');
  const remaining: Record<string, number> = {};
  for (const ch of a) remaining[ch] = (remaining[ch] ?? 0) + 1;

  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      res[i] = 'correct';
      remaining[g[i]]--;
    }
  }
  for (let i = 0; i < g.length; i++) {
    if (res[i] === 'correct') continue;
    if ((remaining[g[i]] ?? 0) > 0) {
      res[i] = 'present';
      remaining[g[i]]--;
    }
  }
  return res;
}

/** True when the guess exactly matches the answer. */
export function isSolved(guess: string, answer: string): boolean {
  return guess === answer && guess.length > 0;
}

/** A submitted, scored guess (kept by the board for rendering + key hints). */
export interface ScoredGuess {
  letters: string[];
  states: TileState[];
}

const RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };

/**
 * Best-known state per keyboard letter across all guesses (correct beats
 * present beats absent). Letters never guessed are omitted (treat as idle).
 */
export function keyHints(guesses: ScoredGuess[]): Record<string, TileState> {
  const out: Record<string, TileState> = {};
  for (const g of guesses) {
    for (let i = 0; i < g.letters.length; i++) {
      const L = g.letters[i];
      const s = g.states[i];
      const cur = out[L];
      if (cur === undefined || RANK[s] > RANK[cur]) out[L] = s;
    }
  }
  return out;
}

/** Normalise a typed character to a usable Hurdle letter, or null. */
export function normalizeLetter(ch: string): string | null {
  if (ch.length !== 1) return null;
  const up = toUpperActive(ch);
  return isLetterActive(up) ? up : null;
}
