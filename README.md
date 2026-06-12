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

## The progression spine (word-gating)

Vocabulary is split into **packs** of ~20 words (`src/content/vocab.ts`). Ship:
Pack 1 (20 words) + a partial Pack 2 (8 words) to demo unlocking.

1. A new player starts in **Learn** and must acquire **all of Pack 1** before
   anything else opens.
2. Finishing Pack 1 unlocks **Cipher** and **Grammar**. Their content is tagged
   with a pack and only appears once that pack is fully learned — so a puzzle
   never shows a word you haven't met, guaranteeing repetition before new load.
3. Winning Cipher/Grammar levels unlocks the **next pack** to learn (default: 2
   wins per pack), which unlocks more — and harder — puzzles.

The Home screen shows packs, what's learned, what's unlocked next, your focus,
and subscription state.

Gating math is pure and in `src/state/progression.ts`
(`completedPackCount`, `availablePackCount`, `modesUnlocked`, `isItemEligible`,
`recordWordAnswer`, `wordsToStudy`).

---

## Modes

**Learn** (`src/games/learn/`) — vocabulary acquisition. Recognition (de→en)
and recall (en→de) checks; a word is marked *learned* after
`PROGRESSION.learnThreshold` (default 2) correct answers in a row. Feeds the gate.

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

- **Words:** add to a pack's `words` in `src/content/vocab.ts` (unique ids;
  give nouns a `gender`). Add a pack with the next `pack` number.
- **Cipher sentences:** add to `src/content/cipherItems.ts` with `pack` +
  `level`. Use only words from that pack or earlier (a test enforces this).
- **Grammar drills:** add to `src/content/grammarItems.ts` (`before`, `stem`,
  `ending`, `after`, `gender`, `pack`, `level`).

---

## Project layout

```
src/
  state/                 Pure systems + persistence + React context
    economyConfig.ts     ECONOMY (lives/focus/costs/IAP labels)
    progressionConfig.ts learnThreshold, unlockWinsPerPack
    difficulty.ts        DIFFICULTY flags per level (L1–L6)
    types.ts             PlayerState + defaults
    focus.ts             pure focus/lives math
    progression.ts       pure gating/learning math
    storage.ts           versioned localStorage
    PlayerContext.tsx    provider + usePlayer() + regen tick
  content/
    vocab.ts             packs of words
    cipherItems.ts       cipher sentences (pack + level)
    grammarItems.ts      grammar drills (pack + level)
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

## Tech decisions

- **Pure, data-driven systems** — economy, gating, and difficulty are plain
  functions/config, unit-tested without a browser.
- **No router/animation/state libraries** — one context + Tailwind keeps the
  bundle small.
- **Multiple-choice in Learn; one-letter-at-a-time in puzzles** — both are
  mobile-friendly.

## License

Private / unpublished. Add a license before distributing.
