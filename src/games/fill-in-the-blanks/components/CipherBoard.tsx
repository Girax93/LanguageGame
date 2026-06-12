import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CipherItem } from '../types';
import {
  buildPuzzle,
  initialFilled,
  firstEmpty,
  nextEmpty,
  keyStateFor,
  toUpperDE,
  isLetterDE,
} from '../cipher';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Button } from '../../../components/ui/Button';
import { Keyboard } from './Keyboard';

interface Props {
  item: CipherItem;
  /** Called when the puzzle is solved and the player taps Next. */
  onNext: (mistakes: number) => void;
  isLast: boolean;
}

/**
 * One cryptogram. Mounted with a `key={item.id}` so all per-puzzle state
 * resets cleanly when advancing.
 */
export function CipherBoard({ item, onNext, isLast }: Props) {
  const puzzle = useMemo(() => buildPuzzle(item.sentence), [item.id]);
  const total = puzzle.slotLetters.length;

  const seed = useMemo(() => {
    const f = initialFilled(puzzle);
    return { filled: f, selected: firstEmpty(total, f) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const [filled, setFilled] = useState<Set<number>>(seed.filled);
  const [selected, setSelected] = useState<number | null>(seed.selected);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const solved = filled.size === total;

  const selectSlot = useCallback(
    (slot: number) => {
      if (filled.has(slot)) return; // givens / already solved slots aren't selectable
      setSelected(slot);
    },
    [filled],
  );

  const pressLetter = useCallback(
    (letter: string) => {
      if (solved || selected == null) return;

      if (puzzle.slotLetters[selected] === letter) {
        // Correct: fill this ONE slot, advance to the next empty slot.
        const next = new Set(filled);
        next.add(selected);
        setFilled(next);
        setSelected(nextEmpty(total, next, selected));
      } else {
        // Wrong: brief shake, no fill.
        setWrongSlot(selected);
        setMistakes((m) => m + 1);
        window.setTimeout(() => setWrongSlot(null), 400);
      }
    },
    [solved, selected, puzzle.slotLetters, filled, total],
  );

  // Physical keyboard: type a letter to guess; Enter to advance when solved.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && solved) {
        onNext(mistakes);
        return;
      }
      if (e.key.length === 1) {
        const up = toUpperDE(e.key);
        if (isLetterDE(up)) pressLetter(up);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressLetter, solved, onNext, mistakes]);

  return (
    <div className="flex flex-1 flex-col">
      {/* per-puzzle progress */}
      <ProgressBar value={total === 0 ? 1 : filled.size / total} />

      {/* the cryptogram */}
      <div className="mt-7 flex flex-1 flex-col justify-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
          {puzzle.words.map((cells, wi) => (
            <div key={wi} className="flex items-end gap-1">
              {cells.map((cell, ci) =>
                cell.kind === 'letter' ? (
                  <Slot
                    key={ci}
                    letter={cell.char}
                    number={puzzle.numberForLetter[cell.char]}
                    filled={filled.has(cell.slot)}
                    given={puzzle.givens.has(cell.char)}
                    selected={selected === cell.slot}
                    wrong={wrongSlot === cell.slot}
                    onClick={() => selectSlot(cell.slot)}
                  />
                ) : (
                  <span
                    key={ci}
                    className="px-0.5 pb-6 text-2xl font-semibold text-white/70"
                  >
                    {cell.char}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>

        {/* translation hint (free, off by default) */}
        <div className="mt-7 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/20"
          >
            {showHint ? 'Hide translation' : 'Show translation'}
          </button>
          {showHint && (
            <p className="mt-3 animate-fade-in text-center text-white/60">
              {item.translation}
            </p>
          )}
        </div>
      </div>

      {/* win banner or keyboard */}
      <div className="mt-6">
        {solved ? (
          <div className="animate-pop-in text-center">
            <p className="text-lg font-bold text-emerald-300">Gelöst! 🎉</p>
            <p className="mt-1 text-sm text-white/50">
              {mistakes === 0
                ? 'Flawless — no wrong guesses.'
                : `${mistakes} wrong ${mistakes === 1 ? 'guess' : 'guesses'}.`}
            </p>
            <Button className="mt-4 w-full" onClick={() => onNext(mistakes)}>
              {isLast ? 'See results' : 'Next puzzle'} →
            </Button>
          </div>
        ) : (
          <Keyboard
            onKey={pressLetter}
            stateFor={(letter) => keyStateFor(letter, puzzle.slotLetters, filled)}
          />
        )}
      </div>
    </div>
  );
}

interface SlotProps {
  letter: string;
  number: number;
  filled: boolean;
  given: boolean;
  selected: boolean;
  wrong: boolean;
  onClick: () => void;
}

function Slot({ letter, number, filled, given, selected, wrong, onClick }: SlotProps) {
  const box = given
    ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
    : filled
      ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100'
      : selected
        ? 'border-sky-400 bg-sky-400/10 text-white ring-2 ring-sky-400/60'
        : 'border-white/25 bg-white/[0.03] text-white hover:border-white/50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={filled}
      aria-label={`Letter, code ${number}`}
      className={`flex flex-col items-center ${filled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span
        className={[
          'flex h-11 w-9 items-center justify-center rounded-md border-2 text-xl font-bold uppercase transition sm:h-12 sm:w-10',
          box,
          wrong ? 'animate-shake border-rose-400 text-rose-300' : '',
        ].join(' ')}
      >
        {filled ? letter : ''}
      </span>
      <span className="mt-1.5 text-xs font-medium tabular-nums text-white/45">
        {number}
      </span>
    </button>
  );
}
