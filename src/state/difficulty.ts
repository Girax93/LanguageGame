/**
 * Data-driven difficulty curve. Each level is a set of flags applied by the
 * cipher board, so the curve is easy to retune without touching UI logic.
 *
 *  L1: two footholds + all numbers shown (gentlest).
 *  L2: one foothold.
 *  L3: zero footholds.
 *  L4: a slot's number stays hidden until an adjacent slot is solved.
 *  L5: neighbor-locks — a slot won't accept input until a neighbor is found
 *      (word-initial slots are always open, so the puzzle stays solvable).
 *  L6: stop greying unused keyboard letters (keyboard hides which letters
 *      are in play).
 */
export interface DifficultyFlags {
  /** How many of the most frequent letters start pre-revealed. */
  footholds: number;
  /** Hide a slot's number until it or a neighbor is solved. */
  hideNumbersUntilAdjacent: boolean;
  /** Require a found neighbor before a slot accepts input. */
  neighborLock: boolean;
  /** Grey/disable keyboard letters that aren't (or are no longer) needed. */
  greyUnusedKeys: boolean;
}

export const MAX_LEVEL = 6;

export const DIFFICULTY: Record<number, DifficultyFlags> = {
  1: { footholds: 2, hideNumbersUntilAdjacent: false, neighborLock: false, greyUnusedKeys: true },
  2: { footholds: 1, hideNumbersUntilAdjacent: false, neighborLock: false, greyUnusedKeys: true },
  3: { footholds: 0, hideNumbersUntilAdjacent: false, neighborLock: false, greyUnusedKeys: true },
  4: { footholds: 0, hideNumbersUntilAdjacent: true, neighborLock: false, greyUnusedKeys: true },
  5: { footholds: 0, hideNumbersUntilAdjacent: false, neighborLock: true, greyUnusedKeys: true },
  6: { footholds: 0, hideNumbersUntilAdjacent: false, neighborLock: false, greyUnusedKeys: false },
};

/** Flags for a level, clamped to the defined range. */
export function flagsForLevel(level: number): DifficultyFlags {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.round(level)));
  return DIFFICULTY[clamped];
}
