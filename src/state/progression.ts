/**
 * Pure word-gating / progression math.
 *
 * Vocabulary is delivered in ordered SETS, grouped into BLOCKS of
 * `setsPerBlock` sets. The cycle is LEARN -> PRACTICE -> ADVANCE: a block
 * unlocks the next only when its sets are mastered AND its Practice session is
 * done. Cipher rounds + the crossword challenge join this gate once their
 * generators ship. STRICT eligibility holds everywhere: a puzzle never contains
 * an unmastered word.
 */
import { PROGRESSION } from './progressionConfig';
import type { PlayerState } from './types';
import type { VocabSet, VocabWord } from '../content/vocab';
import { wordById, ALL_WORDS } from '../content/vocab';
import { cipherRoundsForBlock } from '../content/cipherItems';
import { crosswordRoundsForBlock } from '../content/crosswords';
import { hurdleRoundsForBlock } from '../content/hurdleItems';

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

// Blocks
export function blockOf(setIndex: number): number {
  return Math.floor(setIndex / B);
}
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

// Coverage (cipher / grammar / challenge)
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
  return p.total === 0 || p.done >= p.total;
}
/** The crossword challenge (capstone) — kept for recap; not yet a gate. */
export function challengeReady(s: PlayerState, sets: VocabSet[], block: number): boolean {
  return (
    isBlockLearned(s, sets, block) &&
    cipherComplete(s, sets, block) &&
    grammarComplete(s, sets, block) &&
    !isChallengeDone(s, block)
  );
}
export function isBlockComplete(s: PlayerState, sets: VocabSet[], block: number): boolean {
  // LEARN -> PRACTICE -> ADVANCE: a block unlocks the next only when its sets
  // are mastered AND all three Practice games are done — the grammar drills
  // (blockPracticeDone), the cipher sentences covering its new words
  // (cipherSessionDone), and the crossword over the leftovers (crosswordSessionDone).
  return (
    isBlockLearned(s, sets, block) &&
    blockPracticeDone(s, block) &&
    cipherSessionDone(s, block) &&
    crosswordSessionDone(s, block) &&
    hurdleSessionDone(s, block)
  );
}

export function currentBlock(s: PlayerState, sets: VocabSet[]): number {
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) if (!isBlockComplete(s, sets, b)) return b;
  return blocks;
}
export function pendingChallenge(s: PlayerState, sets: VocabSet[]): number | null {
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) if (challengeReady(s, sets, b)) return b;
  return null;
}

// Availability / learning
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
export function wordsToStudy(s: PlayerState, sets: VocabSet[]): string[] {
  const idx = currentLearnSetIndex(s, sets);
  if (idx === null) return [];
  return sets[idx].words.filter((w) => !s.learnedWords.includes(w.id)).map((w) => w.id);
}

// Eligibility
export function isItemEligible(item: { requires: string[] }, s: PlayerState): boolean {
  return item.requires.every((id) => s.learnedWords.includes(id));
}
export function frontierSetIndex(s: PlayerState, sets: VocabSet[]): number {
  for (let k = sets.length - 1; k >= 0; k--) {
    if (sets[k].words.some((w) => s.learnedWords.includes(w.id))) return k;
  }
  return -1;
}
export function practiceBlock(s: PlayerState, sets: VocabSet[]): number {
  const f = frontierSetIndex(s, sets);
  return f < 0 ? 0 : blockOf(f);
}
export function isPracticeEligible(item: { requires: string[] }, s: PlayerState, sets: VocabSet[]): boolean {
  if (!isItemEligible(item, s)) return false;
  const bw = new Set(blockWords(sets, practiceBlock(s, sets)).map((w) => w.id));
  return item.requires.some((r) => bw.has(r));
}
export function grammarNounId(item: { requires: string[] }): string | undefined {
  return item.requires.find((r) => wordById(r)?.gender);
}
export function isGrammarPracticeEligible(item: { requires: string[] }, s: PlayerState, sets: VocabSet[]): boolean {
  if (!isItemEligible(item, s)) return false;
  const n = grammarNounId(item);
  if (!n) return false;
  const bn = new Set(blockNouns(sets, practiceBlock(s, sets)).map((w) => w.id));
  return bn.has(n);
}
export function isRecapEligible(item: { requires: string[] }, s: PlayerState): boolean {
  return isItemEligible(item, s);
}

// Per-block Practice gate
/** The nouns a block's grammar session drills: the block's own (learned) nouns,
 *  padded with the most-recently-learned nouns when the block has fewer than
 *  `n` (so noun-sparse blocks still get a real session). */
export function practiceNounsForBlock(s: PlayerState, sets: VocabSet[], block: number, n = 3): string[] {
  const learned = new Set(s.learnedWords);
  const target = blockNouns(sets, block).map((w) => w.id).filter((id) => learned.has(id));
  if (target.length >= n) return target;
  const have = new Set(target);
  const recent = ALL_WORDS
    .filter((w) => w.gender && learned.has(w.id) && !have.has(w.id))
    .sort((a, b) => b.order - a.order);
  for (const w of recent) {
    if (target.length >= n) break;
    target.push(w.id);
    have.add(w.id);
  }
  return target;
}
export function practiceCount(s: PlayerState, block: number): number {
  return (s.practiceCounts ?? {})[block] ?? 0;
}
export function blockPracticeDone(s: PlayerState, block: number): boolean {
  return practiceCount(s, block) >= PROGRESSION.practiceRounds;
}
/** Completed cipher Practice sentences for a block. */
export function cipherRoundCount(s: PlayerState, block: number): number {
  return (s.cipherCounts ?? {})[block] ?? 0;
}
/** The cipher half of the gate: all of the block's generated sentences solved. */
export function cipherSessionDone(s: PlayerState, block: number): boolean {
  const target = cipherRoundsForBlock(block);
  return target === 0 || cipherRoundCount(s, block) >= target;
}
/** Completed crossword Practice puzzles for a block (0 or 1). */
export function crosswordRoundCount(s: PlayerState, block: number): number {
  return (s.crosswordCounts ?? {})[block] ?? 0;
}
/** The crossword part of the gate: the block's leftover-words puzzle solved. */
export function crosswordSessionDone(s: PlayerState, block: number): boolean {
  const target = crosswordRoundsForBlock(block);
  return target === 0 || crosswordRoundCount(s, block) >= target;
}
/** Solved Hurdle Practice words for a block. */
export function hurdleRoundCount(s: PlayerState, block: number): number {
  return (s.hurdleCounts ?? {})[block] ?? 0;
}
/** The Hurdle part of the gate: all of the block's Hurdle words solved. */
export function hurdleSessionDone(s: PlayerState, block: number): boolean {
  const target = hurdleRoundsForBlock(block);
  return target === 0 || hurdleRoundCount(s, block) >= target;
}

// Daily recap
export function recapDue(s: PlayerState, sets: VocabSet[], now: number): boolean {
  if (masteredSetCount(s, sets) < 2) return false;
  return now - (s.lastRecapAt ?? now) >= PROGRESSION.recapIntervalMs;
}
export function recordRecapDone(s: PlayerState, now: number): PlayerState {
  return { ...s, lastRecapAt: now };
}
/** DEV: make the daily recap due immediately (for testing). */
export function forceRecapDue(s: PlayerState, now: number): PlayerState {
  return { ...s, lastRecapAt: now - PROGRESSION.recapIntervalMs - 1000 };
}

// Recording coverage
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
export function recordPracticeDrill(s: PlayerState, block: number): PlayerState {
  const cur = practiceCount(s, block);
  if (cur >= PROGRESSION.practiceRounds) return s;
  return { ...s, practiceCounts: { ...(s.practiceCounts ?? {}), [block]: cur + 1 } };
}
/** Count one solved cipher Practice sentence (capped at the block's target). */
export function recordCipherRound(s: PlayerState, block: number): PlayerState {
  const target = cipherRoundsForBlock(block);
  const cur = cipherRoundCount(s, block);
  if (target === 0 || cur >= target) return s;
  return { ...s, cipherCounts: { ...(s.cipherCounts ?? {}), [block]: cur + 1 } };
}
/** Count the block's solved crossword (capped at the block's target). */
export function recordCrosswordRound(s: PlayerState, block: number): PlayerState {
  const target = crosswordRoundsForBlock(block);
  const cur = crosswordRoundCount(s, block);
  if (target === 0 || cur >= target) return s;
  return { ...s, crosswordCounts: { ...(s.crosswordCounts ?? {}), [block]: cur + 1 } };
}
/** Count one solved Hurdle Practice word (capped at the block's target). */
export function recordHurdleRound(s: PlayerState, block: number): PlayerState {
  const target = hurdleRoundsForBlock(block);
  const cur = hurdleRoundCount(s, block);
  if (target === 0 || cur >= target) return s;
  return { ...s, hurdleCounts: { ...(s.hurdleCounts ?? {}), [block]: cur + 1 } };
}
export function recordChallengeDone(s: PlayerState, block: number): PlayerState {
  if (isChallengeDone(s, block)) return s;
  return { ...s, challengesDone: [...(s.challengesDone ?? []), block] };
}
