import { usePlayer } from '../state/PlayerContext';
import { SETS } from '../content/vocab';
import { isSetMastered, availableSetCount } from '../state/progression';
import { TopBar } from './Practice';

interface Props {
  onBack: () => void;
}

/** Word-set overview — the only place set/pool detail lives. */
export function Progress({ onBack }: Props) {
  const { state } = usePlayer();
  const available = availableSetCount(state, SETS);
  const learnedCount = state.learnedWords.length;

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Progress" onBack={onBack} />
      <p className="mt-2 text-taupe">{learnedCount} words learned so far</p>

      <div className="mt-7 flex flex-col gap-2.5">
        {SETS.map((set, i) => {
          const mastered = set.words.filter((w) => state.learnedWords.includes(w.id)).length;
          const done = isSetMastered(state, set);
          const open = i < available;
          const stateLabel = done ? 'Learned' : open ? `${mastered} of ${set.words.length}` : 'Locked';

          return (
            <div
              key={set.index}
              className={`card flex items-center justify-between px-5 py-4 ${open ? '' : 'opacity-55'}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-serif text-base text-brown">
                  {done ? '✓' : open ? '◦' : '·'}
                </span>
                <span className="font-medium text-espresso">Word set {i + 1}</span>
              </div>
              <span className={`text-sm ${done ? 'text-sage' : 'text-taupe'}`}>{stateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
