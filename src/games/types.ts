import type { ComponentType } from 'react';

/** How a game scopes its puzzle pool.
 *  - practice: the current block's gating session.
 *  - recap: everything learned (free review, does not gate).
 *  - daily: a short bounded review for the forced daily recap. */
export type GameScope = 'practice' | 'recap' | 'daily';

/**
 * Props passed to every game's root component. Games read/update player
 * state via the usePlayer() hook, so this stays minimal.
 */
export interface GameProps {
  onExit: () => void;
  /** Open the Settings screen (e.g. to refill focus when out). */
  onOpenSettings?: () => void;
  /** Request returning to the main menu (host shows a confirm). */
  onMain?: () => void;
  /** Jump to the Practice menu (Learn uses this when a set is complete). */
  onPractice?: () => void;
  /** Go to Learn (used by the practice-complete screen). */
  onLearn?: () => void;
  /** Go to the Recap menu (used by the practice-complete screen). */
  onRecap?: () => void;
  /** Mark the daily recap done + leave (used by the daily-recap session). */
  onRecapDone?: () => void;
  /** Word-pool scope. Defaults to 'practice'. */
  scope?: GameScope;
}

export type GameStatus = 'available' | 'coming-soon';

/** When a mode becomes playable. */
export type GameGate = 'always' | 'modes-unlocked';

/**
 * A self-contained game module. Add a game: create src/games/<game>/ that
 * exports one of these, then register it in src/games/registry.ts.
 */
export interface GameModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
  status: GameStatus;
  /** Gate controlling availability. Defaults to 'always'. */
  gate?: GameGate;
  component?: ComponentType<GameProps>;
}
