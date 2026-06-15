import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PlayerState } from './types';
import { defaultPlayerState } from './types';
import { ECONOMY } from './economyConfig';
import { loadPlayerState, savePlayerState, clearPlayerState } from './storage';
import {
  applyRegen,
  recordLevelResult,
  recordLevelResultNoGate,
  buyFocusRefill,
  setSubscribed as setSubscribedPure,
} from './focus';
import { recordWordAnswer, recordChallengeDone } from './progression';

interface PlayerContextValue {
  state: PlayerState;
  /** A ticking clock (ms) so focus countdowns re-render. */
  now: number;
  answerWord: (wordId: string, correct: boolean) => void;
  /**
   * Record a level result. `countsTowardGate` (default true) advances the
   * games-to-advance unlock counter on a win; Recap passes false so review
   * never changes unlock progress.
   */
  recordLevel: (won: boolean, countsTowardGate?: boolean) => void;
  /** Mark the given challenge block cleared. */
  recordChallenge: (block: number) => void;
  buyFocus: () => void;
  setSubscribed: (value: boolean) => void;
  resetProgress: () => void;
}

const PlayerCtx = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>(() =>
    applyRegen(loadPlayerState(Date.now()), Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());

  // Persist whenever state changes.
  useEffect(() => {
    savePlayerState(state);
  }, [state]);

  // Tick: advance the clock and apply focus regen. applyRegen returns the
  // same object when nothing changes, so React bails out of needless updates.
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((s) => applyRegen(s, t));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      state,
      now,
      answerWord: (wordId, correct) =>
        setState((s) => recordWordAnswer(s, wordId, correct)),
      recordLevel: (won, countsTowardGate = true) =>
        setState((s) =>
          (countsTowardGate ? recordLevelResult : recordLevelResultNoGate)(s, won, Date.now()),
        ),
      recordChallenge: (block) => setState((s) => recordChallengeDone(s, block)),
      buyFocus: () => setState((s) => buyFocusRefill(s, Date.now())),
      setSubscribed: (v) => setState((s) => setSubscribedPure(s, v, Date.now())),
      resetProgress: () => {
        clearPlayerState();
        setState(defaultPlayerState(Date.now(), ECONOMY.focusStart));
      },
    }),
    [state, now],
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const v = useContext(PlayerCtx);
  if (!v) throw new Error('usePlayer must be used within a PlayerProvider');
  return v;
}
