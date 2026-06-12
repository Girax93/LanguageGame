import type { ComponentType } from 'react';

/**
 * Props passed to every game's root component.
 * Keep this minimal and stable so new game modules stay decoupled
 * from the app shell.
 */
export interface GameProps {
  /** Return to the home screen. */
  onExit: () => void;
}

export type GameStatus = 'available' | 'coming-soon';

/**
 * A self-contained game module. Add a new game by creating a folder
 * under src/games/<your-game>/ that exports one of these, then
 * registering it in src/games/registry.ts.
 */
export interface GameModule {
  /** Stable unique id, used for routing. */
  id: string;
  title: string;
  /** One-line tagline shown on the home card. */
  subtitle: string;
  /** Longer description shown on the home card. */
  description: string;
  /** Emoji used as a lightweight icon (no asset pipeline needed). */
  icon: string;
  /** Tailwind gradient classes for the card accent, e.g. 'from-sky-500 to-indigo-500'. */
  accent: string;
  status: GameStatus;
  /** Root component. Required when status is 'available'. */
  component?: ComponentType<GameProps>;
}
