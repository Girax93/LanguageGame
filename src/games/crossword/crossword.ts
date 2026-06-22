/**
 * Pure crossword model: turn a content puzzle into a grid of cells with
 * standard clue numbering and ordered entries. No React, so it can be
 * unit-tested. Throws on an authoring mistake (overlapping letters that don't
 * agree), which the content test catches before shipping.
 */
import { wordById } from '../../content/vocab';
import { toUpperActive } from '../../content/lang/alphabet';
import type { CrosswordContentItem, CrosswordDir } from '../../content/crosswords';

export interface XCell {
  r: number;
  c: number;
  answer: string;
  number?: number;
  across?: number;
  down?: number;
}

export interface XEntry {
  index: number;
  number: number;
  dir: CrosswordDir;
  wordId: string;
  clue: string;
  answer: string;
  cells: string[];
}

export interface BuiltCrossword {
  id: string;
  rows: number;
  cols: number;
  cells: Map<string, XCell>;
  entries: XEntry[];
  total: number;
}

export const cellKey = (r: number, c: number): string => `${r},${c}`;

export function buildCrossword(item: CrosswordContentItem): BuiltCrossword {
  const cells = new Map<string, XCell>();

  const drafts = item.entries.map((e, i) => {
    const word = wordById(e.wordId);
    if (!word) throw new Error(`crossword ${item.id}: unknown word ${e.wordId}`);
    const answer = toUpperActive(word.de);
    const clue = e.clue ?? word.en;
    const keys: string[] = [];
    for (let k = 0; k < answer.length; k++) {
      const r = e.row + (e.dir === 'down' ? k : 0);
      const c = e.col + (e.dir === 'across' ? k : 0);
      const key = cellKey(r, c);
      const ch = answer[k];
      const existing = cells.get(key);
      if (existing) {
        if (existing.answer !== ch) {
          throw new Error(`crossword ${item.id}: letter conflict at ${key} (${existing.answer} vs ${ch})`);
        }
      } else {
        cells.set(key, { r, c, answer: ch });
      }
      keys.push(key);
    }
    return { e, i, answer, clue, keys };
  });

  for (const d of drafts) {
    for (const key of d.keys) {
      const cell = cells.get(key)!;
      if (d.e.dir === 'across') cell.across = d.i;
      else cell.down = d.i;
    }
  }

  let n = 0;
  for (let r = 0; r < item.rows; r++) {
    for (let c = 0; c < item.cols; c++) {
      const key = cellKey(r, c);
      if (!cells.has(key)) continue;
      const startsAcross = !cells.has(cellKey(r, c - 1)) && cells.has(cellKey(r, c + 1));
      const startsDown = !cells.has(cellKey(r - 1, c)) && cells.has(cellKey(r + 1, c));
      if (startsAcross || startsDown) {
        n += 1;
        cells.get(key)!.number = n;
      }
    }
  }

  const entries: XEntry[] = drafts.map((d) => ({
    index: d.i,
    number: cells.get(d.keys[0])!.number ?? 0,
    dir: d.e.dir,
    wordId: d.e.wordId,
    clue: d.clue,
    answer: d.answer,
    cells: d.keys,
  }));

  return { id: item.id, rows: item.rows, cols: item.cols, cells, entries, total: cells.size };
}
