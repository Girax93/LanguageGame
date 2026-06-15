import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CrosswordContentItem } from '../../../content/crosswords';
import type { BoardControls } from '../../_shared/LevelStage';
import { toUpperDE, isLetterDE } from '../../fill-in-the-blanks/cipher';
import { Keyboard } from '../../fill-in-the-blanks/components/Keyboard';
import { buildCrossword, cellKey } from '../crossword';

interface Props {
  item: CrosswordContentItem;
  controls: BoardControls;
}

export function CrosswordBoard({ item, controls }: Props) {
  const built = useMemo(() => buildCrossword(item), [item.id]);

  const [entered, setEntered] = useState<Record<string, string>>({});
  const [selEntry, setSelEntry] = useState(0);
  const [active, setActive] = useState<string>(() => built.entries[0]?.cells[0] ?? '');
  const [wrong, setWrong] = useState<string | null>(null);
  const [showClues, setShowClues] = useState(false);
  const done = useRef(false);

  // Cells belonging to a fully-correct entry (shown in the sage "done" style).
  const sageCells = useMemo(() => {
    const s = new Set<string>();
    for (const e of built.entries) {
      if (e.cells.every((k) => entered[k])) for (const k of e.cells) s.add(k);
    }
    return s;
  }, [built, entered]);

  const selectedEntry = built.entries[selEntry];
  const selCells = useMemo(() => new Set(selectedEntry?.cells ?? []), [selectedEntry]);

  const advanceFrom = useCallback(
    (key: string, map: Record<string, string>) => {
      const entry = built.entries[selEntry];
      const idx = entry.cells.indexOf(key);
      for (let s = 1; s <= entry.cells.length; s++) {
        const k = entry.cells[(idx + s) % entry.cells.length];
        if (!map[k]) {
          setActive(k);
          return;
        }
      }
      for (let s = 1; s <= built.entries.length; s++) {
        const e = built.entries[(selEntry + s) % built.entries.length];
        const empty = e.cells.find((k) => !map[k]);
        if (empty) {
          setSelEntry(e.index);
          setActive(empty);
          return;
        }
      }
    },
    [built, selEntry],
  );

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current || !active) return;
      const cell = built.cells.get(active);
      if (!cell) return;
      if (entered[active]) {
        advanceFrom(active, entered);
        return;
      }
      if (cell.answer === letter) {
        const next = { ...entered, [active]: letter };
        setEntered(next);
        if (Object.keys(next).length === built.total) {
          done.current = true;
          controls.onSolved();
          return;
        }
        advanceFrom(active, next);
      } else {
        const k = active;
        setWrong(k);
        window.setTimeout(() => setWrong((w) => (w === k ? null : w)), 400);
        controls.onWrong();
      }
    },
    [active, entered, built, controls, advanceFrom],
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

  function onCellTap(key: string) {
    const cell = built.cells.get(key);
    if (!cell) return;
    const cands = [cell.across, cell.down].filter((x) => x !== undefined) as number[];
    if (cands.length === 0) return;
    let target: number;
    if (cands.includes(selEntry) && cands.length > 1) target = cands.find((x) => x !== selEntry)!;
    else if (cands.includes(selEntry)) target = selEntry;
    else target = cands[0];
    setSelEntry(target);
    setActive(key);
  }

  function selectClue(i: number) {
    const e = built.entries[i];
    setSelEntry(i);
    setActive(e.cells.find((k) => !entered[k]) ?? e.cells[0]);
    setShowClues(false);
  }

  const across = built.entries.filter((e) => e.dir === 'across');
  const down = built.entries.filter((e) => e.dir === 'down');

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* selected clue + clues toggle */}
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <p className="min-w-0 flex-1 text-sm text-espresso">
          {selectedEntry && (
            <>
              <span className="font-semibold tabular-nums">{selectedEntry.number}</span>
              <span className="text-taupe"> {selectedEntry.dir === 'across' ? 'Across' : 'Down'} · </span>
              <span>{selectedEntry.clue}</span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setShowClues((s) => !s)}
          className="shrink-0 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-brown transition hover:bg-[#ddcdb2]"
        >
          Clues
        </button>
      </div>

      {/* grid */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${built.cols}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: `${built.cols * 50}px`,
          }}
        >
          {Array.from({ length: built.rows }).flatMap((_, r) =>
            Array.from({ length: built.cols }).map((__, c) => {
              const key = cellKey(r, c);
              const cell = built.cells.get(key);
              if (!cell) return <div key={key} className="aspect-square" />;
              const isWrong = wrong === key;
              const isActive = active === key;
              const box = isWrong
                ? 'border-terracotta bg-terracotta/10 text-terracotta animate-shake'
                : sageCells.has(key)
                  ? 'border-sage/60 bg-sage/20 text-espresso'
                  : isActive
                    ? 'border-brown bg-sand text-espresso ring-2 ring-brown/40'
                    : selCells.has(key)
                      ? 'border-brown/40 bg-sand/50 text-espresso'
                      : 'border-line bg-card text-espresso hover:border-brown/50';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCellTap(key)}
                  className={[
                    'relative flex aspect-square items-center justify-center rounded-md border-2',
                    'font-serif text-base font-semibold uppercase transition sm:text-lg',
                    box,
                  ].join(' ')}
                >
                  {cell.number && (
                    <span className="absolute left-0.5 top-0 text-[8px] font-medium leading-tight text-taupe sm:text-[9px]">
                      {cell.number}
                    </span>
                  )}
                  {entered[key] ?? ''}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* keyboard */}
      <div className="mt-4 shrink-0 border-t border-line bg-page pt-3 pb-2">
        <Keyboard onKey={pressLetter} stateFor={() => 'idle'} />
      </div>

      {/* clues sheet */}
      {showClues && (
        <div className="absolute inset-0 z-10 flex flex-col bg-page/97 animate-fade-in">
          <div className="flex shrink-0 items-center justify-between pb-3">
            <h3 className="font-serif text-lg font-semibold text-espresso">Clues</h3>
            <button
              type="button"
              onClick={() => setShowClues(false)}
              className="rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-brown transition hover:bg-[#ddcdb2]"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-2">
            <ClueGroup title="Across" entries={across} selEntry={selEntry} onPick={selectClue} done={sageCells} built={built} />
            <ClueGroup title="Down" entries={down} selEntry={selEntry} onPick={selectClue} done={sageCells} built={built} />
          </div>
        </div>
      )}
    </div>
  );
}

interface GroupProps {
  title: string;
  entries: { index: number; number: number; clue: string; cells: string[] }[];
  selEntry: number;
  onPick: (i: number) => void;
  done: Set<string>;
  built: { cells: Map<string, { answer: string }> };
}

function ClueGroup({ title, entries, selEntry, onPick, done }: GroupProps) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe">{title}</h4>
      <ul className="space-y-1">
        {entries.map((e) => {
          const complete = e.cells.every((k) => done.has(k));
          return (
            <li key={e.index}>
              <button
                type="button"
                onClick={() => onPick(e.index)}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                  selEntry === e.index ? 'bg-sand text-espresso' : 'hover:bg-sand/60',
                  complete ? 'text-taupe line-through' : 'text-espresso',
                ].join(' ')}
              >
                <span className="w-5 shrink-0 font-semibold tabular-nums text-brown">{e.number}</span>
                <span>{e.clue}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
