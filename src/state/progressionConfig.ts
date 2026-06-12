/**
 * PROGRESSION — tuning for word-gating and pack unlocks.
 */
export const PROGRESSION = {
  /** Correct answers (in a row) needed in LEARN to mark a word "learned". */
  learnThreshold: 2,

  /**
   * Wins required to unlock the *next* pack, multiplied by the current pack
   * number. e.g. with 2: pack 2 needs 2 wins, pack 3 needs 4 total wins, …
   * (on top of having fully learned the current pack).
   */
  unlockWinsPerPack: 2,
} as const;
