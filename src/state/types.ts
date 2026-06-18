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
  /** Per-block count of completed Practice drills (block index -> count). */
  practiceCounts: Record<number, number>;
  /** Challenge-block indices whose crossword has been completed. */
  challengesDone: number[];
  /** Epoch ms of the last completed recap session (0 = never). Daily recap. */
  lastRecapAt: number;
  /** Total games won (a statistic only — no longer gates anything). */
  levelsWon: number;
  /** Current focus (energy). */
  focus: number;
  /** Epoch ms anchor used to compute focus regen. */
  lastFocusRegenAt: number;
  /** Subscription stub — when true, focus is unlimited. */
  subscribed: boolean;
}

// Bumped to 6: Practice gate is now a per-block drill count (practiceCounts)
// + lastRecapAt for the daily recap. Old saves reset.
export const STATE_VERSION = 6;

export function defaultPlayerState(now: number, focusStart: number): PlayerState {
  return {
    version: STATE_VERSION,
    learnedWords: [],
    wordProgress: {},
    cipherWords: [],
    grammarWords: [],
    practiceCounts: {},
    challengesDone: [],
    lastRecapAt: 0,
    levelsWon: 0,
    focus: focusStart,
    lastFocusRegenAt: now,
    subscribed: false,
  };
}
