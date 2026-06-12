import type { ComponentType } from 'react';

/**
 * Props passed to every game's root component. Games read/update player
 * state via the usePlayer() hook, so this stays minimal.
 */
export interface GameProps {
  onExit: () => void;
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
