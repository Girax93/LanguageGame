/**
 * Vocabulary access layer. The word data now lives in `lemmas.ts` (~2000
 * frequency-ordered German lemmas); this module derives the curriculum
 * structure (sets/blocks) and the lookups/display helpers the rest of the app
 * uses. Lookups are Map-backed (O(1)) so they stay fast at 2000+ words.
 *
 * Backwards-compatible surface: `VocabWord`, `VocabSet`, `SETS`, `ALL_WORDS`,
 * `wordById`, `setIndexForWord`, and the article/answer helpers keep the same
 * shapes the games and progression already import.
 */
import { PROGRESSION } from '../state/progressionConfig';
import { LEMMAS, type Lemma, type Gender, type Pos } from './lemmas';

export type { Gender, Pos } from './lemmas';

/** A learnable unit. Now a dictionary lemma carrying rich metadata. */
export type VocabWord = Lemma;

export interface VocabSet {
  index: number;
  name: string;
  words: VocabWord[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Every lemma, in curriculum (frequency) order. */
export const ALL_WORDS: VocabWord[] = LEMMAS;

/** Ordered sets of `wordsPerSet` lemmas (the unit Learn delivers). */
export const SETS: VocabSet[] = chunk(LEMMAS, PROGRESSION.wordsPerSet).map(
  (words, index) => ({ index, name: `Set ${index + 1}`, words }),
);

// ── Fast lookups (Map-backed) ───────────────────────────────────────────────
const BY_ID = new Map<string, VocabWord>(LEMMAS.map((w) => [w.id, w]));
const ID_TO_SET = new Map<string, number>();
SETS.forEach((s) => s.words.forEach((w) => ID_TO_SET.set(w.id, s.index)));

/** Surface (lowercased `de`) → first lemma id with that surface. */
export const SURFACE_TO_ID: Record<string, string> = {};
for (const w of LEMMAS) {
  const k = w.de.toLowerCase();
  if (!(k in SURFACE_TO_ID)) SURFACE_TO_ID[k] = w.id;
}

export function wordById(id: string): VocabWord | undefined {
  return BY_ID.get(id);
}

export function setIndexForWord(id: string): number {
  return ID_TO_SET.get(id) ?? -1;
}

// ── Display + answer-matching helpers ───────────────────────────────────────

/** Nominative definite article for a noun's gender. */
export function articleFor(gender: Gender): string {
  return gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
}

/** German display form: nouns carry their definite article ("der Hund");
 *  everything else is shown bare. */
export function germanWithArticle(w: VocabWord): string {
  return w.gender ? `${articleFor(w.gender)} ${w.de}` : w.de;
}

/** English gloss as presented: nouns compose to "the <gloss>"; others bare. */
export function englishWithArticle(w: VocabWord): string {
  return w.gender ? `the ${w.en}` : w.en;
}

/** Definite articles (English + German) treated as "the" when matching answers. */
const DEFINITE_ARTICLES = ['the', 'der', 'die', 'das', 'den', 'dem', 'des'];

/** Drop a single leading definite article for tolerant matching:
 *  "the man" -> "man", "der Hund" -> "Hund". */
export function stripArticle(s: string): string {
  const t = s.trim();
  const lower = t.toLowerCase();
  for (const a of DEFINITE_ARTICLES) {
    if (lower.startsWith(a + ' ')) return t.slice(a.length + 1).trim();
  }
  return t;
}

/** Case-insensitive answer equality that accepts the form WITH or WITHOUT a
 *  leading definite article, so a learner is never penalised for "the". */
export function answerMatches(a: string, b: string): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  return stripArticle(a).toLowerCase() === stripArticle(b).toLowerCase();
}
