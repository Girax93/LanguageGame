// Content invariants. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import { SETS, ALL_WORDS, FILLER_IDS } from '../src/content/vocab';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CROSSWORDS } from '../src/content/crosswords';
import { challengeCrossword, blockWordIds } from '../src/content/challenges';
import { buildCrossword } from '../src/games/crossword/crossword';
import {
  isItemEligible,
  isPracticeEligible,
  availableSetCount,
  pendingChallenge,
  challengeBlockCount,
} from '../src/state/progression';
import type { PlayerState } from '../src/state/types';

const all = [...CIPHER_ITEMS, ...GRAMMAR_ITEMS, ...CROSSWORDS];
const setWordIds = SETS.map((s) => new Set(s.words.map((w) => w.id)));
const allIds = new Set(ALL_WORDS.map((w) => w.id));

// (a) No eligible item ever references an unmastered word, across the sweep.
let invA = true;
const learned = new Set<string>();
for (const set of SETS) {
  for (const w of set.words) learned.add(w.id);
  for (const it of all)
    if (it.requires.every((r) => learned.has(r)) && it.requires.some((r) => !learned.has(r))) invA = false;
}

// (b) Every set, once learned, introduces >= 1 eligible sentence using a new word.
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

function stateThrough(k: number): PlayerState {
  const learnedWords = SETS.slice(0, k + 1).flatMap((s) => s.words.map((w) => w.id));
  return { learnedWords } as PlayerState;
}

// (c) PRACTICE scope: enough Practice-eligible cipher items per set.
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

// (d) PRACTICE subset of RECAP.
let invD = true;
for (let k = 0; k < SETS.length; k++) {
  const s = stateThrough(k);
  for (const it of CIPHER_ITEMS)
    if (isPracticeEligible(it, s, SETS) && !isItemEligible(it, s)) invD = false;
}

// (e) Curated crosswords build cleanly, numbered, gating-coverable.
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
  } catch { invE = false; xgaps.push(cw.id + ':throw'); }
}

// (f) CHALLENGE crosswords: each block's generated crossword uses EVERY word in
//     the block, builds with consistent intersections, and every entry numbered.
let invF = true;
const fgaps: string[] = [];
const xinfo: string[] = [];
const blocks = challengeBlockCount(SETS);
for (let bk = 0; bk < blocks; bk++) {
  try {
    const ids = blockWordIds(bk);
    const cw = challengeCrossword(bk);
    const used = new Set(cw.entries.map((e) => e.wordId));
    if (cw.entries.length !== ids.length) { invF = false; fgaps.push(`b${bk}:count`); }
    if (ids.some((id) => !used.has(id))) { invF = false; fgaps.push(`b${bk}:missing`); }
    if (cw.requires.length !== ids.length) { invF = false; fgaps.push(`b${bk}:req`); }
    const b = buildCrossword(cw);
    for (const e of b.entries) {
      if (e.number <= 0) { invF = false; fgaps.push(`b${bk}:num`); }
      const word = e.cells.map((k) => b.cells.get(k)!.answer).join('');
      if (word !== e.answer) { invF = false; fgaps.push(`b${bk}:letters`); }
    }
    xinfo.push(`b${bk}=${cw.rows}x${cw.cols}/${cw.entries.length}w`);
  } catch { invF = false; fgaps.push(`b${bk}:throw`); }
}

// (g) CHALLENGE gate: a 4-set block boundary stays closed until its challenge
//     is cleared; clearing it opens the next set; pendingChallenge tracks it.
function gState(learnedSets: number, levelsWon: number, challengesDone: number[]): PlayerState {
  const learnedWords = SETS.slice(0, learnedSets).flatMap((s) => s.words.map((w) => w.id));
  return { learnedWords, levelsWon, challengesDone } as PlayerState;
}
let invG = true;
const a1 = gState(4, 8, []);
if (availableSetCount(a1, SETS) !== 4 || pendingChallenge(a1, SETS) !== 0) invG = false;
const a2 = gState(4, 8, [0]);
if (availableSetCount(a2, SETS) !== 5 || pendingChallenge(a2, SETS) !== null) invG = false;
const a3 = gState(8, 100, [0]);
if (availableSetCount(a3, SETS) !== 8 || pendingChallenge(a3, SETS) !== 1) invG = false;

console.log(`words=${ALL_WORDS.length} sets=${SETS.length} cipher=${CIPHER_ITEMS.length} grammar=${GRAMMAR_ITEMS.length} crosswords=${CROSSWORDS.length} fillers=${FILLER_IDS.size} blocks=${blocks}`);
console.log('invariant_a (no unmastered word):', invA);
console.log('invariant_b (per-set new-word coverage):', invB, 'gaps:', gaps);
console.log('invariant_c (per-set practice coverage):', invC, 'gaps:', cgaps);
console.log('practice-eligible per set:', pcounts.join(','));
console.log('invariant_d (practice subset of recap):', invD);
console.log('invariant_e (curated crosswords):', invE, 'gaps:', xgaps);
console.log('invariant_f (challenge crosswords use all words):', invF, 'gaps:', fgaps);
console.log('  challenge sizes:', xinfo.join(' '));
console.log('invariant_g (challenge gate blocks/opens):', invG);
if (!invA || !invB || !invC || !invD || !invE || !invF || !invG) process.exit(1);
console.log('OK');
