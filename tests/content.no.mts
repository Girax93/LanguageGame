// Norwegian content + progression invariants. Mirrors content.invariants.mts but
// switches the active language to Norwegian first. Run:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.no.mts
import { setActiveContentLanguage, getActiveCode } from '../src/content/lang/registry';
setActiveContentLanguage('no');

import {
  SETS, ALL_WORDS, wordById, setIndexForWord,
  germanWithArticle, englishWithArticle, answerMatches,
} from '../src/content/vocab';
import { LEMMAS_NO } from '../src/content/lang/no/lemmas.no';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CIPHER_ITEMS, cipherItemsForBlock, cipherRoundsForBlock } from '../src/content/cipherItems';
import { CROSSWORDS, crosswordWordsForBlock, crosswordItemsForBlock, crosswordRoundsForBlock } from '../src/content/crosswords';
import { buildCrossword } from '../src/games/crossword/crossword';
import { HURDLE_ITEMS, hurdleItemsForBlock, hurdleRoundsForBlock, isHurdleWord } from '../src/content/hurdleItems';
import { triesFor, scoreGuess, isSolved, answerLength, keyHints } from '../src/games/hurdle/hurdle';
import {
  isItemEligible, isSetMastered, isBlockComplete, currentBlock, blockCount, blockNouns,
  availableSetCount, masteredSetCount, practiceNounsForBlock,
  blockPracticeDone, recordPracticeDrill, cipherSessionDone, recordCipherRound,
  crosswordSessionDone, recordCrosswordRound, hurdleSessionDone, recordHurdleRound,
  recapDue, recordRecapDone,
} from '../src/state/progression';
import { PROGRESSION } from '../src/state/progressionConfig';
import type { PlayerState } from '../src/state/types';

function st(p: Partial<PlayerState>): PlayerState {
  return { learnedWords: [], wordProgress: {}, cipherWords: [], grammarWords: [], practiceCounts: {}, cipherCounts: {}, crosswordCounts: {}, hurdleCounts: {}, challengesDone: [], lastRecapAt: 0, levelsWon: 0, ...p } as PlayerState;
}
function learnedThrough(setIdx: number): string[] {
  return SETS.slice(0, setIdx + 1).flatMap((s) => s.words.map((w) => w.id));
}
let ok = true;
const fail = (label: string, detail: unknown = '') => { ok = false; console.log('FAIL', label, detail); };

if (getActiveCode() !== 'no') fail('active-not-no', getActiveCode());
if (ALL_WORDS !== LEMMAS_NO) fail('all-words-not-no');

// (a) dataset shape
{
  const ids = new Set<string>(); let dupes = 0;
  for (const w of LEMMAS_NO) { if (ids.has(w.id)) dupes++; ids.add(w.id); }
  if (dupes) fail('a:dup-ids', dupes);
  const orders = LEMMAS_NO.map((w) => w.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) if (orders[i] !== i + 1) { fail('a:order-gap', `${orders[i]}!=${i+1}`); break; }
  for (const w of LEMMAS_NO) { if (!w.id || !w.de || !w.en) fail('a:empty', w.id); if (w.de !== w.de.toLowerCase()) fail('a:not-lowercase', w.de); }
}
// (b) gender hygiene: every noun has a gender; gender only on nouns.
{
  const PLURAL_ONLY = new Set(['penger', 'foreldre', 'briller', 'klær', 'søsken', 'omgivelser', 'møbler', 'grønnsaker', 'folk']);
  for (const w of LEMMAS_NO) {
    if (w.gender && w.pos !== 'noun') fail('b:gender-nonnoun', w.id);
    if (w.pos === 'noun' && !w.gender && !PLURAL_ONLY.has(w.de)) fail('b:noun-no-gender', w.de);
    if (w.gender && !['m', 'f', 'n'].includes(w.gender)) fail('b:bad-gender', `${w.id}:${w.gender}`);
  }
}
// (c) sets + lookups
{
  const flat = SETS.flatMap((s) => s.words);
  if (flat.length !== LEMMAS_NO.length) fail('c:set-count');
  const w = LEMMAS_NO[20];
  if (wordById(w.id) !== w) fail('c:wordById');
  if (setIndexForWord(w.id) < 0) fail('c:setIndex');
}
// (d) grammar drills: en/ei/et by gender
{
  const nouns = LEMMAS_NO.filter((w) => w.pos === 'noun' && w.gender);
  if (GRAMMAR_ITEMS.length !== nouns.length) fail('d:grammar-count', `${GRAMMAR_ITEMS.length}!=${nouns.length}`);
  for (const g of GRAMMAR_ITEMS) {
    const noun = wordById(g.requires[0]);
    if (!noun || !noun.gender) { fail('d:noun-missing', g.id); continue; }
    const expected = noun.gender === 'm' ? 'en' : noun.gender === 'f' ? 'ei' : 'et';
    if (g.ending !== expected) fail('d:ending', `${g.id}:${g.ending}!=${expected}`);
    if (g.translation !== `a ${noun.en}`) fail('d:translation', g.id);
  }
}
// (e) cipher: 1..4 sentences/block, eligible requires, >=1 coverage, avg healthy
{
  if (CIPHER_ITEMS.length === 0) fail('e:cipher-empty');
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS_NO.length / BS);
  let totalCov = 0;
  for (let b = 0; b < nb; b++) {
    const learnedThru = new Set(LEMMAS_NO.slice(0, (b + 1) * BS).map((w) => w.id));
    const items = cipherItemsForBlock(b);
    if (items.length !== cipherRoundsForBlock(b)) fail('e:round-count', b);
    if (items.length < 1 || items.length > 4) fail('e:round-bounds', `${b}:${items.length}`);
    const cov = new Set<string>();
    for (const it of items) {
      if (!it.sentence || !it.translation || it.requires.length === 0) fail('e:shape', it.id);
      for (const r of it.requires) {
        if (!wordById(r)) fail('e:bad-require', `${b}:${r}`);
        if (!learnedThru.has(r)) fail('e:uneligible', `${b}:${r}`);
        cov.add(r);
      }
    }
    const target = LEMMAS_NO.slice(b * BS, b * BS + BS);
    const covered = target.filter((w) => cov.has(w.id)).length;
    if (covered < 1) fail('e:zero-coverage', b);
    totalCov += covered;
  }
  console.log(`cipher avg coverage = ${(totalCov / nb).toFixed(2)}/10`);
  if (totalCov / nb < 4) fail('e:avg-coverage', (totalCov / nb).toFixed(2));
}
// (g) LEARN -> PRACTICE -> ADVANCE gating on block 0
{
  const B = PROGRESSION.setsPerBlock;
  let s = st({ learnedWords: learnedThrough(B - 1) });
  for (let i = 0; i < B; i++) if (!isSetMastered(s, SETS[i])) fail('g:set-not-mastered', i);
  if (isBlockComplete(s, SETS, 0)) fail('g:complete-without-practice');
  if (currentBlock(s, SETS) !== 0) fail('g:block-before');
  if (practiceNounsForBlock(s, SETS, 0).length === 0) fail('g:empty-session');
  for (let k = 0; k < PROGRESSION.practiceRounds; k++) s = recordPracticeDrill(s, 0);
  if (!blockPracticeDone(s, 0)) fail('g:grammar-flag');
  for (let k = 0; k < cipherRoundsForBlock(0); k++) s = recordCipherRound(s, 0);
  if (!cipherSessionDone(s, 0)) fail('g:cipher-flag');
  for (let k = 0; k < crosswordRoundsForBlock(0); k++) s = recordCrosswordRound(s, 0);
  if (!crosswordSessionDone(s, 0)) fail('g:crossword-flag');
  for (let k = 0; k < hurdleRoundsForBlock(0); k++) s = recordHurdleRound(s, 0);
  if (!hurdleSessionDone(s, 0)) fail('g:hurdle-flag');
  if (!isBlockComplete(s, SETS, 0)) fail('g:incomplete-after-practice');
  if (currentBlock(s, SETS) !== 1) fail('g:block-after', currentBlock(s, SETS));
}
// (h) display helpers: "en mann" / "a man"
{
  const noun = LEMMAS_NO.find((w) => w.gender === 'm')!;
  const art = noun.gender === 'm' ? 'en' : noun.gender === 'f' ? 'ei' : 'et';
  if (germanWithArticle(noun) !== `${art} ${noun.de}`) fail('h:withArticle', germanWithArticle(noun));
  if (englishWithArticle(noun) !== `a ${noun.en}`) fail('h:en', englishWithArticle(noun));
  if (!answerMatches(`a ${noun.en}`, noun.en)) fail('h:match');
  const f = LEMMAS_NO.find((w) => w.gender === 'f');
  if (f && germanWithArticle(f) !== `ei ${f.de}`) fail('h:fem', germanWithArticle(f));
}
// (i) article trio en/ei/et present
{
  const arts = LEMMAS_NO.filter((w) => w.pos === 'art');
  for (const a of ['en', 'ei', 'et']) if (!arts.find((x) => x.de === a)) fail('i:missing-article', a);
}
// (k) crosswords: each existing puzzle is ONE connected component of >=2 words
{
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS_NO.length / BS);
  let built = 0;
  for (let b = 0; b < nb; b++) {
    const item = crosswordItemsForBlock(b);
    if (crosswordRoundsForBlock(b) !== (item ? 1 : 0)) fail('k:round-count', b);
    if (!item) continue;
    built++;
    if (item.entries.length < 2) fail('k:too-few', `${b}:${item.entries.length}`);
    const pool = new Set(crosswordWordsForBlock(b));
    const learnedThru = new Set(LEMMAS_NO.slice(0, (b + 1) * BS).map((w) => w.id));
    for (const e of item.entries) {
      if (!learnedThru.has(e.wordId)) fail('k:uneligible', `${b}:${e.wordId}`);
      if (!pool.has(e.wordId)) fail('k:not-in-pool', `${b}:${e.wordId}`);
    }
    const cells = buildCrossword(item).cells;
    const start = cells.keys().next().value as string | undefined;
    if (start) {
      const reach = new Set([start]); const stack = [start];
      while (stack.length) {
        const cur = stack.pop()!; const [r, c] = cur.split(',').map(Number);
        for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]] as const) {
          const k2 = `${r+dr},${c+dc}`;
          if (cells.has(k2) && !reach.has(k2)) { reach.add(k2); stack.push(k2); }
        }
      }
      if (reach.size !== cells.size) fail('k:not-connected', `${b}:${reach.size}/${cells.size}`);
    }
  }
  console.log(`crosswords built = ${built}`);
}
// (m) hurdle scoring + coverage (cipher+crossword+hurdle cover every spellable block word)
{
  if (triesFor('ab') !== 5 || triesFor('hallo') !== 8) fail('m:tries');
  if (answerLength('GRØNN') !== 5) fail('m:len-oe');
  const eq = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  if (!eq(scoreGuess('MANN', 'MANN'), ['correct','correct','correct','correct'])) fail('m:score');
  if (!isSolved('HUS', 'HUS')) fail('m:solved');
  if (HURDLE_ITEMS.length === 0) fail('m:pool-empty');
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS_NO.length / BS);
  let totalH = 0;
  for (let b = 0; b < nb; b++) {
    const items = hurdleItemsForBlock(b);
    if (items.length !== hurdleRoundsForBlock(b)) fail('m:round-count', b);
    totalH += items.length;
    const blockIds = new Set(LEMMAS_NO.slice(b * BS, b * BS + BS).map((w) => w.id));
    const xitem = crosswordItemsForBlock(b);
    const placed = new Set(xitem ? xitem.entries.map((e) => e.wordId) : []);
    const cipherCov = new Set<string>();
    for (const it of cipherItemsForBlock(b)) for (const r of it.requires) if (blockIds.has(r)) cipherCov.add(r);
    const hset = new Set(items.map((it) => it.wordId));
    for (const id of blockIds) {
      const w = wordById(id)!;
      if (!isHurdleWord(w)) continue;
      if (!cipherCov.has(id) && !placed.has(id) && !hset.has(id)) fail('m:uncovered', `${b}:${id}=${w.de}`);
    }
  }
  console.log(`hurdle words total = ${totalH}`);
}
// switch back to German and confirm the live bindings flip back
setActiveContentLanguage('de');
if (ALL_WORDS.length !== 2000) fail('switch-back:de-not-2000', ALL_WORDS.length);
setActiveContentLanguage('no');

console.log(`\nNO: lemmas=${LEMMAS_NO.length} sets=${SETS.length} blocks=${blockCount(SETS)} grammar=${GRAMMAR_ITEMS.length} crosswords=${CROSSWORDS.length} hurdlePool=${HURDLE_ITEMS.length}`);
if (!ok) { console.log('\nNORWEGIAN INVARIANTS FAILED'); process.exit(1); }
console.log('OK — Norwegian invariants pass');
