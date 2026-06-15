/**
 * PROGRESSION — tuning for the learn → practise → unlock rhythm.
 *
 * Loop: learn a BLOCK of `setsPerBlock` sets (the new words), then fully
 * practise that block — use every new word in letter ciphers, drill every new
 * article in grammar, and finish the block's crossword challenge — before the
 * next block of sets unlocks.
 */
export const PROGRESSION = {
  /** Words delivered per set (vocabulary is chunked into ordered sets). */
  wordsPerSet: 5,

  /** Correct answers in a row in LEARN to "master" a word. */
  masteryThreshold: 2,

  /** Sets learned + practised together as one block (2 sets = 10 words). */
  setsPerBlock: 2,
} as const;
