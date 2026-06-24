/**
 * Derive a puzzle's required word-ids from its text, and its difficulty from
 * how deep into the vocabulary those words sit. Throwing here is intentional:
 * it makes an authoring mistake (a word not in vocab) fail loudly and is
 * caught by the content test before it can ship.
 */
import { SURFACE_TO_ID, setIndexForWord, answerMatches, type VocabWord } from './vocab';
import { CIPHER_ITEMS } from './cipherItems';

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

// ── Learn: smart distractors ────────────────────────────────────────────────
// Plausible wrong answers are close to the target: same part of speech first,
// then same gender (nouns), same set, and similar length. A pure, deterministic
// ranking so it's unit-testable; the game shuffles a top window for variety.

function distractorScore(target: VocabWord, w: VocabWord, targetSet: number): number {
  let s = 0;
  if (w.pos === target.pos) s += 100; // dominant: keep options the same kind of word
  if (target.gender && w.gender === target.gender) s += 10;
  if (setIndexForWord(w.id) === targetSet) s += 5;
  if (Math.abs(w.de.length - target.de.length) <= 2) s += 1;
  return s;
}

/** Candidate distractor words for `target`, best (closest) first. Pure. */
export function rankedDistractors(target: VocabWord, pool: VocabWord[]): VocabWord[] {
  const targetSet = setIndexForWord(target.id);
  return pool
    .filter((w) => w.id !== target.id)
    .map((w) => ({ w, s: distractorScore(target, w, targetSet) }))
    .sort((a, b) => b.s - a.s || a.w.rank - b.w.rank)
    .map((x) => x.w);
}

/**
 * `n` distractor strings rendered via `toText`, never matching the answer and
 * de-duplicated. Pure + deterministic (tests assert this); the game adds variety
 * by shuffling a top window of `rankedDistractors` before rendering.
 */
export function distractorTexts(
  target: VocabWord,
  pool: VocabWord[],
  n: number,
  toText: (w: VocabWord) => string,
): string[] {
  const answer = toText(target);
  const out: string[] = [];
  for (const w of rankedDistractors(target, pool)) {
    const t = toText(w);
    if (answerMatches(t, answer)) continue;
    if (out.some((o) => answerMatches(o, t))) continue;
    out.push(t);
    if (out.length === n) break;
  }
  return out;
}

// ── Learn: example sentence ─────────────────────────────────────────────────
/**
 * A short example sentence that uses `wordId` and otherwise only words the
 * player already knows — sourced from the generated cipher sentences (which are
 * grammatical and provably correct). Returns the shortest match, or null if the
 * generator never places this word among known words yet.
 */
export function exampleSentenceFor(
  wordId: string,
  knownIds: ReadonlySet<string>,
): { de: string; en: string } | null {
  const candidates = CIPHER_ITEMS.filter(
    (c) => c.requires.includes(wordId) && c.requires.every((r) => r === wordId || knownIds.has(r)),
  );
  if (candidates.length === 0) return null;
  let best = candidates[0];
  for (const c of candidates) if (c.sentence.length < best.sentence.length) best = c;
  return { de: best.sentence, en: best.translation };
}
