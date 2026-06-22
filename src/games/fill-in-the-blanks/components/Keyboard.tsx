import { activeAlphabet, activeKeyboardRows, type KeyState } from '../../../content/lang/alphabet';

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
  // Active-language layout (German QWERTZ + ä/ö/ü/ß, Norwegian QWERTY + æ/ø/å).
  const rows = activeKeyboardRows().map((r) => [...r]);
  const missing = activeAlphabet().filter((l) => !rows.flat().includes(l));
  if (missing.length) rows.push(missing);

  return (
    <div className="select-none space-y-1.5">
      {rows.map((row, r) => (
        <div key={r} className="flex justify-center gap-1">
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
                  'h-11 min-w-0 flex-1 rounded-lg text-[15px] font-semibold',
                  'transition active:scale-95 disabled:cursor-default disabled:active:scale-100',
                  'max-w-[2.6rem]',
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
