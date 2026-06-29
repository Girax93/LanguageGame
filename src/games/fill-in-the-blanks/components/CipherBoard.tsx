import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CipherContentItem } from '../../../content/cipherItems';
import type { DifficultyFlags } from '../../../state/difficulty';
import { type BoardControls, SkipButton } from '../../_shared/LevelStage';
import { buildPuzzle, initialFilled, keyStateFor, toUpperDE, isLetterDE } from '../cipher';
import { wordById } from '../../../content/vocab';
import { verb3sg } from '../../../content/generateCipher';
import { Keyboard } from './Keyboard';

// Article surface forms that ALWAYS participate (a noun phrase's article stays
// decodable even when it's an earlier-block word) — definite + indefinite, the
// inflections the generators emit, across German + Norwegian.
const ARTICLE_SURFACES = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'eines', 'einer',
  'en', 'ei', 'et',
]);

/** Lowercased letters only (matches buildPuzzle's per-letter view). */
function normSurface(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}]/gu, '');
}

interface Participation {
  /** Surfaces (normalised) that participate in the cipher for this scope. */
  surfaces: Set<string>;
  /** Reportable content surface -> lemma id (articles excluded). */
  surfaceToLemma: Map<string, string>;
}
/** Work out which on-screen words participate (decodable) vs are inert context.
 *  `participatingLemmaIds` undefined ⇒ everything participates (recap). */
function buildParticipation(item: CipherContentItem, participatingLemmaIds?: Set<string>): Participation {
  const surfaces = new Set<string>(ARTICLE_SURFACES);
  const surfaceToLemma = new Map<string, string>();
  if (!participatingLemmaIds) return { surfaces, surfaceToLemma };
  for (const id of item.requires) {
    if (!participatingLemmaIds.has(id)) continue;
    const w = wordById(id);
    if (!w) continue;
    const reportable = w.pos !== 'art'; // articles never pool / report
    const add = (form?: string | null) => {
      const n = normSurface(form ?? '');
      if (!n) return;
      surfaces.add(n);
      if (reportable && !surfaceToLemma.has(n)) surfaceToLemma.set(n, id);
    };
    add(w.de);
    if (w.pos === 'verb') add(verb3sg(w));
  }
  return { surfaces, surfaceToLemma };
}

interface Props {
  item: CipherContentItem;
  flags: DifficultyFlags;
  controls: BoardControls;
  /** Lemma ids whose words participate (decodable). Undefined ⇒ all (recap). */
  participatingLemmaIds?: Set<string>;
  /** Reports solved/unsolved content word ids (for the focus pool). */
  onProgress?: (solved: string[], unsolved: string[]) => void;
}

export function CipherBoard({ item, flags, controls, participatingLemmaIds, onProgress }: Props) {
  const participation = useMemo(
    () => buildParticipation(item, participatingLemmaIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, participatingLemmaIds],
  );
  const puzzle = useMemo(
    () =>
      buildPuzzle(item.sentence, {
        givenCount: flags.footholds,
        participates: participatingLemmaIds
          ? (w) => {
              const n = normSurface(w);
              return !n || participation.surfaces.has(n);
            }
          : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, participatingLemmaIds, participation],
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

  // Report solved/unsolved content words (for the focus pool re-mastery + capture).
  useEffect(() => {
    if (!onProgress) return;
    const solved: string[] = [];
    const unsolved: string[] = [];
    for (const cells of puzzle.words) {
      const letters = cells.filter((c) => c.kind === 'letter');
      if (letters.length === 0) continue;
      const id = participation.surfaceToLemma.get(normSurface(cells.map((c) => c.char).join('')));
      if (!id) continue; // article / unmapped — never pooled
      (letters.every((c) => filled.has(c.slot)) ? solved : unsolved).push(id);
    }
    onProgress([...new Set(solved)], [...new Set(unsolved)]);
  }, [filled, puzzle, participation, onProgress]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
        <div className="my-auto flex flex-wrap justify-center gap-x-4 gap-y-6">
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
                    given={puzzle.givenSlots.has(cell.slot)}
                    selected={selected === cell.slot}
                    wrong={wrongSlot === cell.slot}
                    locked={!filled.has(cell.slot) && !isUnlocked(cell.slot, filled)}
                    onClick={() => selectSlot(cell.slot)}
                  />
                ) : (
                  <span
                    key={ci}
                    className={[
                      'px-0.5 pb-6 font-serif text-2xl font-semibold',
                      cell.kind === 'plain' ? 'text-taupe' : 'text-espresso',
                    ].join(' ')}
                  >
                    {cell.char}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex shrink-0 flex-col items-center gap-3 border-t border-line bg-page pt-3 pb-2">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="text-sm text-taupe underline-offset-4 transition hover:text-brown hover:underline"
          >
            {showHint ? item.translation : 'Need a hint?'}
          </button>
          <SkipButton onSkip={controls.onSkip} />
        </div>
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
