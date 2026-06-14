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
        <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-taupe">
          Article ending
        </span>
      </div>
      <ProgressBar value={total === 0 ? 1 : filled.size / total} />

      <div className="mt-8 flex flex-1 flex-col justify-center">
        <p className="mb-5 text-center eyebrow">
          Fill the article ending
        </p>
        <div className="flex flex-wrap items-end justify-center gap-x-1.5 gap-y-3 font-serif text-2xl font-semibold text-espresso">
          {item.before && <span className="pb-7 text-espresso">{item.before}</span>}
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
          {item.after && <span className="pb-7 text-espresso">{item.after}</span>}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium text-brown transition hover:bg-sand"
          >
            {showHint ? 'Hide translation' : 'Show translation'}
          </button>
          {showHint && (
            <p className="mt-3 animate-fade-in text-center text-taupe">{item.translation}</p>
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
      ? 'border-line bg-given/25 text-brown'
      : kind === 'filled'
        ? 'border-sage/60 bg-sage/15 text-espresso'
        : kind === 'selected'
          ? 'border-brown bg-sand text-espresso ring-2 ring-brown/40'
          : kind === 'wrong'
            ? 'border-terracotta bg-terracotta/10 text-terracotta animate-shake'
            : 'border-line bg-card text-espresso hover:border-brown/50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={[
        'flex h-11 w-9 items-center justify-center rounded-xl border-2 text-xl font-semibold uppercase transition sm:h-12 sm:w-10',
        style,
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {char}
    </button>
  );
}
