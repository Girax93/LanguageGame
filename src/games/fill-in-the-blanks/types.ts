export type Level = 'A1' | 'A2' | 'B1';

/**
 * One fill-in-the-blanks item.
 *
 * `sentence` must contain the blank marker "___" (three underscores),
 * which is where `answer` belongs.
 */
export interface FillBlankItem {
  id: string;
  /** German sentence containing the "___" blank marker. */
  sentence: string;
  /** The word that fills the blank. */
  answer: string;
  /** English translation of the full, completed sentence. */
  translation: string;
  /** Optional curated wrong options. If omitted, distractors are auto-generated. */
  options?: string[];
  /** Optional extra hint shown under the sentence. */
  hint?: string;
  level: Level;
}

export interface FillBlankDeck {
  /** Human-readable deck name, shown in the UI. */
  name: string;
  language: string;
  items: FillBlankItem[];
}
