/**
 * "This block's words" reminder (Feature 1). Shown on the Practice screen so the
 * player can refresh the block's vocabulary before drilling it, with a full
 * review screen one tap away. Language-agnostic: forms + glosses come from the
 * active pack's article helpers, so it reads "der Mann" (de) / "en mann" (no).
 */
import { TopBar } from '../components/ui/TopBar';
import type { VocabWord } from '../content/vocab';
import { germanWithArticle, englishWithArticle } from '../content/vocab';

const GENDER_LABEL: Record<string, string> = { m: 'masc.', f: 'fem.', n: 'neut.' };

/** Compact inline reminder of the block's words, tappable to open the full list. */
export function BlockWordsBanner({ words, onOpen }: { words: VocabWord[]; onOpen: () => void }) {
  if (words.length === 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-4 w-full rounded-2xl border border-line bg-sand/40 p-4 text-left transition hover:bg-sand/70 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-sm font-semibold text-espresso">This block’s words</h3>
        <span className="shrink-0 text-xs font-medium text-brown">Review all →</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-taupe">
        {words.map((w) => germanWithArticle(w)).join('  ·  ')}
      </p>
    </button>
  );
}

/** Full review screen: every block word with its article form, gloss and gender. */
export function BlockWords({
  words,
  blockLabel,
  onBack,
  onMain,
}: {
  words: VocabWord[];
  blockLabel?: string;
  onBack: () => void;
  onMain: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <TopBar title="This block’s words" onBack={onBack} onMain={onMain} />
      {blockLabel && <p className="mb-5 -mt-1 text-taupe">{blockLabel}</p>}
      <div className="flex flex-col gap-2.5">
        {words.map((w) => (
          <div key={w.id} className="card flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg font-semibold text-espresso">{germanWithArticle(w)}</p>
              <p className="mt-0.5 text-sm text-taupe">{englishWithArticle(w)}</p>
            </div>
            {w.gender && (
              <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-taupe">
                {GENDER_LABEL[w.gender] ?? w.gender}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
