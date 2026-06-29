import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from '../../components/ui/icons';
import { wordById, germanWithArticle, type VocabWord } from '../../content/vocab';

/**
 * The ONE end-of-session screen, shared by every game. A game only describes the
 * message + buttons (`CompleteSpec`); the shared level flow supplies this layout,
 * injects the just-solved item's reveal, and the session word-summary. This is
 * why "show the answer / the words at the end" is a single place, not per-game.
 */
export interface CompleteSpec {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

// Words worth recapping at the end (skip pure scaffolding: articles, conjunctions…).
const SUMMARY_POS = new Set(['noun', 'verb', 'adj', 'adv']);

/** A win / reveal card: a bold line (the answer) + its meaning. Shared so every
 *  game's reveal looks identical (cipher sentence, hurdle word, grammar phrase). */
export function RevealCard({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="mt-3 w-full max-w-xs rounded-xl border border-line bg-sand/40 px-4 py-3 text-center">
      <p className="font-serif text-lg font-semibold text-espresso">{primary}</p>
      <p className="mt-1 text-sm text-taupe">{secondary}</p>
    </div>
  );
}

/** Recap of the content words a session covered (deduped, content words only,
 *  active language). Hidden for trivial sessions where the reveal already says it. */
function WordSummary({ ids }: { ids: string[] }) {
  const words = ids
    .map((id) => wordById(id))
    .filter((w): w is VocabWord => !!w && SUMMARY_POS.has(w.pos))
    .slice(0, 12);
  if (words.length < 2) return null;
  return (
    <div className="mt-5 w-full max-w-xs rounded-xl border border-line bg-card/70 px-4 py-3 text-left">
      <p className="eyebrow mb-2">Words you practiced</p>
      <ul className="flex flex-col gap-1">
        {words.map((w) => (
          <li key={w.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-serif font-semibold text-espresso">{germanWithArticle(w)}</span>
            <span className="text-right text-taupe">{w.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompleteScreen({
  spec,
  reveal,
  words,
  onExit,
}: {
  spec: CompleteSpec;
  reveal?: ReactNode;
  words?: string[];
  onExit: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center">
        <button
          onClick={onExit}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-taupe transition hover:bg-sand hover:text-espresso"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-4 text-center animate-pop-in">
        <div className="text-4xl text-brown">✓</div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-espresso">{spec.title}</h2>
        <p className="mt-2 max-w-xs text-taupe">{spec.body}</p>
        {reveal}
        {words && <WordSummary ids={words} />}
        <Button className="mt-8 w-64" onClick={spec.onPrimary}>
          {spec.primaryLabel}
        </Button>
        {spec.secondaryLabel && spec.onSecondary && (
          <button
            onClick={spec.onSecondary}
            className="mt-4 text-sm font-medium text-brown transition hover:text-espresso"
          >
            {spec.secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
