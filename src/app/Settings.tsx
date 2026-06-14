import { useState } from 'react';
import { usePlayer } from '../state/PlayerContext';
import { ECONOMY } from '../state/economyConfig';
import { timeToNextFocusMs } from '../state/focus';
import { FocusPips } from '../components/ui/FocusPips';
import { TopBar } from '../components/ui/TopBar';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

function fmt(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

export function Settings({ onBack, onMain }: Props) {
  const { state, now, buyFocus, setSubscribed, resetProgress } = usePlayer();
  const next = timeToNextFocusMs(state, now);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Settings" onBack={onBack} onMain={onMain} />

      <div className="mt-6 flex flex-col gap-4">
        {/* Focus */}
        <section className="card p-[22px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-espresso">Focus</p>
              <p className="mt-0.5 text-xs text-taupe">
                {state.subscribed
                  ? 'Unlimited with Pro.'
                  : next != null
                    ? `+1 in ${fmt(next)} · max ${ECONOMY.focusMax}`
                    : `Full · max ${ECONOMY.focusMax}`}
              </p>
            </div>
            <FocusPips focus={state.focus} max={ECONOMY.focusMax} subscribed={state.subscribed} />
          </div>
          {!state.subscribed && (
            <button
              onClick={buyFocus}
              className="mt-4 w-full rounded-xl bg-ochre px-4 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
            >
              Refill focus · {ECONOMY.iap.refillPriceLabel}
            </button>
          )}
        </section>

        {/* Membership */}
        <section className="card p-[22px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-espresso">Membership</p>
              <p className="mt-0.5 text-xs text-taupe">
                {state.subscribed ? 'Pro — unlimited focus' : 'Free'}
              </p>
            </div>
            <span className="text-sm font-medium text-brown">{state.subscribed ? 'Pro' : 'Free'}</span>
          </div>
          <button
            onClick={() => setSubscribed(!state.subscribed)}
            className="mt-4 w-full rounded-xl border border-brown/40 px-4 py-2.5 text-sm font-semibold text-brown transition hover:bg-brown/5"
          >
            {state.subscribed ? 'Cancel Pro (demo)' : `Get Pro · ${ECONOMY.iap.subscriptionPriceLabel}`}
          </button>
          <p className="mt-2 text-[11px] text-taupe">Demo only — no real payment.</p>
        </section>

        {/* Reset */}
        <section className="card p-[22px]">
          <p className="text-sm font-semibold text-espresso">Reset progress</p>
          <p className="mt-0.5 text-xs text-taupe">Clears learned words, focus and membership.</p>
          <button
            onClick={() => {
              if (confirmReset) {
                resetProgress();
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
              }
            }}
            className="mt-4 w-full rounded-xl border border-terracotta/50 px-4 py-2.5 text-sm font-semibold text-terracotta transition hover:bg-terracotta/5"
          >
            {confirmReset ? 'Tap again to confirm' : 'Reset progress'}
          </button>
        </section>
      </div>
    </div>
  );
}
