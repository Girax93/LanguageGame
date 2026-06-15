/**
 * Challenge crosswords: the capstone of each block. One crossword built from
 * EVERY word in the block (2 sets * 5 = 10 words), generated procedurally and
 * deterministically (seeded by block index) so retries are the same puzzle and
 * nothing is hand-authored.
 */
import { SETS, wordById } from './vocab';
import { PROGRESSION } from '../state/progressionConfig';
import { toUpperDE } from '../games/fill-in-the-blanks/cipher';
import { levelForRequires } from './derive';
import { generateLayout } from '../games/crossword/generate';
import type { CrosswordContentItem } from './crosswords';

export function blockWordIds(block: number): string[] {
  const lo = block * PROGRESSION.setsPerBlock;
  return SETS.slice(lo, lo + PROGRESSION.setsPerBlock).flatMap((s) => s.words.map((w) => w.id));
}

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
