import { useCallback, useEffect, useRef, useState } from 'react';
import type { GrammarContentItem } from '../../../content/grammarItems';
import { ECONOMY } from '../../../state/economyConfig';
import { toUpperDE, isLetterDE } from '../../fill-in-the-blanks/cipher';
import { endingLetters, isEndingLetterCorrect } from '../grammar';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Hearts } from '../../../components/ui/Hearts';
import { Keyboard } from '../../fill-in-the-blanks/components/Keyboard';

interface Props {
  item: GrammarContentItem;
  onResult: (won: boolean) => void;
}

export function GrammarBoard({ item, onResult }: Props) {
  const ending = endingLetters(item.ending);
  const stemChars = [...toUpperDE(item.stem)];
  const total = ending.length;

  const [filled, setFilled] = useState<Set<number>>(() => new Set());
  const [selected, setSelected] = useState<number>(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
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

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current) return;
      if (isEndingLetterCorrect(item.ending, selected, letter)) {
        const next = new Set(filled);
        next.add(selected);
        setFilled(next);
        if (next.size === total) {
          finish(true);
        } else {
          // advance to the next empty ending slot
          let i = selected + 1;
          while (i < total && next.has(i)) i++;
          setSelected(i < total ? i : selected);
        }
      } else {
        const idx = selected;
        setWrongIdx(idx);
        window.setTimeout(() => setWrongIdx((w) => (w === idx ? null : w)), 400);
        const left = lives - 1;
        setLives(left);
        if (left <= 0) finish(false);
      }
    },
    [item.ending, selected, filled, total, finish, lives],
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
          Article ending
        </span>
      </div>
      <ProgressBar value={total === 0 ? 1 : filled.size / total} />

      <div className="mt-8 flex flex-1 flex-col justify-center">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/70">
          Fill the article ending
        </p>
        <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-3 text-2xl font-semibold">
          {item.before && <span className="pb-7">{item.before}</span>}
          {stemChars.map((c, i) => (
            <Cell key={`s${i}`} char={c} kind="given" />
          ))}
          {ending.map((_, i) => (
            <Cell
              key={`e${i}`}
              char={filled.has(i) ? ending[i] : ''}
              kind={
                filled.has(i)
                  ? 'filled'
                  : wrongIdx === i
                    ? 'wrong'
                    : selected === i
                      ? 'selected'
                      : 'empty'
              }
              onClick={() => !filled.has(i) && setSelected(i)}
            />
          ))}
          {item.after && <span className="pb-7">{item.after}</span>}
        </div>

        <div className="mt-8 flex flex-col items-center">
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
        <Keyboard onKey={pressLetter} stateFor={() => 'idle'} />
      </div>
    </div>
  );
}

type CellKind = 'given' | 'filled' | 'empty' | 'selected' | 'wrong';

function Cell({
  char,
  kind,
  onClick,
}: {
  char: string;
  kind: CellKind;
  onClick?: () => void;
}) {
  const style =
    kind === 'given'
      ? 'border-white/15 bg-white/[0.06] text-white'
      : kind === 'filled'
        ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100'
        : kind === 'selected'
          ? 'border-violet-400 bg-violet-400/10 text-white ring-2 ring-violet-400/60'
          : kind === 'wrong'
            ? 'border-rose-400 bg-rose-400/10 text-rose-300 animate-shake'
            : 'border-white/25 bg-white/[0.03] text-white hover:border-white/50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={[
        'flex h-11 w-9 items-center justify-center rounded-md border-2 text-xl font-bold uppercase transition sm:h-12 sm:w-10',
        style,
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {char}
    </button>
  );
}
