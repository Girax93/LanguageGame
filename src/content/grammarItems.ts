/**
 * Grammar drills — GENERATED from the noun lemmas. For every gendered noun we
 * produce a der/die/das article drill (pick the right ending). This replaces
 * the old hand-authored list and scales to the whole vocabulary. The grammar
 * game layers a short "explain → practise" flow on top of these items.
 */
import { ALL_WORDS } from './vocab';
import type { Gender } from './lemmas';

export interface GrammarContentItem {
  id: string;
  before: string;
  stem: string;
  ending: string;
  after: string;
  translation: string;
  gender: Gender;
  requires: string[];
  level: number;
}

function endingFor(g: Gender): string {
  return g === 'm' ? 'er' : g === 'f' ? 'ie' : 'as';
}
/** Spread the difficulty curve (1–6) across the ~2000-word order. */
function levelForOrder(order: number): number {
  return Math.max(1, Math.min(6, Math.floor((order - 1) / 334) + 1));
}

export const GRAMMAR_ITEMS: GrammarContentItem[] = ALL_WORDS.filter(
  (w) => w.pos === 'noun' && !!w.gender,
).map((noun) => ({
  id: `g-${noun.id}`,
  before: '',
  stem: 'd',
  ending: endingFor(noun.gender!),
  after: ` ${noun.de}`,
  translation: `the ${noun.en}`,
  gender: noun.gender!,
  requires: [noun.id],
  level: levelForOrder(noun.order),
}));
