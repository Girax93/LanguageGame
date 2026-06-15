/**
 * Hand-authored interlocking crosswords, built entirely from learned
 * vocabulary. Each entry references a vocab word-id; the answer letters come
 * from that word's German surface. `requires` (every answer's word-id) feeds
 * the same strict gate as the other modes — a puzzle is only eligible once
 * ALL its answers are mastered. A procedural generator can come later; for now
 * these are curated criss-cross grids that work as soon as they're eligible.
 */
import { wordById } from './vocab';
import { levelForRequires } from './derive';

export type CrosswordDir = 'across' | 'down';

export interface CrosswordEntry {
  /** Vocab word-id; answer letters come from its German surface. */
  wordId: string;
  row: number;
  col: number;
  dir: CrosswordDir;
  /** Optional clue override (e.g. a German category). Defaults to the word's
   *  English meaning, which reinforces vocabulary. */
  clue?: string;
}

export interface RawCrossword {
  id: string;
  rows: number;
  cols: number;
  entries: CrosswordEntry[];
}

export interface CrosswordContentItem extends RawCrossword {
  /** Word-ids every answer needs (strict gating). */
  requires: string[];
  level: number;
}

const RAW: RawCrossword[] = [
  {
    id: 'cw-1',
    rows: 4,
    cols: 6,
    entries: [
      { wordId: 'w-garten', row: 0, col: 0, dir: 'across' },
      { wordId: 'w-auto', row: 0, col: 1, dir: 'down' },
      { wordId: 'w-tee', row: 0, col: 3, dir: 'down' },
      { wordId: 'w-neu', row: 0, col: 5, dir: 'down' },
    ],
  },
  {
    id: 'cw-2',
    rows: 6,
    cols: 7,
    entries: [
      { wordId: 'w-stadt', row: 0, col: 2, dir: 'across' },
      { wordId: 'w-schule', row: 0, col: 2, dir: 'down' },
      { wordId: 'w-alt', row: 0, col: 4, dir: 'down' },
      { wordId: 'w-tee', row: 0, col: 6, dir: 'down' },
    ],
  },
  {
    id: 'cw-3',
    rows: 5,
    cols: 5,
    entries: [
      { wordId: 'w-tisch', row: 0, col: 0, dir: 'across' },
      { wordId: 'w-tee', row: 0, col: 0, dir: 'down' },
      { wordId: 'w-sonne', row: 0, col: 2, dir: 'down' },
      { wordId: 'w-haus', row: 0, col: 4, dir: 'down' },
    ],
  },
];

export const CROSSWORDS: CrosswordContentItem[] = RAW.map((p) => {
  const requires = Array.from(
    new Set(
      p.entries.map((e) => {
        if (!wordById(e.wordId)) throw new Error(`Crossword ${p.id}: unknown word ${e.wordId}`);
        return e.wordId;
      }),
    ),
  );
  return { ...p, requires, level: levelForRequires(requires) };
});
