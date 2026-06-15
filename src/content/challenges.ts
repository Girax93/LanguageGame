/**
 * Challenge crosswords: after every `setsPerChallenge` sets, the player must
 * clear one crossword built from EVERY word in that block (4 sets * 5 = 20
 * words). Fully procedural and deterministic (seeded by block index) so the
 * player always retries the same puzzle and nothing is hand-authored.
 */
import { SETS, wordById } from './vocab';
import { PROGRESSION } from '../state/progressionConfig';
import { toUpperDE } from '../games/fill-in-the-blanks/cipher';
import { levelForRequires } from './derive';
import { generateLayout } from '../games/crossword/generate';
import type { CrosswordContentItem } from './crosswords';

/** The word-ids in a challenge block (one block = setsPerChallenge sets). */
export function blockWordIds(block: number): string[] {
  const lo = block * PROGRESSION.setsPerChallenge;
  return SETS.slice(lo, lo + PROGRESSION.setsPerChallenge).flatMap((s) => s.words.map((w) => w.id));
}

/** Procedurally generate the challenge crossword for a block. */
export function challengeCrossword(block: number): CrosswordContentItem {
  const ids = blockWordIds(block);
  const words = ids.map((id) => ({ id, surface: toUpperDE(wordById(id)!.de) }));
  const layout = generateLayout(words, block);
  return {
    id: `challenge-${block}`,
    rows: layout.rows,
    cols: layout.cols,
    entries: layout.entries.map((e) => ({ wordId: e.wordId, row: e.row, col: e.col, dir: e.dir })),
    requires: ids.slice(),
    level: levelForRequires(ids),
  };
}
