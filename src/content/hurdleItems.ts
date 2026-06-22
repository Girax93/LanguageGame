/**
 * Hurdle content — GENERATED from each language's curriculum. The per-block
 * Practice session is the cipher-uncovered words the crossword couldn't place
 * (usually 0–1). `HURDLE_ITEMS` is the flat pool (any spellable word) for free
 * Recap. Precomputed per language; the active view swaps on a language switch.
 */
import type { Lemma } from './lemmas';
import { PROGRESSION } from '../state/progressionConfig';
import { crosswordLeftoverForLang } from './crosswords';
import { LANGS, getActiveCode, getActiveLang, onLanguageChange } from './lang/registry';
import { vocabFor } from './vocab';
import type { LangPack } from './lang/types';

export interface HurdleContentItem {
  id: string;
  wordId: string;
  answer: string;
  en: string;
  requires: string[];
  level: number;
}

const B = PROGRESSION.setsPerBlock;

function isHurdleWordPack(w: Lemma, pack: LangPack): boolean {
  if (/\s/.test(w.de)) return false;
  const letters = [...pack.toUpper(w.de)];
  return letters.length >= 2 && letters.every((c) => pack.isLetter(c));
}

/** Is the ACTIVE language's lemma spellable as a Hurdle answer? */
export function isHurdleWord(w: Lemma): boolean {
  return isHurdleWordPack(w, getActiveLang());
}

function levelForLang(requires: string[], idToSet: Map<string, number>): number {
  let maxIdx = 0;
  for (const id of requires) maxIdx = Math.max(maxIdx, idToSet.get(id) ?? 0);
  return Math.max(1, Math.min(6, maxIdx + 1));
}

function itemFor(w: Lemma, pack: LangPack, idToSet: Map<string, number>): HurdleContentItem {
  return {
    id: `h-${w.id}`,
    wordId: w.id,
    answer: pack.toUpper(w.de),
    en: w.en,
    requires: [w.id],
    level: levelForLang([w.id], idToSet),
  };
}

interface LangHurdle {
  byBlock: HurdleContentItem[][];
  pool: HurdleContentItem[];
}

function buildLang(pack: LangPack): LangHurdle {
  const v = vocabFor(pack.code);
  const blockCount = Math.floor(v.sets.length / B);
  const byBlock: HurdleContentItem[][] = [];
  for (let b = 0; b < blockCount; b++) {
    const words = crosswordLeftoverForLang(pack.code, b)
      .map((id) => v.byId.get(id))
      .filter((w): w is Lemma => !!w && isHurdleWordPack(w, pack));
    byBlock[b] = words.map((w) => itemFor(w, pack, v.idToSet));
  }
  const pool = pack.lemmas.filter((w) => isHurdleWordPack(w, pack)).map((w) => itemFor(w, pack, v.idToSet));
  return { byBlock, pool };
}

const BY_LANG = new Map<string, LangHurdle>(LANGS.map((l) => [l.code, buildLang(l)]));

let active: LangHurdle = BY_LANG.get(getActiveCode()) ?? { byBlock: [], pool: [] };
export let HURDLE_ITEMS: HurdleContentItem[] = active.pool;

onLanguageChange((code) => {
  active = BY_LANG.get(code) ?? { byBlock: [], pool: [] };
  HURDLE_ITEMS = active.pool;
});

/** The bounded Hurdle Practice session for a block: the crossword's leftovers. */
export function hurdleItemsForBlock(block: number): HurdleContentItem[] {
  return active.byBlock[block] ?? [];
}
/** How many Hurdle words a block's Practice session contains (gate target; 0+). */
export function hurdleRoundsForBlock(block: number): number {
  return active.byBlock[block]?.length ?? 0;
}
