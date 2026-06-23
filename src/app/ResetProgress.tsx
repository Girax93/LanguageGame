import { useState } from 'react';
import { usePlayer } from '../state/PlayerContext';
import { TopBar } from '../components/ui/TopBar';
import { LANGS } from '../content/lang/registry';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

/**
 * Reset progress — per language or everything. Each language's progress lives
 * under its own localStorage key, so resetting one never touches the other.
 * Typing RESET arms the buttons; the active-language choice is kept either way.
 */
export function ResetProgress({ onBack, onMain }: Props) {
  const { resetProgress, language } = usePlayer();
  const [text, setText] = useState('');
  const [doneMsg, setDoneMsg] = useState('');
  const armed = text.trim().toUpperCase() === 'RESET';

  function reset(target: string, label: string) {
    if (!armed) return;
    resetProgress(target);
    setText('');
    setDoneMsg(`${label} reset.`);
  }

  const btn = (extra: string) =>
    `w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
      armed ? `${extra} hover:opacity-90` : 'cursor-not-allowed bg-sand text-taupe'
    }`;

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Reset progress" onBack={onBack} onMain={onMain} />

      <section className="card p-[22px]">
        <p className="font-serif text-lg font-semibold text-espresso">Reset progress</p>
        <p className="mt-2 text-sm text-taupe">
          Permanently clears learned words, focus and membership for the language you choose. This
          can’t be undone.
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-taupe">
          Type RESET to confirm
        </p>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDoneMsg('');
          }}
          placeholder="RESET"
          autoCapitalize="characters"
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-espresso outline-none transition focus:border-terracotta/60"
        />

        <div className="mt-4 space-y-2">
          {LANGS.map((l) => (
            <button
              key={l.code}
              disabled={!armed}
              onClick={() => reset(l.code, l.name)}
              className={btn('bg-terracotta text-cream')}
            >
              {`${l.flag} Reset ${l.name}${l.code === language ? ' (current)' : ''}`}
            </button>
          ))}
          <button
            disabled={!armed}
            onClick={() => reset('all', 'All languages')}
            className={`mt-1 ${btn('bg-espresso text-cream')}`}
          >
            Reset everything
          </button>
        </div>

        {doneMsg && (
          <p className="mt-3 text-center text-sm font-semibold text-sage">{doneMsg}</p>
        )}
      </section>
    </div>
  );
}
