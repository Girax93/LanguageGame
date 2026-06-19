# CLAUDE.md — LanguageGame

Guidance for working on this codebase. Read this first.

## What this is

LanguageGame is a **calm, minimal German language‑learning web app** (mobile‑first). The
player learns small sets of words, then practises them through four game modes —
letter ciphers, grammar (article) drills, crosswords, and a Wordle‑style speller (Hurdle) — gated by a structured
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
  `ResetProgress` are screens; `routes.ts` defines routes. **Back is tree‑based:** a `PARENT` map +
  `pathTo()` mean the top‑left back button always goes to the menu the current page *belongs to*
  (a game → its Practice/Recap menu → German menu → …), never to a previously‑visited page or a game.
- `src/components/ui/` — shared kit: `Button`, `Hearts` (lives), `FocusPips` (focus dots, used
  outside games), `ProgressBar`, `TopBar`, `MenuScreen`, `icons`. `ConfirmDialog` is one level up.
- `src/content/` — the actual learning material:
  - `vocab.ts` — `SETS` of words (each word has an id, gender for nouns, `en`, filler/scaffold tags).
  - `cipherItems.ts` — sentence cryptograms; `grammarItems.ts` — article drills.
  - `crosswords.ts` — GENERATES one interlocking crossword per block from its leftover words (see Curriculum); `challenges.ts` — old per‑block challenge crossword (dormant/unwired).
  - `clues.ts` — `CLUES: Record<lemmaId, {de, en}>` (short parallel German + English DEFINITIONS, not literal glosses) and `clueFor(lemmaId, lang)`; authored for early‑block (0–20) crossword words, English‑gloss fallback beyond.
  - `hurdleItems.ts` — GENERATES the per‑block Hurdle word list (`hurdleItemsForBlock`, up to 3 of the block's spellable words) + `HURDLE_ITEMS` flat pool for Recap.
  - `derive.ts` — helpers that derive data from the sets.
- `src/games/` — one folder per mode, each exposes a default game component via `registry.ts`:
  - `_shared/LevelStage.tsx` — the shared focus‑gated level flow (owns lives, win/lose screens,
    `renderBoard` / `onWin` / `renderWin`, plus optional `livesForItem` / `renderHud` / `loseTitle` /
    `renderLoseExtra` for variable‑tries games like Hurdle). All games render their board through this.
  - `fill-in-the-blanks/` — letter‑cipher game (`cipher.ts`, `CipherBoard`, German `Keyboard`).
  - `grammar/` — article drill (`grammar.ts`, `GrammarBoard`).
  - `crossword/` — `Crossword` (recap/practice), `ChallengeCrossword` (the block capstone),
    `components/CrosswordBoard` (zoom/pan grid, German keyboard, left clue drawer),
    `crossword.ts` (build/layout), `generate.ts` (procedural generator).
  - `hurdle/` — Wordle‑style speller: `hurdle.ts` (pure `triesFor` / `scoreGuess` / `keyHints`),
    `Hurdle.tsx` (practice/recap shell), `components/HurdleBoard` + `HurdleKeyboard` (QWERTZ + Enter/⌫).
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
still used outside games (Home/Settings). **Hurdle is the exception:** it replaces the hearts with
its grid of **tries** (`triesFor(word) = max(5, letters+3)`, no cap) via `LevelStage`'s
`livesForItem`/`renderHud` hooks; running out of tries still costs 1 focus like any level loss.

### Progression: learn → practice → advance gating (`progressionConfig.ts`, `progression.ts`)
`PROGRESSION = { wordsPerSet: 5, masteryThreshold: 2, setsPerBlock: 2, practiceRounds: 3,
recapIntervalMs: 24*60*60*1000 }`. A **block = 2 sets = 10 words**. The cycle is **LEARN →
PRACTICE → ADVANCE**, one block at a time:
1. **Learn** the 2 sets (10 words) — each word masters at `masteryThreshold` (2) correct in a row.
2. **Practice** the block: complete `practiceRounds` (3) grammar drills. Progress is a per‑block
   count in `state.practiceCounts`, shown as **X/3**; partial progress persists. The session is
   `practiceNounsForBlock`, which pads with the most‑recently‑learned nouns so even noun‑sparse
   blocks still gate.
3. **Advance:** the next sets unlock. Finishing a block's practice shows a **"Block complete!"**
   screen with two buttons — **Learn more words** (→ next set) and **Recap** (→ recap mode).

The Practice session has **four gating parts** (see Curriculum below): the grammar drills above
(`practiceCounts`, X/3), the **generated letter‑cipher session** (`cipherCounts`), the
**generated block crossword** (`crosswordCounts`, one puzzle over the cipher's leftover words), and
the **Hurdle session** (`hurdleCounts`, up to 3 of the block's words spelled Wordle‑style). So
`isBlockComplete = isBlockLearned && blockPracticeDone && cipherSessionDone && crosswordSessionDone &&
hurdleSessionDone`. Recap mode replays learned material full‑pool without driving the gate.

**Forced daily recap.** Every `recapIntervalMs` (24h), once ≥2 sets are mastered, `recapDue` fires
and **locks Learn / Practice / Recap** until the player finishes a recap (`recordRecapDone` stamps
`state.lastRecapAt`). The Daily Recap screen runs a bounded **grammar** review (game `scope:
'daily'`) today, with Letter Cipher + Crossword shown as **"Soon"** placeholders. A dev button
**"🔧 Dev: trigger daily recap"** on the German menu (`forceRecapDue`) forces it without waiting.

**Dev Skip.** Every learn/exercise card shows a small **Skip ⏭** button (`SkipButton`, exported from
`_shared/LevelStage.tsx`) that clears the round as a success. Boards render it directly above their
keyboard so it never overlaps a key; Learn puts it in its header. Testing aid only — leave it in
until the content pipeline is complete.

### Strict word‑id gating
Content items carry `requires: string[]`. An item is eligible only when **all** of its `requires`
are in `learnedWords`. This is how puzzles are kept to words the player actually knows.

### Crossword specifics
- `Crossword.tsx` is the **bounded per‑block Practice game** (`scope:'practice'`, frozen block,
  `recordCrosswordRound`, Block‑complete done‑screen) and also a free Recap pool (`scope:'recap'`,
  the `CROSSWORDS` flat list). It's the third gate part (see Curriculum).
- `generate.ts` — deterministic generator (seeded LCG), packs multiple components, only allows
  **perpendicular** crossings (a `cellDir` bitmask prevents collinear overlaps that broke numbering).
- `CrosswordBoard.tsx` — pinch‑zoom + drag‑pan grid, fit‑to‑width, German keyboard, sage = solved /
  terracotta shake = wrong, plus the dev **Skip** button above the keyboard. Clues are in a
  **floating left drawer** that slides out from the screen edge (inset top/bottom, rounded, no dim
  backdrop); a tiny edge nub opens it. Clues are **German DEFINITIONS by default with a DE/EN
  toggle** (`clueFor`, sourced from `clues.ts`) — not the literal translation.

### Hurdle specifics
- `Hurdle.tsx` is the **bounded per‑block Practice game** (`scope:'practice'`, frozen block,
  `recordHurdleRound`, Block‑complete done‑screen) and a free Recap pool (`scope:'recap'`,
  `HURDLE_ITEMS` — any learned word). It's the **fourth gate part** (see Curriculum).
- One word per puzzle: the clue is the word's **English meaning**, the player spells the **German**
  word. Tries scale with length — `triesFor(answer) = max(5, letters+3)`, **no cap** (Ari's call) —
  replacing hearts via `LevelStage`'s `livesForItem`/`renderHud`; the lose screen reveals the word
  (`renderLoseExtra`).
- `hurdle.ts` is pure + tested: `scoreGuess` is standard Wordle scoring **with duplicate‑letter
  handling** (a guessed letter never claims more copies than the answer has), `keyHints` aggregates
  the best state per key (correct > present > absent). Ä/Ö/Ü/ß are single letters (`toUpperDE`).
- `HurdleBoard.tsx` — fit‑to‑width tile grid + `HurdleKeyboard` (QWERTZ with Enter/Backspace,
  colored by `keyHints`), hardware‑keyboard support, and the dev **Skip** button above the keyboard.

## Conventions

- **One phase / change at a time, commit each.** Keep changes scoped and verifiable.
- Keep logic in `src/state` pure and covered by `tests/content.invariants.mts` where possible.
- New vocab → make sure it's cipher‑ and grammar‑coverable for its block, and add a clue in
  `clues.ts`; the content tests will flag gaps.
- Match the existing visual language (tokens, serif display, calm spacing, solid fills).

## Curriculum: 2000‑lemma frequency vocabulary (shipped)

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
- **Letter ciphers are GENERATED** from the lemmas (`generateCipher.ts` → `cipherItems.ts`). Per
  block we generate a few **individually sensible** sentences (`cipherItemsForBlock` /
  `cipherRoundsForBlock`, capped at `MAX_SENTENCES = 4`). The generator only emits provably‑correct
  constructions (nominative article+noun, predicate adjectives, `sein` + 3rd‑person‑singular verbs
  from `forms[0]`, locative/PP predicates, questions) and only joins **two complete, valid clauses**
  with a conjunction — "Der Mann ist gut **und** die Frau ist schön." (und) or "… **aber** … nicht
  …" (a real contrast). NO noun‑list enumeration and NO chaining of unrelated clauses (both read as
  non‑sequiturs — Ari flagged these). **Predicate adjectives must fit their subject**
  (`ADJ_PERSON_ONLY` / `ADJ_ABSTRACT_ONLY`, everything else universal): a person is never "klar", a
  thing never "müde", and abstract adjectives (richtig/klar/wahr/…) appear only as "Das ist klar."
  — never on a noun. Cipher no longer forces 100% coverage: it makes ~3 good sentences covering
  ~6/10 of a block's new words; **whatever it can't place naturally is left to the crossword**.
- **Crossword is GENERATED per block** (`crosswords.ts`): it picks up the block's **leftover words**
  the cipher didn't cover (mostly short function words) and pads them with the block's nouns so they
  interlock into one real grid of 4–8 words (`crosswordWordsForBlock` / `crosswordItemsForBlock`,
  built via `generate.ts` + `buildCrossword`). Clues come from `clueFor` (DE+EN definitions). Once
  prepositions move into Grammar (planned), they'll drop out of the crossword pool automatically.
- **Hurdle is GENERATED per block** (`hurdleItems.ts`): it takes up to 3 of the block's own spellable
  words (`hurdleWordsForBlock`/`hurdleItemsForBlock`, single token of ≥2 German letters) for the
  bounded Practice session; `HURDLE_ITEMS` is the flat pool (any learned word) for Recap. Each puzzle
  is one word guessed Wordle‑style from its English meaning.
- **The per‑block gate requires ALL FOUR Practice games**: grammar drills (`blockPracticeDone`,
  X/3) + cipher session (`cipherSessionDone`, `state.cipherCounts`) + the block crossword
  (`crosswordSessionDone`, `state.crosswordCounts`, one puzzle) + the Hurdle session
  (`hurdleSessionDone`, `state.hurdleCounts`, up to 3 words). So `isBlockComplete = isBlockLearned
  && blockPracticeDone && cipherSessionDone && crosswordSessionDone && hurdleSessionDone`. App's
  Practice menu shows all four with a combined X/total; each game's done‑screen branches on
  `isBlockComplete` (only offers "Learn more words" when ALL four are done, else "Back to Practice").
- Articles `der/die/das` are their own early entries glossed "the (masc./fem./neut.)".
- `STATE_VERSION = 9` (old saves reset). `tests/content.invariants.mts` asserts the lemma‑dataset
  + gating invariants — sets/lookups, generated grammar drills, generated **cipher** coverage
  (1..4 sensible sentences/block; requires real + eligible; unique ids; avg ≥5/10), generated
  **crossword** (every block's puzzle places all its chosen words with no letter conflicts; eligible
  requires; round count 0/1), **crossword clues** (every early‑block (0–20) crossword word has a
  real DE+EN clue that isn't the literal answer), generated **Hurdle** (tries `max(5, len+3)` no cap;
  `scoreGuess` incl. duplicate handling; every block has 1..3 spellable in‑block words), the per‑block
  Practice gate (grammar + cipher + crossword + Hurdle), and the daily recap (`recapDue`/`lastRecapAt`).

## Planned next (agreed with Ari, not built yet)

- **Prepositions into Grammar.** Group prepositions (mit/auf/aus/um/für/von…) into a Grammar lesson
  that teaches their case‑government rules. This also shrinks the crossword leftover pool: the
  crossword takes "block words the cipher didn't cover", so once Grammar covers prepositions, wire a
  grammar‑coverage subtraction into `crosswordWordsForBlock` and they drop out automatically.
- **"Hurdle" game — ✅ SHIPPED** (was here). Built as a gating 4th Practice game + free Recap; see
  "Hurdle specifics" and the Curriculum gate above. Possible follow‑up: a dedicated entry point to
  drill ONE specific blocking lemma on demand (the current Hurdle cycles a block/pool, not a chosen word).
- Possible cipher follow‑up: declarative `oder` is intentionally excluded (reads oddly) — it could
  return inside a question frame ("Ist das der Mann oder das Kind?").

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
