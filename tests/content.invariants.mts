// Content + progression invariants for the 2000-lemma curriculum. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import {
  SETS, ALL_WORDS, wordById, setIndexForWord,
  germanWithArticle, englishWithArticle, articleFor, answerMatches,
} from '../src/content/vocab';
import { LEMMAS, type Pos } from '../src/content/lemmas';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CIPHER_ITEMS, cipherItemsForBlock, cipherRoundsForBlock } from '../src/content/cipherItems';
import { CROSSWORDS, crosswordWordsForBlock, crosswordItemsForBlock, crosswordRoundsForBlock } from '../src/content/crosswords';
import { buildCrossword } from '../src/games/crossword/crossword';
import { CLUES } from '../src/content/clues';
import { HURDLE_ITEMS, hurdleItemsForBlock, hurdleRoundsForBlock, isHurdleWord, HURDLE_MAX_ROUNDS } from '../src/content/hurdleItems';
import { triesFor, scoreGuess, isSolved, answerLength, keyHints } from '../src/games/hurdle/hurdle';
import {
  isItemEligible, isRecapEligible, grammarNounId,
  availableSetCount, masteredSetCount, currentLearnSetIndex,
  isSetMastered, isBlockComplete, currentBlock, blockCount,
  blockNouns, practiceNounsForBlock, blockPracticeDone, practiceCount, recordPracticeDrill,
  cipherSessionDone, cipherRoundCount, recordCipherRound,
  crosswordSessionDone, crosswordRoundCount, recordCrosswordRound,
  hurdleSessionDone, hurdleRoundCount, recordHurdleRound,
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
const POS: Pos[] = ['noun','verb','adj','adv','pron','art','prep','conj','num','particle','interj'];
const PLURAL_ONLY = new Set(['Leute', 'Eltern']);

let ok = true;
const fail = (label: string, detail: unknown = '') => { ok = false; console.log('FAIL', label, detail); };

// (a) dataset shape
{
  const ids = new Set<string>(); let dupes = 0;
  for (const w of LEMMAS) { if (ids.has(w.id)) dupes++; ids.add(w.id); }
  if (dupes) fail('a:duplicate-ids', dupes);
  const orders = LEMMAS.map((w) => w.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) if (orders[i] !== i + 1) { fail('a:order-gap', `${orders[i]}!=${i + 1}`); break; }
  for (const w of LEMMAS) {
    if (!w.id || !w.de || !w.en) fail('a:empty-field', w.id);
    if (!POS.includes(w.pos)) fail('a:bad-pos', `${w.id}:${w.pos}`);
  }
}

// (b) gender hygiene
{
  const noGender: string[] = [];
  for (const w of LEMMAS) {
    if (w.gender && w.pos !== 'noun') fail('b:gender-on-nonnoun', w.id);
    if (w.pos === 'noun' && !w.gender) noGender.push(w.de);
  }
  const unexpected = noGender.filter((de) => !PLURAL_ONLY.has(de));
  if (unexpected.length) fail('b:noun-without-gender', unexpected.slice(0, 10));
}

// (c) sets + lookups
{
  const flat = SETS.flatMap((s) => s.words);
  if (flat.length !== LEMMAS.length) fail('c:set-count', `${flat.length}!=${LEMMAS.length}`);
  if (SETS.some((s) => s.words.length > PROGRESSION.wordsPerSet)) fail('c:set-too-big');
  for (const w of [LEMMAS[0], LEMMAS[500], LEMMAS[1999]]) {
    if (wordById(w.id) !== w) fail('c:wordById', w.id);
    if (setIndexForWord(w.id) < 0) fail('c:setIndex', w.id);
  }
}

// (d) generated grammar drills
{
  const nouns = LEMMAS.filter((w) => w.pos === 'noun' && w.gender);
  if (GRAMMAR_ITEMS.length !== nouns.length) fail('d:grammar-count', `${GRAMMAR_ITEMS.length}!=${nouns.length}`);
  for (const g of GRAMMAR_ITEMS) {
    const noun = wordById(g.requires[0]);
    if (!noun || !noun.gender) { fail('d:noun-missing', g.id); continue; }
    if (grammarNounId(g) !== noun.id) fail('d:grammarNounId', g.id);
    const expected = noun.gender === 'm' ? 'er' : noun.gender === 'f' ? 'ie' : 'as';
    if (g.ending !== expected) fail('d:ending', `${g.id}:${g.ending}`);
  }
}

// (e) generated cipher content: each block's session is 1..4 short, grammatically
//     SAFE sentences; every requires id is a real lemma eligible by that block;
//     ids unique; levels in range; round count matches. Coverage is sense-first
//     (hard-to-place function words may be skipped) so we only assert each block
//     touches >=1 new word and the average is healthy.
{
  if (CIPHER_ITEMS.length === 0) fail('e:cipher-empty');
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS.length / BS);
  const seen = new Set<string>(); let dup = 0;
  for (const it of CIPHER_ITEMS) {
    if (seen.has(it.id)) dup++; else seen.add(it.id);
    if (it.level < 1 || it.level > 6) fail('e:cipher-level', `${it.id}:${it.level}`);
    if (!it.sentence || !it.translation || it.requires.length === 0) fail('e:cipher-shape', it.id);
  }
  if (dup) fail('e:cipher-dup-id', dup);
  let totalCov = 0;
  for (let b = 0; b < nb; b++) {
    const learnedThru = new Set(LEMMAS.slice(0, (b + 1) * BS).map((w) => w.id));
    const items = cipherItemsForBlock(b);
    if (items.length !== cipherRoundsForBlock(b)) fail('e:cipher-round-count', b);
    if (items.length < 1 || items.length > 4) fail('e:cipher-round-bounds', `${b}:${items.length}`);
    const cov = new Set<string>();
    for (const it of items) {
      for (const r of it.requires) {
        if (!wordById(r)) fail('e:cipher-bad-require', `${b}:${r}`);
        if (!learnedThru.has(r)) fail('e:cipher-require-uneligible', `${b}:${r}`);
        cov.add(r);
      }
    }
    const target = LEMMAS.slice(b * BS, b * BS + BS);
    const covered = target.filter((w) => cov.has(w.id)).length;
    if (covered < 1) fail('e:cipher-zero-coverage', b);
    totalCov += covered;
  }
  if (totalCov / nb < 5) fail('e:cipher-avg-coverage', (totalCov / nb).toFixed(2));
}

// (f) strict eligibility
{
  const noun = LEMMAS.find((w) => w.pos === 'noun' && w.gender)!;
  const g = GRAMMAR_ITEMS.find((x) => x.requires[0] === noun.id)!;
  if (isItemEligible(g, st({ learnedWords: [] }))) fail('f:eligible-empty');
  if (!isItemEligible(g, st({ learnedWords: [noun.id] }))) fail('f:not-eligible-learned');
  if (!isRecapEligible(g, st({ learnedWords: [noun.id] }))) fail('f:recap');
}

// (g) LEARN -> PRACTICE -> ADVANCE: mastering a block's sets is not enough; its
//     Practice session (practiceRounds drills) must be completed to advance.
{
  const B = PROGRESSION.setsPerBlock;
  let s = st({ learnedWords: learnedThrough(B - 1) }); // master block 0's sets
  for (let i = 0; i < B; i++) if (!isSetMastered(s, SETS[i])) fail('g:set-not-mastered', i);
  if (isBlockComplete(s, SETS, 0)) fail('g:complete-without-practice');
  if (availableSetCount(s, SETS) !== B) fail('g:avail-before', availableSetCount(s, SETS));
  if (currentBlock(s, SETS) !== 0) fail('g:block-before');
  if (practiceNounsForBlock(s, SETS, 0).length === 0) fail('g:empty-session-block0');
  for (let k = 0; k < PROGRESSION.practiceRounds; k++) s = recordPracticeDrill(s, 0);
  if (practiceCount(s, 0) !== PROGRESSION.practiceRounds) fail('g:count', practiceCount(s, 0));
  if (!blockPracticeDone(s, 0)) fail('g:flag');
  // grammar alone is no longer enough — the cipher session must be done too.
  if (isBlockComplete(s, SETS, 0)) fail('g:complete-without-cipher');
  for (let k = 0; k < cipherRoundsForBlock(0); k++) s = recordCipherRound(s, 0);
  if (!cipherSessionDone(s, 0)) fail('g:cipher-flag');
  if (cipherRoundCount(s, 0) !== cipherRoundsForBlock(0)) fail('g:cipher-count');
  // cipher + grammar still isn't enough — the crossword must be solved too.
  if (isBlockComplete(s, SETS, 0)) fail('g:complete-without-crossword');
  for (let k = 0; k < crosswordRoundsForBlock(0); k++) s = recordCrosswordRound(s, 0);
  if (!crosswordSessionDone(s, 0)) fail('g:crossword-flag');
  if (crosswordRoundCount(s, 0) !== crosswordRoundsForBlock(0)) fail('g:crossword-count');
  // grammar + cipher + crossword still isn't enough — Hurdle must be solved too.
  if (isBlockComplete(s, SETS, 0)) fail('g:complete-without-hurdle');
  for (let k = 0; k < hurdleRoundsForBlock(0); k++) s = recordHurdleRound(s, 0);
  if (!hurdleSessionDone(s, 0)) fail('g:hurdle-flag');
  if (hurdleRoundCount(s, 0) !== hurdleRoundsForBlock(0)) fail('g:hurdle-count');
  if (!isBlockComplete(s, SETS, 0)) fail('g:incomplete-after-practice');
  if (availableSetCount(s, SETS) !== 2 * B) fail('g:avail-after', availableSetCount(s, SETS));
  if (currentBlock(s, SETS) !== 1) fail('g:block-after', currentBlock(s, SETS));

  // partial progress is tracked (1 drill < required) and a noun-sparse block
  // still produces a non-empty session.
  let p = st({ learnedWords: learnedThrough(B - 1) });
  p = recordPracticeDrill(p, 0);
  if (practiceCount(p, 0) !== 1) fail('g:partial-count');
  if (blockPracticeDone(p, 0)) fail('g:partial-done');
  let s2 = st({ learnedWords: SETS.slice(0, 10).flatMap((x) => x.words.map((w) => w.id)) });
  let firstNounless = -1;
  for (let b = 0; b < 5; b++) if (blockNouns(SETS, b).length === 0) { firstNounless = b; break; }
  if (firstNounless >= 0 && practiceNounsForBlock(s2, SETS, firstNounless).length === 0)
    fail('g:nounless-empty-session', firstNounless);
}

// (h) display helpers
{
  for (const w of [LEMMAS[0], ...LEMMAS.filter((x) => x.gender).slice(0, 3)]) {
    if (w.gender) {
      if (germanWithArticle(w) !== `${articleFor(w.gender)} ${w.de}`) fail('h:de', w.id);
      if (englishWithArticle(w) !== `the ${w.en}`) fail('h:en', w.id);
      if (!answerMatches(`the ${w.en}`, w.en)) fail('h:match', w.id);
    } else if (englishWithArticle(w) !== w.en) fail('h:en-bare', w.id);
  }
}

// (i) article trio present with gendered glosses
{
  const arts = LEMMAS.filter((w) => w.pos === 'art');
  for (const [de, en] of [['der', 'the (masc.)'], ['die', 'the (fem.)'], ['das', 'the (neut.)']]) {
    const m = arts.find((a) => a.de === de);
    if (!m) fail('i:missing-article', de);
    else if (m.en !== en) fail('i:article-gloss', `${de}:${m.en}`);
  }
}

// (j) daily recap: due after the interval once >=2 sets are mastered.
{
  const DAY = PROGRESSION.recapIntervalMs;
  const learned = SETS.slice(0, 4).flatMap((x) => x.words.map((w) => w.id)); // >=2 sets
  const s = st({ learnedWords: learned, lastRecapAt: 1000 });
  if (recapDue(s, SETS, 1000 + 1000)) fail('j:due-too-early');
  if (!recapDue(s, SETS, 1000 + DAY + 1)) fail('j:not-due-after-interval');
  const after = recordRecapDone(s, 1000 + DAY + 1);
  if (recapDue(after, SETS, 1000 + DAY + 2)) fail('j:still-due-after-done');
  const few = st({ learnedWords: SETS[0].words.map((w) => w.id), lastRecapAt: 1 });
  if (recapDue(few, SETS, 1e15)) fail('j:due-without-2-sets');
}

// (k) generated crosswords: every block has one puzzle of >=4 placeable words
//     (the leftovers the cipher didn't cover, padded with block words). Every
//     chosen word is actually placed, the grid has no conflicting crossings,
//     requires are real lemmas eligible by that block, ids are unique, and the
//     round count is 0/1. The crossword's role in the gate is asserted in (g).
{
  if (CROSSWORDS.length === 0) fail('k:crossword-empty');
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS.length / BS);
  const seen = new Set<string>(); let dup = 0;
  for (let b = 0; b < nb; b++) {
    const ids = crosswordWordsForBlock(b);
    const item = crosswordItemsForBlock(b);
    if (crosswordRoundsForBlock(b) !== (item ? 1 : 0)) fail('k:round-count', b);
    if (!item) { if (ids.length >= 2) fail('k:null-with-words', b); continue; }
    if (seen.has(item.id)) dup++; else seen.add(item.id);
    if (ids.length < 4) fail('k:too-few-words', `${b}:${ids.length}`);
    if (item.level < 1 || item.level > 6) fail('k:level', `${b}:${item.level}`);
    const learnedThru = new Set(LEMMAS.slice(0, (b + 1) * BS).map((w) => w.id));
    const placed = new Set(item.entries.map((e) => e.wordId));
    for (const id of ids) {
      if (!wordById(id)) fail('k:bad-word', `${b}:${id}`);
      if (!learnedThru.has(id)) fail('k:require-uneligible', `${b}:${id}`);
      if (!placed.has(id)) fail('k:word-not-placed', `${b}:${id}`);
    }
    for (const r of item.requires) if (!learnedThru.has(r)) fail('k:require-out-of-block', `${b}:${r}`);
    try { const built = buildCrossword(item); if (built.total < item.entries.length) fail('k:total', b); }
    catch (e) { fail('k:build-threw', `${b}:${(e as Error).message}`); }
  }
  if (dup) fail('k:dup-id', dup);
}

// (l) crossword clues: every word in an early-block (0–20) crossword has a real
//     DE+EN definitional clue (not just the gloss fallback), and the clue is not
//     literally the answer word. Beyond block 20 the gloss fallback is allowed
//     until those clues are authored.
{
  const seen = new Set<string>();
  for (let b = 0; b < 20; b++) for (const id of crosswordWordsForBlock(b)) seen.add(id);
  for (const id of seen) {
    const c = CLUES[id];
    if (!c) { fail('l:missing-clue', id); continue; }
    if (!c.de || !c.en) { fail('l:empty-clue', id); continue; }
    const w = wordById(id);
    if (w && (c.de.toLowerCase() === w.de.toLowerCase() || c.en.toLowerCase() === w.de.toLowerCase()))
      fail('l:clue-is-answer', id);
  }
}

// (m) Hurdle: tries scale with length (floor 5, no cap); Wordle scoring handles
//     duplicate letters; the per-block session is 1..MAX of the block's own
//     spellable words, every word eligible by that block; the flat pool is sound.
{
  const eq = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((x, i) => x === b[i]);

  // tries: max(5, len + 3), no ceiling.
  if (triesFor('AB') !== 5) fail('m:tries-floor', triesFor('AB'));
  if (triesFor('ABC') !== 6) fail('m:tries-3', triesFor('ABC'));
  if (triesFor('HALLO') !== 8) fail('m:tries-5', triesFor('HALLO'));
  if (triesFor('ABCDEFG') !== 10) fail('m:tries-7', triesFor('ABCDEFG'));
  if (triesFor('A'.repeat(14)) !== 17) fail('m:tries-nocap', triesFor('A'.repeat(14)));
  if (answerLength('GROß') !== 4) fail('m:len-eszett', answerLength('GROß'));

  // scoring: greens, duplicate handling, and over-guessed letters going absent.
  if (!eq(scoreGuess('MANN', 'MANN'), ['correct', 'correct', 'correct', 'correct'])) fail('m:score-all');
  if (!eq(scoreGuess('NANN', 'MANN'), ['absent', 'correct', 'correct', 'correct'])) fail('m:score-dup');
  if (!eq(scoreGuess('TOOT', 'OTTO'), ['present', 'present', 'present', 'present'])) fail('m:score-anagram');
  if (!eq(scoreGuess('AA', 'AB'), ['correct', 'absent'])) fail('m:score-overguess');
  if (!isSolved('HAUS', 'HAUS') || isSolved('HAXS', 'HAUS') || isSolved('', '')) fail('m:isSolved');

  // key hints: correct beats present beats absent across guesses.
  const kh = keyHints([
    { letters: ['A', 'B'], states: ['present', 'absent'] },
    { letters: ['A', 'C'], states: ['correct', 'absent'] },
  ]);
  if (kh.A !== 'correct' || kh.B !== 'absent' || kh.C !== 'absent') fail('m:keyhints', JSON.stringify(kh));

  // flat pool: shape + uniqueness.
  if (HURDLE_ITEMS.length === 0) fail('m:pool-empty');
  const seen = new Set<string>(); let dup = 0;
  for (const it of HURDLE_ITEMS) {
    if (seen.has(it.id)) dup++; else seen.add(it.id);
    const w = wordById(it.wordId);
    if (!w) { fail('m:pool-bad-word', it.id); continue; }
    if (!isHurdleWord(w)) fail('m:pool-not-spellable', it.id);
    if (it.requires.length !== 1 || it.requires[0] !== it.wordId) fail('m:pool-requires', it.id);
    if (it.en !== w.en) fail('m:pool-en', it.id);
    if (answerLength(it.answer) < 2) fail('m:pool-too-short', it.id);
    if (it.level < 1 || it.level > 6) fail('m:pool-level', `${it.id}:${it.level}`);
  }
  if (dup) fail('m:pool-dup-id', dup);

  // per-block session: bounded, non-empty, and every word belongs to the block
  // (hence eligible once the block is learned). The gate role is checked in (g).
  const BS = PROGRESSION.setsPerBlock * PROGRESSION.wordsPerSet;
  const nb = Math.floor(LEMMAS.length / BS);
  for (let b = 0; b < nb; b++) {
    const items = hurdleItemsForBlock(b);
    if (items.length !== hurdleRoundsForBlock(b)) fail('m:round-count', b);
    if (items.length < 1) fail('m:block-empty', b);
    if (items.length > HURDLE_MAX_ROUNDS) fail('m:round-bounds', `${b}:${items.length}`);
    const blockIds = new Set(LEMMAS.slice(b * BS, b * BS + BS).map((w) => w.id));
    for (const it of items) {
      if (!blockIds.has(it.wordId)) fail('m:word-out-of-block', `${b}:${it.wordId}`);
    }
  }
}

console.log(`lemmas=${LEMMAS.length} sets=${SETS.length} blocks=${blockCount(SETS)} grammar=${GRAMMAR_ITEMS.length} crosswords=${CROSSWORDS.length} hurdlePool=${HURDLE_ITEMS.length} practiceRounds=${PROGRESSION.practiceRounds}`);
if (!ok) { console.log('\nINVARIANTS FAILED'); process.exit(1); }
console.log('OK — all invariants pass');
