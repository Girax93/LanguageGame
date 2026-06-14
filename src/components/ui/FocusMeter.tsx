import { ECONOMY } from '../../state/economyConfig';
import { usePlayer } from '../../state/PlayerContext';
import { timeToNextFocusMs } from '../../state/focus';

function fmt(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Compact focus (energy) display with regen countdown. */
export function FocusMeter() {
  const { state, now } = usePlayer();
  const next = timeToNextFocusMs(state, now);

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm">
      <span className="text-ochre" aria-hidden>⬣</span>
      <span className="font-semibold text-espresso">
        {state.subscribed ? '∞' : `${state.focus}/${ECONOMY.focusMax}`}
      </span>
      {!state.subscribed && next != null && (
        <span className="text-taupe">+1 in {fmt(next)}</span>
      )}
    </div>
  );
}
