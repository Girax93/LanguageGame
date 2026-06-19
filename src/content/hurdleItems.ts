/**
 * Hurdle content — GENERATED from the lemma curriculum.
 *
 * Hurdle drills the SPELLING of individual words: each item is one word the
 * player guesses Wordle-style from its English meaning. Per block we take a few
 * of that block's own words (the player's current "batch") to form the bounded
 * Practice session — the fourth half of the block's Practice gate. `HURDLE_ITEMS`
 * is the flat pool used by free Recap (any learned word).
 *
 * A word is usable only if it's a single token of >= 2 German letters (so
 * spaces, hyphens and stray punctuation are excluded — they can't sit in a row
 * of letter tiles).
 */
import { LEMMAS, type Lemma } from './lemmas';
import { SETS, wordById } from './vocab';
import { PROGRESSION } from '../state/progressionConfig';
import { toUpperDE, isLetterDE } from '../games/fill-in-the-blanks/cipher';
import { levelForRequires } from './derive';

export interface HurdleContentItem {
  id: string;
  wordId: string;
  /** The answer, uppercased (ß/umlauts preserved as single letters). */
  answer: string;
  /** English meaning shown as the clue. */
  en: string;
  requires: string[];
  level: number;
}

const B = PROGRESSION.setsPerBlock;
const BLOCK_COUNT = Math.floor(SETS.length / B);

/** Words per block's Hurdle Practice session (gate target cap). */
export const HURDLE_MAX_ROUNDS = 3;

/** Can a lemma be a Hurdle answer? Single token, >= 2 German letters only. */
export function isHurdleWord(w: Lemma): boolean {
  if (/\s/.test(w.de)) return false;
  const up = toUpperDE(w.de);
  const letters = [...up];
  return letters.length >= 2 && letters.every((c) => isLetterDE(c));
}

function itemFor(w: Lemma): HurdleContentItem {
  return {
    id: `h-${w.id}`,
    wordId: w.id,
    answer: toUpperDE(w.de),
    en: w.en,
    requires: [w.id],
    level: levelForRequires([w.id]),
  };
}

function blockWordIds(block: number): string[] {
  return SETS.slice(block * B, block * B + B).flatMap((s) => s.words.map((w) => w.id));
}

// Precompute the per-block sessions once at load (like cipher/crossword).
const BY_BLOCK: HurdleContentItem[][] = [];
for (let b = 0; b < BLOCK_COUNT; b++) {
  const words = blockWordIds(b)
    .map((id) => wordById(id)!)
    .filter(isHurdleWord)
    .slice(0, HURDLE_MAX_ROUNDS);
  BY_BLOCK[b] = words.map(itemFor);
}

/** Flat pool of every spellable lemma (used by free Recap eligibility). */
export const HURDLE_ITEMS: HurdleContentItem[] = LEMMAS.filter(isHurdleWord).map(itemFor);

/** The bounded Hurdle Practice session for a block (its own words). */
export function hurdleItemsForBlock(block: number): HurdleContentItem[] {
  return BY_BLOCK[block] ?? [];
}

/** How many Hurdle words a block's Practice session contains (gate target). */
export function hurdleRoundsForBlock(block: number): number {
  return BY_BLOCK[block]?.length ?? 0;
}
