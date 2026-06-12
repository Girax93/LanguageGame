export type Level = 'A1' | 'A2' | 'B1';

/** One cryptogram puzzle: a sentence/proverb the player decodes. */
export interface CipherItem {
  id: string;
  /** German sentence in natural case; the engine normalizes to uppercase. */
  sentence: string;
  /** English translation, shown only when the player toggles the hint on. */
  translation: string;
  level: Level;
}

export interface CipherDeck {
  /** Human-readable deck name, shown in the UI. */
  name: string;
  language: string;
  items: CipherItem[];
}
