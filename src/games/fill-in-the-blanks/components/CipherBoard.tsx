import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CipherContentItem } from '../../../content/cipherItems';
import type { DifficultyFlags } from '../../../state/difficulty';
import { ECONOMY } from '../../../state/economyConfig';
import {
  buildPuzzle,
  initialFilled,
  keyStateFor,
  toUpperDE,
  isLetterDE,
} from '../cipher';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Hearts } from '../../../components/ui/Hearts';
import { Keyboard } from './Keyboard';

interface Props {
  item: CipherContentItem;
  flags: DifficultyFlags;
  onResult: (won: boolean) => void;
}

export function CipherBoard({ item, flags, onResult }: Props) {
  const puzzle = useMemo(
    () => buildPuzzle(item.sentence, { givenCount: flags.footholds }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id],
  );
  const total = puzzle.slotLetters.length;

  // Slots that begin a word are always unlocked (entry points for L5).
  const wordStarts = useMemo(() => {
    const set = new Set<number>();
    for (const cells of puzzle.words) {
      const first = cells.find((c) => c.kind === 'letter');
      if (first) set.add(first.slot);
    }
    return set;
  }, [puzzle]);

  const isUnlocked = useCallback(
    (slot: number, filledSet: Set<number>): boolean => {
      if (!flags.neighborLock) return true;
      if (wordStarts.has(slot)) return true;
      if (slot - 1 >= 0 && filledSet.has(slot - 1)) return true;
      if (slot + 1 < total && filledSet.has(slot + 1)) return true;
      return false;
    },
    [flags.neighborLock, wordStarts, total],
  );

  const firstSelectable = useCallback(
    (filledSet: Set<number>, from = -1): number | null => {
      for (let step = 1; step <= total; step++) {
        const i = (from + step) % total;
        if (!filledSet.has(i) && isUnlocked(i, filledSet)) return i;
      }
      return null;
    },
    [total, isUnlocked],
  );

  const seed = useMemo(() => {
    const f = initialFilled(puzzle);
    return { filled: f, selected: firstSelectable(f) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const [filled, setFilled] = useState<Set<number>>(seed.filled);
  const [selected, setSelected] = useState<number | null>(seed.selected);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [lives, setLives] = useState(ECONOMY.livesPerLevel);
  const [showHint, setShowHint] = useState(false);
  const done = useRef(false);

  const finish = useCallback(
    (won: boolean) => {
      if (done.current) return;
      done.current = true;
      onResult(won);
    },
    [onResult],
  );

  const numberVisible = useCallback(
    (slot: number): boolean => {
      if (!flags.hideNumbersUntilAdjacent) return true;
      if (filled.has(slot)) return true;
      if (slot - 1 >= 0 && filled.has(slot - 1)) return true;
      if (slot + 1 < total && filled.has(slot + 1)) return true;
      return false;
    },
    [flags.hideNumbersUntilAdjacent, filled, total],
  );

  const selectSlot = useCallback(
    (slot: number) => {
      if (filled.has(slot) || !isUnlocked(slot, filled)) return;
      setSelected(slot);
    },
    [filled, isUnlocked],
  );

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current || selected == null) return;
      if (puzzle.slotLetters[selected] === letter) {
        const next = new Set(filled);
        next.add(selected);
        setFilled(next);
        if (next.size === total) {
          finish(true);
        } else {
          setSelected(firstSelectable(next, selected));
        }
      } else {
        const slot = selected;
        setWrongSlot(slot);
        window.setTimeout(() => setWrongSlot((w) => (w === slot ? null : w)), 400);
        const left = lives - 1;
        setLives(left);
        if (left <= 0) finish(false);
      }
    },
    [selected, puzzle.slotLetters, filled, total, finish, firstSelectable, lives],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.length === 1) {
        const up = toUpperDE(e.key);
        if (isLetterDE(up)) pressLetter(up);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressLetter]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <Hearts total={ECONOMY.livesPerLevel} remaining={lives} />
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/60">
          Difficulty L{item.level}
        </span>
      </div>
      <ProgressBar value={total === 0 ? 1 : filled.size / total} />

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
                    showNumber={numberVisible(cell.slot)}
                    filled={filled.has(cell.slot)}
                    given={puzzle.givens.has(cell.char)}
                    selected={selected === cell.slot}
                    wrong={wrongSlot === cell.slot}
                    locked={!filled.has(cell.slot) && !isUnlocked(cell.slot, filled)}
                    onClick={() => selectSlot(cell.slot)}
                  />
                ) : (
                  <span key={ci} className="px-0.5 pb-6 text-2xl font-semibold text-white/70">
                    {cell.char}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/20"
          >
            {showHint ? 'Hide translation' : 'Show translation'}
          </button>
          {showHint && (
            <p className="mt-3 animate-fade-in text-center text-white/60">{item.translation}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Keyboard
          onKey={pressLetter}
          stateFor={(letter) =>
            keyStateFor(letter, puzzle.slotLetters, filled, flags.greyUnusedKeys)
          }
        />
      </div>
    </div>
  );
}

interface SlotProps {
  letter: string;
  number: number;
  showNumber: boolean;
  filled: boolean;
  given: boolean;
  selected: boolean;
  wrong: boolean;
  locked: boolean;
  onClick: () => void;
}

function Slot({
  letter,
  number,
  showNumber,
  filled,
  given,
  selected,
  wrong,
  locked,
  onClick,
}: SlotProps) {
  const box = given
    ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
    : filled
      ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100'
      : selected
        ? 'border-sky-400 bg-sky-400/10 text-white ring-2 ring-sky-400/60'
        : locked
          ? 'border-white/10 bg-white/[0.02] text-white/30'
          : 'border-white/25 bg-white/[0.03] text-white hover:border-white/50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={filled || locked}
      aria-label={showNumber ? `Letter, code ${number}` : 'Letter'}
      className={`flex flex-col items-center ${filled || locked ? 'cursor-default' : 'cursor-pointer'}`}
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
      <span className="mt-1.5 h-4 text-xs font-medium tabular-nums text-white/45">
        {showNumber ? number : ''}
      </span>
    </button>
  );
}
