import { useMemo, useState } from 'react';
import { usePlayer } from '../state/PlayerContext';
import { vocabFor } from '../content/vocab';
import { LANGS, langByCode } from '../content/lang/registry';
import { loadPlayerState } from '../state/storage';
import { TopBar } from '../components/ui/TopBar';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function Statistics({ onBack, onMain }: Props) {
  const { state, language } = usePlayer();
  // Which language's stats are on screen. Defaults to the active course, but the
  // toggle lets you peek at the other language WITHOUT changing your course.
  const [view, setView] = useState(language);

  // Active language reads live state; others read their own saved namespace.
  const viewState = useMemo(
    () => (view === language ? state : loadPlayerState(Date.now(), view)),
    [view, language, state],
  );
  const vocab = vocabFor(view);
  const langName = langByCode(view)?.name ?? view;

  const learned = viewState.learnedWords.length;
  const total = vocab.allWords.length;
  const pct = total ? learned / total : 0;

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Statistics" onBack={onBack} onMain={onMain} />

      {/* Language toggle — view either course's stats. */}
      {LANGS.length > 1 && (
        <div className="mb-5 flex gap-2">
          {LANGS.map((l) => {
            const selected = l.code === view;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setView(l.code)}
                aria-pressed={selected}
                className={[
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98]',
                  selected ? 'bg-brown text-cream' : 'bg-sand text-taupe hover:text-espresso',
                ].join(' ')}
              >
                <span aria-hidden>{l.flag}</span>
                {l.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <section className="card p-[22px]">
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg font-semibold text-espresso">{langName}</p>
            <span className="text-sm tabular-nums text-taupe">
              {learned} / {total} words
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-brown" style={{ width: `${Math.min(1, pct) * 100}%` }} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-brown px-2.5 py-1 text-xs font-semibold text-cream">A1</span>
            <span className="text-xs text-taupe">in progress</span>
            <span className="ml-auto rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-taupe">
              A2 · locked
            </span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Words mastered" value={learned} />
          <Metric label="Games cleared" value={viewState.levelsWon} />
        </div>

        <section className="card p-[22px]">
          <p className="eyebrow mb-3">Word sets</p>
          <div className="flex flex-col gap-2">
            {vocab.sets.map((s) => {
              const m = s.words.filter((w) => viewState.learnedWords.includes(w.id)).length;
              const done = m === s.words.length;
              return (
                <div key={s.index} className="flex items-center justify-between text-sm">
                  <span className="text-espresso">Set {s.index + 1}</span>
                  <span className={done ? 'text-sage' : 'text-taupe'}>
                    {done ? 'Learned' : `${m} / ${s.words.length}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 text-center">
      <div className="font-serif text-3xl font-semibold text-espresso">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-taupe">{label}</div>
    </div>
  );
}
