import { useState } from 'react';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { loadProfile, saveProfile, type Profile } from '../state/profile';

interface Props {
  onBack: () => void;
  onMain: () => void;
}

export function Account({ onBack, onMain }: Props) {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<Profile>) {
    setProfile((p) => ({ ...p, ...patch }));
    setSaved(false);
  }
  function save() {
    saveProfile(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="Account" onBack={onBack} onMain={onMain} />

      <div className="flex flex-col gap-4">
        <section className="card p-[22px]">
          <Field label="Username" value={profile.username} onChange={(v) => update({ username: v })} />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={profile.email}
            onChange={(v) => update({ email: v })}
          />
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-taupe">Password</p>
            <div className="mt-1 rounded-xl border border-line bg-sand px-3 py-2.5 text-sm text-taupe">
              •••••••• · managed locally
            </div>
          </div>
          <Button className="mt-5 w-full" onClick={save}>
            {saved ? 'Saved ✓' : 'Save'}
          </Button>
        </section>

        <p className="text-center text-[11px] text-taupe">
          Demo account — your progress is saved on this device and linked here. Real sign-in
          arrives with a backend later.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="mt-3 block first:mt-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-taupe">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-espresso outline-none transition focus:border-brown/60"
      />
    </label>
  );
}
