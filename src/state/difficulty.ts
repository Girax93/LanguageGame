/**
 * Data-driven difficulty curve. Each level is a set of flags applied by the
 * cipher board. By design the cipher number under EVERY letter is always
 * shown, and every puzzle starts with a few given letters (footholds) — so a
 * cipher is never "it could be anything". The curve only varies how many free
 * letters you start with.
 */
export interface DifficultyFlags {
  /** How many of the most frequent letters start pre-revealed. Always >= 2. */
  footholds: number;
  /** Hide a slot's number until it or a neighbor is solved. Always false. */
  hideNumbersUntilAdjacent: boolean;
  /** Require a found neighbor before a slot accepts input. Always false. */
  neighborLock: boolean;
  /** Grey/disable keyboard letters that aren't needed (a helpful hint). */
  greyUnusedKeys: boolean;
}

export const MAX_LEVEL = 6;

// Numbers always visible, neighbour-lock off, unused keys greyed (a help), and
// always footholds. Higher levels simply hand out fewer free letters.
const BASE = {
  hideNumbersUntilAdjacent: false,
  neighborLock: false,
  greyUnusedKeys: true,
} as const;

export const DIFFICULTY: Record<number, DifficultyFlags> = {
  1: { footholds: 3, ...BASE },
  2: { footholds: 3, ...BASE },
  3: { footholds: 2, ...BASE },
  4: { footholds: 2, ...BASE },
  5: { footholds: 2, ...BASE },
  6: { footholds: 2, ...BASE },
};

/** Flags for a level, clamped to the defined range. */
export function flagsForLevel(level: number): DifficultyFlags {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.round(level)));
  return DIFFICULTY[clamped];
}
