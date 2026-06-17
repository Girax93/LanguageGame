# CLAUDE.md — LanguageGame

Guidance for working on this codebase. Read this first.

## What this is

LanguageGame is a **calm, minimal German language‑learning web app** (mobile‑first). The
player learns small sets of words, then practises them through three game modes —
letter ciphers, grammar (article) drills, and crosswords — gated by a structured
progression system. The aesthetic is deliberately warm, quiet, and uncluttered:
solid fills only, no gradients or glows, generous whitespace, a serif display face.

- **Source of truth:** GitHub `Girax93/LanguageGame`, branch `main`. Only ever push to this repo.
- **Testing loop:** push to `main` → Vercel auto‑deploys → test on phone.
- **Packaging:** Capacitor wraps the built web app for the App Store / Play Store
  (native projects are generated locally with `npx cap add`, git‑ignored).
- **All progress is client‑side** in `localStorage`. There is no backend.
- **Store / Subscription / Account are demo stubs** — no real billing or auth. Keep them stubs unless asked.

## Tech stack

React 18 · Vite 5 · TypeScript · Tailwind CSS · Capacitor.

**Important build note:** the production build is **esbuild via Vite — it strips types and does
NOT typecheck.** Type errors will not fail `npm run build`, and unused/orphan files do not break
it (only modules actually imported get bundled). Don't rely on the build to catch type mistakes;
reason about types yourself, and run the content tests for pure logic.

## Commands

See `package.json` for the canonical scripts. Typically:

- `npm install`
- `npm run dev` — local Vite dev server
- `npm run build` — production build (no typecheck, see above)
- Content/logic tests run under Node's type stripping:
  `node --experimental-strip-types --import ./tests/loader.mjs tests/content.invariants.mts`
  (`tests/loader.mjs` + `tests/hooks.mjs` resolve TS imports). These assert content invariants
  — e.g. every vocab word has cipher/grammar coverage, every clue has DE+EN, gating chains are
  reachable. Extend them when you add content.

## Working from Cowork (Claude desktop)

This project is often worked on from Claude's Cowork mode — a Linux sandbox with this folder
mounted. So a fresh chat is set up correctly:

- **Awareness is automatic.** This section plus the project auto‑memory load into every new chat,
  and the Composio GitHub connection is account‑level and persists across chats. There is no
  per‑chat setup ritual to run.
- **The sandbox CANNOT run git writes or push.** The mounted `.git` forbids unlinking files (git
  can create lockfiles but not delete them, so every write leaves an un‑removable `*.lock` that
  blocks the next op), and GitHub egress is blocked (no DNS / SSH:22 / HTTPS:443). `npm install`
  is likewise blocked in the sandbox (registry 403).
- **To commit/push, use Composio — not local git.** Call `GITHUB_COMMIT_MULTIPLE_FILES` with
  owner=`Girax93`, repo=`LanguageGame`, branch=`main`, listing **only the files actually changed**
  in `upserts`. That makes a real commit on `main` → Vercel auto‑deploys → test on phone.
- **Only commit files you changed.** The local working tree shows ~70 files as "modified", but it
  is pure CRLF / file‑mode noise (`core.autocrlf=true` on the Windows mount) with 0 real diff —
  never commit that.
- **Local file *contents* stay current automatically; only the git *ref* lags.** File-tool edits in
  a chat write straight to the Windows disk, so the working tree already matches what was pushed — a
  fresh chat reads correct, current files with no sync. Syncing is therefore **optional/cosmetic**:
  run `git fetch && git reset --hard origin/main` on the dev machine only for a clean `git
  status`/history or before running `npm run dev`/`build` locally.
- **Tests run in the sandbox** with no `node_modules` (Node type‑stripping), so content/logic is
  verified before pushing — see the test command under Commands above.
- `npm install` / `npm run dev` / `npm run build` are run on the **dev machine** (Windows), not the sandbox.

## Directory map

- `src/app/` — `App.tsx` is the router + screen shell (Home, Practice, Progress, Settings live
  here as route states, not separate files). `Account`, `Store`, `Subscription`, `Statistics`,
  `ResetProgress` are screens; `routes.ts` defines routes.
- `src/components/ui/` — shared kit: `Button`, `Hearts` (lives), `FocusPips` (focus dots, used
  outside games), `ProgressBar`, `TopBar`, `MenuScreen`, `icons`. `ConfirmDialog` is one level up.
- `src/content/` — the actual learning material:
  - `vocab.ts` — `SETS` of words (each word has an id, gender for nouns, `en`, filler/scaffold tags).
  - `cipherItems.ts` — sentence cryptograms; `grammarItems.ts` — article drills.
  - `crosswords.ts` — hand‑authored interlocking puzzles; `challenges.ts` — per‑block challenge crosswords.
  - `clues.ts` — `CLUES: Record<wordId, {de, en}>` (cryptic German + English) and `clueFor(wordId, lang)`.
  - `derive.ts` — helpers that derive data from the sets.
- `src/games/` — one folder per mode, each exposes a default game component via `registry.ts`:
  - `_shared/LevelStage.tsx` — the shared focus‑gated level flow (owns lives, win/lose screens,
    `renderBoard` / `onWin` / `renderWin`). All games render their board through this.
  - `fill-in-the-blanks/` — letter‑cipher game (`cipher.ts`, `CipherBoard`, German `Keyboard`).
  - `grammar/` — article drill (`grammar.ts`, `GrammarBoard`).
  - `crossword/` — `Crossword` (recap/practice), `ChallengeCrossword` (the block capstone),
    `components/CrosswordBoard` (zoom/pan grid, German keyboard, left clue drawer),
    `crossword.ts` (build/layout), `generate.ts` (procedural generator).
  - `learn/` — the Learn (study new words) flow.
  - `types.ts` — `GameProps` (`onExit`, `onMain`, `onOpenSettings`, `onPractice`, `scope`).
- `src/state/` — all the logic, kept pure and React‑free where possible so it can be unit‑tested:
  - `types.ts` — `PlayerState` + `defaultPlayerState` + `STATE_VERSION`.
  - `storage.ts` — load/save to localStorage, merging saved state over defaults.
  - `PlayerContext.tsx` — React context exposing `state`, `now`, `recordLevel`, `recordChallenge`, etc.
  - `economyConfig.ts` (`ECONOMY`), `progressionConfig.ts` (`PROGRESSION`), `difficulty.ts`,
    `focus.ts` (focus/lives math), `progression.ts` (gating), `profile.ts`.
- `src/lib/array.ts` — `shuffle`, `sampleExcluding`.
- `src/index.css` — Tailwind layers + CSS variable mirror of the theme + component classes
  (`.card`, `.btn-primary`, `.tile`, …). `tailwind.config.js` is the source of truth for the palette and animations.

## Core concepts

### Theme (warm / calm / minimal)
Palette lives in `tailwind.config.js` (`page`, `sand`, `card`, `cream`, `line`,
`brown{DEFAULT,light,dark}`, `espresso`, `taupe`, `sage` = success, `terracotta` = error,
`ochre` = focus/energy, `given` = disabled). Mirrored as CSS vars in `index.css`. Display font
is **Fraunces** (serif), body is **Inter**. Animations (`pop-in`, `shake`, `slide-up`, `fade-in`,
`focus-drop`) are defined as keyframes in `tailwind.config.js`. Solid fills only — no gradients.

### Economy: lives vs focus (`economyConfig.ts`, `focus.ts`)
Two separate resources:
- **Lives** — 3 per level (`livesPerLevel`), shown as hearts in the in‑game HUD. Run out → lose the level.
- **Focus** — the meta energy, max 5 (`focusMax`), regenerates +1 / 20 min. Losing a level costs 1
  focus (`focusCostOnFail`); winning is free. You need ≥1 focus to start.

In games, the HUD shows **only the hearts** — the persistent focus dots were removed. When the
player loses all 3 lives, the "Out of lives" screen plays a short **`focus-drop`** animation of one
focus pip popping and fading, so the focus cost is felt without a permanent meter. `FocusPips` is
still used outside games (Home/Settings).

### Progression: block‑coverage gating (`progressionConfig.ts`, `progression.ts`)
`PROGRESSION = { wordsPerSet: 5, masteryThreshold: 2, setsPerBlock: 2 }`. A **block = 2 sets = 10
words**. The unlock flow per block:
1. Learn the 2 sets (10 words).
2. Complete **letter ciphers** until every block word has been covered, AND complete **grammar**
   drills until every new article rule is covered (either order). Each practice shows an X/Y
   progress indicator and locks when complete.
3. Complete the **crossword challenge** (the capstone — one generated puzzle using all the block's words, 3 lives).
4. The next sets unlock; repeat.

A completed practice locks with a "Practice is complete — go to Recap" message + button. Recap mode
replays learned material full‑pool without driving the gate.

### Strict word‑id gating
Content items carry `requires: string[]`. An item is eligible only when **all** of its `requires`
are in `learnedWords`. This is how puzzles are kept to words the player actually knows.

### Crossword specifics
- `generate.ts` — deterministic generator (seeded LCG), packs multiple components, only allows
  **perpendicular** crossings (a `cellDir` bitmask prevents collinear overlaps that broke numbering).
- `CrosswordBoard.tsx` — pinch‑zoom + drag‑pan grid, fit‑to‑width, German keyboard, sage = solved /
  terracotta shake = wrong. Clues are in a **floating left drawer** that slides out from the screen
  edge (inset top/bottom, rounded, no dim backdrop); a tiny edge nub opens it. Clues are **cryptic
  German by default with a DE/EN toggle**, sourced from `clues.ts`.

## Conventions

- **One phase / change at a time, commit each.** Keep changes scoped and verifiable.
- Keep logic in `src/state` pure and covered by `tests/content.invariants.mts` where possible.
- New vocab → make sure it's cipher‑ and grammar‑coverable for its block, and add a clue in
  `clues.ts`; the content tests will flag gaps.
- Match the existing visual language (tokens, serif display, calm spacing, solid fills).

## Curriculum: 2000‑lemma frequency vocabulary (migration in progress)

The vocabulary has moved from the old ~100 hand‑curated surface words to **~2000
German lemmas ordered by conversational (OpenSubtitles) frequency**, in
`src/content/lemmas.ts` (compact tab‑separated rows parsed at load; fields: id,
de, en, pos, order, rank, gender, plural, forms, tags, register). `vocab.ts` is
lemma‑backed (`VocabWord = Lemma`, Map lookups). It is **lemma‑based**: `sein`,
`gehen`, `Hund` are single units; conjugation/declension is taught by grammar,
not stored as separate words. (This supersedes the "three game modes" / per‑word
clue rules described above where they conflict.)

- **Grammar drills are GENERATED** from the noun lemmas (`grammarItems.ts`) — one
  der/die/das drill per noun. No hand‑authored grammar list.
- **Letter ciphers and recap crosswords are temporarily empty** (`cipherItems.ts`,
  `crosswords.ts`) while their generators are rebuilt. The live block gate is
  **mastery + grammar coverage** (`isBlockComplete`); cipher coverage + the
  crossword challenge rejoin the gate when their generators ship.
- Articles `der/die/das` are their own early entries glossed "the (masc./fem./neut.)".
- `STATE_VERSION` bumped (old saves reset). `tests/content.invariants.mts` now
  asserts lemma‑dataset + gating invariants.

## Planned: in‑game glossary & wiki (TODO — not built yet)

Designer idea to build later:

- A small **side menu/drawer on the RIGHT edge** of game screens (mirroring the
  crossword game's left clue drawer) that opens to show what abbreviations/terms
  mean, e.g. "masc. = masculine".
- Each term is **clickable** and opens an in‑game **wiki** page explaining the
  concept, with cross‑links to related pages.
- Example: tapping **masc.** opens an *Articles* page:
  > Every noun has a gender — **der** = masculine, **die** = feminine, **das** =
  > neuter. These are core building blocks for the biggest German grammar rules;
  > many words change their ending because of gender, such as **nouns** (link) and
  > **articles** (ein/eine) (link).
- Goal: learners look up grammar terms without leaving the game. Once it exists,
  glosses can safely use short abbreviations because the glossary explains them.

## Repo state notes

- The stale orphan / scratch files previously listed here have all been deleted — nothing left to clean.
- If the local `.git` history drifts from `main` (e.g. after Composio pushes that the dev machine
  hasn't pulled yet), realign git on the dev machine with `git fetch && git reset --hard origin/main`
  (or re‑clone). File contents track `main`.
