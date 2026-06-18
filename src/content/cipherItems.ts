/**
 * Cipher content — GENERATED from the lemma curriculum (see `generateCipher.ts`).
 *
 * For each block we generate the small set of sentences whose words together
 * cover that block's newly-learned words; completing them is the cipher half of
 * the block's Practice gate. `CIPHER_ITEMS` is the flat pool (used by recap +
 * eligibility); `cipherItemsForBlock` / `cipherRoundsForBlock` drive the bounded
 * Practice session and its progress bar.
 */
import { LEMMAS, type Lemma } from './lemmas';
import { PROGRESSION } from '../state/progressionConfig';
import { generateBlockDrafts, levelForRequires } from './generateCipher';

export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  requires: string[];
  level: number;
}

const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock; // 10
const BLOCK_COUNT = Math.floor(LEMMAS.length / BLOCK_SIZE);
const BY_ID = new Map<string, Lemma>(LEMMAS.map((w) => [w.id, w]));

const BY_BLOCK: CipherContentItem[][] = [];
for (let b = 0; b < BLOCK_COUNT; b++) {
  BY_BLOCK[b] = generateBlockDrafts(b, LEMMAS).map((d, i) => ({
    id: `c-b${b}-${i}`,
    sentence: d.sentence,
    translation: d.translation,
    requires: d.requires,
    level: levelForRequires(d.requires, BY_ID),
  }));
}

export const CIPHER_ITEMS: CipherContentItem[] = BY_BLOCK.flat();

/** The bounded cipher Practice session for a block (covers its new words). */
export function cipherItemsForBlock(block: number): CipherContentItem[] {
  return BY_BLOCK[block] ?? [];
}

/** How many cipher sentences a block's Practice session contains (gate target). */
export function cipherRoundsForBlock(block: number): number {
  return BY_BLOCK[block]?.length ?? 0;
}
