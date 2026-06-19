/**
 * Pure logic for Hurdle — a Wordle-style single-word guesser. No React here so
 * it can be unit-tested and reused by the board.
 *
 * The player is shown a word's English meaning and a row of empty tiles (one
 * per German letter). They guess the spelling a whole word at a time; each
 * submitted guess is scored Wordle-style (correct / present / absent). Instead
 * of hearts, the player gets a number of TRIES that scales with word length.
 *
 * German specifics carry over from the cipher: Ä Ö Ü and ß are single letters,
 * so we count/compare by code point (`[...word]`), never via .length, and use
 * `toUpperDE` so ß is not expanded to "SS".
 */
import { toUpperDE, isLetterDE } from '../fill-in-the-blanks/cipher';

/** Floor on tries — even a 1–2 letter word gets this many. */
export const HURDLE_MIN_TRIES = 5;
/** Tries above the letter count (so a 5-letter word gets 5 + 3 = 8). */
export const HURDLE_EXTRA_TRIES = 3;

/** Number of letters in an answer (umlauts/ß count as one). */
export function answerLength(answer: string): number {
  return [...answer].length;
}

/**
 * Tries for a word: letters + a few, floored at HURDLE_MIN_TRIES, no ceiling.
 * 5 letters → 8, 7 → 10, 3 → 6, 2 → 5. Longer compounds simply get more rows.
 */
export function triesFor(answer: string): number {
  return Math.max(HURDLE_MIN_TRIES, answerLength(answer) + HURDLE_EXTRA_TRIES);
}

export type TileState = 'correct' | 'present' | 'absent';

/**
 * Score a guess against the answer (both same length, uppercased).
 *  - 'correct': right letter, right position.
 *  - 'present': letter is in the word elsewhere (respecting letter counts, so a
 *    guessed letter never claims more copies than the answer actually has).
 *  - 'absent':  not in the word (or all its copies already accounted for).
 */
export function scoreGuess(guess: string, answer: string): TileState[] {
  const g = [...guess];
  const a = [...answer];
  const res: TileState[] = g.map(() => 'absent');
  const remaining: Record<string, number> = {};
  for (const ch of a) remaining[ch] = (remaining[ch] ?? 0) + 1;

  // Pass 1: exact matches consume a copy.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      res[i] = 'correct';
      remaining[g[i]]--;
    }
  }
  // Pass 2: remaining letters that still have an unclaimed copy are 'present'.
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
  const up = toUpperDE(ch);
  return isLetterDE(up) ? up : null;
}
