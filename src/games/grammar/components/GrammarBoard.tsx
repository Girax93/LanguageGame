import { useCallback, useEffect, useRef, useState } from 'react';
import type { GrammarContentItem } from '../../../content/grammarItems';
import type { BoardControls } from '../../_shared/LevelStage';
import { toUpperDE, isLetterDE } from '../../fill-in-the-blanks/cipher';
import { endingLetters, isEndingLetterCorrect } from '../grammar';
import { Keyboard } from '../../fill-in-the-blanks/components/Keyboard';

interface Props {
  item: GrammarContentItem;
  controls: BoardControls;
}

export function GrammarBoard({ item, controls }: Props) {
  const ending = endingLetters(item.ending);
  const stemChars = [...toUpperDE(item.stem)];
  const total = ending.length;

  const [filled, setFilled] = useState<Set<number>>(() => new Set());
  const [selected, setSelected] = useState<number>(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const done = useRef(false);

  const pressLetter = useCallback(
    (letter: string) => {
      if (done.current) return;
      if (isEndingLetterCorrect(item.ending, selected, letter)) {
        const next = new Set(filled);
        next.add(selected);
        setFilled(next);
        if (next.size === total) {
          done.current = true;
          controls.onSolved();
        } else {
          let i = selected + 1;
          while (i < total && next.has(i)) i++;
          setSelected(i < total ? i : selected);
        }
      } else {
        const idx = selected;
        setWrongIdx(idx);
        window.setTimeout(() => setWrongIdx((w) => (w === idx ? null : w)), 400);
        controls.onWrong();
      }
    },
    [item.ending, selected, filled, total, controls],
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 font-serif text-2xl font-semibold text-espresso">
          {item.before && <span className="text-espresso">{item.before}</span>}
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
          {item.after && <span className="text-espresso">{item.after}</span>}
        </div>
      </div>

      <div className="mt-4 flex shrink-0 flex-col items-center gap-3 border-t border-line bg-page pt-3 pb-2">
        <button
          type="button"
          onClick={() => setShowHint((s) => !s)}
          className="text-sm text-taupe underline-offset-4 transition hover:text-brown hover:underline"
        >
          {showHint ? item.translation : 'Need a hint?'}
        </button>
        <div className="w-full">
          <Keyboard onKey={pressLetter} stateFor={() => 'idle'} />
        </div>
      </div>
    </div>
  );
}

type CellKind = 'given' | 'filled' | 'empty' | 'selected' | 'wrong';

function Cell({ char, kind, onClick }: { char: string; kind: CellKind; onClick?: () => void }) {
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
