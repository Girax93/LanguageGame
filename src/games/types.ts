import type { ComponentType } from 'react';

/** How a game scopes its puzzle pool. Practice = recent words only; Recap =
 *  everything learned (and does not count toward the unlock gate). */
export type GameScope = 'practice' | 'recap';

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
