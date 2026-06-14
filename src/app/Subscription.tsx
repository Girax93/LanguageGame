import { usePlayer } from '../state/PlayerContext';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function Subscription({ onBack, onMain }: Props) {
  const { state, setSubscribed } = usePlayer();

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Subscription" onBack={onBack} onMain={onMain} />

      <div className="flex flex-col gap-4">
        <section className="card p-[22px]">
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg font-semibold text-espresso">
              {state.subscribed ? 'Premium' : 'Free plan'}
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                state.subscribed ? 'bg-brown text-cream' : 'bg-sand text-taupe'
              }`}
            >
              {state.subscribed ? 'Active' : 'Free'}
            </span>
          </div>
          <p className="mt-2 text-sm text-taupe">
            {state.subscribed
              ? 'You have Premium — unlimited focus and no ads.'
              : 'Upgrade in the Store for unlimited focus and no ads.'}
          </p>
        </section>

        <section className="card p-[22px]">
          <p className="font-serif text-lg font-semibold text-espresso">How to cancel</p>
          <p className="mt-2 text-sm text-taupe">
            When real billing is added, you’ll cancel through your App Store / Google Play
            subscriptions (or right here). For now it’s a demo toggle.
          </p>
          {state.subscribed && (
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setSubscribed(false)}>
              Cancel premium (demo)
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
