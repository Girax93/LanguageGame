import { useCallback, useEffect, useRef, useState } from 'react';
import type { HurdleContentItem } from '../../../content/hurdleItems';
import { type BoardControls, SkipButton } from '../../_shared/LevelStage';
import {
  answerLength,
  isSolved,
  keyHints,
  normalizeLetter,
  scoreGuess,
  triesFor,
  type ScoredGuess,
  type TileState,
} from '../hurdle';
import { HurdleKeyboard } from './HurdleKeyboard';
import { getActiveLang } from '../../../content/lang/registry';

interface Props {
  item: HurdleContentItem;
  controls: BoardControls;
}

export function HurdleBoard({ item, controls }: Props) {
  const answer = item.answer;
  const len = answerLength(answer);
  const maxRows = triesFor(answer);

  const [guesses, setGuesses] = useState<ScoredGuess[]>([]);
  const [current, setCurrent] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const done = useRef(false);

  const hints = keyHints(guesses);

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current) return;
      setCurrent((cur) => (cur.length >= len ? cur : [...cur, letter]));
    },
    [len],
  );
  const del = useCallback(() => {
    if (done.current) return;
    setCurrent((cur) => cur.slice(0, -1));
  }, []);
  const submit = useCallback(() => {
    if (done.current) return;
    if (current.length !== len) {
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      return;
    }
    const guess = current.join('');
    const states = scoreGuess(guess, answer);
    setGuesses((gs) => [...gs, { letters: current, states }]);
    setCurrent([]);
    if (isSolved(guess, answer)) {
      done.current = true;
      controls.onSolved();
    } else {
      controls.onWrong();
    }
  }, [current, len, answer, controls]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        del();
        return;
      }
      const letter = normalizeLetter(e.key);
      if (letter) pressLetter(letter);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submit, del, pressLetter]);

  // Fit the grid to the width: ~2.75rem tiles, shrinking for long words.
  const gridWidth = `min(100%, ${len * 2.75 + (len - 1) * 0.375}rem)`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto py-3">
        <div className="flex w-full items-center justify-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-taupe">Guess the word</p>
          <button
            type="button"
            onClick={() => setShowInfo((s) => !s)}
            aria-label="How to play"
            aria-expanded={showInfo}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[11px] font-semibold italic text-taupe transition hover:border-brown/50 hover:text-brown"
          >
            i
          </button>
        </div>
        {showInfo && (
          <div className="w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-left text-sm text-taupe animate-pop-in">
            <p className="mb-1 font-serif text-base font-semibold text-espresso">How to play</p>
            <p>Guess the hidden {getActiveLang().name} word — type a word of the right length and press Enter.</p>
            <ul className="mt-2 space-y-1">
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sage" /> right letter, right spot</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-ochre" /> right letter, wrong spot</li>
              <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-given/60" /> not in the word</li>
            </ul>
            <p className="mt-2">Longer words give you more tries.</p>
          </div>
        )}

        <div className="mx-auto flex flex-col gap-1.5" style={{ width: gridWidth }}>
          {Array.from({ length: maxRows }).map((_, r) => {
            const submitted = r < guesses.length ? guesses[r] : null;
            const isActive = r === guesses.length;
            return (
              <div key={r} className={['flex gap-1.5', isActive && shake ? 'animate-shake' : ''].join(' ')}>
                {Array.from({ length: len }).map((_, c) => {
                  if (submitted) {
                    return <Tile key={c} letter={submitted.letters[c]} kind={submitted.states[c]} />;
                  }
                  if (isActive) {
                    const ch = current[c];
                    if (ch) return <Tile key={c} letter={ch} kind="typed" />;
                    return <Tile key={c} letter="" kind={c === current.length ? 'cursor' : 'empty'} />;
                  }
                  return <Tile key={c} letter="" kind="empty" />;
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex shrink-0 flex-col items-center gap-3 border-t border-line bg-page pt-3 pb-2">
        <div className="flex w-full items-center justify-end">
          <SkipButton onSkip={controls.onSkip} />
        </div>
        <div className="w-full">
          <HurdleKeyboard
            onLetter={pressLetter}
            onEnter={submit}
            onDelete={del}
            hints={hints}
            canSubmit={current.length === len}
          />
        </div>
      </div>
    </div>
  );
}

type TileKind = TileState | 'empty' | 'typed' | 'cursor';

const TILE_STYLES: Record<TileKind, string> = {
  correct: 'border-sage bg-sage text-cream',
  present: 'border-ochre bg-ochre text-espresso',
  absent: 'border-line bg-given/40 text-taupe',
  typed: 'border-brown/50 bg-card text-espresso animate-pop-in',
  cursor: 'border-brown bg-sand text-espresso ring-2 ring-brown/30',
  empty: 'border-line bg-card text-espresso',
};

function Tile({ letter, kind }: { letter: string; kind: TileKind }) {
  return (
    <span
      className={[
        'flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg border-2',
        'font-serif text-xl font-semibold uppercase transition',
        TILE_STYLES[kind],
      ].join(' ')}
    >
      {letter}
    </span>
  );
}
