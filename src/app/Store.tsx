import { usePlayer } from '../state/PlayerContext';
import { ECONOMY } from '../state/economyConfig';
import { TopBar } from '../components/ui/TopBar';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function Store({ onBack, onMain }: Props) {
  const { state, buyFocus, setSubscribed } = usePlayer();

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Store" onBack={onBack} onMain={onMain} />

      <div className="flex flex-col gap-4">
        <section className="card p-[22px]">
          <p className="font-serif text-lg font-semibold text-espresso">Premium</p>
          <p className="mt-0.5 text-sm text-taupe">
            {state.subscribed
              ? 'Active — unlimited focus and no ads.'
              : 'Unlimited focus, no ads, and more to come.'}
          </p>
          <button
            onClick={() => setSubscribed(!state.subscribed)}
            className="mt-4 w-full rounded-xl bg-brown px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-brown-dark"
          >
            {state.subscribed
              ? 'Cancel premium (demo)'
              : `Subscribe · ${ECONOMY.iap.subscriptionPriceLabel}`}
          </button>
        </section>

        <section className="card p-[22px]">
          <p className="font-serif text-lg font-semibold text-espresso">Refill focus</p>
          <p className="mt-0.5 text-sm text-taupe">Instantly top your focus back up.</p>
          <button
            onClick={buyFocus}
            className="mt-4 w-full rounded-xl bg-ochre px-4 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90"
          >
            Refill · {ECONOMY.iap.refillPriceLabel}
          </button>
        </section>

        <p className="text-center text-[11px] text-taupe">
          Demo only — no real payment. Real billing (Stripe) comes later.
        </p>
      </div>
    </div>
  );
}
