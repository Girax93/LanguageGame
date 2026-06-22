/**
 * Pure logic for the number-cipher (cryptogram) game. No React here so it can be
 * unit-tested and reused. The alphabet follows the ACTIVE language (German
 * Ä/Ö/Ü/ß; Norwegian Æ/Ø/Å) via the active-alphabet helpers.
 */
import { toUpperActive, isLetterActive, activeAlphabet } from '../../content/lang/alphabet';

export type CellKind = 'letter' | 'punct';

export interface Cell {
  kind: CellKind;
  char: string;
  /** Slot index for letters (0-based, sentence-wide); -1 for punctuation. */
  slot: number;
}

export interface Puzzle {
  words: Cell[][];
  slotLetters: string[];
  numberForLetter: Record<string, number>;
  givenSlots: Set<number>;
}

function shuffledNumbers(n: number, rng: () => number): number[] {
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

export interface BuildOptions {
  givenCount?: number;
  rng?: () => number;
}

/** Build a fully-described puzzle from a raw sentence (active-language alphabet). */
export function buildPuzzle(rawSentence: string, options: BuildOptions = {}): Puzzle {
  const { givenCount = 2, rng = Math.random } = options;
  const upper = toUpperActive(rawSentence).trim();

  const ALPHABET = activeAlphabet();
  const nums = shuffledNumbers(ALPHABET.length, rng);
  const numberForLetter: Record<string, number> = {};
  ALPHABET.forEach((letter, i) => {
    numberForLetter[letter] = nums[i];
  });

  const words: Cell[][] = [];
  const slotLetters: string[] = [];
  let slot = 0;

  for (const wordStr of upper.split(/\s+/)) {
    if (wordStr === '') continue;
    const cells: Cell[] = [];
    for (const ch of wordStr) {
      if (isLetterActive(ch)) {
        cells.push({ kind: 'letter', char: ch, slot });
        slotLetters.push(ch);
        slot++;
      } else {
        cells.push({ kind: 'punct', char: ch, slot: -1 });
      }
    }
    if (cells.length > 0) words.push(cells);
  }

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
  while (givenSlots.size >= slotLetters.length && givenSlots.size > 0) {
    givenSlots.delete([...givenSlots][givenSlots.size - 1]);
  }

  return { words, slotLetters, numberForLetter, givenSlots };
}

export function initialFilled(puzzle: Puzzle): Set<number> {
  return new Set(puzzle.givenSlots);
}

export function firstEmpty(total: number, filled: Set<number>): number | null {
  for (let i = 0; i < total; i++) {
    if (!filled.has(i)) return i;
  }
  return null;
}

export function nextEmpty(total: number, filled: Set<number>, from: number): number | null {
  for (let step = 1; step <= total; step++) {
    const i = (from + step) % total;
    if (!filled.has(i)) return i;
  }
  return null;
}

export type KeyState = 'disabled' | 'active' | 'idle';

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
    if (!greyUnused && total === 0) return 'idle';
    return 'disabled';
  }
  return known ? 'active' : 'idle';
}
