/**
 * The full persisted player state. Versioned so we can migrate/clear later.
 */
export interface PlayerState {
  version: number;
  /** Word ids the player has fully learned (feeds every gate). */
  learnedWords: string[];
  /** Per-word progress toward "learned" (correct-answer streak). */
  wordProgress: Record<string, number>;
  /** Words used in a solved Practice cipher (block cipher-coverage). */
  cipherWords: string[];
  /** Nouns whose article was drilled in a solved Practice grammar (coverage). */
  grammarWords: string[];
  /** Per-block count of completed grammar Practice drills (block index -> count). */
  practiceCounts: Record<number, number>;
  /** Per-block count of completed cipher Practice sentences (block index -> count). */
  cipherCounts: Record<number, number>;
  /** Per-block count of completed crossword Practice puzzles (block index -> count). */
  crosswordCounts: Record<number, number>;
  /** Per-block count of solved Hurdle Practice words (block index -> count). */
  hurdleCounts: Record<number, number>;
  /** Challenge-block indices whose crossword has been completed. */
  challengesDone: number[];
  /** Epoch ms of the last completed recap session (starts at creation). */
  lastRecapAt: number;
  /** Total games won (a statistic only — no longer gates anything). */
  levelsWon: number;
  /** Current focus (energy). */
  focus: number;
  /** Epoch ms anchor used to compute focus regen. */
  lastFocusRegenAt: number;
  /** Subscription stub — when true, focus is unlimited. */
  subscribed: boolean;
  /** Consecutive days with any activity (this language). 0 until first activity. */
  streak: number;
  /** Local day-index (days since epoch) of the most recent activity; -1 = never. */
  lastActiveDay: number;
  /** Practice "focus pool": word ids the player missed in a FAILED Practice game,
   *  mapped to their re-mastery streak (consecutive-correct in a focus session).
   *  A word leaves the pool once the streak reaches `masteryThreshold`. Articles
   *  and grammar drills never add to it. Per language (namespaced storage). */
  focusPool: Record<string, number>;
}

// Bumped to 9: the per-block Practice gate now also requires the Hurdle session
// (hurdleCounts) alongside the grammar drills, cipher session and crossword.
// Old saves reset.
// (Phase 1 added `streak`/`lastActiveDay` WITHOUT a bump — they merge in from
//  defaults for existing v9 saves, so no reset was needed. `focusPool` was added
//  the same way — additive, backfilled from defaults, so still no bump.)
export const STATE_VERSION = 9; // focusPool added additively (no bump)

export function defaultPlayerState(now: number, focusStart: number): PlayerState {
  return {
    version: STATE_VERSION,
    learnedWords: [],
    wordProgress: {},
    cipherWords: [],
    grammarWords: [],
    practiceCounts: {},
    cipherCounts: {},
    crosswordCounts: {},
    hurdleCounts: {},
    challengesDone: [],
    lastRecapAt: now,
    levelsWon: 0,
    focus: focusStart,
    lastFocusRegenAt: now,
    subscribed: false,
    streak: 0,
    lastActiveDay: -1,
    focusPool: {},
  };
}
