/**
 * Crossword content — GENERATED per block (see `generateLayout`).
 *
 * Division of labour across the three Practice games:
 *  - Cipher    teaches the block's words inside whole sentences.
 *  - Grammar   drills articles (and, later, prepositions).
 *  - Crossword PICKS UP THE LEFTOVERS — the block words the cipher session
 *    couldn't place (mostly short function words) — and pads them with the
 *    block's nouns so they actually interlock into a real grid (min 4 words).
 *
 * Each clue is just the answer's English meaning (the board has a DE/EN toggle
 * and falls back to the gloss), so no clue authoring is needed; crossings make
 * even hard-to-clue particles solvable. One puzzle per block — it's the third
 * half of the block's Practice gate.
 */
import { SETS, wordById } from './vocab';
import { PROGRESSION } from '../state/progressionConfig';
import { toUpperDE } from '../games/fill-in-the-blanks/cipher';
import { levelForRequires } from './derive';
import { generateConnectedLayout } from '../games/crossword/generate';
import { cipherItemsForBlock } from './cipherItems';

export type CrosswordDir = 'across' | 'down';

export interface CrosswordEntry {
  wordId: string;
  row: number;
  col: number;
  dir: CrosswordDir;
  clue?: string;
}

export interface RawCrossword {
  id: string;
  rows: number;
  cols: number;
  entries: CrosswordEntry[];
}

export interface CrosswordContentItem extends RawCrossword {
  requires: string[];
  level: number;
}

const B = PROGRESSION.setsPerBlock;
const BLOCK_COUNT = Math.floor(SETS.length / B);

/** All word-ids in a block (2 sets). */
function blockWordIds(block: number): string[] {
  return SETS.slice(block * B, block * B + B).flatMap((s) => s.words.map((w) => w.id));
}

/** Block words the generated cipher session already covers. */
function cipherCoveredIds(block: number): Set<string> {
  const ids = new Set(blockWordIds(block));
  const covered = new Set<string>();
  for (const it of cipherItemsForBlock(block)) {
    for (const r of it.requires) if (ids.has(r)) covered.add(r);
  }
  return covered;
}

/** A word can be a crossword answer only if it's a single token of >= 2 letters
 *  (multi-word contractions like "in dem" can't sit in a grid). */
function isPlaceable(id: string): boolean {
  const w = wordById(id);
  return !!w && w.de.length >= 2 && !/\s/.test(w.de);
}

const lenOf = (id: string): number => wordById(id)?.de.length ?? 0;
const byLenDesc = (a: string, b: string): number => lenOf(b) - lenOf(a) || (a < b ? -1 : a > b ? 1 : 0);

/** Cipher-uncovered, placeable words of a block — the words the crossword most
 *  wants to place (priority); whatever it can't interlock falls to Hurdle. */
function blockLeftovers(block: number): string[] {
  const covered = cipherCoveredIds(block);
  return blockWordIds(block).filter((id) => isPlaceable(id) && !covered.has(id));
}

/**
 * The pool a block's crossword draws from: every leftover the cipher didn't
 * cover (priority), PLUS connector words from the same block (nouns first,
 * longest first) so short leftovers can interlock into ONE connected grid.
 */
export function crosswordWordsForBlock(block: number): string[] {
  const leftovers = blockLeftovers(block);
  const used = new Set(leftovers);
  const connectors = blockWordIds(block)
    .filter((id) => isPlaceable(id) && !used.has(id))
    .sort((a, b) => {
      const ga = wordById(a)?.gender ? 0 : 1;
      const gb = wordById(b)?.gender ? 0 : 1;
      return ga - gb || byLenDesc(a, b); // nouns first, then longest
    });
  const result = [...leftovers];
  let added = 0;
  for (const id of connectors) {
    if (result.length >= 7) break;
    if (result.length >= 4 && added >= 2) break; // enough size + interlock anchors
    result.push(id);
    added++;
  }
  return result;
}

interface BlockCross {
  item: CrosswordContentItem | null;
  /** Cipher-uncovered words the crossword couldn't place — sent to Hurdle. */
  hurdleLeftovers: string[];
}

/**
 * Build the block's ONE connected crossword + the leftover word(s) it couldn't
 * place. The generator maximises placement of the priority leftovers; any that
 * still don't interlock are returned for Hurdle — so every block word is
 * practised by the cipher, the crossword, or Hurdle (at least once).
 */
function buildBlockCrossword(block: number): BlockCross {
  const leftovers = blockLeftovers(block);
  const pool = crosswordWordsForBlock(block);
  if (pool.length < 2) return { item: null, hurdleLeftovers: leftovers };

  const words = pool.map((id) => ({ id, surface: toUpperDE(wordById(id)!.de) }));
  const layout = generateConnectedLayout(words, 1000 + block, 60, new Set(leftovers));
  const placedIds = layout.entries.map((e) => e.wordId);
  const placed = new Set(placedIds);
  const hurdleLeftovers = leftovers.filter((id) => !placed.has(id));

  // A real crossword needs at least two interlocking words; if fewer placed,
  // drop the crossword for this block and let Hurdle take its leftovers.
  if (placedIds.length < 2) return { item: null, hurdleLeftovers: leftovers };

  const item: CrosswordContentItem = {
    id: `x-b${block}`,
    rows: layout.rows,
    cols: layout.cols,
    entries: layout.entries.map((e) => ({ wordId: e.wordId, row: e.row, col: e.col, dir: e.dir })),
    requires: [...new Set(placedIds)],
    level: levelForRequires(placedIds),
  };
  return { item, hurdleLeftovers };
}

// Precompute once at load (memoized), like the cipher session.
const BY_BLOCK: BlockCross[] = [];
for (let b = 0; b < BLOCK_COUNT; b++) BY_BLOCK[b] = buildBlockCrossword(b);

/** The block's single crossword puzzle (null if it has none). */
export function crosswordItemsForBlock(block: number): CrosswordContentItem | null {
  return BY_BLOCK[block]?.item ?? null;
}

/** How many crossword rounds a block's Practice session has (0 or 1). */
export function crosswordRoundsForBlock(block: number): number {
  return BY_BLOCK[block]?.item ? 1 : 0;
}

/** Cipher-uncovered words the block's crossword couldn't place (→ Hurdle). */
export function crosswordLeftoverWordsForBlock(block: number): string[] {
  return BY_BLOCK[block]?.hurdleLeftovers ?? [];
}

/** Flat pool of every block's crossword (used by free Recap eligibility). */
export const CROSSWORDS: CrosswordContentItem[] = BY_BLOCK
  .map((b) => b.item)
  .filter((x): x is CrosswordContentItem => x !== null);
