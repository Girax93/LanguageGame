import type { TileState } from '../hurdle';
import { activeKeyboardRows, activeAlphabet } from '../../../content/lang/alphabet';
import { ChevronLeft } from '../../../components/ui/icons';

type KeyHint = TileState | 'idle';

const HINT_STYLES: Record<KeyHint, string> = {
  correct: 'bg-sage text-cream',
  present: 'bg-ochre text-espresso',
  absent: 'bg-page text-given',
  idle: 'bg-sand text-espresso hover:bg-[#ddcdb2]',
};

interface Props {
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  hints: Record<string, TileState>;
  canSubmit: boolean;
}

export function HurdleKeyboard({ onLetter, onEnter, onDelete, hints, canSubmit }: Props) {
  // Active-language layout (German QWERTZ, Norwegian QWERTY+Æ/Ø/Å, French QWERTY +
  // a top accent row). Render every row but the LAST as plain letter rows; the
  // final (short) row carries Enter/⌫. Any alphabet letter missing from the layout
  // is appended so it stays typable — mirrors the cipher Keyboard's fallback. For
  // German/Norwegian (3 rows) this is identical to the previous 2-rows-then-Enter
  // layout; it just also supports French's 4th row.
  const rows = activeKeyboardRows().map((r) => [...r]);
  const missing = activeAlphabet().filter((l) => !rows.flat().includes(l));
  if (missing.length) rows.push(missing);
  const plainRows = rows.slice(0, -1);
  const lastRow = rows[rows.length - 1] ?? [];
  return (
    <div className="select-none space-y-1.5">
      {plainRows.map((row, r) => (
        <div key={r} className="flex justify-center gap-1">
          {row.map((letter) => (
            <LetterKey key={letter} letter={letter} hint={hints[letter] ?? 'idle'} onClick={onLetter} />
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-1">
        <button
          type="button"
          onClick={onEnter}
          aria-label="Submit guess"
          className={[
            'h-11 flex-[1.6] rounded-lg px-1 text-[12px] font-semibold uppercase tracking-wide',
            'transition active:scale-95',
            canSubmit ? 'bg-brown text-cream' : 'bg-sand text-espresso hover:bg-[#ddcdb2]',
          ].join(' ')}
        >
          Enter
        </button>
        {lastRow.map((letter) => (
          <LetterKey key={letter} letter={letter} hint={hints[letter] ?? 'idle'} onClick={onLetter} />
        ))}
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete letter"
          className="flex h-11 flex-[1.6] items-center justify-center rounded-lg bg-sand text-espresso transition hover:bg-[#ddcdb2] active:scale-95"
        >
          <ChevronLeft />
        </button>
      </div>
    </div>
  );
}

function LetterKey({
  letter,
  hint,
  onClick,
}: {
  letter: string;
  hint: KeyHint;
  onClick: (letter: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(letter)}
      className={[
        'h-11 min-w-0 flex-1 rounded-lg text-[15px] font-semibold',
        'transition active:scale-95 max-w-[2.6rem]',
        HINT_STYLES[hint],
      ].join(' ')}
    >
      {letter}
    </button>
  );
}
