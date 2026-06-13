/**
 * Derive a puzzle's required word-ids from its text, and its difficulty from
 * how deep into the vocabulary those words sit. Throwing here is intentional:
 * it makes an authoring mistake (a word not in vocab) fail loudly and is
 * caught by the content test before it can ship.
 */
import { SURFACE_TO_ID, setIndexForWord } from './vocab';

const PUNCT = /[.,!?;:"'„“”()]/g;

/** Word-ids required by a piece of German text (every token must be vocab). */
export function requiresFromText(text: string): string[] {
  const tokens = text.toLowerCase().replace(PUNCT, ' ').split(/\s+/).filter(Boolean);
  const ids = new Set<string>();
  for (const tok of tokens) {
    const id = SURFACE_TO_ID[tok];
    if (!id) {
      throw new Error(`Content error: no vocab word for "${tok}" in: ${text}`);
    }
    ids.add(id);
  }
  return [...ids];
}

/**
 * Difficulty level (1–6) from the deepest set among the required words, so
 * difficulty scales automatically with progression: puzzles that only become
 * eligible later (because they need later-set words) are harder.
 */
export function levelForRequires(requires: string[]): number {
  let maxIdx = 0;
  for (const id of requires) maxIdx = Math.max(maxIdx, setIndexForWord(id));
  return Math.max(1, Math.min(6, maxIdx + 1));
}
