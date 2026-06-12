import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameProps } from '../types';
import type { FillBlankDeck, FillBlankItem } from './types';
import { germanA1 } from './data/german-a1';
import { shuffle, sampleExcluding } from '../../lib/array';
import { loadNumber, saveNumber } from '../../lib/storage';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatPill } from '../../components/ui/StatPill';
import { SentenceWithBlank } from './components/SentenceWithBlank';
import { Results } from './components/Results';

const BEST_STREAK_KEY = 'fitb:de-a1:bestStreak';
const deck: FillBlankDeck = germanA1;

type Phase = 'answering' | 'revealed' | 'finished';

/** Build a shuffled set of choices for one item (answer + 3 distractors). */
function buildOptions(item: FillBlankItem, deckItems: FillBlankItem[]): string[] {
  const pool = Array.from(new Set(deckItems.map((i) => i.answer)));
  const distractors =
    item.options && item.options.length >= 3
      ? shuffle(item.options).slice(0, 3)
      : sampleExcluding(pool, [item.answer], 3);
  return shuffle([item.answer, ...distractors]);
}

export function FillInTheBlanks({ onExit }: GameProps) {
  const [order, setOrder] = useState<FillBlankItem[]>(() => shuffle(deck.items));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => loadNumber(BEST_STREAK_KEY));

  const current = order[index];
  const total = order.length;
  const options = useMemo(
    () => buildOptions(current, deck.items),
    // Rebuild only when the item changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current.id],
  );

  const choose = useCallback(
    (option: string) => {
      if (phase !== 'answering') return;
      const correct = option === current.answer;
      setSelected(option);
      setPhase('revealed');

      if (correct) {
        setScore((s) => s + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) {
            setBestStreak(next);
            saveNumber(BEST_STREAK_KEY, next);
          }
          return next;
        });
      } else {
        setStreak(0);
      }
    },
    [phase, current, bestStreak],
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setPhase('finished');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase('answering');
  }, [index, total]);

  const restart = useCallback(() => {
    setOrder(shuffle(deck.items));
    setIndex(0);
    setPhase('answering');
    setSelected(null);
    setScore(0);
    setStreak(0);
  }, []);

  // Keyboard support: 1–4 to answer, Enter/Space to advance.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'answering') {
        const n = Number(e.key);
        if (n >= 1 && n <= options.length) choose(options[n - 1]);
      } else if (phase === 'revealed' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, options, choose, next]);

  if (phase === 'finished') {
    return (
      <Results
        score={score}
        total={total}
        bestStreak={bestStreak}
        onPlayAgain={restart}
        onExit={onExit}
      />
    );
  }

  const isCorrect = selected === current.answer;
  const blankState =
    phase !== 'revealed' ? 'idle' : isCorrect ? 'correct' : 'wrong';

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onExit}
          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Back to games"
        >
          ←
        </button>
        <div className="flex gap-2">
          <StatPill icon="🔥" label="streak" value={streak} />
          <StatPill icon="⭐" label="score" value={score} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2 flex items-center justify-between text-xs text-white/50">
        <span>{deck.name}</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <ProgressBar value={(index + (phase === 'revealed' ? 1 : 0)) / total} />

      {/* Prompt card */}
      <div
        key={current.id}
        className={`mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur ${
          phase === 'revealed' && !isCorrect ? 'animate-shake' : 'animate-slide-up'
        }`}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/70">
          Fill in the blank
        </p>
        <SentenceWithBlank
          sentence={current.sentence}
          filled={phase === 'revealed' ? current.answer : undefined}
          state={blankState}
        />
        <p className="mt-4 text-white/50">{current.translation}</p>
        {current.hint && (
          <p className="mt-1 text-sm text-white/35">Hint: {current.hint}</p>
        )}
      </div>

      {/* Options */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const state = optionState(option, selected, current.answer, phase);
          return (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={phase === 'revealed'}
              className={optionClasses(state)}
            >
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/20 text-xs font-bold text-white/60">
                {i + 1}
              </span>
              <span className="flex-1 text-left">{option}</span>
              {state === 'correct' && <span>✓</span>}
              {state === 'wrong' && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback + next */}
      <div className="mt-auto pt-6">
        {phase === 'revealed' && (
          <div className="animate-fade-in">
            <p
              className={`mb-3 text-center font-semibold ${
                isCorrect ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isCorrect
                ? feedbackPraise()
                : `Not quite — the answer is “${current.answer}”.`}
            </p>
            <Button className="w-full" onClick={next}>
              {index + 1 >= total ? 'See results' : 'Next'} →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'muted';

function optionState(
  option: string,
  selected: string | null,
  answer: string,
  phase: Phase,
): OptionState {
  if (phase !== 'revealed') return 'idle';
  if (option === answer) return 'correct';
  if (option === selected) return 'wrong';
  return 'muted';
}

function optionClasses(state: OptionState): string {
  const base =
    'flex items-center rounded-2xl border px-4 py-4 text-lg font-medium transition active:scale-[0.99] disabled:cursor-default';
  switch (state) {
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

const PRAISE = ['Richtig! 🎉', 'Sehr gut! 👏', 'Perfekt! ✨', 'Genau! 💪'];
function feedbackPraise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
}
