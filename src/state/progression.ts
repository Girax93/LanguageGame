/**
 * Pure word-gating / progression math for the learn → play → unlock rhythm.
 *
 * Model:
 *  - Vocabulary is delivered in ordered SETS; there is ONE cumulative mastered
 *    pool (learnedWords) that grows over time.
 *  - STRICT gating: a cipher/grammar item is eligible only when EVERY word-id
 *    it requires is mastered. A puzzle never contains an unmastered word.
 *  - Loop: learn the current set -> clear `gamesToAdvance` levels -> the next
 *    set unlocks to learn -> repeat. The pool (and therefore puzzle
 *    length/difficulty) grows each cycle.
 *  - CHALLENGE GATE: after every `setsPerChallenge` sets (a "block"), the player
 *    must clear a challenge crossword built from ALL the block's words before
 *    the next block opens to learn.
 *  - SCOPING (Practice vs Recap): Practice draws only from the current +
 *    previous set (plus always-available filler/scaffold words); Recap draws
 *    from the whole learned pool.
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

// ── Challenge blocks ────────────────────────────────────────────────────────

/** The challenge block a set belongs to (sets are grouped in fours). */
export function challengeBlockOf(setIndex: number): number {
  return Math.floor(setIndex / PROGRESSION.setsPerChallenge);
}

/** How many FULL challenge blocks exist for the given set list. */
export function challengeBlockCount(sets: VocabSet[]): number {
  return Math.floor(sets.length / PROGRESSION.setsPerChallenge);
}

export function isChallengeDone(s: PlayerState, block: number): boolean {
  return (s.challengesDone ?? []).includes(block);
}

/**
 * The block whose sets are all mastered but whose challenge crossword has not
 * yet been cleared — the challenge the player must complete now, or null.
 */
export function pendingChallenge(s: PlayerState, sets: VocabSet[]): number | null {
  const blocks = challengeBlockCount(sets);
  for (let b = 0; b < blocks; b++) {
    const lo = b * PROGRESSION.setsPerChallenge;
    const blockSets = sets.slice(lo, lo + PROGRESSION.setsPerChallenge);
    const allMastered = blockSets.length > 0 && blockSets.every((st) => isSetMastered(s, st));
    if (allMastered && !isChallengeDone(s, b)) return b;
  }
  return null;
}

/** Mark a challenge block cleared (idempotent). */
export function recordChallengeDone(s: PlayerState, block: number): PlayerState {
  if (isChallengeDone(s, block)) return s;
  return { ...s, challengesDone: [...(s.challengesDone ?? []), block] };
}

/**
 * How many sets are available to learn. Set 0 is always available; set k+1
 * opens once set k is mastered AND the player has cleared enough levels
 * (gamesToAdvance * (k+1) total) AND — when k+1 crosses into a new challenge
 * block — that block's challenge crossword has been cleared.
 */
export function availableSetCount(s: PlayerState, sets: VocabSet[]): number {
  if (sets.length === 0) return 0;
  let available = 1;
  for (let i = 0; i < sets.length; i++) {
    const enoughWins = s.levelsWon >= PROGRESSION.gamesToAdvance * (i + 1);
    const crossesBlock = (i + 1) % PROGRESSION.setsPerChallenge === 0;
    const challengeOk = !crossesBlock || isChallengeDone(s, challengeBlockOf(i));
    if (isSetMastered(s, sets[i]) && enoughWins && challengeOk) {
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
 * RECAP eligibility (broad scope): the original strict gate. Same rule as
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
