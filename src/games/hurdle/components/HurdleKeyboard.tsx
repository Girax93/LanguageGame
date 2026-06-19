import type { TileState } from '../hurdle';
import { ChevronLeft } from '../../../components/ui/icons';

/** QWERTZ German layout. Bottom row is flanked by Enter + Backspace (Wordle-style). */
const LETTER_ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['Y', 'X', 'C', 'V', 'B', 'N', 'M', 'ß'],
];

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
  /** Whether the current row is complete (Enter emphasised when true). */
  canSubmit: boolean;
}

export function HurdleKeyboard({ onLetter, onEnter, onDelete, hints, canSubmit }: Props) {
  return (
    <div className="select-none space-y-1.5">
      {LETTER_ROWS.slice(0, 2).map((row, r) => (
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
        {LETTER_ROWS[2].map((letter) => (
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
