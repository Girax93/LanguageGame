/**
 * Recap crosswords.
 *
 * Temporarily EMPTY: the old hand-authored grids referenced the previous
 * surface-form vocabulary. Procedurally generated crosswords over the learned
 * lemma pool are added in a follow-up; until then the recap crossword shows an
 * empty state. Types are preserved (the challenge generator + board import
 * them).
 */
export type CrosswordDir = 'across' | 'down';

export interface CrosswordEntry {
  /** Vocab word-id; answer letters come from its German surface. */
  wordId: string;
  row: number;
  col: number;
  dir: CrosswordDir;
  /** Optional clue override; defaults to the word's clue/meaning. */
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

export const CROSSWORDS: CrosswordContentItem[] = [];
