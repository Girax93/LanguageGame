# LanguageGame — two fixes, handoff (apply on a clean tree)

**Date:** 2026-07-01 · prepared from a Cowork session.

## ⚠️ Read first — why this is a doc and not a push

This session could **not** push or deploy, and the local checkout is **corrupted**, so
the fixes are written here as exact, ready-to-apply changes instead of being committed.

1. **No GitHub/Composio tools were loaded this session** — no `GITHUB_COMMIT_MULTIPLE_FILES`,
   no deployment-status tools. I could not commit or deploy-verify.
2. **The local working tree is damaged (main is fine — production works).** Several files are
   truncated on the real Windows disk from a prior bad sync, most importantly
   `src/content/lang/fr/lemmas.fr.ts` (only ~113 lemmas, cut mid-row; main has the full ~420)
   and `src/content/lang/registry.ts` (was truncated). The bash sandbox mount also serves
   stale/truncated reads and pass-through writes, so I could not run the test suites against my
   edits, and some exploratory `bash >>` writes duplicated tails in a few files
   (`vocab.ts`, `de/index.ts`, `no/index.ts`, `types.ts`, `fr/index.ts`, `tests/content.fr.mts`).

**Because of #2, do not commit from the current checkout.** Reset it to `main` first:

```
git fetch origin
git reset --hard origin/main      # restores the real lemmas.fr.ts etc.
git clean -fd                      # optional: drop stray files (this doc, FIXES_HANDOFF.md)
```

Then apply the two fixes below (each as its own commit), run the content tests, push, and
verify the Vercel deploy.

## What was verified

- The TypeScript content suites (`tests/content.invariants.mts`, `content.no.mts`,
  `content.fr.mts`) **pass on unmodified `main` logic** — confirmed in-session with a TS
  transpiling loader (the sandbox's native `--experimental-strip-types` can't load the graph).
- **Fix 1** logic is straightforward dispatch and was reviewed against all call sites.
- **Fix 2** math was derived and cross-checked by hand (see worked examples below) but the full
  suites must be re-run on a clean tree — do this before pushing.

Run the suites with:

```
node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts
node --experimental-strip-types --import ./tests/loader.mjs tests/content.no.mts
node --experimental-strip-types --import ./tests/loader.mjs tests/content.fr.mts
```

---

# FIX 1 — German articles leaking into French (and Norwegian) Learn

**Symptom:** French (and Norwegian) Learn exercises showed **der / die / das**. Cause: the Learn
gender-tap exercise and the intro-card gender chip hard-coded the German articles, and
`vocab.ts`'s `articleFor` always returns German. The fix routes articles through the active
`LangPack`, so each course shows only its own (de der/die/das, no en/ei/et, fr un/une).

### 1. `src/content/lang/types.ts`

Add an `ArticleOption` type and an `articleOptions` field to `LangPack`.

After `export type { Lemma, Gender, Pos, Register };` add:

```ts
/** One tappable article choice in the Learn "which article?" exercise. */
export interface ArticleOption {
  /** The article surface this language teaches for the gender (de "der", no "en", fr "un"). */
  art: string;
  /** The grammatical gender this article marks. */
  gender: Gender;
}
```

Inside `interface LangPack`, after the `withArticleEn` line, add:

```ts
  /** The article choices for the Learn gender-tap exercise + intro chip, in
   *  display order. Each language lists ONLY its own articles (de der/die/das;
   *  no en/ei/et; fr un/une) so a course never shows another language's articles. */
  articleOptions: ArticleOption[];
```

### 2. `src/content/lang/de/index.ts`

In the `de` pack object, after `withArticleEn: withArticleEnDE,` add:

```ts
  articleOptions: [
    { art: 'der', gender: 'm' },
    { art: 'die', gender: 'f' },
    { art: 'das', gender: 'n' },
  ],
```

### 3. `src/content/lang/no/index.ts`

After `withArticleEn: withArticleEnNO,` add:

```ts
  articleOptions: [
    { art: 'en', gender: 'm' },
    { art: 'ei', gender: 'f' },
    { art: 'et', gender: 'n' },
  ],
```

### 4. `src/content/lang/fr/index.ts`

After `withArticleEn: withArticleEnFR,` add (French is two-gender — only un/une):

```ts
  articleOptions: [
    { art: 'un', gender: 'm' },
    { art: 'une', gender: 'f' },
  ],
```

### 5. `src/content/vocab.ts`

Keep `articleFor` (German-only, still used by the German test). Add a dispatched helper right
after it:

```ts
/** The ACTIVE language's teaching article for a gender (de der/die/das;
 *  no en/ei/et; fr un/une). Drives the Learn gender-tap exercise so a course
 *  only ever shows its own articles — never another language's. */
export function articleForGender(gender: Gender): string {
  const opt = getActiveLang().articleOptions.find((a) => a.gender === gender);
  return opt ? opt.art : '';
}
```

(`getActiveLang` is already imported in `vocab.ts`.)

### 6. `src/games/learn/components.tsx`

**a) Import** — swap `articleFor` for `articleForGender`:

```ts
import {
  germanWithArticle,
  englishWithArticle,
  answerMatches,
  articleForGender,
  type VocabWord,
} from '../../content/vocab';
```

**b) Replace the hard-coded `ARTICLES` constant** with a gender→colour map (the article surface
now comes from the active pack):

```ts
// Each gender gets a consistent warm-palette colour so it reads visually. The
// article SURFACE comes from the active language pack (der/die/das, en/ei/et,
// un/une) via articleForGender — never hard-coded — so a course only ever shows
// its own articles.
const GENDER_CLS: Record<'m' | 'f' | 'n', string> = {
  m: 'text-brown',
  f: 'text-terracotta',
  n: 'text-ochre',
};
function genderLabel(g: 'm' | 'f' | 'n'): string {
  return g === 'm' ? 'masculine' : g === 'f' ? 'feminine' : 'neuter';
}
```

**c) `IntroCard` gender chip** — replace:

```ts
  const gi = word.gender ? ARTICLES.find((a) => a.gender === word.gender) : null;
```

with:

```ts
  const gi = word.gender
    ? { art: articleForGender(word.gender), cls: GENDER_CLS[word.gender] }
    : null;
```

(The JSX that renders `gi.art` / `gi.cls` stays unchanged.)

**d) `Gender` exercise** — render the active pack's articles. Replace the body from
`const [picked, ...]` down through the buttons grid:

```ts
  const [picked, setPicked] = useState<string | null>(null);
  const options = getActiveLang().articleOptions;
  const answer = articleForGender(step.word.gender!);
  const isCorrect = picked === answer;
  function classesFor(a: { art: string; gender: 'm' | 'f' | 'n' }): string {
    const base =
      'rounded-2xl border px-2 py-4 font-serif text-xl font-semibold transition active:scale-[0.99] disabled:cursor-default';
    if (picked === null) return `${base} border-line bg-card ${GENDER_CLS[a.gender]} hover:bg-sand`;
    if (a.art === answer) return `${base} border-sage/60 bg-sage/15 text-espresso`;
    if (a.art === picked) return `${base} border-terracotta/60 bg-terracotta/10 text-terracotta`;
    return `${base} border-line bg-card text-given`;
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 text-center">
        <p className="eyebrow">Which article?</p>
        <p className="mt-4 font-serif text-4xl font-semibold text-espresso">{step.word.de}</p>
        <p className="mt-2 text-base text-taupe">{step.word.en}</p>
      </div>
      <div className={`mt-auto grid ${options.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 pt-8`}>
        {options.map((a) => (
          <button key={a.art} disabled={picked !== null} onClick={() => setPicked(a.art)} className={classesFor(a)}>
            {a.art}
          </button>
        ))}
      </div>
```

(The `{picked !== null && <Feedback .../>}` block and closing `</div>` stay unchanged; `answer`
is now the active-language article so the Feedback reveal "`un homme`" is correct.)

> Note: the `engine.ts` choice/type/scramble/pairs steps already dispatch through
> `germanWithArticle`/`englishWithArticle`, so they were never the leak — no change needed there.

### 7. `tests/content.fr.mts` — invariant that French Learn never shows German articles

Add to the imports:

```ts
import { setActiveContentLanguage, getActiveCode, getActiveLang } from '../src/content/lang/registry';
// ...add articleForGender to the vocab import:
//   germanWithArticle, englishWithArticle, answerMatches, articleForGender,
import { makeExerciseStep } from '../src/games/learn/engine';
```

Add this block just before the "switch back to German" section near the end:

```ts
// (o) FIX 1 — a French course never shows German articles in Learn. The
//     gender-tap exercise + intro chip read the active pack's articleOptions /
//     articleForGender (un/une), and choice/type/scramble steps read withArticle
//     (a/un …) — none may yield der/die/das.
{
  const GERMAN = new Set(['der', 'die', 'das']);
  const lang = getActiveLang();
  for (const o of lang.articleOptions) if (GERMAN.has(o.art)) fail('o:german-in-articleOptions', o.art);
  const arts = new Set(lang.articleOptions.map((o) => o.art));
  if (!arts.has('un') || !arts.has('une')) fail('o:missing-fr-articles', [...arts].join(','));
  for (const g of ['m', 'f'] as const) {
    const a = articleForGender(g);
    if (GERMAN.has(a)) fail('o:german-answer', `${g}:${a}`);
    if (!arts.has(a)) fail('o:answer-not-in-options', `${g}:${a}`);
  }
  // Simulate every Learn exercise format for a sample of French nouns; no step's
  // visible text may contain a standalone der/die/das token.
  const tokenize = (s: string) => s.toLowerCase().split(/[^a-zà-ÿ]+/u).filter(Boolean);
  const stepText = (st: Record<string, unknown>): string[] => {
    const out: string[] = [];
    if (typeof st.prompt === 'string') out.push(st.prompt);
    if (typeof st.answer === 'string') out.push(st.answer);
    if (Array.isArray(st.options)) out.push(...(st.options as string[]));
    return out;
  };
  const sample = LEMMAS_FR.filter((w) => w.pos === 'noun' && w.gender).slice(0, 15);
  let scanned = 0;
  for (const noun of sample) {
    const steps = [makeExerciseStep(noun, 0)];
    for (let k = 0; k < 12; k++) steps.push(makeExerciseStep(noun, 1));
    for (const stp of steps)
      for (const t of stepText(stp as unknown as Record<string, unknown>)) {
        for (const tok of tokenize(t)) if (GERMAN.has(tok)) fail('o:german-in-step', `${noun.id}:${(stp as { kind: string }).kind}:${t}`);
        scanned++;
      }
  }
  console.log(`FR Learn articles = ${lang.articleOptions.map((o) => o.art).join('/')}; scanned ${scanned} step texts, no der/die/das`);
}
```

Optionally mirror a shorter version into `tests/content.no.mts` (the bug affected Norwegian too;
the fix already covers it).

**Commit 1:** `Learn: dispatch articles through the active LangPack (fix der/die/das leaking into French/Norwegian)`
Files: `types.ts`, `de/index.ts`, `no/index.ts`, `fr/index.ts`, `vocab.ts`, `components.tsx`, `tests/content.fr.mts`.

---

# FIX 2 — 5-word learn blocks after the first 10

**Goal:** the first block stays **10 words (2 sets)**; every block after it introduces **5 words
(1 set)**. Applies to all languages (shared progression layer). Today it's a fixed
`setsPerBlock: 2` (always 10-word blocks). The fix makes block size variable and centralises all
block↔set↔word math in `progressionConfig.ts` so every module stays consistent.

### Worked example (German, 2000 lemmas → 400 sets, wordsPerSet = 5)

| block | sets | words | lemma range |
|------:|:-----|------:|:------------|
| 0 | 0,1 | 10 | [0, 10) |
| 1 | 2   | 5  | [10, 15) |
| 2 | 3   | 5  | [15, 20) |
| … | …   | 5  | … |
| 398 | 399 | 5 | [1995, 2000) |

Total blocks: **399** (was 200). Block 0 = 10 words, blocks 1..398 = 5 words each = 1990; 10 + 1990 = 2000. ✓

### 1. `src/state/progressionConfig.ts` — the single source of block math

Replace `setsPerBlock: 2,` with the two-size config, and append the helpers:

```ts
export const PROGRESSION = {
  /** Words delivered per set (vocabulary is chunked into ordered sets). */
  wordsPerSet: 5,

  /** Correct answers in a row in LEARN to "master" a word. */
  masteryThreshold: 2,

  /** Sets in the FIRST block — the opening block is larger (10 words) to
   *  front-load the basics; every later block is `laterBlockSets` (5 words). */
  firstBlockSets: 2,
  /** Sets in every block AFTER the first. */
  laterBlockSets: 1,

  /** Grammar drills required to clear a block's Practice gate. */
  practiceRounds: 3,

  /** How often a recap session is forced (default: every 24 hours). */
  recapIntervalMs: 24 * 60 * 60 * 1000,
} as const;

// ── block ↔ set / word math (the ONLY place block sizing lives) ──────────────
// Block 0 spans `firstBlockSets` sets; every later block spans `laterBlockSets`.
// All modules (progression gate, cipher/crossword/hurdle generators, the router)
// derive their boundaries from these helpers so sizing stays consistent.
const FIRST = PROGRESSION.firstBlockSets;
const LATER = PROGRESSION.laterBlockSets;

/** Number of sets in `block` (block 0 is the larger opening block). */
export function setsInBlock(block: number): number {
  return block <= 0 ? FIRST : LATER;
}
/** Index of the first set belonging to `block`. */
export function firstSetOfBlock(block: number): number {
  return block <= 0 ? 0 : FIRST + (block - 1) * LATER;
}
/** The block that contains set `setIndex`. */
export function blockOfSet(setIndex: number): number {
  return setIndex < FIRST ? 0 : Math.floor((setIndex - FIRST) / LATER) + 1;
}
/** Number of COMPLETE blocks coverable by `totalSets` full sets. */
export function blockCountForSets(totalSets: number): number {
  if (totalSets < FIRST) return 0;
  return 1 + Math.floor((totalSets - FIRST) / LATER);
}
/** Number of COMPLETE blocks for `wordCount` words (drops a partial trailing set). */
export function blockCountForWords(wordCount: number): number {
  return blockCountForSets(Math.floor(wordCount / PROGRESSION.wordsPerSet));
}
/** Lemma index range [start, end) for `block` (words, not sets). */
export function blockWordRange(block: number): { start: number; end: number } {
  const start = firstSetOfBlock(block) * PROGRESSION.wordsPerSet;
  const end = start + setsInBlock(block) * PROGRESSION.wordsPerSet;
  return { start, end };
}
```

> `setsPerBlock` is removed. Every reference must move to the helpers (below). Because the build
> doesn't typecheck, grep for `setsPerBlock` after applying and confirm **zero** hits remain in
> `src/`.

### 2. `src/state/progression.ts`

- Delete `const B = PROGRESSION.setsPerBlock;`.
- Import the helpers:
  ```ts
  import {
    PROGRESSION,
    firstSetOfBlock, setsInBlock, blockOfSet, blockCountForSets, blockCountForWords,
  } from './progressionConfig';
  ```
- Replace these functions:

```ts
export function blockOf(setIndex: number): number {
  return blockOfSet(setIndex);
}
export function blockCount(sets: VocabSet[]): number {
  // count complete blocks from the total word count (matches the content generators)
  const totalWords = sets.reduce((n, s) => n + s.words.length, 0);
  return blockCountForWords(totalWords);
}
export function blockSets(sets: VocabSet[], block: number): VocabSet[] {
  const start = firstSetOfBlock(block);
  return sets.slice(start, start + setsInBlock(block));
}
```

```ts
export function isBlockLearned(s: PlayerState, sets: VocabSet[], block: number): boolean {
  const bs = blockSets(sets, block);
  return bs.length === setsInBlock(block) && bs.every((set) => isSetMastered(s, set));
}
```

```ts
export function availableSetCount(s: PlayerState, sets: VocabSet[]): number {
  if (sets.length === 0) return 0;
  let completed = 0;
  const blocks = blockCount(sets);
  for (let b = 0; b < blocks; b++) {
    if (isBlockComplete(s, sets, b)) completed++;
    else break;
  }
  return Math.min(sets.length, firstSetOfBlock(completed) + setsInBlock(completed));
}
```

- Add a helper used by the router (`App.tsx`):

```ts
/** The latest block whose sets are all mastered (−1 if none), from the count of
 *  consecutively-mastered sets. Drives the Practice screen's block. */
export function latestCompleteBlock(masteredSets: number): number {
  return blockCountForSets(masteredSets) - 1;
}
```

(`practiceBlock` still calls `blockOf(...)` — unchanged.)

### 3. `src/content/cipherItems.ts`

- Remove `const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock;`.
- Import `blockCountForWords` from `../state/progressionConfig`.
- In `buildLang`: `const blockCount = blockCountForWords(pack.lemmas.length);`

### 4. `src/content/generateCipher.ts` (and identically `src/content/lang/fr/cipher.ts`, `src/content/lang/no/cipher.ts`)

- Remove `const BLOCK_SIZE = ...`.
- Import `blockWordRange` from the right relative path
  (`../state/progressionConfig` for `generateCipher.ts`; `../../../state/progressionConfig` for the
  `lang/*/cipher.ts` files).
- In each `generateBlockDrafts*(b, lemmas)`, replace the pool/target slices:

```ts
  const { start, end } = blockWordRange(b);
  const pool = lemmas.slice(0, end);     // cumulative pool through block b
  // ...
  const target = lemmas.slice(start, end);
```

(Blocks are contiguous from 0, so the cumulative pool is `slice(0, end)`.)

### 5. `src/content/crosswords.ts`

- Remove `const B = PROGRESSION.setsPerBlock;`.
- Import `firstSetOfBlock, setsInBlock, blockCountForWords` from `../state/progressionConfig`.
- `blockWordIds`:
  ```ts
  function blockWordIds(ctx: LangCtx, block: number): string[] {
    const start = firstSetOfBlock(block);
    return ctx.sets.slice(start, start + setsInBlock(block)).flatMap((s) => s.words.map((w) => w.id));
  }
  ```
- In `buildLang`: `const blockCount = blockCountForWords(pack.lemmas.length);`

### 6. `src/content/hurdleItems.ts`

- Remove `const B = PROGRESSION.setsPerBlock;`.
- Import `blockCountForWords` from `../state/progressionConfig`.
- In `buildLang`: `const blockCount = blockCountForWords(pack.lemmas.length);`

### 7. `src/content/challenges.ts`

- Import `firstSetOfBlock, setsInBlock` from `../state/progressionConfig`.
- `blockWordIds`:
  ```ts
  export function blockWordIds(block: number): string[] {
    const start = firstSetOfBlock(block);
    return SETS.slice(start, start + setsInBlock(block)).flatMap((s) => s.words.map((w) => w.id));
  }
  ```

### 8. `src/app/App.tsx`

- Import `latestCompleteBlock` from `../state/progression`.
- Replace line ~152:
  ```ts
  const practiceIdx = latestCompleteBlock(masteredSets);
  ```
  (was `Math.floor(masteredSets / PROGRESSION.setsPerBlock) - 1`).

### 9. Tests — `tests/content.invariants.mts`, `content.no.mts`, `content.fr.mts`

In each, import the helpers and replace the hand-rolled block math:

```ts
import { PROGRESSION, blockCountForWords, blockWordRange, firstSetOfBlock, setsInBlock } from '../src/state/progressionConfig';
```

Then, in sections that did `const BS = setsPerBlock * wordsPerSet; const nb = Math.floor(LEMMAS.length / BS);`:

```ts
const nb = blockCountForWords(LEMMAS.length);            // LEMMAS_NO / LEMMAS_FR in the other suites
```

Replace every per-block range:

- block target `LEMMAS.slice(b * BS, b * BS + BS)` →
  ```ts
  const { start, end } = blockWordRange(b);
  const target = LEMMAS.slice(start, end);
  ```
- cumulative learned `LEMMAS.slice(0, (b + 1) * BS)` → `LEMMAS.slice(0, blockWordRange(b).end)`.

In the gating section (`g`) of `content.invariants.mts` (and the analogous `g` in the other two):

- Master block 0's sets: `learnedThrough(setsInBlock(0) - 1)` (= sets 0,1).
- Before practice: `availableSetCount === setsInBlock(0)` (= 2).
- After block 0 is fully complete: `availableSetCount === firstSetOfBlock(1) + setsInBlock(1)` (= 3, **was `2 * B` = 4**), and `currentBlock === 1` (unchanged).
- Hurdle-gating block `bH`: master its sets with
  `learnedThrough(firstSetOfBlock(bH) + setsInBlock(bH) - 1)`.

Sanity prints will now show `blocks=399` (DE/NO) instead of 200.

**Commit 2:** `Progression: variable block size — first block 10 words, every later block 5`
Files: `progressionConfig.ts`, `progression.ts`, `cipherItems.ts`, `generateCipher.ts`,
`crosswords.ts`, `hurdleItems.ts`, `challenges.ts`, `lang/fr/cipher.ts`, `lang/no/cipher.ts`,
`app/App.tsx`, and the three `tests/content.*.mts`.

---

# After applying

1. `git fetch && git reset --hard origin/main` (clean tree).
2. Apply Fix 1, run all three suites, commit (Commit 1), push, confirm Vercel deploy = success.
3. Apply Fix 2, run all three suites (expect `blocks=399` for DE/NO; gating chains still pass),
   commit (Commit 2), push, confirm deploy.
4. Update `CLAUDE.md`: the Progression section still says `setsPerBlock: 2` / "block = 2 sets =
   10 words" — change to "first block = 10 words (2 sets), every later block = 5 words (1 set)";
   note `STATE_VERSION` does **not** need a bump (gating is recomputed from config, and old saves
   already reset at v9). Also add a repo-state note that this local checkout was corrupted and a
   `git reset --hard origin/main` is the recovery.
