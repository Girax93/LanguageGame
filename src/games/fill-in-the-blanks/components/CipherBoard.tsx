import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CipherContentItem } from '../../../content/cipherItems';
import type { DifficultyFlags } from '../../../state/difficulty';
import type { BoardControls } from '../../_shared/LevelStage';
import { buildPuzzle, initialFilled, keyStateFor, toUpperDE, isLetterDE } from '../cipher';
import { Keyboard } from './Keyboard';

interface Props {
  item: CipherContentItem;
  flags: DifficultyFlags;
  controls: BoardControls;
}

export function CipherBoard({ item, flags, controls }: Props) {
  const puzzle = useMemo(
    () => buildPuzzle(item.sentence, { givenCount: flags.footholds }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id],
  );
  const total = puzzle.slotLetters.length;

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
  const [showHint, setShowHint] = useState(false);
  const done = useRef(false);

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
          done.current = true;
          controls.onSolved();
        } else {
          setSelected(firstSelectable(next, selected));
        }
      } else {
        const slot = selected;
        setWrongSlot(slot);
        window.setTimeout(() => setWrongSlot((w) => (w === slot ? null : w)), 400);
        controls.onWrong();
      }
    },
    [selected, puzzle.slotLetters, filled, total, controls, firstSelectable],
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
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
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
                  <span key={ci} className="px-0.5 pb-6 font-serif text-2xl font-semibold text-espresso">
                    {cell.char}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 mt-4 flex flex-col items-center gap-3 border-t border-line bg-page pt-3 pb-2">
        <button
          type="button"
          onClick={() => setShowHint((s) => !s)}
          className="text-sm text-taupe underline-offset-4 transition hover:text-brown hover:underline"
        >
          {showHint ? item.translation : 'Need a hint?'}
        </button>
        <div className="w-full">
          <Keyboard
            onKey={pressLetter}
            stateFor={(letter) => keyStateFor(letter, puzzle.slotLetters, filled, flags.greyUnusedKeys)}
          />
        </div>
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

function Slot({ letter, number, showNumber, filled, given, selected, wrong, locked, onClick }: SlotProps) {
  const box = given
    ? 'border-line bg-given/25 text-brown'
    : filled
      ? 'border-sage/60 bg-sage/15 text-espresso'
      : selected
        ? 'border-brown bg-sand text-espresso ring-2 ring-brown/40'
        : locked
          ? 'border-line bg-page text-given'
          : 'border-line bg-card text-espresso hover:border-brown/50';

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
          'flex h-11 w-9 items-center justify-center rounded-xl border-2 font-serif text-xl font-semibold uppercase transition sm:h-12 sm:w-10',
          box,
          wrong ? 'animate-shake border-terracotta text-terracotta' : '',
        ].join(' ')}
      >
        {filled ? letter : ''}
      </span>
      <span className="mt-1.5 h-4 text-xs font-medium tabular-nums text-taupe">
        {showNumber ? number : ''}
      </span>
    </button>
  );
}
