import { useEffect, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS, ALL_WORDS, wordById, type VocabWord } from '../../content/vocab';
import { PROGRESSION } from '../../state/progressionConfig';
import { wordsToStudy, currentLearnSetIndex } from '../../state/progression';
import { shuffle, sampleExcluding } from '../../lib/array';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { HomeIcon } from '../../components/ui/icons';

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

export function Learn({ onExit, onMain }: GameProps) {
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
          className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
          aria-label="Back to home"
        >
          ←
        </button>
        <h2 className="eyebrow">
          {currentSet ? `Learn · Set ${currentSet.index + 1}` : 'Learn'}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-xs tabular-nums text-taupe">
            {masteredInSet}/{setSize}
          </span>
          {onMain && (
            <button
              onClick={onMain}
              aria-label="Main menu"
              className="rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
            >
              <HomeIcon />
            </button>
          )}
        </div>
      </div>
      <ProgressBar value={setSize === 0 ? 1 : masteredInSet / setSize} />

      {turn === null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <div className="text-4xl text-brown">✦</div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-espresso">Set complete!</h3>
          <p className="mt-2 max-w-xs text-taupe">
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
            <p className="eyebrow">
              {turn.mode === 'recognition' ? 'What does this mean?' : 'Say it in German'}
            </p>
            <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{turn.prompt}</p>
            {turn.mode === 'recall' && turn.word.gender && (
              <p className="mt-1 text-sm text-taupe">({genderLabel(turn.word.gender)})</p>
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
                  picked === turn.answer ? 'text-sage' : 'text-terracotta'
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
      return `${base} border-sage/60 bg-sage/15 text-espresso`;
    case 'wrong':
      return `${base} border-terracotta/60 bg-terracotta/10 text-terracotta`;
    case 'muted':
      return `${base} border-line bg-card text-taupe`;
    default:
      return `${base} border-line bg-card text-espresso hover:border-brown/40 hover:bg-sand`;
  }
}
