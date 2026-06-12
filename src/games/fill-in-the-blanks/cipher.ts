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
  /** Letters pre-revealed as footholds (the most frequent letters). */
  givens: Set<string>;
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

  // Givens: the most frequent letters in this sentence.
  const freq: Record<string, number> = {};
  for (const letter of slotLetters) {
    freq[letter] = (freq[letter] ?? 0) + 1;
  }
  const givens = new Set(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, givenCount)
      .map(([letter]) => letter),
  );

  return { words, slotLetters, numberForLetter, givens };
}

/** Slots that start filled because their letter is a given. */
export function initialFilled(puzzle: Puzzle): Set<number> {
  const filled = new Set<number>();
  puzzle.slotLetters.forEach((letter, i) => {
    if (puzzle.givens.has(letter)) filled.add(i);
  });
  return filled;
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
 *  - 'disabled': no empty slots need this letter (not in puzzle, or done).
 *  - 'active':   letter has been discovered AND still has empty slots.
 *  - 'idle':     letter is in the puzzle, has empty slots, not yet found.
 */
export function keyStateFor(
  letter: string,
  slotLetters: string[],
  filled: Set<number>,
): KeyState {
  let remaining = 0;
  let known = false;
  for (let i = 0; i < slotLetters.length; i++) {
    if (slotLetters[i] === letter) {
      if (filled.has(i)) known = true;
      else remaining++;
    }
  }
  if (remaining === 0) return 'disabled';
  return known ? 'active' : 'idle';
}
