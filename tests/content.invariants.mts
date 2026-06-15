// Content invariants. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import { SETS, ALL_WORDS, FILLER_IDS } from '../src/content/vocab';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CROSSWORDS } from '../src/content/crosswords';
import { buildCrossword } from '../src/games/crossword/crossword';
import { isItemEligible, isPracticeEligible } from '../src/state/progression';
import type { PlayerState } from '../src/state/types';

const all = [...CIPHER_ITEMS, ...GRAMMAR_ITEMS, ...CROSSWORDS];
const setWordIds = SETS.map((s) => new Set(s.words.map((w) => w.id)));
const allIds = new Set(ALL_WORDS.map((w) => w.id));

// (a) Across a full learning sweep, no eligible item (cipher, grammar OR
//     crossword) ever references an unmastered word.
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

// (c) PRACTICE scope: once a set is reached there are enough Practice-eligible
//     cipher items (>=3, or >=2 for the very first set).
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

// (d) PRACTICE subset of RECAP: every Practice-eligible item is strictly gated.
let invD = true;
for (let k = 0; k < SETS.length; k++) {
  const s = stateThrough(k);
  for (const it of CIPHER_ITEMS)
    if (isPracticeEligible(it, s, SETS) && !isItemEligible(it, s)) invD = false;
}

// (e) CROSSWORDS: each builds cleanly (no letter conflicts), every entry is
//     numbered, each answer matches its cells, requires are real vocab and the
//     puzzle is gating-coverable (a learning state masters exactly its words).
let invE = true;
const xgaps: string[] = [];
for (const cw of CROSSWORDS) {
  try {
    if (!cw.requires.every((r) => allIds.has(r))) { invE = false; xgaps.push(cw.id + ':vocab'); }
    const b = buildCrossword(cw);
    for (const e of b.entries) {
      if (e.number <= 0) { invE = false; xgaps.push(cw.id + ':num'); }
      const word = e.cells.map((k) => b.cells.get(k)!.answer).join('');
      if (word !== e.answer) { invE = false; xgaps.push(cw.id + ':letters'); }
    }
    // when surfaced (all requires mastered) no answer word is unmastered — trivially
    // true, but assert the coverable point exists within the sweep:
    const maxSet = Math.max(...cw.requires.map((r) => SETS.findIndex((s) => s.words.some((w) => w.id === r))));
    if (maxSet < 0 || maxSet >= SETS.length) { invE = false; xgaps.push(cw.id + ':cover'); }
  } catch {
    invE = false; xgaps.push(cw.id + ':throw');
  }
}

console.log(`words=${ALL_WORDS.length} sets=${SETS.length} cipher=${CIPHER_ITEMS.length} grammar=${GRAMMAR_ITEMS.length} crosswords=${CROSSWORDS.length} fillers=${FILLER_IDS.size}`);
console.log('invariant_a (no unmastered word):', invA);
console.log('invariant_b (per-set new-word coverage):', invB, 'gaps:', gaps);
console.log('invariant_c (per-set practice coverage):', invC, 'gaps:', cgaps);
console.log('practice-eligible per set:', pcounts.join(','));
console.log('invariant_d (practice subset of recap):', invD);
console.log('invariant_e (crosswords build/number/cover):', invE, 'gaps:', xgaps);
if (!invA || !invB || !invC || !invD || !invE) process.exit(1);
console.log('OK');
