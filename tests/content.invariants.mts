// Content + progression invariants. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import {
  SETS, ALL_WORDS, englishWithArticle, germanWithArticle, answerMatches, articleFor,
} from '../src/content/vocab';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CROSSWORDS } from '../src/content/crosswords';
import { CLUES, clueFor } from '../src/content/clues';
import { challengeCrossword, blockWordIds } from '../src/content/challenges';
import { buildCrossword } from '../src/games/crossword/crossword';
import {
  isItemEligible, isPracticeEligible, isGrammarPracticeEligible, grammarNounId,
  availableSetCount, currentBlock, blockCount, blockWords, blockNouns,
  challengeReady, isBlockComplete, pendingChallenge,
  addCipherWords, addGrammarNoun, recordChallengeDone,
} from '../src/state/progression';
import type { PlayerState } from '../src/state/types';

const allItems = [...CIPHER_ITEMS, ...GRAMMAR_ITEMS, ...CROSSWORDS];
const blocks = blockCount(SETS);
function learnedThrough(set: number): string[] {
  return SETS.slice(0, set + 1).flatMap((s) => s.words.map((w) => w.id));
}
function st(p: Partial<PlayerState>): PlayerState {
  return { learnedWords: [], wordProgress: {}, cipherWords: [], grammarWords: [], challengesDone: [], levelsWon: 0, ...p } as PlayerState;
}

// (a) No eligible item ever references an unmastered word, across the sweep.
let invA = true;
const acc = new Set<string>();
for (const set of SETS) {
  for (const w of set.words) acc.add(w.id);
  for (const it of allItems)
    if (it.requires.every((r) => acc.has(r)) && it.requires.some((r) => !acc.has(r))) invA = false;
}

// (b) CIPHER coverage: once a block's sets are mastered, every block word
//     appears in some eligible cipher (so cipher-coverage is completable).
let invB = true;
const bgaps: string[] = [];
for (let b = 0; b < blocks; b++) {
  const s = st({ learnedWords: learnedThrough(b * 2 + 1) });
  const cov = new Set<string>();
  for (const c of CIPHER_ITEMS) if (isItemEligible(c, s)) for (const r of c.requires) cov.add(r);
  for (const w of blockWords(SETS, b)) if (!cov.has(w.id)) { invB = false; bgaps.push(`b${b}:${w.de}`); }
}

// (c) GRAMMAR coverage: every block noun has an eligible grammar drill.
let invC = true;
const cgaps: string[] = [];
for (let b = 0; b < blocks; b++) {
  const s = st({ learnedWords: learnedThrough(b * 2 + 1) });
  const learnedSet = new Set(s.learnedWords);
  const drill = new Set<string>();
  for (const g of GRAMMAR_ITEMS) if (g.requires.every((r) => learnedSet.has(r))) { const n = grammarNounId(g); if (n) drill.add(n); }
  for (const n of blockNouns(SETS, b)) if (!drill.has(n.id)) { invC = false; cgaps.push(`b${b}:${n.de}`); }
}

// (d) Practice eligibility shape: a Practice cipher is gated AND features a
//     block word; a Practice grammar drills a current-block noun.
let invD = true;
for (let b = 0; b < blocks; b++) {
  const s = st({ learnedWords: learnedThrough(b * 2 + 1) });
  const bw = new Set(blockWords(SETS, b).map((w) => w.id));
  const bn = new Set(blockNouns(SETS, b).map((w) => w.id));
  for (const c of CIPHER_ITEMS)
    if (isPracticeEligible(c, s, SETS) && (!isItemEligible(c, s) || !c.requires.some((r) => bw.has(r)))) invD = false;
  for (const g of GRAMMAR_ITEMS)
    if (isGrammarPracticeEligible(g, s, SETS)) { const n = grammarNounId(g); if (!n || !bn.has(n)) invD = false; }
}

// (e) BLOCK GATING: learn -> cover ciphers+grammar -> challenge -> next unlocks.
let invE = true;
{
  let s = st({ learnedWords: learnedThrough(1) }); // sets 0,1 mastered
  if (availableSetCount(s, SETS) !== 2) invE = false;
  if (currentBlock(s, SETS) !== 0) invE = false;
  if (pendingChallenge(s, SETS) !== null) invE = false; // ciphers/grammar not done
  s = addCipherWords(s, blockWords(SETS, 0).map((w) => w.id));
  for (const n of blockNouns(SETS, 0)) s = addGrammarNoun(s, n.id);
  if (!challengeReady(s, SETS, 0)) invE = false; // capstone now ready
  if (pendingChallenge(s, SETS) !== 0) invE = false;
  if (availableSetCount(s, SETS) !== 2) invE = false; // still gated until challenge done
  s = recordChallengeDone(s, 0);
  if (!isBlockComplete(s, SETS, 0)) invE = false;
  if (availableSetCount(s, SETS) !== 4) invE = false; // block 1 unlocked
  if (currentBlock(s, SETS) !== 1) invE = false;
}

// (f) CHALLENGE crosswords: each block's crossword uses all 10 block words, builds & numbers.
let invF = true;
const fgaps: string[] = [];
const xsizes: string[] = [];
for (let b = 0; b < blocks; b++) {
  try {
    const ids = blockWordIds(b);
    const cw = challengeCrossword(b);
    const used = new Set(cw.entries.map((e) => e.wordId));
    if (cw.entries.length !== ids.length || ids.some((i) => !used.has(i))) { invF = false; fgaps.push(`b${b}:words`); }
    const built = buildCrossword(cw);
    for (const e of built.entries) {
      if (e.number <= 0) { invF = false; fgaps.push(`b${b}:num`); }
      if (e.cells.map((k) => built.cells.get(k)!.answer).join('') !== e.answer) { invF = false; fgaps.push(`b${b}:letters`); }
    }
    xsizes.push(`${cw.rows}x${cw.cols}`);
  } catch { invF = false; fgaps.push(`b${b}:throw`); }
}

// (g) curated recap crosswords still valid.
let invG = true;
for (const cw of CROSSWORDS) {
  try {
    const b = buildCrossword(cw);
    for (const e of b.entries) {
      if (e.number <= 0) invG = false;
      if (e.cells.map((k) => b.cells.get(k)!.answer).join('') !== e.answer) invG = false;
    }
  } catch { invG = false; }
}

// (h) article translations compose to "the <noun>".
let invH = true;
for (const w of ALL_WORDS) {
  if (w.gender) {
    if (englishWithArticle(w) !== `the ${w.en}` || germanWithArticle(w) !== `${articleFor(w.gender)} ${w.de}` || !answerMatches(`the ${w.en}`, w.en)) invH = false;
  } else if (englishWithArticle(w) !== w.en) invH = false;
}

// (i) CLUES: every vocab word has a non-empty German + English clue, and the
//     toggle returns the right language.
let invI = true;
const igaps: string[] = [];
for (const w of ALL_WORDS) {
  const c = CLUES[w.id];
  if (!c || !c.de || !c.en) { invI = false; igaps.push(w.id); continue; }
  if (clueFor(w.id, 'de') !== c.de || clueFor(w.id, 'en') !== c.en) { invI = false; igaps.push(w.id + ':lang'); }
}

console.log(`words=${ALL_WORDS.length} sets=${SETS.length} blocks=${blocks} cipher=${CIPHER_ITEMS.length} grammar=${GRAMMAR_ITEMS.length} crosswords=${CROSSWORDS.length}`);
console.log('a no-unmastered-word:', invA);
console.log('b cipher coverage/block:', invB, bgaps.slice(0, 6));
console.log('c grammar coverage/block:', invC, cgaps.slice(0, 6));
console.log('d practice eligibility shape:', invD);
console.log('e block gating chain:', invE);
console.log('f challenge crosswords (10 words):', invF, fgaps.slice(0, 6), 'sizes', xsizes.join(','));
console.log('g curated crosswords:', invG);
console.log('h article translations:', invH);
console.log('i crossword clues (de+en per word):', invI, igaps.slice(0,5));
if (!invA || !invB || !invC || !invD || !invE || !invF || !invG || !invH || !invI) process.exit(1);
console.log('OK');
