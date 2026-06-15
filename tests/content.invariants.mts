// Content invariants. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import { SETS, ALL_WORDS, FILLER_IDS } from '../src/content/vocab';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { isItemEligible, isPracticeEligible } from '../src/state/progression';
import type { PlayerState } from '../src/state/types';

const all = [...CIPHER_ITEMS, ...GRAMMAR_ITEMS];
const setWordIds = SETS.map((s) => new Set(s.words.map((w) => w.id)));

// (a) Across a full learning sweep, no eligible item ever references an
//     unmastered word.
let invA = true;
const learned = new Set<string>();
for (const set of SETS) {
  for (const w of set.words) learned.add(w.id);
  for (const it of all)
    if (it.requires.every((r) => learned.has(r)) && it.requires.some((r) => !learned.has(r))) invA = false;
}

// (b) Every set, once learned, introduces >= 1 eligible sentence using one of
//     that set's new words.
let invB = true;
const gaps: number[] = [];
const acc = new Set<string>();
for (let k = 0; k < SETS.length; k++) {
  for (const w of SETS[k].words) acc.add(w.id);
  const here = CIPHER_ITEMS.filter(
    (i) => i.requires.every((r) => acc.has(r)) && i.requires.some((r) => setWordIds[k].has(r)),
  );
  if (here.length === 0) { invB = false; gaps.push(k); }
}

// A player state with sets 0..k fully mastered.
function stateThrough(k: number): PlayerState {
  const learnedWords = SETS.slice(0, k + 1).flatMap((s) => s.words.map((w) => w.id));
  return { learnedWords } as PlayerState;
}

// (c) PRACTICE scope: once a set is reached (sets 0..k mastered) there are
//     enough Practice-eligible cipher items (>=3, or >=2 for the very first
//     set, which only has 5 words total).
let invC = true;
const cgaps: number[] = [];
const pcounts: number[] = [];
for (let k = 0; k < SETS.length; k++) {
  const s = stateThrough(k);
  const pe = CIPHER_ITEMS.filter((i) => isPracticeEligible(i, s, SETS));
  pcounts.push(pe.length);
  const min = k === 0 ? 2 : 3;
  if (pe.length < min) { invC = false; cgaps.push(k); }
}

// (d) PRACTICE ⊆ RECAP: every Practice-eligible item is also strictly gated
//     (Recap-eligible), so the no-unmastered-word invariant holds for the
//     narrow scope too.
let invD = true;
for (let k = 0; k < SETS.length; k++) {
  const s = stateThrough(k);
  for (const it of CIPHER_ITEMS)
    if (isPracticeEligible(it, s, SETS) && !isItemEligible(it, s)) invD = false;
}

console.log(`words=${ALL_WORDS.length} sets=${SETS.length} cipher=${CIPHER_ITEMS.length} grammar=${GRAMMAR_ITEMS.length} fillers=${FILLER_IDS.size}`);
console.log('invariant_a (no unmastered word):', invA);
console.log('invariant_b (per-set new-word coverage):', invB, 'gaps:', gaps);
console.log('invariant_c (per-set practice coverage):', invC, 'gaps:', cgaps);
console.log('practice-eligible per set:', pcounts.join(','));
console.log('invariant_d (practice subset of recap):', invD);
if (!invA || !invB || !invC || !invD) process.exit(1);
console.log('OK');
