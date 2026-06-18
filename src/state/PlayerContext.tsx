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
import {
  recordWordAnswer,
  recordChallengeDone,
  recordPracticeDrill as applyPracticeDrill,
  recordCipherRound as applyCipherRound,
  recordRecapDone as applyRecapDone,
  forceRecapDue as applyForceRecapDue,
  addCipherWords,
  addGrammarNoun,
} from './progression';

interface PlayerContextValue {
  state: PlayerState;
  /** A ticking clock (ms) so focus countdowns + the daily-recap timer re-render. */
  now: number;
  answerWord: (wordId: string, correct: boolean) => void;
  recordLevel: (won: boolean, countsTowardGate?: boolean) => void;
  /** Mark the given challenge block cleared. */
  recordChallenge: (block: number) => void;
  /** Count one completed grammar Practice drill for the block (gates advancement). */
  recordPracticeDrill: (block: number) => void;
  /** Count one solved cipher Practice sentence for the block (gates advancement). */
  recordCipherRound: (block: number) => void;
  /** Mark today's recap session complete (resets the 24h timer). */
  recordRecapDone: () => void;
  /** DEV: make the daily recap due now (for testing). */
  forceRecapDue: () => void;
  /** Mark words used in a solved Practice cipher (block cipher-coverage). */
  recordCipherWords: (ids: string[]) => void;
  /** Mark a noun's article drilled in a solved Practice grammar (coverage). */
  recordGrammarNoun: (id: string | undefined) => void;
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

  useEffect(() => {
    savePlayerState(state);
  }, [state]);

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
      recordPracticeDrill: (block) => setState((s) => applyPracticeDrill(s, block)),
      recordCipherRound: (block) => setState((s) => applyCipherRound(s, block)),
      recordRecapDone: () => setState((s) => applyRecapDone(s, Date.now())),
      forceRecapDue: () => setState((s) => applyForceRecapDue(s, Date.now())),
      recordCipherWords: (ids) => setState((s) => addCipherWords(s, ids)),
      recordGrammarNoun: (id) => setState((s) => addGrammarNoun(s, id)),
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
