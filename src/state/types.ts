/**
 * The full persisted player state. Versioned so we can migrate/clear later.
 */
export interface PlayerState {
  version: number;
  /** Word ids the player has fully learned (feeds the gate). */
  learnedWords: string[];
  /** Per-word progress toward "learned" (correct-answer streak). */
  wordProgress: Record<string, number>;
  /** Total cipher/grammar levels won (drives pack unlocks). */
  levelsWon: number;
  /** Current focus (energy). */
  focus: number;
  /** Epoch ms anchor used to compute focus regen. */
  lastFocusRegenAt: number;
  /** Subscription stub — when true, focus is unlimited. */
  subscribed: boolean;
}

export const STATE_VERSION = 1;

export function defaultPlayerState(now: number, focusStart: number): PlayerState {
  return {
    version: STATE_VERSION,
    learnedWords: [],
    wordProgress: {},
    levelsWon: 0,
    focus: focusStart,
    lastFocusRegenAt: now,
    subscribed: false,
  };
}
