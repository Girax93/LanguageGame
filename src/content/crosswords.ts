/**
 * Crossword content — GENERATED per block, for every language. The crossword
 * picks up a block's LEFTOVERS (words the cipher didn't place), pads them with
 * the block's nouns so they interlock, and builds ONE connected grid. Whatever
 * still can't be placed is handed to Hurdle. Precomputed per language; the
 * public functions dispatch to the active language and swap on a switch.
 */
import type { Lemma } from './lemmas';
import { PROGRESSION } from '../state/progressionConfig';
import { generateConnectedLayout } from '../games/crossword/generate';
import { cipherBlocksForLang, type CipherContentItem } from './cipherItems';
import { LANGS, getActiveCode, onLanguageChange } from './lang/registry';
import { vocabFor, type VocabSet } from './vocab';
import type { LangPack } from './lang/types';

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

interface LangCtx {
  code: string;
  byId: Map<string, Lemma>;
  idToSet: Map<string, number>;
  sets: VocabSet[];
  toUpper: (s: string) => string;
  cipherBlocks: CipherContentItem[][];
}

function levelForRequiresLang(requires: string[], idToSet: Map<string, number>): number {
  let maxIdx = 0;
  for (const id of requires) maxIdx = Math.max(maxIdx, idToSet.get(id) ?? 0);
  return Math.max(1, Math.min(6, maxIdx + 1));
}

function blockWordIds(ctx: LangCtx, block: number): string[] {
  return ctx.sets.slice(block * B, block * B + B).flatMap((s) => s.words.map((w) => w.id));
}
function cipherCoveredIds(ctx: LangCtx, block: number): Set<string> {
  const ids = new Set(blockWordIds(ctx, block));
  const covered = new Set<string>();
  for (const it of ctx.cipherBlocks[block] ?? []) {
    for (const r of it.requires) if (ids.has(r)) covered.add(r);
  }
  return covered;
}
function isPlaceable(ctx: LangCtx, id: string): boolean {
  const w = ctx.byId.get(id);
  return !!w && w.de.length >= 2 && !/\s/.test(w.de);
}
const lenOf = (ctx: LangCtx, id: string): number => ctx.byId.get(id)?.de.length ?? 0;
const byLenDesc = (ctx: LangCtx, a: string, b: string): number =>
  lenOf(ctx, b) - lenOf(ctx, a) || (a < b ? -1 : a > b ? 1 : 0);

function blockLeftovers(ctx: LangCtx, block: number): string[] {
  const covered = cipherCoveredIds(ctx, block);
  return blockWordIds(ctx, block).filter((id) => isPlaceable(ctx, id) && !covered.has(id));
}

function crosswordPool(ctx: LangCtx, block: number): string[] {
  const leftovers = blockLeftovers(ctx, block);
  const used = new Set(leftovers);
  const connectors = blockWordIds(ctx, block)
    .filter((id) => isPlaceable(ctx, id) && !used.has(id))
    .sort((a, b) => {
      const ga = ctx.byId.get(a)?.gender ? 0 : 1;
      const gb = ctx.byId.get(b)?.gender ? 0 : 1;
      return ga - gb || byLenDesc(ctx, a, b);
    });
  const result = [...leftovers];
  let added = 0;
  for (const id of connectors) {
    if (result.length >= 7) break;
    if (result.length >= 4 && added >= 2) break;
    result.push(id);
    added++;
  }
  return result;
}

interface BlockCross {
  item: CrosswordContentItem | null;
  pool: string[];
  hurdleLeftovers: string[];
}

function buildBlockCrossword(ctx: LangCtx, block: number): BlockCross {
  const leftovers = blockLeftovers(ctx, block);
  const pool = crosswordPool(ctx, block);
  if (pool.length < 2) return { item: null, pool, hurdleLeftovers: leftovers };

  const words = pool.map((id) => ({ id, surface: ctx.toUpper(ctx.byId.get(id)!.de) }));
  const layout = generateConnectedLayout(words, 1000 + block, 60, new Set(leftovers));
  const placedIds = layout.entries.map((e) => e.wordId);
  const placed = new Set(placedIds);
  const hurdleLeftovers = leftovers.filter((id) => !placed.has(id));

  if (placedIds.length < 2) return { item: null, pool, hurdleLeftovers: leftovers };

  const item: CrosswordContentItem = {
    id: `x-b${block}`,
    rows: layout.rows,
    cols: layout.cols,
    entries: layout.entries.map((e) => ({ wordId: e.wordId, row: e.row, col: e.col, dir: e.dir })),
    requires: [...new Set(placedIds)],
    level: levelForRequiresLang(placedIds, ctx.idToSet),
  };
  return { item, pool, hurdleLeftovers };
}

function ctxFor(pack: LangPack): LangCtx {
  const v = vocabFor(pack.code);
  return {
    code: pack.code,
    byId: v.byId,
    idToSet: v.idToSet,
    sets: v.sets,
    toUpper: pack.toUpper,
    cipherBlocks: cipherBlocksForLang(pack.code),
  };
}

function buildLang(pack: LangPack): BlockCross[] {
  const ctx = ctxFor(pack);
  const blockCount = Math.floor(ctx.sets.length / B);
  const out: BlockCross[] = [];
  for (let b = 0; b < blockCount; b++) out[b] = buildBlockCrossword(ctx, b);
  return out;
}

const BY_LANG = new Map<string, BlockCross[]>(LANGS.map((l) => [l.code, buildLang(l)]));

/** Cipher-uncovered words a language's block crossword couldn't place. */
export function crosswordLeftoverForLang(code: string, block: number): string[] {
  return BY_LANG.get(code)?.[block]?.hurdleLeftovers ?? [];
}

let activeBlocks: BlockCross[] = BY_LANG.get(getActiveCode()) ?? [];
export let CROSSWORDS: CrosswordContentItem[] = activeBlocks
  .map((b) => b.item)
  .filter((x): x is CrosswordContentItem => x !== null);

onLanguageChange((code) => {
  activeBlocks = BY_LANG.get(code) ?? [];
  CROSSWORDS = activeBlocks.map((b) => b.item).filter((x): x is CrosswordContentItem => x !== null);
});

/** The pool a block's crossword draws from (active language; used by tests). */
export function crosswordWordsForBlock(block: number): string[] {
  return activeBlocks[block]?.pool ?? [];
}
/** The block's single crossword puzzle (null if it has none). */
export function crosswordItemsForBlock(block: number): CrosswordContentItem | null {
  return activeBlocks[block]?.item ?? null;
}
/** How many crossword rounds a block's Practice session has (0 or 1). */
export function crosswordRoundsForBlock(block: number): number {
  return activeBlocks[block]?.item ? 1 : 0;
}
/** Cipher-uncovered words the block's crossword couldn't place (→ Hurdle). */
export function crosswordLeftoverWordsForBlock(block: number): string[] {
  return activeBlocks[block]?.hurdleLeftovers ?? [];
}
