import { GERMAN_ALPHABET, type KeyState } from '../cipher';

// QWERTZ-style German layout, including ä/ö/ü and ß as their own keys.
const ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['Y', 'X', 'C', 'V', 'B', 'N', 'M', 'ß'],
];

// Safety net: make sure every cipher letter has a key somewhere.
const MISSING = GERMAN_ALPHABET.filter((l) => !ROWS.flat().includes(l));
if (MISSING.length) ROWS.push(MISSING);

interface Props {
  onKey: (letter: string) => void;
  stateFor: (letter: string) => KeyState;
  disabled?: boolean;
}

const KEY_STYLES: Record<KeyState, string> = {
  active: 'bg-brown text-cream',
  idle: 'bg-sand text-espresso hover:bg-[#ddcdb2]',
  disabled: 'bg-page text-given',
};

export function Keyboard({ onKey, stateFor, disabled = false }: Props) {
  return (
    <div className="select-none space-y-1.5">
      {ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1.5">
          {row.map((letter) => {
            const state = stateFor(letter);
            const isDisabled = disabled || state === 'disabled';
            return (
              <button
                key={letter}
                type="button"
                disabled={isDisabled}
                onClick={() => onKey(letter)}
                className={[
                  'h-11 min-w-[2rem] flex-1 rounded-lg text-base font-semibold',
                  'transition active:scale-95 disabled:cursor-default disabled:active:scale-100',
                  'max-w-[2.75rem]',
                  KEY_STYLES[state],
                ].join(' ')}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
