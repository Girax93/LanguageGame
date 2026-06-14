import { usePlayer } from '../state/PlayerContext';
import { SETS, ALL_WORDS } from '../content/vocab';
import { TopBar } from '../components/ui/TopBar';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function Statistics({ onBack, onMain }: Props) {
  const { state } = usePlayer();
  const learned = state.learnedWords.length;
  const total = ALL_WORDS.length;
  const pct = total ? learned / total : 0;

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Statistics" onBack={onBack} onMain={onMain} />

      <div className="flex flex-col gap-4">
        <section className="card p-[22px]">
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg font-semibold text-espresso">German</p>
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
          <Metric label="Games cleared" value={state.levelsWon} />
        </div>

        <section className="card p-[22px]">
          <p className="eyebrow mb-3">Word sets</p>
          <div className="flex flex-col gap-2">
            {SETS.map((s) => {
              const m = s.words.filter((w) => state.learnedWords.includes(w.id)).length;
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
