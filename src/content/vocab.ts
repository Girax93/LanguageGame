/**
 * Vocabulary access for the ACTIVE language. The dataset is delivered by each
 * `LangPack` (German, Norwegian); this module chunks every pack's lemmas into
 * SETS + lookup maps once, and exposes the active language's view.
 *
 * `SETS`, `ALL_WORDS` and `SURFACE_TO_ID` are live `let` bindings reassigned
 * when the language switches — ES-module live bindings mean every importer sees
 * the new value after a switch (the app re-renders from the menu, so games read
 * the fresh data). `wordById` / `setIndexForWord` read the active lookup maps.
 */
import { PROGRESSION } from '../state/progressionConfig';
import { LANGS, getActiveCode, getActiveLang, onLanguageChange } from './lang/registry';
import type { Lemma, Gender, Pos } from './lemmas';

export type { Gender, Pos } from './lemmas';
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

interface VocabData {
  sets: VocabSet[];
  allWords: VocabWord[];
  byId: Map<string, VocabWord>;
  idToSet: Map<string, number>;
  surfaceToId: Record<string, string>;
}

function buildVocab(lemmas: VocabWord[]): VocabData {
  const sets: VocabSet[] = chunk(lemmas, PROGRESSION.wordsPerSet).map((words, index) => ({
    index,
    name: `Set ${index + 1}`,
    words,
  }));
  const byId = new Map<string, VocabWord>(lemmas.map((w) => [w.id, w]));
  const idToSet = new Map<string, number>();
  sets.forEach((s) => s.words.forEach((w) => idToSet.set(w.id, s.index)));
  const surfaceToId: Record<string, string> = {};
  for (const w of lemmas) {
    const k = w.de.toLowerCase();
    if (!(k in surfaceToId)) surfaceToId[k] = w.id;
  }
  return { sets, allWords: lemmas, byId, idToSet, surfaceToId };
}

const VOCAB = new Map<string, VocabData>(LANGS.map((l) => [l.code, buildVocab(l.lemmas)]));

/** The vocab data for a specific language (used by per-language precompute). */
export function vocabFor(code: string): VocabData {
  return VOCAB.get(code) ?? VOCAB.get('de')!;
}

let active = vocabFor(getActiveCode());

// Live bindings: reassigned on language switch (importers see the new values).
export let SETS: VocabSet[] = active.sets;
export let ALL_WORDS: VocabWord[] = active.allWords;
export let SURFACE_TO_ID: Record<string, string> = active.surfaceToId;

onLanguageChange((code) => {
  active = vocabFor(code);
  SETS = active.sets;
  ALL_WORDS = active.allWords;
  SURFACE_TO_ID = active.surfaceToId;
});

export function wordById(id: string): VocabWord | undefined {
  return active.byId.get(id);
}
export function setIndexForWord(id: string): number {
  return active.idToSet.get(id) ?? -1;
}

// ── display helpers (dispatch to the active pack's article system) ───────────
/** Definite article from gender — German der/die/das (kept for German). */
export function articleFor(gender: Gender): string {
  return gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
}
/** A noun shown with its teaching article (de "der Mann"; no "en mann"). */
export function germanWithArticle(w: VocabWord): string {
  return getActiveLang().withArticle(w);
}
/** The English shown with its article (de/no "the man" / "a man"). */
export function englishWithArticle(w: VocabWord): string {
  return getActiveLang().withArticleEn(w);
}

// Articles stripped when loosely matching a learn answer — superset across
// languages (definite + indefinite + English a/an) so matching is lenient.
const STRIP_ARTICLES = [
  'the', 'der', 'die', 'das', 'den', 'dem', 'des',
  'a', 'an', 'en', 'ei', 'et',
];
export function stripArticle(s: string): string {
  const t = s.trim();
  const lower = t.toLowerCase();
  for (const a of STRIP_ARTICLES) {
    if (lower.startsWith(a + ' ')) return t.slice(a.length + 1).trim();
  }
  return t;
}
export function answerMatches(a: string, b: string): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  return stripArticle(a).toLowerCase() === stripArticle(b).toLowerCase();
}
