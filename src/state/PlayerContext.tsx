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
import {
  loadPlayerState,
  savePlayerState,
  clearPlayerState,
  clearAllPlayerState,
  loadActiveLanguage,
  saveActiveLanguage,
} from './storage';
import { setActiveContentLanguage } from '../content/lang/registry';
import { touchStreak } from './streak';
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
  recordCrosswordRound as applyCrosswordRound,
  recordHurdleRound as applyHurdleRound,
  recordRecapDone as applyRecapDone,
  forceRecapDue as applyForceRecapDue,
  addCipherWords,
  addGrammarNoun,
} from './progression';

// Pick the saved language and align the content layer BEFORE any state loads.
const INITIAL_LANG = loadActiveLanguage();
setActiveContentLanguage(INITIAL_LANG);

interface PlayerContextValue {
  state: PlayerState;
  now: number;
  /** The active course language ('de' | 'no'). */
  language: string;
  /** Switch course language: saves current progress, loads the other language's. */
  switchLanguage: (code: string) => void;
  answerWord: (wordId: string, correct: boolean) => void;
  recordLevel: (won: boolean, countsTowardGate?: boolean) => void;
  recordChallenge: (block: number) => void;
  recordPracticeDrill: (block: number) => void;
  recordCipherRound: (block: number) => void;
  recordCrosswordRound: (block: number) => void;
  recordHurdleRound: (block: number) => void;
  recordRecapDone: () => void;
  forceRecapDue: () => void;
  recordCipherWords: (ids: string[]) => void;
  recordGrammarNoun: (id: string | undefined) => void;
  buyFocus: () => void;
  setSubscribed: (value: boolean) => void;
  /** Reset progress for one language code (e.g. 'de' | 'no') or 'all'. */
  resetProgress: (target: string) => void;
}

const PlayerCtx = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>(INITIAL_LANG);
  const [state, setState] = useState<PlayerState>(() =>
    applyRegen(loadPlayerState(Date.now(), INITIAL_LANG), Date.now()),
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    savePlayerState(state, language);
  }, [state, language]);

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
      language,
      switchLanguage: (code) => {
        if (code === language) return;
        savePlayerState(state, language); // persist the language we're leaving
        setActiveContentLanguage(code);
        saveActiveLanguage(code);
        setLanguage(code);
        setState(applyRegen(loadPlayerState(Date.now(), code), Date.now()));
      },
      answerWord: (wordId, correct) =>
        setState((s) => touchStreak(recordWordAnswer(s, wordId, correct), Date.now())),
      recordLevel: (won, countsTowardGate = true) =>
        setState((s) =>
          touchStreak(
            (countsTowardGate ? recordLevelResult : recordLevelResultNoGate)(s, won, Date.now()),
            Date.now(),
          ),
        ),
      recordChallenge: (block) => setState((s) => recordChallengeDone(s, block)),
      recordPracticeDrill: (block) => setState((s) => applyPracticeDrill(s, block)),
      recordCipherRound: (block) => setState((s) => applyCipherRound(s, block)),
      recordCrosswordRound: (block) => setState((s) => applyCrosswordRound(s, block)),
      recordHurdleRound: (block) => setState((s) => applyHurdleRound(s, block)),
      recordRecapDone: () => setState((s) => touchStreak(applyRecapDone(s, Date.now()), Date.now())),
      forceRecapDue: () => setState((s) => applyForceRecapDue(s, Date.now())),
      recordCipherWords: (ids) => setState((s) => addCipherWords(s, ids)),
      recordGrammarNoun: (id) => setState((s) => addGrammarNoun(s, id)),
      buyFocus: () => setState((s) => buyFocusRefill(s, Date.now())),
      setSubscribed: (v) => setState((s) => setSubscribedPure(s, v, Date.now())),
      resetProgress: (target) => {
        if (target === 'all') {
          clearAllPlayerState();
          setState(defaultPlayerState(Date.now(), ECONOMY.focusStart));
        } else {
          clearPlayerState(target);
          // Only the live (active) language needs its in-memory state refreshed.
          if (target === language) setState(defaultPlayerState(Date.now(), ECONOMY.focusStart));
        }
      },
    }),
    [state, now, language],
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const v = useContext(PlayerCtx);
  if (!v) throw new Error('usePlayer must be used within a PlayerProvider');
  return v;
}
