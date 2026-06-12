# Language Games

A growing collection of bite-sized language-learning games, built to run
**in the browser** and to be packaged for the **Apple App Store** and
**Google Play** from a single codebase.

The first game is **German Fill-in-the-Blanks**. The project is structured
so additional game types (crosswords, number fill-ins, gamified flashcards,
…) can be added later as independent modules.

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling and animations
- **Capacitor** for native iOS/Android packaging (web stays fully playable)

---

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173). That's the full
vertical slice — pick "Fill in the Blanks" and play.

Other scripts:

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the dev server with hot reload          |
| `npm run build`    | Type-check and build the production web app to `dist/` |
| `npm run preview`  | Preview the production build locally          |
| `npm run typecheck`| Type-check only                               |

> **Note:** dependencies are not committed. Run `npm install` first — it was
> not run in the environment that scaffolded this project.

---

## How to play

A German sentence appears with a missing word. Choose the correct word from
four options. You get immediate right/wrong feedback, a running **score**, and
a **streak** counter (your best streak is saved locally). Work through the set,
then see your results and play again. On desktop you can use keys **1–4** to
answer and **Enter** to advance.

---

## Adding content (new sentences)

All content for the first game lives in one easy-to-edit file:

```
src/games/fill-in-the-blanks/data/german-a1.ts
```

Each item is a plain object. Copy an existing one and edit the fields:

```ts
{
  id: 'de-a1-023',                 // must be unique
  sentence: 'Ich ___ ins Bett.',   // put ___ where the blank goes
  answer: 'gehe',                  // the word that fills the blank
  translation: 'I am going to bed.',
  hint: 'gehen — to go',           // optional
  options: ['gehe', 'gehst', 'geht', 'gehen'], // optional; auto-generated if omitted
  level: 'A1',
}
```

If you omit `options`, the game automatically picks plausible wrong answers
from the other items in the deck. Save the file and the new item appears
immediately in dev mode.

### Adding a whole new deck (e.g. A2, or another language)

1. Create a new file next to `german-a1.ts`, e.g. `german-a2.ts`, exporting a
   `FillBlankDeck` (same shape — `{ name, language, items }`).
2. Import and use it in `src/games/fill-in-the-blanks/FillInTheBlanks.tsx`
   (currently it imports `germanA1`). A deck picker can be added later.

---

## Adding a new game type (the series grows here)

Games are modular. Each one is a folder under `src/games/` that exports a
`GameModule` (see `src/games/types.ts`).

1. Create `src/games/<your-game>/` with a root component that accepts
   `GameProps` (`{ onExit }`).
2. Export a `GameModule` from that folder's `index.ts`:

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

3. Register it in `src/games/registry.ts` by adding it to the `games` array.

That's it — it shows up on the home screen automatically. (The registry
already contains `coming-soon` placeholders for Crossword, Number Fill-ins,
and Flashcards; flip one to `available` and add a `component` when ready.)

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
    fill-in-the-blanks/
      index.ts         GameModule definition
      FillInTheBlanks.tsx
      components/       Game-specific UI
      data/german-a1.ts  Editable content
  lib/                 Small helpers (shuffle, storage)
```

---

## Building for the App Store & Google Play (Capacitor)

The web build in `dist/` is wrapped by Capacitor into native iOS and Android
shells. The same code runs in the browser unchanged.

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
npm install @capacitor/android
npx cap add android

# iOS (requires macOS + Xcode + CocoaPods)
npm install @capacitor/ios
npx cap add ios
```

`@capacitor/ios` and `@capacitor/android` are already listed in
`package.json`, so `npm install` pulls them in; the `cap add` step scaffolds
the native projects.

### Each time you change the app

```bash
npm run build        # rebuild the web app into dist/
npx cap sync         # copy dist/ + plugins into the native projects
```

### Open / run the native apps

```bash
npx cap open ios       # opens Xcode      → run on a simulator/device, then Archive for the App Store
npx cap open android   # opens Android Studio → run, then build a signed AAB for Google Play
```

Convenience scripts are included: `npm run cap:add:ios`, `cap:add:android`,
`cap:sync`, `cap:open:ios`, `cap:open:android`.

### Requirements / notes

- **iOS:** a Mac with Xcode and an Apple Developer account; set a real
  `appId`, signing team, and app icons before submitting.
- **Android:** Android Studio with JDK 17; generate a signed release **AAB**
  for Play.
- App icons / splash screens can be generated with
  [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets).
- The viewport meta tag and CSS safe-area insets are already set so the UI
  sits correctly under notches/home indicators.

---

## Tech decisions

- **No router dependency** — navigation is a single piece of state in
  `App.tsx`. Easy to swap for React Router if deep linking is needed later.
- **Multiple-choice answers** rather than free-text — far better on mobile
  (no German keyboard / umlaut friction) while still teaching recall.
- **Local-only progress** (best streak via `localStorage`). No backend.
- **CSS/Tailwind animations** (no animation library) to keep the bundle small.

## License

Private / unpublished. Add a license before distributing.
