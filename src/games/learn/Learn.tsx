import { useEffect, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS, ALL_WORDS, wordById, type VocabWord } from '../../content/vocab';
import { PROGRESSION } from '../../state/progressionConfig';
import { wordsToStudy, currentLearnSetIndex } from '../../state/progression';
import { shuffle, sampleExcluding } from '../../lib/array';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

type Mode = 'recognition' | 'recall';

interface Turn {
  word: VocabWord;
  mode: Mode;
  prompt: string;
  answer: string;
  options: string[];
}

function makeTurn(studyIds: string[]): Turn | null {
  if (studyIds.length === 0) return null;
  const id = studyIds[Math.floor(Math.random() * studyIds.length)];
  const word = wordById(id)!;
  const mode: Mode = Math.random() < 0.5 ? 'recognition' : 'recall';
  const prompt = mode === 'recognition' ? word.de : word.en;
  const answer = mode === 'recognition' ? word.en : word.de;
  const pool = ALL_WORDS.map((w) => (mode === 'recognition' ? w.en : w.de));
  const options = shuffle([answer, ...sampleExcluding(pool, [answer], 3)]);
  return { word, mode, prompt, answer, options };
}

export function Learn({ onExit }: GameProps) {
  const { state, answerWord } = usePlayer();
  const study = wordsToStudy(state, SETS);
  const setIdx = currentLearnSetIndex(state, SETS);
  const currentSet = setIdx !== null ? SETS[setIdx] : null;

  const [turn, setTurn] = useState<Turn | null>(() => makeTurn(study));
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (turn === null && picked === null && study.length > 0) {
      setTurn(makeTurn(study));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, picked, study.length]);

  const setSize = currentSet ? currentSet.words.length : 0;
  const masteredInSet = currentSet
    ? currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length
    : setSize;

  function choose(option: string) {
    if (!turn || picked) return;
    setPicked(option);
    answerWord(turn.word.id, option === turn.answer);
  }
  function next() {
    setPicked(null);
    setTurn(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Back to home"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
          {currentSet ? `Learn · Set ${currentSet.index + 1}` : 'Learn'}
        </h2>
        <span className="text-xs tabular-nums text-white/45">
          {masteredInSet}/{setSize}
        </span>
      </div>
      <ProgressBar value={setSize === 0 ? 1 : masteredInSet / setSize} />

      {turn === null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <div className="text-6xl">🎉</div>
          <h3 className="mt-4 text-2xl font-extrabold">Set complete!</h3>
          <p className="mt-2 max-w-xs text-white/60">
            You’ve mastered this set. Win {PROGRESSION.gamesToAdvance} Cipher or
            Grammar levels to unlock the next one.
          </p>
          <Button className="mt-8" onClick={onExit}>
            Back to home
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="mt-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {turn.mode === 'recognition' ? 'What does this mean?' : 'Say it in German'}
            </p>
            <p className="mt-4 text-4xl font-extrabold">{turn.prompt}</p>
            {turn.mode === 'recall' && turn.word.gender && (
              <p className="mt-1 text-sm text-white/40">({genderLabel(turn.word.gender)})</p>
            )}
          </div>

          <div className="mt-auto grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2">
            {turn.options.map((option) => (
              <button
                key={option}
                onClick={() => choose(option)}
                disabled={picked !== null}
                className={optionClasses(optionState(option, picked, turn.answer))}
              >
                {option}
              </button>
            ))}
          </div>

          {picked !== null && (
            <div className="mt-5 animate-fade-in">
              <p
                className={`mb-3 text-center font-semibold ${
                  picked === turn.answer ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {picked === turn.answer
                  ? justMastered(state, turn.word.id)
                    ? 'Mastered! ✅'
                    : 'Correct! ✓'
                  : `Answer: ${turn.answer}`}
              </p>
              <Button className="w-full" onClick={next}>
                Continue →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function genderLabel(g: 'm' | 'f' | 'n'): string {
  return g === 'm' ? 'der' : g === 'f' ? 'die' : 'das';
}

function justMastered(
  state: { learnedWords: string[]; wordProgress: Record<string, number> },
  wordId: string,
): boolean {
  return (
    state.learnedWords.includes(wordId) ||
    (state.wordProgress[wordId] ?? 0) >= PROGRESSION.masteryThreshold
  );
}

type OptState = 'idle' | 'correct' | 'wrong' | 'muted';
function optionState(option: string, picked: string | null, answer: string): OptState {
  if (picked === null) return 'idle';
  if (option === answer) return 'correct';
  if (option === picked) return 'wrong';
  return 'muted';
}
function optionClasses(s: OptState): string {
  const base =
    'rounded-2xl border px-4 py-4 text-lg font-medium transition active:scale-[0.99] disabled:cursor-default';
  switch (s) {
    case 'correct':
      return `${base} border-emerald-400/60 bg-emerald-400/15 text-emerald-100`;
    case 'wrong':
      return `${base} border-rose-400/60 bg-rose-400/15 text-rose-100`;
    case 'muted':
      return `${base} border-white/10 bg-white/[0.03] text-white/40`;
    default:
      return `${base} border-white/10 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.1]`;
  }
}
