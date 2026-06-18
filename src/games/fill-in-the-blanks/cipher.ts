/**
 * Pure logic for the number-cipher (cryptogram) game. No React here so it
 * can be unit-tested and reused.
 *
 * German specifics:
 *  - The alphabet includes Ä, Ö, Ü and ß as their own distinct letters.
 *  - JS quirk: "ß".toUpperCase() === "SS". We must NOT do that — ß is a
 *    single cipher letter. `toUpperDE` handles this.
 */

export const GERMAN_ALPHABET: string[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Ä',
  'Ö',
  'Ü',
  'ß',
];

const LETTER_SET = new Set(GERMAN_ALPHABET);

/** Uppercase that keeps ß as a single ß (instead of expanding to "SS"). */
export function toUpperDE(input: string): string {
  let out = '';
  for (const ch of input) {
    out += ch === 'ß' ? 'ß' : ch.toUpperCase();
  }
  return out;
}

/** Is this (already-uppercased) character one of our cipher letters? */
export function isLetterDE(ch: string): boolean {
  return LETTER_SET.has(ch);
}

export type CellKind = 'letter' | 'punct';

export interface Cell {
  kind: CellKind;
  char: string;
  /** Slot index for letters (0-based, sentence-wide); -1 for punctuation. */
  slot: number;
}

export interface Puzzle {
  /** Words for layout (each an array of cells); spaces separate words. */
  words: Cell[][];
  /** slot index -> uppercase letter. Length === number of letter slots. */
  slotLetters: string[];
  /** Cipher number assigned to each letter (full alphabet). */
  numberForLetter: Record<string, number>;
  /** Slots pre-revealed as footholds: ONE occurrence of each of the most
   *  frequent letters. The player fills the remaining occurrences themselves. */
  givenSlots: Set<number>;
}

/** Shuffle the integers 1..n (inclusive) using the given RNG. */
function shuffledNumbers(n: number, rng: () => number): number[] {
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

export interface BuildOptions {
  /** How many of the most frequent letters to pre-reveal. Default 2. */
  givenCount?: number;
  rng?: () => number;
}

/** Build a fully-described puzzle from a raw sentence. */
export function buildPuzzle(rawSentence: string, options: BuildOptions = {}): Puzzle {
  const { givenCount = 2, rng = Math.random } = options;
  const upper = toUpperDE(rawSentence).trim();

  // Assign a unique cipher number to every alphabet letter.
  const nums = shuffledNumbers(GERMAN_ALPHABET.length, rng);
  const numberForLetter: Record<string, number> = {};
  GERMAN_ALPHABET.forEach((letter, i) => {
    numberForLetter[letter] = nums[i];
  });

  // Tokenize into words (split on whitespace); keep punctuation in-word.
  const words: Cell[][] = [];
  const slotLetters: string[] = [];
  let slot = 0;

  for (const wordStr of upper.split(/\s+/)) {
    if (wordStr === '') continue;
    const cells: Cell[] = [];
    for (const ch of wordStr) {
      if (isLetterDE(ch)) {
        cells.push({ kind: 'letter', char: ch, slot });
        slotLetters.push(ch);
        slot++;
      } else {
        cells.push({ kind: 'punct', char: ch, slot: -1 });
      }
    }
    if (cells.length > 0) words.push(cells);
  }

  // Footholds: reveal ONE occurrence of each of the most-frequent letters (not
  // every occurrence). The player infers the rest from the numbers — the
  // keyboard shows those letters as placeable — for a better puzzle overview.
  const freq: Record<string, number> = {};
  for (const letter of slotLetters) {
    freq[letter] = (freq[letter] ?? 0) + 1;
  }
  const givenLetters = new Set(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, givenCount)
      .map(([letter]) => letter),
  );
  const givenSlots = new Set<number>();
  const revealed = new Set<string>();
  slotLetters.forEach((letter, i) => {
    if (givenLetters.has(letter) && !revealed.has(letter)) {
      givenSlots.add(i);
      revealed.add(letter);
    }
  });
  // Never reveal the whole puzzle — always leave at least one slot to solve.
  while (givenSlots.size >= slotLetters.length && givenSlots.size > 0) {
    givenSlots.delete([...givenSlots][givenSlots.size - 1]);
  }

  return { words, slotLetters, numberForLetter, givenSlots };
}

/** Slots that start filled (the revealed footholds — one per given letter). */
export function initialFilled(puzzle: Puzzle): Set<number> {
  return new Set(puzzle.givenSlots);
}

/** First empty (unfilled) slot index, or null if none remain. */
export function firstEmpty(total: number, filled: Set<number>): number | null {
  for (let i = 0; i < total; i++) {
    if (!filled.has(i)) return i;
  }
  return null;
}

/** Next empty slot after `from` (wraps around), or null if puzzle is solved. */
export function nextEmpty(
  total: number,
  filled: Set<number>,
  from: number,
): number | null {
  for (let step = 1; step <= total; step++) {
    const i = (from + step) % total;
    if (!filled.has(i)) return i;
  }
  return null;
}

export type KeyState = 'disabled' | 'active' | 'idle';

/**
 * Visual state of a keyboard letter:
 *  - 'disabled': no empty slots need this letter (done, or — when greying is
 *                on — not in the puzzle at all).
 *  - 'active':   letter has been discovered AND still has empty slots.
 *  - 'idle':     letter is in the puzzle (or, at L6, possibly not) and not
 *                yet found.
 *
 * `greyUnused` (default true) controls difficulty L6: when false, letters
 * that are not in the puzzle are NOT greyed (so the keyboard no longer
 * reveals which letters are in play). Completed letters are still greyed.
 */
export function keyStateFor(
  letter: string,
  slotLetters: string[],
  filled: Set<number>,
  greyUnused = true,
): KeyState {
  let total = 0;
  let remaining = 0;
  let known = false;
  for (let i = 0; i < slotLetters.length; i++) {
    if (slotLetters[i] === letter) {
      total++;
      if (filled.has(i)) known = true;
      else remaining++;
    }
  }
  if (remaining === 0) {
    // Not needed: either fully solved (total>0) or absent (total===0).
    if (!greyUnused && total === 0) return 'idle';
    return 'disabled';
  }
  return known ? 'active' : 'idle';
}
