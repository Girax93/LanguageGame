import type { ReactNode } from 'react';
import { Card, type MenuItem } from '../components/ui/MenuScreen';
import { BookIcon, FlameIcon, ProgressIcon, SettingsIcon, StoreIcon } from '../components/ui/icons';
import { loadProfile } from '../state/profile';

interface Props {
  /** Active course language display name (e.g. "German"). */
  langName: string;
  /** Consecutive-day streak for the active language. */
  streak: number;
  /** Words learned in the active language. */
  wordsLearned: number;
  /** The single featured "next action" card (already has emphasis set). */
  continueItem: MenuItem;
  onLanguages: () => void;
  onStatistics: () => void;
  onStore: () => void;
  onSettings: () => void;
}

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The home screen: an identity header (streak + words), a warm greeting, one
 * prominent "Continue" card that resumes the next real action, the language
 * picker, and a demoted row of utilities (Stats / Store / Settings).
 */
export function Home({
  langName,
  streak,
  wordsLearned,
  continueItem,
  onLanguages,
  onStatistics,
  onStore,
  onSettings,
}: Props) {
  const name = loadProfile().username;
  const greeting = greetingFor(new Date().getHours());
  const subline =
    wordsLearned === 0 ? 'Let’s learn your first words.' : `Keep your ${langName} going.`;

  const languagesItem: MenuItem = {
    icon: <BookIcon />,
    label: 'Languages',
    sublabel: `${langName} · switch or start a new one`,
    onClick: onLanguages,
  };

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      {/* Identity band */}
      <div className="mb-7 flex items-center justify-between">
        <div className="font-serif text-lg font-semibold tracking-tight text-espresso">
          LanguageGame
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold tabular-nums text-espresso">
              <FlameIcon size={14} className="text-ochre" />
              {streak}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold tabular-nums text-espresso">
            {wordsLearned}
            <span className="font-normal text-taupe">words</span>
          </span>
        </div>
      </div>

      {/* Greeting */}
      <h1 className="font-serif text-3xl font-semibold leading-tight text-espresso">
        {greeting}
        {name ? `, ${name}` : ''}
      </h1>
      <p className="mb-6 mt-1 text-taupe">{subline}</p>

      {/* Primary actions */}
      <div className="flex flex-col gap-3">
        <Card item={continueItem} index={0} />
        <Card item={languagesItem} index={1} />
      </div>

      {/* Demoted utilities */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <SecondaryButton icon={<ProgressIcon size={20} />} label="Stats" onClick={onStatistics} index={2} />
        <SecondaryButton icon={<StoreIcon size={20} />} label="Store" onClick={onStore} index={3} />
        <SecondaryButton icon={<SettingsIcon size={20} />} label="Settings" onClick={onSettings} index={4} />
      </div>
    </div>
  );
}

function SecondaryButton({
  icon,
  label,
  onClick,
  index,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 45}ms`, animationFillMode: 'backwards' }}
      className="flex animate-slide-up flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-card/60 py-3.5 text-taupe transition hover:bg-card hover:text-espresso active:scale-[0.98]"
    >
      <span className="text-brown/80">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
