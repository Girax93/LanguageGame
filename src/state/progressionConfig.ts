/**
 * PROGRESSION — tuning for the learn → play → unlock rhythm.
 */
export const PROGRESSION = {
  /** Words delivered per set (vocabulary is chunked into ordered sets). */
  wordsPerSet: 5,

  /** Correct answers in a row in LEARN to "master" a word. */
  masteryThreshold: 2,

  /** Cipher/grammar levels to clear before the next word set unlocks. */
  gamesToAdvance: 2,
} as const;
