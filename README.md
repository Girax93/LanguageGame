# Language Games

A growing collection of bite-sized language-learning games, built to run
**in the browser** and to be packaged for the **Apple App Store** and
**Google Play** from a single codebase.

The first game is a German **Letter Cipher** (cryptogram). The project is
structured so additional game types (crosswords, number fill-ins, gamified
flashcards, …) can be added later as independent modules.

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling and animations
- **Capacitor** for native iOS/Android packaging (web stays fully playable)

---

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173) and pick
"Letter Cipher".

| Command             | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Start the dev server with hot reload                   |
| `npm run build`     | Type-check and build the production web app to `dist/` |
| `npm run preview`   | Preview the production build locally                   |
| `npm run typecheck` | Type-check only                                        |

> **Note:** dependencies are not committed. Run `npm install` first — it was
> not run in the environment that scaffolded this project.

---

## The game: Letter Cipher (cryptogram)

Each puzzle is a German sentence or proverb shown as a row of letter slots —
one slot per letter, with spaces between words and punctuation shown as-is.
Under every slot is a **number**.

- Each distinct letter maps to a unique number, assigned freshly per puzzle
  (e.g. O = 5, M = 19). The **same letter always shows the same number**, so
  cracking one letter reveals where it goes everywhere else.
- A couple of the most frequent letters start **pre-revealed** as footholds,
  shown in a distinct "given" style.
- A full **German on-screen keyboard** sits at the bottom — the alphabet plus
  **ä, ö, ü and ß** as their own keys.

**How you play (one letter at a time):** tap an empty slot to select it, then
tap a keyboard letter. Correct → that single slot fills green and selection
jumps to the next empty slot. Wrong → a brief red shake, nothing fills.
(Filling *all* matching slots at once is intentionally **not** done — that's
reserved as a future Pro feature; the code is structured to add it later.)

**Keyboard colours:**

- **Grey / disabled** — no empty slots need that letter (it's not in the
  puzzle, or every slot for it is already filled).
- **Green / active** — the letter has been discovered and still has empty
  slots to fill.
- **Neutral** — the letter is in the puzzle and undiscovered.

A free **Show translation** toggle reveals the English meaning (off by
default). Solve every slot to win, then advance to the next puzzle. On
desktop you can also type on your physical keyboard; press **Enter** to
advance after solving.

> **German case note:** the engine uppercases text but keeps **ß** as a single
> letter (plain `"ß".toUpperCase()` returns `"SS"` in JavaScript, which would
> be wrong here). See `toUpperDE` in `cipher.ts`.

---

## Adding content (new sentences)

All content lives in one easy-to-edit file:

```
src/games/fill-in-the-blanks/data/german-a1.ts
```

Each item is a plain object — copy one and edit:

```ts
{
  id: 'de-a1-013',                 // must be unique
  sentence: 'Ich heiße Anna.',     // natural case; ä ö ü ß welcome
  translation: 'My name is Anna.', // shown only when the hint is toggled on
  level: 'A1',
}
```

Punctuation is shown as-is and isn't part of the cipher. Shorter sentences
make easier puzzles. Save the file and it appears immediately in dev mode.

### Adding a whole new deck (A2, another language, …)

1. Create a file next to `german-a1.ts` exporting a `CipherDeck`
   (`{ name, language, items }`).
2. Import it in `src/games/fill-in-the-blanks/FillInTheBlanks.tsx` (a deck
   picker can be added later).

---

## Adding a new game type (the series grows here)

Games are modular. Each is a folder under `src/games/` that exports a
`GameModule` (see `src/games/types.ts`).

1. Create `src/games/<your-game>/` with a root component that accepts
   `GameProps` (`{ onExit }`).
2. Export a `GameModule` from its `index.ts`:

   ```ts
   export const myGame: GameModule = {
     id: 'my-game',
     title: 'My Game',
     subtitle: 'Short tagline',
     description: 'One sentence about it.',
     icon: '🎯',
     accent: 'from-rose-500 to-orange-500',
     status: 'available',
     component: MyGameComponent,
   };
   ```

3. Register it in `src/games/registry.ts`.

It then appears on the home screen automatically. The registry already has
`coming-soon` placeholders for Crossword, Number Fill-ins and Flashcards —
flip one to `available` and add a `component` when ready.

### Project layout

```
src/
  app/                 App shell + home screen (game picker)
    App.tsx            Lightweight state-based router
    Home.tsx           Renders the game cards from the registry
  components/ui/        Shared UI primitives (Button, ProgressBar, …)
  games/
    types.ts           GameModule / GameProps contracts
    registry.ts        The list of all games
    fill-in-the-blanks/  (the Letter Cipher module)
      index.ts         GameModule definition
      FillInTheBlanks.tsx   Deck flow (order, progress, results)
      cipher.ts        Pure cipher logic (case/ß, numbering, givens, key state)
      components/      CipherBoard, Keyboard, Results
      data/german-a1.ts     Editable content
  lib/                 Small helpers (shuffle, storage)
```

The puzzle logic in `cipher.ts` is pure (no React) and unit-testable.

---

## Building for the App Store & Google Play (Capacitor)

The web build in `dist/` is wrapped by Capacitor into native iOS and Android
shells; the same code runs unchanged in the browser.

`capacitor.config.ts` is already configured:

```ts
appId:   'net.aribenjamin.languagegames'   // change to your real bundle id
appName: 'Language Games'
webDir:  'dist'
```

### One-time: add the native platforms

The `ios/` and `android/` folders are generated locally (they're gitignored).

```bash
npm install
npm run build                 # produces dist/

# Android (requires Android Studio + JDK 17)
npx cap add android

# iOS (requires macOS + Xcode + CocoaPods)
npx cap add ios
```

`@capacitor/ios` and `@capacitor/android` are already in `package.json`, so
`npm install` pulls them in; `cap add` scaffolds the native projects.

### Each time you change the app

```bash
npm run build        # rebuild the web app into dist/
npx cap sync         # copy dist/ + plugins into the native projects
```

### Open / run the native apps

```bash
npx cap open ios       # Xcode → run on a simulator/device, then Archive for the App Store
npx cap open android   # Android Studio → run, then build a signed AAB for Google Play
```

Convenience scripts: `npm run cap:add:ios`, `cap:add:android`, `cap:sync`,
`cap:open:ios`, `cap:open:android`.

### Requirements / notes

- **iOS:** a Mac with Xcode and an Apple Developer account; set a real
  `appId`, signing team and app icons before submitting.
- **Android:** Android Studio with JDK 17; generate a signed release **AAB**.
- App icons / splash screens: [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets).
- Viewport meta and CSS safe-area insets are already set so the UI sits
  correctly under notches/home indicators.

---

## Tech decisions

- **No router dependency** — navigation is one piece of state in `App.tsx`.
- **One-at-a-time reveals** — auto-fill-all is deliberately omitted and kept
  as a future Pro feature; `cipher.ts` already exposes the primitives for it.
- **Pure cipher logic** in `cipher.ts`, separate from the React UI.
- **CSS/Tailwind animations** (no animation library) to keep the bundle small.

## License

Private / unpublished. Add a license before distributing.
