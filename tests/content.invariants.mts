// Content invariants. Run with:
//   node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
import { SETS, ALL_WORDS } from '../src/content/vocab';
import { CIPHER_ITEMS } from '../src/content/cipherItems';
import { GRAMMAR_ITEMS } from '../src/content/grammarItems';

const all = [...CIPHER_ITEMS, ...GRAMMAR_ITEMS];
const setWordIds = SETS.map((s) => new Set(s.words.map((w) => w.id)));

// (a) Across a full learning sweep, no eligible item ever references an
//     unmastered word.
let invA = true;
let learned = new Set<string>();
for (const set of SETS) {
  for (const w of set.words) learned.add(w.id);
  for (const it of all)
    if (it.requires.every((r) => learned.has(r)) && it.requires.some((r) => !learned.has(r))) invA = false;
}

// (b) Every set, once learned, introduces >= 1 eligible sentence that uses one
//     of that set's new words.
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

console.log(`words=${ALL_WORDS.length} sets=${SETS.length} cipher=${CIPHER_ITEMS.length} grammar=${GRAMMAR_ITEMS.length}`);
console.log('invariant_a (no unmastered word):', invA);
console.log('invariant_b (per-set new-word coverage):', invB, 'gaps:', gaps);
if (!invA || !invB) process.exit(1);
console.log('OK');
