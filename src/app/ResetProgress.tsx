import { useState } from 'react';
import { usePlayer } from '../state/PlayerContext';
import { TopBar } from '../components/ui/TopBar';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function ResetProgress({ onBack, onMain }: Props) {
  const { resetProgress } = usePlayer();
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const armed = text.trim().toUpperCase() === 'RESET';

  function doReset() {
    if (!armed) return;
    resetProgress();
    setText('');
    setDone(true);
  }

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Reset progress" onBack={onBack} onMain={onMain} />

      <section className="card p-[22px]">
        <p className="font-serif text-lg font-semibold text-espresso">German</p>
        <p className="mt-2 text-sm text-taupe">
          This permanently clears your learned words, focus and membership for German. It can’t be
          undone.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-taupe">
          Type RESET to confirm
        </p>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDone(false);
          }}
          placeholder="RESET"
          autoCapitalize="characters"
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-espresso outline-none transition focus:border-terracotta/60"
        />
        <button
          disabled={!armed}
          onClick={doReset}
          className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            armed
              ? 'bg-terracotta text-cream hover:opacity-90'
              : 'cursor-not-allowed bg-sand text-taupe'
          }`}
        >
          Reset German progress
        </button>
        {done && <p className="mt-3 text-center text-sm font-semibold text-sage">Progress reset.</p>}
      </section>
    </div>
  );
}
