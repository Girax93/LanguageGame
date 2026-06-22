/**
 * Cipher content for the ACTIVE language. Each `LangPack` generates the small
 * set of sentences covering a block's newly-learned words; completing them is
 * the cipher half of the block's Practice gate. Precomputed per language at
 * load; the active view swaps on a language switch.
 */
import type { Lemma } from './lemmas';
import { PROGRESSION } from '../state/progressionConfig';
import { levelForRequires } from './generateCipher';
import { LANGS, getActiveCode, onLanguageChange } from './lang/registry';
import type { LangPack } from './lang/types';

export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  requires: string[];
  level: number;
}

const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock; // 10

function buildLang(pack: LangPack): CipherContentItem[][] {
  const byId = new Map<string, Lemma>(pack.lemmas.map((w) => [w.id, w]));
  const blockCount = Math.floor(pack.lemmas.length / BLOCK_SIZE);
  const byBlock: CipherContentItem[][] = [];
  for (let b = 0; b < blockCount; b++) {
    byBlock[b] = pack.generateCipherDrafts(b).map((d, i) => ({
      id: `c-b${b}-${i}`,
      sentence: d.sentence,
      translation: d.translation,
      requires: d.requires,
      level: levelForRequires(d.requires, byId),
    }));
  }
  return byBlock;
}

const BY_LANG = new Map<string, CipherContentItem[][]>(LANGS.map((l) => [l.code, buildLang(l)]));

/** Per-language block list (used by the crossword module for coverage). */
export function cipherBlocksForLang(code: string): CipherContentItem[][] {
  return BY_LANG.get(code) ?? [];
}

let activeBlocks: CipherContentItem[][] = BY_LANG.get(getActiveCode()) ?? [];
export let CIPHER_ITEMS: CipherContentItem[] = activeBlocks.flat();

onLanguageChange((code) => {
  activeBlocks = BY_LANG.get(code) ?? [];
  CIPHER_ITEMS = activeBlocks.flat();
});

/** The bounded cipher Practice session for a block (covers its new words). */
export function cipherItemsForBlock(block: number): CipherContentItem[] {
  return activeBlocks[block] ?? [];
}

/** How many cipher sentences a block's Practice session contains (gate target). */
export function cipherRoundsForBlock(block: number): number {
  return activeBlocks[block]?.length ?? 0;
}
