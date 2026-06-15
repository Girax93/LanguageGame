/**
 * Pure word-gating / progression math for the learn → play → unlock rhythm.
 *
 * Model:
 *  - Vocabulary is delivered in ordered SETS; there is ONE cumulative mastered
 *    pool (learnedWords) that grows over time.
 *  - STRICT gating: a cipher/grammar item is eligible only when EVERY word-id
 *    it requires is mastered. A puzzle never contains an unmastered word.
 *  - Loop: learn the current set → clear `gamesToAdvance` levels → the next
 *    set unlocks to learn → repeat. The pool (and therefore puzzle
 *    length/difficulty) grows each cycle.
 *  - SCOPING (Practice vs Recap): Practice draws only from the current +
 *    previous set (plus always-available filler/scaffold words) to keep focus
 *    on freshly-learned material; Recap draws from the whole learned pool.
 */
import { PROGRESSION } from './progressionConfig';
import type { PlayerState } from './types';
import type { VocabSet } from '../content/vocab';
import { isFiller } from '../content/vocab';

export function learnedSet(s: PlayerState): Set<string> {
  return new Set(s.learnedWords);
}

export function isWordLearned(s: PlayerState, wordId: string): boolean {
  return s.learnedWords.includes(wordId);
}

/** Record a LEARN answer; mastering happens at `masteryThreshold` correct. */
export function recordWordAnswer(
  s: PlayerState,
  wordId: string,
  correct: boolean,
): PlayerState {
  if (isWordLearned(s, wordId)) return s;
  const cur = s.wordProgress[wordId] ?? 0;
  const next = correct ? cur + 1 : 0;
  const wordProgress = { ...s.wordProgress, [wordId]: next };
  if (next >= PROGRESSION.masteryThreshold) {
    return { ...s, wordProgress, learnedWords: [...s.learnedWords, wordId] };
  }
  return { ...s, wordProgress };
}

export function isSetMastered(s: PlayerState, set: VocabSet): boolean {
  return set.words.every((w) => s.learnedWords.includes(w.id));
}

/** How many sets (in order) are fully mastered. */
export function masteredSetCount(s: PlayerState, sets: VocabSet[]): number {
  let n = 0;
  for (const set of sets) {
    if (isSetMastered(s, set)) n++;
    else break;
  }
  return n;
}

/**
 * How many sets are available to learn. Set 0 is always available; set k+1
 * opens once set k is mastered AND the player has cleared enough levels
 * (gamesToAdvance * (k+1) total).
 */
export function availableSetCount(s: PlayerState, sets: VocabSet[]): number {
  if (sets.length === 0) return 0;
  let available = 1;
  for (let i = 0; i < sets.length; i++) {
    const enoughWins = s.levelsWon >= PROGRESSION.gamesToAdvance * (i + 1);
    if (isSetMastered(s, sets[i]) && enoughWins) {
      available = Math.min(sets.length, i + 2);
    } else {
      break;
    }
  }
  return available;
}

/** The set the player should be learning now, or null if none (games phase). */
export function currentLearnSetIndex(s: PlayerState, sets: VocabSet[]): number | null {
  const available = availableSetCount(s, sets);
  for (let i = 0; i < available; i++) {
    if (!isSetMastered(s, sets[i])) return i;
  }
  return null;
}

/** Games unlock once at least one set is mastered. */
export function modesUnlocked(s: PlayerState, sets: VocabSet[]): boolean {
  return masteredSetCount(s, sets) >= 1;
}

/**
 * Progress toward unlocking the next set, or null when not in that phase
 * (still learning a set, or all sets mastered).
 */
export function gamesToNextSet(
  s: PlayerState,
  sets: VocabSet[],
): { cleared: number; needed: number } | null {
  if (currentLearnSetIndex(s, sets) !== null) return null;
  const ms = masteredSetCount(s, sets);
  if (ms >= sets.length) return null;
  const needed = PROGRESSION.gamesToAdvance;
  const base = PROGRESSION.gamesToAdvance * (ms - 1);
  const cleared = Math.max(0, Math.min(needed, s.levelsWon - base));
  return { cleared, needed };
}

/** STRICT eligibility: every required word must be mastered. */
export function isItemEligible(
  item: { requires: string[] },
  s: PlayerState,
): boolean {
  return item.requires.every((id) => s.learnedWords.includes(id));
}

/** Highest set index that contains any mastered word, or -1 if none yet. */
export function frontierSetIndex(s: PlayerState, sets: VocabSet[]): number {
  for (let k = sets.length - 1; k >= 0; k--) {
    if (sets[k].words.some((w) => s.learnedWords.includes(w.id))) return k;
  }
  return -1;
}

/**
 * The Practice word scope: ids in the current set + the immediately-previous
 * set (the two most-recently-reached sets). Filler/scaffold words are handled
 * separately (always allowed) and are NOT included here.
 */
export function practiceScopeIds(s: PlayerState, sets: VocabSet[]): Set<string> {
  const f = frontierSetIndex(s, sets);
  const ids = new Set<string>();
  for (const k of [f - 1, f]) {
    if (k >= 0 && k < sets.length) for (const w of sets[k].words) ids.add(w.id);
  }
  return ids;
}

/**
 * PRACTICE eligibility (narrow scope): every required word is mastered AND
 * every required NON-filler word belongs to the current or previous set.
 * Filler/scaffold words are always allowed once mastered. Keeps Practice on
 * freshly-learned material while still driving the games-to-advance gate.
 */
export function isPracticeEligible(
  item: { requires: string[] },
  s: PlayerState,
  sets: VocabSet[],
): boolean {
  if (!isItemEligible(item, s)) return false;
  const scope = practiceScopeIds(s, sets);
  return item.requires.every((id) => isFiller(id) || scope.has(id));
}

/**
 * RECAP eligibility (broad scope): the original strict gate — any mastered word
 * may appear, mixing old and new for spaced review. Same rule as
 * isItemEligible; named for clarity at the call sites.
 */
export function isRecapEligible(item: { requires: string[] }, s: PlayerState): boolean {
  return isItemEligible(item, s);
}

/** Word-ids the player is studying now: the current set's unmastered words. */
export function wordsToStudy(s: PlayerState, sets: VocabSet[]): string[] {
  const idx = currentLearnSetIndex(s, sets);
  if (idx === null) return [];
  return sets[idx].words.filter((w) => !s.learnedWords.includes(w.id)).map((w) => w.id);
}
