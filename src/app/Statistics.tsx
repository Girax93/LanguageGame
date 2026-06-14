import { usePlayer } from '../state/PlayerContext';
import { ALL_WORDS } from '../content/vocab';
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
            <div
              className="h-full rounded-full bg-brown"
              style={{ width: `${Math.min(1, pct) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-brown px-2.5 py-1 text-xs font-semibold text-cream">
              A1
            </span>
            <span className="text-xs text-taupe">in progress</span>
            <span className="ml-auto rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-taupe">
              A2 · locked
            </span>
          </div>
        </section>

        <p className="text-center text-xs text-taupe">More statistics coming soon.</p>
      </div>
    </div>
  );
}
