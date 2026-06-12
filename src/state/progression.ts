/**
 * Pure word-gating / progression math. No React, no storage.
 *
 * Gating rule: cipher & grammar items are tagged with the pack they belong
 * to, and a pack's content only ever uses that pack's (or earlier) words.
 * An item is eligible once the player has fully LEARNED every pack up to and
 * including the item's pack — so known words always repeat before new load.
 */
import { PROGRESSION } from './progressionConfig';
import type { PlayerState } from './types';
import type { VocabPack } from '../content/vocab';

export function learnedSet(s: PlayerState): Set<string> {
  return new Set(s.learnedWords);
}

export function isWordLearned(s: PlayerState, wordId: string): boolean {
  return s.learnedWords.includes(wordId);
}

/**
 * Record a LEARN answer for a word. Correct increments the streak; reaching
 * `learnThreshold` marks the word learned. A wrong answer resets the streak.
 */
export function recordWordAnswer(
  s: PlayerState,
  wordId: string,
  correct: boolean,
): PlayerState {
  if (isWordLearned(s, wordId)) return s;
  const cur = s.wordProgress[wordId] ?? 0;
  const next = correct ? cur + 1 : 0;
  const wordProgress = { ...s.wordProgress, [wordId]: next };
  if (next >= PROGRESSION.learnThreshold) {
    return { ...s, wordProgress, learnedWords: [...s.learnedWords, wordId] };
  }
  return { ...s, wordProgress };
}

export function isPackLearned(s: PlayerState, pack: VocabPack): boolean {
  return pack.words.every((w) => s.learnedWords.includes(w.id));
}

/** How many packs (in order) the player has fully learned. */
export function completedPackCount(s: PlayerState, packs: VocabPack[]): number {
  let n = 0;
  for (const p of packs) {
    if (isPackLearned(s, p)) n++;
    else break;
  }
  return n;
}

/**
 * How many packs are currently available to LEARN. Pack 1 is always
 * available; pack k+1 opens once pack k is fully learned AND the player has
 * enough cipher/grammar wins (unlockWinsPerPack * k).
 */
export function availablePackCount(s: PlayerState, packs: VocabPack[]): number {
  if (packs.length === 0) return 0;
  let available = 1;
  for (let i = 0; i < packs.length; i++) {
    const packNum = i + 1;
    const enoughWins = s.levelsWon >= PROGRESSION.unlockWinsPerPack * packNum;
    if (isPackLearned(s, packs[i]) && enoughWins) {
      available = Math.min(packs.length, packNum + 1);
    } else {
      break;
    }
  }
  return available;
}

/** Cipher & grammar modes open once the first pack is fully learned. */
export function modesUnlocked(s: PlayerState, packs: VocabPack[]): boolean {
  return completedPackCount(s, packs) >= 1;
}

/** Is a pack-tagged item (cipher/grammar) currently playable? */
export function isItemEligible(
  item: { pack: number },
  s: PlayerState,
  packs: VocabPack[],
): boolean {
  return item.pack <= completedPackCount(s, packs);
}

/** Word ids the player should be studying now (available, not yet learned). */
export function wordsToStudy(s: PlayerState, packs: VocabPack[]): string[] {
  const count = availablePackCount(s, packs);
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    for (const w of packs[i].words) {
      if (!s.learnedWords.includes(w.id)) ids.push(w.id);
    }
  }
  return ids;
}
