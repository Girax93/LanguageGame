# Running & testing LanguageGame for real

This turns the code into the actual playable React app and gets it onto your
phone and any other device. Work top to bottom — you only do step 0 once.

> Why you have to run these (not me): my sandbox blocks the npm download
> servers and outside network, so installing, building, and deploying have to
> happen on your own computer. Everything below is copy‑paste simple.

---

## 0. One‑time: install Node.js

1. Go to https://nodejs.org and download the **LTS** version. Install it
   (just click through).
2. This gives you the `npm` command used below.
3. Check it worked: open a terminal and type `node -v` — you should see a
   version number.

**Opening a terminal in the project folder (Windows):**
- Open File Explorer to `…\Documents\00_Coding\LanguageGame`
- Click the address bar, type `powershell`, press Enter.
  (Or right‑click inside the folder → "Open in Terminal".)

---

## 1. Run the real game on your computer

In that terminal, in the `LanguageGame` folder:

```
npm install        (first time only — downloads dependencies, ~1–2 min)
npm run dev
```

Open the **Local** link it prints (usually http://localhost:5173) in your
browser. That's the real game. Leave the terminal running while you play;
press `Ctrl + C` to stop it.

---

## 2. Test on your phone over the same Wi‑Fi  (quickest)

When `npm run dev` is running it also prints a **Network** link like
`http://192.168.1.23:5173`.

1. Put your phone on the **same Wi‑Fi** as your computer.
2. Type that Network link into your phone's browser.
3. If it won't connect, Windows may pop up a firewall prompt for Node —
   choose **Private networks → Allow**.

Caveat: only works on your home network, and your computer must be running
`npm run dev`.

---

## 3. Put it online so ALL devices can reach it (a real link, anywhere)

Pick ONE of these.

### 3A. Fastest — Netlify Drop (no git needed)
1. In the terminal: `npm run build`  → this creates a `dist` folder.
2. Go to https://app.netlify.com/drop
3. Drag the **`dist`** folder onto that page.
4. You get a public link like `https://your‑game.netlify.app` — open it on
   any phone, tablet, or computer.
5. To update later: run `npm run build` again and drag `dist` in again.

### 3B. Best for ongoing development — GitHub + Vercel (auto‑updates)
The project is already a git repo, so you get a link that refreshes every time
you change the code.
1. Make a free account at https://github.com and create a new empty
   repository (e.g. `language-game`).
2. Connect your local project to it and push. (Ask me and I'll give you the
   exact 3 commands for your repo.)
3. Go to https://vercel.com, sign in with GitHub, **Add New → Project**,
   import the repo. Settings: Framework = Vite, Build = `npm run build`,
   Output = `dist`. Click **Deploy**.
4. You get a permanent link like `https://language-game.vercel.app`.
5. From then on: change code → `git push` → the link auto‑updates in ~30s.
   Test on any device.

---

## 4. Want to edit AND run from any device (incl. phone)?

Editing this kind of project on a phone keyboard is rough, but you can use a
browser‑based dev environment so you don't need anything installed:
- **StackBlitz** (https://stackblitz.com) — import your GitHub repo; it runs
  the real app in the browser and gives a preview URL you can open on your
  phone. Great for small content edits.
- **GitHub Codespaces** — a full cloud editor + preview, launched from your
  repo.

---

## Good to know

- **Progress is per‑device.** Learned words, focus, and Pro are saved in each
  browser's local storage, so every device/browser starts fresh.
- **Editing content** (no coding needed): words in
  `src/content/vocab.ts`, cipher sentences in `src/content/cipherItems.ts`,
  grammar drills in `src/content/grammarItems.ts`. Save and the dev server (or
  deployed site after a rebuild) updates.
- **It's also App‑Store ready** later via Capacitor — see the main `README.md`
  ("Building for the App Store & Google Play").

---

## Recommended order for you

1. Do **0 → 1** (get it running on your computer).
2. Do **3A (Netlify Drop)** to get a link on your phone in ~5 minutes.
3. When you want a smooth develop loop, set up **3B (GitHub + Vercel)** once —
   after that it's just `git push`.

Stuck on any step? Tell me where and I'll walk you through it.
