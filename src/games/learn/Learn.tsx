import { useEffect, useState } from 'react';
import type { GameProps } from '../types';
import { usePlayer } from '../../state/PlayerContext';
import { SETS, ALL_WORDS, wordById, type VocabWord, type Gender } from '../../content/vocab';
import { wordsToStudy, currentLearnSetIndex } from '../../state/progression';
import { shuffle, sampleExcluding } from '../../lib/array';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ChevronLeft, HomeIcon } from '../../components/ui/icons';

/** Nouns are always shown with their article — "der Hund", never "Hund". */
function articleFor(g?: Gender): string | null {
  return g === 'm' ? 'der' : g === 'f' ? 'die' : g === 'n' ? 'das' : null;
}
export function germanWithArticle(w: VocabWord): string {
  const a = articleFor(w.gender);
  return a ? `${a} ${w.de}` : w.de;
}

interface Step {
  word: VocabWord;
  enOptions: string[];
  deOptions: string[];
}

function makeStep(studyIds: string[]): Step | null {
  if (studyIds.length === 0) return null;
  const id = studyIds[Math.floor(Math.random() * studyIds.length)];
  const word = wordById(id)!;
  const enPool = ALL_WORDS.map((w) => w.en);
  const enOptions = shuffle([word.en, ...sampleExcluding(enPool, [word.en], 3)]);
  const dePool = ALL_WORDS.map((w) => germanWithArticle(w));
  const correctDe = germanWithArticle(word);
  const deOptions = shuffle([correctDe, ...sampleExcluding(dePool, [correctDe], 3)]);
  return { word, enOptions, deOptions };
}

type Round = 1 | 2 | 3;

export function Learn({ onExit, onMain }: GameProps) {
  const { state, answerWord } = usePlayer();
  const study = wordsToStudy(state, SETS);
  const setIdx = currentLearnSetIndex(state, SETS);
  const currentSet = setIdx !== null ? SETS[setIdx] : null;

  const [step, setStep] = useState<Step | null>(() => makeStep(study));
  const [round, setRound] = useState<Round>(1);
  const [picked, setPicked] = useState<string | null>(null);

  // Build the next step once the current one is cleared and words remain.
  useEffect(() => {
    if (step === null && study.length > 0) {
      setStep(makeStep(study));
      setRound(1);
      setPicked(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, study.length]);

  const setSize = currentSet ? currentSet.words.length : 0;
  const masteredInSet = currentSet
    ? currentSet.words.filter((w) => state.learnedWords.includes(w.id)).length
    : setSize;

  function pick(option: string, answer: string) {
    if (picked) return;
    setPicked(option);
    answerWord(step!.word.id, option === answer);
  }
  function advance() {
    if (round === 2) {
      setRound(3);
      setPicked(null);
    } else {
      setStep(null);
      setPicked(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
        <h2 className="eyebrow">{currentSet ? `Learn · Set ${currentSet.index + 1}` : 'Learn'}</h2>
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

      {step === null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <div className="text-4xl text-brown">✦</div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-espresso">Set complete!</h3>
          <p className="mt-2 max-w-xs text-taupe">
            You’ve mastered every word in this set. Win games in Practice to unlock the next one.
          </p>
          <Button className="mt-8" onClick={onExit}>
            Back
          </Button>
        </div>
      ) : (
        <Round123
          step={step}
          round={round}
          picked={picked}
          onIntroNext={() => setRound(2)}
          onPick={pick}
          onAdvance={advance}
        />
      )}
    </div>
  );
}

function RoundDots({ round }: { round: Round }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${n <= round ? 'bg-brown' : 'bg-given/50'}`}
        />
      ))}
    </div>
  );
}

function Round123({
  step,
  round,
  picked,
  onIntroNext,
  onPick,
  onAdvance,
}: {
  step: Step;
  round: Round;
  picked: string | null;
  onIntroNext: () => void;
  onPick: (option: string, answer: string) => void;
  onAdvance: () => void;
}) {
  const de = germanWithArticle(step.word);

  if (round === 1) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mt-6">
          <RoundDots round={1} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="eyebrow">New word</p>
          <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{de}</p>
          <p className="mt-3 text-xl text-taupe">{step.word.en}</p>
        </div>
        <Button className="mt-6 w-full" onClick={onIntroNext}>
          Next →
        </Button>
      </div>
    );
  }

  const prompt = round === 2 ? de : step.word.en;
  const answer = round === 2 ? step.word.en : de;
  const options = round === 2 ? step.enOptions : step.deOptions;
  const label = round === 2 ? 'What does this mean?' : 'Say it in German';

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-6">
        <RoundDots round={round} />
      </div>
      <div className="mt-8 text-center">
        <p className="eyebrow">{label}</p>
        <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{prompt}</p>
      </div>

      <div className="mt-auto grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onPick(option, answer)}
            disabled={picked !== null}
            className={optionClasses(optionState(option, picked, answer))}
          >
            {option}
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="mt-5 animate-fade-in">
          <p
            className={`mb-3 text-center font-semibold ${
              picked === answer ? 'text-sage' : 'text-terracotta'
            }`}
          >
            {picked === answer ? 'Correct! ✓' : `Answer: ${answer}`}
          </p>
          <Button className="w-full" onClick={onAdvance}>
            Continue →
          </Button>
        </div>
      )}
    </div>
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
