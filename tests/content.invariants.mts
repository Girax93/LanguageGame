// Content + progression invariants for the 2000-lemma curriculum. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import {
  SETS, ALL_WORDS, wordById, setIndexForWord,
  germanWithArticle, englishWithArticle, articleFor, answerMatches,
} from '../src/content/vocab';
import { LEMMAS, type Pos } from '../src/content/lemmas';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { CROSSWORDS } from '../src/content/crosswords';
import {
  isItemEligible, isRecapEligible, grammarNounId,
  availableSetCount, masteredSetCount, currentLearnSetIndex,
  isSetMastered, isBlockComplete, currentBlock, blockCount,
} from '../src/state/progression';
import { PROGRESSION } from '../src/state/progressionConfig';
import type { PlayerState } from '../src/state/types';

function st(p: Partial<PlayerState>): PlayerState {
  return { learnedWords: [], wordProgress: {}, cipherWords: [], grammarWords: [], challengesDone: [], levelsWon: 0, ...p } as PlayerState;
}
function learnedThrough(setIdx: number): string[] {
  return SETS.slice(0, setIdx + 1).flatMap((s) => s.words.map((w) => w.id));
}
const POS: Pos[] = ['noun','verb','adj','adv','pron','art','prep','conj','num','particle','interj'];
const PLURAL_ONLY = new Set(['Leute', 'Eltern']); // genuine nouns without a singular gender

let ok = true;
const fail = (label: string, detail: unknown = '') => { ok = false; console.log('FAIL', label, detail); };

// (a) dataset shape: ids unique, orders 1..N contiguous, fields present & valid.
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

// (b) gender hygiene: gender ⇒ noun; every noun has a gender except plural-only.
{
  let noGender: string[] = [];
  for (const w of LEMMAS) {
    if (w.gender && w.pos !== 'noun') fail('b:gender-on-nonnoun', w.id);
    if (w.pos === 'noun' && !w.gender) noGender.push(w.de);
  }
  const unexpected = noGender.filter((de) => !PLURAL_ONLY.has(de));
  if (unexpected.length) fail('b:noun-without-gender', unexpected.slice(0, 10));
}

// (c) sets chunk the lemmas exactly; lookups round-trip.
{
  const flat = SETS.flatMap((s) => s.words);
  if (flat.length !== LEMMAS.length) fail('c:set-count', `${flat.length}!=${LEMMAS.length}`);
  if (SETS.some((s) => s.words.length > PROGRESSION.wordsPerSet)) fail('c:set-too-big');
  const sample = [LEMMAS[0], LEMMAS[500], LEMMAS[1999]];
  for (const w of sample) {
    if (wordById(w.id) !== w) fail('c:wordById', w.id);
    if (setIndexForWord(w.id) < 0) fail('c:setIndex', w.id);
  }
}

// (d) generated grammar: one drill per gendered noun, each gated on that noun.
{
  const nouns = LEMMAS.filter((w) => w.pos === 'noun' && w.gender);
  if (GRAMMAR_ITEMS.length !== nouns.length) fail('d:grammar-count', `${GRAMMAR_ITEMS.length}!=${nouns.length}`);
  for (const g of GRAMMAR_ITEMS) {
    if (g.requires.length !== 1) { fail('d:requires', g.id); continue; }
    const noun = wordById(g.requires[0]);
    if (!noun || !noun.gender) { fail('d:noun-missing', g.id); continue; }
    if (grammarNounId(g) !== noun.id) fail('d:grammarNounId', g.id);
    const expected = noun.gender === 'm' ? 'er' : noun.gender === 'f' ? 'ie' : 'as';
    if (g.ending !== expected) fail('d:ending', `${g.id}:${g.ending}!=${expected}`);
  }
}

// (e) cipher/crossword content is intentionally empty for now (engines pending).
{
  if (CIPHER_ITEMS.length !== 0) fail('e:cipher-nonempty', CIPHER_ITEMS.length);
  if (CROSSWORDS.length !== 0) fail('e:crossword-nonempty', CROSSWORDS.length);
}

// (f) strict eligibility: an item is eligible iff every required word is mastered.
{
  const noun = LEMMAS.find((w) => w.pos === 'noun' && w.gender)!;
  const g = GRAMMAR_ITEMS.find((x) => x.requires[0] === noun.id)!;
  if (isItemEligible(g, st({ learnedWords: [] }))) fail('f:eligible-empty');
  if (!isItemEligible(g, st({ learnedWords: [noun.id] }))) fail('f:not-eligible-learned');
  if (!isRecapEligible(g, st({ learnedWords: [noun.id] }))) fail('f:recap');
}

// (g) MASTERY-ONLY gating: mastering a block's sets unlocks the next block,
//     with no practice/coverage requirement.
{
  const B = PROGRESSION.setsPerBlock;
  let s = st({ learnedWords: learnedThrough(B - 1) }); // master block 0's sets
  for (let i = 0; i < B; i++) if (!isSetMastered(s, SETS[i])) fail('g:set-not-mastered', i);
  if (!isBlockComplete(s, SETS, 0)) fail('g:block0-incomplete');
  if (availableSetCount(s, SETS) !== 2 * B) fail('g:avail', availableSetCount(s, SETS));
  if (currentBlock(s, SETS) !== 1) fail('g:currentBlock', currentBlock(s, SETS));
  if (masteredSetCount(s, SETS) !== B) fail('g:masteredCount', masteredSetCount(s, SETS));
  // before mastery the next block is locked
  let s0 = st({ learnedWords: learnedThrough(0) }); // only set 0
  if (availableSetCount(s0, SETS) !== B) fail('g:avail-locked', availableSetCount(s0, SETS));
}

// (h) display helpers compose correctly.
{
  for (const w of [LEMMAS[0], ...LEMMAS.filter((x) => x.gender).slice(0, 3)]) {
    if (w.gender) {
      if (germanWithArticle(w) !== `${articleFor(w.gender)} ${w.de}`) fail('h:de', w.id);
      if (englishWithArticle(w) !== `the ${w.en}`) fail('h:en', w.id);
      if (!answerMatches(`the ${w.en}`, w.en)) fail('h:match', w.id);
    } else if (englishWithArticle(w) !== w.en) fail('h:en-bare', w.id);
  }
}

// (i) a learner at the frontier can always study the current set.
{
  const s = st({ learnedWords: learnedThrough(2) }); // sets 0-2 mastered
  const idx = currentLearnSetIndex(s, SETS);
  if (idx === null) fail('i:nothing-to-learn');
  else if (SETS[idx].words.every((w) => s.learnedWords.includes(w.id))) fail('i:already-mastered', idx);
}

console.log(`lemmas=${LEMMAS.length} sets=${SETS.length} blocks=${blockCount(SETS)} grammar=${GRAMMAR_ITEMS.length} cipher=${CIPHER_ITEMS.length} crosswords=${CROSSWORDS.length}`);
if (!ok) { console.log('\nINVARIANTS FAILED'); process.exit(1); }
console.log('OK — all invariants pass');
