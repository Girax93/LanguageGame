# Language Games

A word-gated German learning game that runs **in the browser** and packages
for the **App Store** and **Google Play** from one codebase. Players acquire
vocabulary in **Learn**, which unlocks **Cipher** and **Grammar** puzzles built
only from words they already know. A lives + focus (energy) economy with
monetization hooks sits on top. All progress persists in `localStorage`.

- **React + Vite + TypeScript**, **Tailwind CSS**, **Capacitor** (iOS/Android).
- Modular: every mode is a `GameModule` in `src/games/`. The systems
  (economy, gating, difficulty) are pure, data-driven, and unit-tested.

---

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173).

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                  |
| `npm run build`     | Type-check + build the web app to `dist/`   |
| `npm run preview`   | Preview the production build                |
| `npm run typecheck` | Type-check only                             |

> Dependencies aren't committed — run `npm install` first. (It wasn't run in
> the environment that scaffolded this; the pure logic is unit-tested, but the
> React build should be run on your machine.)

### Reset progress

Progress lives in `localStorage` under `languagegames:player`. Clear it from
the browser, or call the `resetProgress()` action exposed by `usePlayer()`.

---

## The learn → play → unlock rhythm

Vocabulary is one ordered list, chunked into small **sets** of
`PROGRESSION.wordsPerSet` words (default 5). There is **one cumulative mastered
pool** that grows over time. Every word that can appear in a sentence — nouns,
verbs, adjectives **and** function words (der/die/das, ich, ist, und, …) — is a
learnable item in `src/content/vocab.ts`.

The loop (mirrors the phone prototype):

1. **Learn** the current set (shown on top of Home as *Words to learn* with a
   progress bar). Step 1.
2. When that set is mastered, **games unlock** (Step 2), built only from the
   words you know so far.
3. **Clear `PROGRESSION.gamesToAdvance` levels** (default 2) and the **next set
   unlocks** to learn. Repeat.

Because the pool grows each cycle, eligible sentences get longer and harder
automatically, old words keep recurring, and new words get drilled.

### Strict vocabulary gating (the important rule)

A cipher or grammar puzzle may **only** use words the player has already
mastered. Each item's required word-ids are **derived from its sentence**
(`src/content/derive.ts`) — every token must be a real vocab word or content
fails loudly — and an item is eligible **only when every required word is
mastered**. So a puzzle can never show a letter the player hasn't earned.
Difficulty (`level`, L1–L6) is derived from the deepest set among an item's
required words, so it scales with progression.

Gating math is pure and unit-tested in `src/state/progression.ts`
(`masteredSetCount`, `availableSetCount`, `currentLearnSetIndex`,
`modesUnlocked`, `gamesToNextSet`, `isItemEligible`, `wordsToStudy`).

## Modes

**Learn** (`src/games/learn/`) — vocabulary acquisition for the **current
set**. Recognition (de→en) and recall (en→de) checks; a word is *mastered*
after `PROGRESSION.masteryThreshold` (default 2) correct answers in a row.
Feeds the gate.

**Cipher** (`src/games/fill-in-the-blanks/`) — the number cryptogram. Sentences
are drawn only from learned packs and carry a difficulty level (below).

**Grammar** (`src/games/grammar/`) — German article-ending drill. The article
shows only its stem with the ending blank (`D_`, `EIN_`) and **no number**, so
the ending can't be deduced — you must recall the gender/case. Reuses the
cipher keyboard, feedback, and lives.

Add a mode by exporting a `GameModule` from `src/games/<mode>/index.ts` and
registering it in `src/games/registry.ts`.

---

## Difficulty curve (`src/state/difficulty.ts`)

Each cipher item has a `level`; levels are sets of flags, so the curve is
data-driven and easy to retune:

| Level | footholds | hideNumbersUntilAdjacent | neighborLock | greyUnusedKeys |
| ----- | --------- | ------------------------ | ------------ | -------------- |
| L1    | 2         | –                        | –            | yes            |
| L2    | 1         | –                        | –            | yes            |
| L3    | 0         | –                        | –            | yes            |
| L4    | 0         | **yes**                  | –            | yes            |
| L5    | 0         | –                        | **yes**      | yes            |
| L6    | 0         | –                        | –            | **no**         |

- **footholds** — most-frequent letters pre-revealed.
- **hideNumbersUntilAdjacent** — a slot's number stays hidden until it or a
  neighbor is solved (you earn the “same number = same letter” hint).
- **neighborLock** — a slot won't accept input until a neighbor is found
  (word-initial slots stay open so the puzzle is still solvable).
- **greyUnusedKeys** — when off (L6), the keyboard stops greying letters that
  aren't in play, so it no longer reveals which letters are used.

Retune by editing the `DIFFICULTY` table; no UI changes needed. (No timers in
the core path.)

---

## Economy (`src/state/economyConfig.ts`)

All numbers are centralized in `ECONOMY` — change them in one place:

| Setting             | Default      | Meaning                                   |
| ------------------- | ------------ | ----------------------------------------- |
| `livesPerLevel`     | `3`          | Wrong guesses allowed; 0 left = fail      |
| `focusMax`          | `5`          | Focus (energy) cap                        |
| `focusStart`        | `5`          | New-player focus                          |
| `focusRegenMs`      | `20 min`     | +1 focus every interval                   |
| `focusToStart`      | `1`          | Focus needed to start a level             |
| `focusCostOnWin`    | `0`          | Winning is free                           |
| `focusCostOnFail`   | `1`          | Failing costs focus                       |

Regen is computed from a stored `lastFocusRegenAt` timestamp, so it works
across reloads/offline. The math is pure in `src/state/focus.ts`
(`applyRegen`, `timeToNextFocusMs`, `canStartLevel`, `recordLevelResult`).

### Monetization hooks (STUBS — no real billing)

- **Refill** — `buyFocusRefill()` instantly fills focus.
- **Subscription** — `setSubscribed(true)` grants unlimited focus (bypasses
  all focus checks; never drains).

Wired to buttons on Home and the out-of-focus screen (`LevelStage`). Real
IAP / store billing would wrap these calls — search for `STUB` in
`src/state/focus.ts` and `economyConfig.ts`.

---

## Adding content

- **Words:** append to `ORDERED_WORDS` in `src/content/vocab.ts` (unique ids;
  nouns get a `gender`). Sets are formed automatically by `wordsPerSet`. Order
  matters — early words should be able to form a few sentences.
- **Cipher sentences:** add to `src/content/cipherItems.ts` (just `id`,
  `sentence`, `translation`). Required words and difficulty are **derived** —
  every word must already exist in vocab (a test enforces this).
- **Grammar drills:** add to `src/content/grammarItems.ts` (`before`, `stem`,
  `ending`, `after`, `gender`). Requirements/difficulty are derived too.

---

## Project layout

```
src/
  state/                 Pure systems + persistence + React context
    economyConfig.ts     ECONOMY (lives/focus/costs/IAP labels)
    progressionConfig.ts wordsPerSet, masteryThreshold, gamesToAdvance
    difficulty.ts        DIFFICULTY flags per level (L1–L6)
    types.ts             PlayerState + defaults
    focus.ts             pure focus/lives math
    progression.ts       pure gating/learning math
    storage.ts           versioned localStorage
    PlayerContext.tsx    provider + usePlayer() + regen tick
  content/
    vocab.ts             packs of words
    cipherItems.ts       cipher sentences (requires + level derived)
    grammarItems.ts      grammar drills (requires + level derived)
    derive.ts            requires/level derivation from sentence text
  components/ui/          Button, ProgressBar, Hearts, FocusMeter, …
  games/
    types.ts, registry.ts
    _shared/LevelStage.tsx   focus gate + lives + win/lose + IAP stubs
    learn/                   Learn mode
    fill-in-the-blanks/      Cipher (cipher.ts logic + CipherBoard + Keyboard)
    grammar/                 Grammar (grammar.ts logic + GrammarBoard)
  app/                   App shell + Home (progression screen)
```

The systems in `src/state/` and `cipher.ts` / `grammar.ts` are pure (no React)
and covered by unit tests.

---

## Building for the App Store & Google Play (Capacitor)

`capacitor.config.ts` is configured (`appId: net.aribenjamin.languagegames`,
`webDir: dist`). The web build runs unchanged in the browser.

```bash
npm install
npm run build            # -> dist/

npx cap add android      # one-time (Android Studio + JDK 17)
npx cap add ios          # one-time (macOS + Xcode + CocoaPods)

# after each change:
npm run build
npx cap sync
npx cap open ios         # Xcode -> Archive for the App Store
npx cap open android     # Android Studio -> signed AAB for Play
```

`ios/` and `android/` are generated locally and gitignored. Set a real bundle
id, signing, and icons before submitting. Real store billing (the focus
refill / subscription) would be added with a Capacitor IAP plugin wrapping the
stubs in `src/state/focus.ts`.

## Design / theme

Calm, warm, minimal (light mode). The theme is centralized so it's easy to
retune:

- **Palette** lives in `tailwind.config.js` (`theme.extend.colors`): `page`
  (#f1e9da cream), `sand` (insets/keys), `card` + `line` (panels/borders),
  `brown` (primary, with `light`/`dark`), `espresso`/`taupe` (text), and muted
  status colors `sage` (success), `terracotta` (error), `ochre` (focus/energy),
  `given` (disabled). Mirrored as CSS variables in `src/index.css`.
- **Fonts:** a refined serif (Fraunces, falling back to Palatino/Georgia) for
  display — headings, the big word in Learn, and the cipher/grammar letter
  tiles; **Inter** for body/UI. Set in `tailwind.config.js` + the font link in
  `index.html`.
- **Shared classes** in `src/index.css` (`@layer components`): `.card`,
  `.eyebrow`, `.btn-primary` (solid brown / cream text), `.btn-secondary`
  (outlined). Solid fills only — no gradients, glows, or heavy shadows.

To re-skin the app, edit the `colors` map (and fonts) in `tailwind.config.js`.

## Tech decisions

- **Pure, data-driven systems** — economy, gating, and difficulty are plain
  functions/config, unit-tested without a browser.
- **No router/animation/state libraries** — one context + Tailwind keeps the
  bundle small.
- **Multiple-choice in Learn; one-letter-at-a-time in puzzles** — both are
  mobile-friendly.

## License

Private / unpublished. Add a license before distributing.
