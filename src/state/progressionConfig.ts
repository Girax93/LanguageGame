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

  /** A challenge crossword (using every word in the block) gates progress after
   *  every this-many sets. 4 sets * 5 words = a 20-word challenge. */
  setsPerChallenge: 4,
} as const;
