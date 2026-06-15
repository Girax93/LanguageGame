/**
 * Pure word-gating / progression math.
 *
 * BLOCK model: vocabulary is delivered in ordered SETS, grouped into BLOCKS of
 * `setsPerBlock` sets (2 sets = 10 words). To unlock the next block the player
 * must, for the current block:
 *   1. learn (master) both sets,
 *   2. use every block word in a solved Practice letter cipher,
 *   3. drill every block noun's article in a solved Practice grammar item,
 *   4. complete the block's crossword challenge (the capstone, unlocked once
 *      ciphers + grammar are done).
 * STRICT gating still holds everywhere: a puzzle never contains an unmastered
 * word. Practice draws from the whole learned pool but every Practice puzzle
 * features at least one current-block word, so the new words get used.
 */
import { PROGRESSION } from './progressionConfig';
import type { PlayerState } from './types';
import type { VocabSet, VocabWord } from '../content/vocab';
import { wordById } from '../content/vocab';

const B = PROGRESSION.setsPerBlock;

export function learnedSet(s: PlayerState): Set<string> {
  return new Set(s.learnedWords);
}
export function isWordLearned(s: PlayerState, wordId: string): boolean {
  return s.learnedWords.includes(wordId);
}

/** Record a LEARN answer; mastering happens at `masteryThreshold` correct. */
export function recordWordAnswer(s: PlayerState, wordId: string, correct: boolean): PlayerState {
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
export function masteredSetCount(s: PlayerState, sets: VocabSet[]): number {
  let n = 0;
  for (const set of sets) {
    if (isSetMastered(s, set)) n++;
    else break;
  }
  return n;
}

// ── Blocks ──────────────────────────────────────────────────────────────────
export function blockOf(setIndex: number): number {
  return Math.floor(setIndex / B);
}
/** Number of FULL blocks for the given set list. */
export function blockCount(sets: VocabSet[]): number {
  return Math.floor(sets.length / B);
}
export function blockSets(sets: VocabSet[], block: number): VocabSet[] {
  return sets.slice(block * B, block * B + B);
}
export function blockWords(sets: VocabSet[], block: number): VocabWord[] {
  return blockSets(sets, block).flatMap((s) => s.words);
}
export function blockNouns(sets: VocabSet[], block: number): VocabWord[] {
  return blockWords(sets, block).filter((w) => w.gender);
}
export function isBlockLearned(s: PlayerState, sets: VocabSet[], block: number): boolean {
  const bs = blockSets(sets, block);
  return bs.length === B && bs.every((set) => isSetMastered(s, set));
}

// ── Coverage (cipher / grammar / challenge) ─────────────────────────────────
export function cipherProgress(s: PlayerState, sets: VocabSet[], block: number): { done: number; total: number } {
  const cov = new Set(s.cipherWords ?? []);
  const w = blockWords(sets, block);
  return { done: w.filter((x) => cov.has(x.id)).length, total: w.length };
}
export function grammarProgress(s: PlayerState, sets: VocabSet[], block: number): { done: number; total: number } {
  const cov = new Set(s.grammarWords ?? []);
  const n = blockNouns(sets, block);
  return { done: n.filter((x) => cov.has(x.id)).length, total: n.length };
}
export function isChallengeDone(s: PlayerState, block: number): boolean {
  return (s.challengesDone ?? []).includes(block);
}
export function cipherComplete(s: PlayerState, sets: VocabSet[], block: number): boolean {
  const p = cipherProgress(s, sets, block);
  return p.done >= p.total;
}
export function grammarComplete(s: PlayerState, sets: VocabSet[], block: number): boolean {
  const p = grammarProgress(s, sets, block);
  return p.done >= p.total;
}
/** The crossword challenge is the capstone: available once both sets are learned
 *  and ciphers + grammar are fully covered, and it isn't already done. */
export function challengeReady(s: PlayerState, sets: VocabSet[], block: number): boolean {
  return (
    isBlockLearned(s, sets, block) &&
    cipherComplete(s, sets, block) &&
    grammarComplete(s, sets, block) &&
    !isChallengeDone(s, block)
  );
}
export function isBlockComplete(s: PlayerState, sets: VocabSet[], block: number): boolean {
  return (
    isBlockLearned(s, sets, block) &&
    cipherComplete(s, sets, block) &&
    grammarComplete(s, sets, block) &&
    isChallengeDone(s, block)
  );
}

/** The block the player is working on now (lowest incomplete full block), or
 *  blockCount when everything available is done. */
export function currentBlock(s: PlayerState, sets: VocabSet[]): number {
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) if (!isBlockComplete(s, sets, b)) return b;
  return blocks;
}
/** The block whose challenge crossword is ready to play (capstone), or null. */
export function pendingChallenge(s: PlayerState, sets: VocabSet[]): number | null {
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) if (challengeReady(s, sets, b)) return b;
  return null;
}

// ── Availability / learning ─────────────────────────────────────────────────
export function availableSetCount(s: PlayerState, sets: VocabSet[]): number {
  if (sets.length === 0) return 0;
  let completed = 0;
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) {
    if (isBlockComplete(s, sets, b)) completed++;
    else break;
  }
  return Math.min(sets.length, (completed + 1) * B);
}
export function currentLearnSetIndex(s: PlayerState, sets: VocabSet[]): number | null {
  const avail = availableSetCount(s, sets);
  for (let i = 0; i < avail; i++) if (!isSetMastered(s, sets[i])) return i;
  return null;
}
export function modesUnlocked(s: PlayerState, sets: VocabSet[]): boolean {
  return masteredSetCount(s, sets) >= 1;
}
/** Word-ids the player is studying now: the current set's unmastered words. */
export function wordsToStudy(s: PlayerState, sets: VocabSet[]): string[] {
  const idx = currentLearnSetIndex(s, sets);
  if (idx === null) return [];
  return sets[idx].words.filter((w) => !s.learnedWords.includes(w.id)).map((w) => w.id);
}

// ── Eligibility ─────────────────────────────────────────────────────────────
/** STRICT eligibility: every required word must be mastered. */
export function isItemEligible(item: { requires: string[] }, s: PlayerState): boolean {
  return item.requires.every((id) => s.learnedWords.includes(id));
}
export function frontierSetIndex(s: PlayerState, sets: VocabSet[]): number {
  for (let k = sets.length - 1; k >= 0; k--) {
    if (sets[k].words.some((w) => s.learnedWords.includes(w.id))) return k;
  }
  return -1;
}
/** The block the player is currently practising (from the frontier set). */
export function practiceBlock(s: PlayerState, sets: VocabSet[]): number {
  const f = frontierSetIndex(s, sets);
  return f < 0 ? 0 : blockOf(f);
}

/**
 * PRACTICE cipher eligibility: every required word mastered AND the sentence
 * features at least one current-block word, so practice exercises the new
 * vocabulary (older words may scaffold the rest).
 */
export function isPracticeEligible(item: { requires: string[] }, s: PlayerState, sets: VocabSet[]): boolean {
  if (!isItemEligible(item, s)) return false;
  const bw = new Set(blockWords(sets, practiceBlock(s, sets)).map((w) => w.id));
  return item.requires.some((r) => bw.has(r));
}

/** The noun a grammar item drills (its one gendered required word). */
export function grammarNounId(item: { requires: string[] }): string | undefined {
  return item.requires.find((r) => wordById(r)?.gender);
}
/** PRACTICE grammar eligibility: eligible AND it drills a current-block noun. */
export function isGrammarPracticeEligible(item: { requires: string[] }, s: PlayerState, sets: VocabSet[]): boolean {
  if (!isItemEligible(item, s)) return false;
  const n = grammarNounId(item);
  if (!n) return false;
  const bn = new Set(blockNouns(sets, practiceBlock(s, sets)).map((w) => w.id));
  return bn.has(n);
}

/** RECAP eligibility (broad): the original strict gate. */
export function isRecapEligible(item: { requires: string[] }, s: PlayerState): boolean {
  return isItemEligible(item, s);
}

// ── Recording coverage ──────────────────────────────────────────────────────
export function addCipherWords(s: PlayerState, ids: string[]): PlayerState {
  const cur = new Set(s.cipherWords ?? []);
  let changed = false;
  for (const id of ids) if (!cur.has(id)) { cur.add(id); changed = true; }
  return changed ? { ...s, cipherWords: [...cur] } : s;
}
export function addGrammarNoun(s: PlayerState, id: string | undefined): PlayerState {
  if (!id || (s.grammarWords ?? []).includes(id)) return s;
  return { ...s, grammarWords: [...(s.grammarWords ?? []), id] };
}
export function recordChallengeDone(s: PlayerState, block: number): PlayerState {
  if (isChallengeDone(s, block)) return s;
  return { ...s, challengesDone: [...(s.challengesDone ?? []), block] };
}
