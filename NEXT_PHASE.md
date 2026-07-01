# NEXT_PHASE.md — LanguageGame roadmap

The agreed next body of work, broken into **self-contained phases**. Each phase is
sized to be **one work session = one commit = one Vercel deploy**, so a fresh chat can
pick up a single phase, ship it, and stop without holding the whole plan in its head.

Approved by Ari (2026‑06‑23). Audio is intentionally deferred to **Phase 5** (future) —
see the reasoning there (it waits on a "Developer Voice" recording flow). Everything
else (menu refresh, Learn engagement, spaced repetition, grammar progression + guides)
is greenlit to build.

---

## How to run a session against this doc

1. **Read `CLAUDE.md` first**, then this file, then the "Touch points" files for the
   phase you're doing. Don't re-derive the design — it's captured below.
2. **Do exactly one phase** (or one labelled sub‑step of Phase 4). Resist scope creep.
3. **Keep `src/state` logic pure** and extend the content tests
   (`tests/content.invariants.mts` for German, `tests/content.no.mts` for Norwegian).
   Run them in the sandbox before pushing (command in `CLAUDE.md` → Commands).
4. **Push via Composio** (`GITHUB_COMMIT_MULTIPLE_FILES`, owner `Girax93`, repo
   `LanguageGame`, branch `main`) — only the files you changed. Then **verify the deploy**
   (see `CLAUDE.md` → "Verifying Vercel deploys"). If the build fails, ask Ari for the
   Vercel error email rather than guessing.
5. **State‑version bumps reset saves** — that's acceptable here (the app already resets on
   version change). Bump `STATE_VERSION` in `src/state/types.ts` whenever a phase adds
   `PlayerState` fields.

## Recommended build order

| # | Phase | Why here | Risk | State bump |
|---|-------|----------|------|------------|
| 1 | Menu & shell refresh | Pure UI, big visible win, warms up cheaply | Low | No |
| 2 | Learn: formats + distractors + reward | Builds on existing keyboards; mostly content/UI | Med | No |
| 3 | Spaced repetition + daily‑recap upgrade | Isolated state/logic; testable in pure functions | Med | Yes |
| 4 | Grammar progression engine + guides + glossary | Largest; reuses the intro/guide pattern from P2 | High | Yes |
| 5 | Audio & "Developer Voice" (future) | Deferred until structure is in place | — | Yes |

Rationale: ship the low‑risk visible change first, end with the biggest. Each phase
deploys independently, so progress is always testable on the phone.

---

## Phase 1 — Menu & shell refresh

**Goal:** make the menus feel clean, designed, and inviting — hierarchy + identity, not a
flat list of equal cards. No gameplay/logic change.

**Depends on:** nothing.

**Scope**
- [ ] **Replace emoji with a coherent line‑icon set** in `brown` (extend
      `src/components/ui/icons.tsx`). Keep flag emoji for languages. Remove emoji from
      `mainItems`, `langMenuItems`, `practiceItems`, `recapItems` in `App.tsx` and let
      `MenuItem.icon` take an icon component/name instead of an emoji string.
- [ ] **Home hero + "Continue" CTA.** New top of the main screen: a warm greeting + one
      prominent card that resumes the next real action (Learn / Practice / Daily Recap),
      computed from the same progression helpers `App.tsx` already calls.
- [ ] **Demote utilities.** Statistics / Store / Settings move to a small secondary row,
      not full‑weight cards.
- [ ] **Featured‑card variant.** Add a `card-primary` style (full border in `ochre`,
      slightly larger) in `index.css`; give `MenuItem`/`Card` an `emphasis` flag.
- [ ] **Header band with identity** + streak + words‑learned (data already in
      `state.learnedWords`; streak is a small new derived/stored value — keep it simple,
      e.g. consecutive days with any activity).
- [ ] **Per‑language progress** on the two language cards ("German · 120 words · A1").
- [ ] **Friendlier locked states:** a lock icon + "Unlocks when…" line instead of just
      dimming to 60%.
- [ ] **Move the dev button out of production** — gate `🔧 Dev: trigger daily recap`
      behind a dev flag (e.g. `import.meta.env.DEV`), don't ship it in `langMenuItems`.
- [ ] **Entrance polish:** stagger cards with the existing `slide-up` / `fade-in`.

**Touch points:** `src/app/App.tsx`, `src/components/ui/MenuScreen.tsx`,
`src/components/ui/TopBar.tsx`, `src/components/ui/icons.tsx`, `src/index.css`,
`tailwind.config.js` (only if a token is missing). Possibly a new `Home`/hero component.

**State changes:** optional tiny streak field (else derive). No gating change.

**Tests:** none required (presentational) — verify the production build + eyeball on phone.

**Done when:** the home screen has one clear primary action, no emoji, a sense of identity,
and Store/Settings/Stats are visibly secondary.

---

## Phase 2 — Learn: exercise variety, smart distractors, reward

**Goal:** kill the monotony of the fixed three‑beat loop (read → DE→EN MC → EN→DE MC).
Recall over recognition; plausible choices; a little momentum. (Audio hooks are **stubbed**
here, wired in Phase 5.)

**Depends on:** Phase 1 (shares the icon set + card styles). Not strictly required but tidier.

**Scope**
- [ ] **Exercise‑type framework** in `src/games/learn/`: a small registry of micro‑exercise
      renderers behind one `Step` interface, chosen per word by type + familiarity.
      Formats to ship (reuse existing pieces):
  - [ ] Recognition MC, both directions (exists — fold into the framework).
  - [ ] **Production typing / tile‑build** — reuse `fill-in-the-blanks/components/Keyboard`
        or the Hurdle board.
  - [ ] **Tap‑the‑pairs** matching (4 DE ↔ 4 EN at once).
  - [ ] **Scrambled letters** (anagram of the word).
  - [ ] **Gender tap** for nouns (der/die/das), color‑coded.
- [ ] **Smarter distractors.** Replace `distractors()` pulling from the global
      `ALL_WORDS` with a pool filtered to same set / same `pos` / same `gender` / similar
      length. Put the selection in a pure helper so it's testable.
- [ ] **Active intro card.** Replace the passive "New word → Next" with: gender shown as
      color, a one‑line example sentence built from already‑known words (reuse the cipher
      generator), the topic tag, and a **disabled speaker button placeholder** (Phase 5).
- [ ] **Momentum + payoff.** In‑set combo counter; a richer, still‑calm "set complete"
      moment (words‑learned tally + a gentle animation). Optional XP toward the level
      already tracked.
- [ ] **Optional:** a "quick 5 vs full set" / "new vs review" choice at session start.

**Touch points:** `src/games/learn/Learn.tsx` (refactor into framework + new components),
`src/content/vocab.ts` / `src/content/derive.ts` (distractor pools, example‑sentence helper),
reuse `src/games/fill-in-the-blanks/components/Keyboard.tsx` and
`src/games/hurdle/components/*`.

**State changes:** none required (combo is in‑session). XP/level only if you choose to add it.

**Tests:** add pure‑function tests for distractor selection (right count, never matches the
answer, respects same‑set/pos/gender filters) to `tests/content.invariants.mts`.

**Done when:** a learn session rotates through ≥3 formats with believable distractors and a
satisfying set‑complete moment, and the intro is interactive.

---

## Phase 3 — Spaced repetition + daily‑recap upgrade

**Goal:** replace "2‑in‑a‑row → done forever (until daily recap)" with lightweight SRS so
misses resurface and known words return at widening intervals — and feed the daily recap a
real due‑queue.

**Depends on:** Phase 2 (the formats become the review surface).

**Scope**
- [ ] **Pure SRS module** `src/state/srs.ts`: per‑word scheduling (ease/interval/next‑due),
      `review(word, correct, now)`, `dueWords(state, now)`. Keep it React‑free + tested.
- [ ] **Integrate into Learn:** mastery still unlocks the set, but reviews are scheduled;
      a missed word re‑enters the near‑term queue.
- [ ] **Upgrade the daily recap** (`recapDue` / `lastRecapAt` already exist) to pull the
      SRS due‑queue instead of a flat shuffle, mixing the games (`scope: 'daily'`).
- [ ] **State + migration:** add scheduling fields to `PlayerState`
      (`src/state/types.ts`), merge in `storage.ts`, bump `STATE_VERSION`.

**Touch points:** `src/state/types.ts`, `src/state/storage.ts`,
`src/state/PlayerContext.tsx`, new `src/state/srs.ts`, `src/state/progression.ts`
(daily‑recap selection), `src/games/learn/Learn.tsx`, the daily‑recap wiring in `App.tsx`.

**State changes:** yes — new per‑word schedule, `STATE_VERSION` bump.

**Tests:** SRS scheduling math in `tests/content.invariants.mts` (interval growth on
success, reset/shorten on miss, due‑queue ordering).

**Done when:** missed words come back sooner, mastered words space out, and the daily recap
is driven by what's actually due.

---

## Phase 4 — Grammar progression engine + just‑in‑time guides + glossary

**Goal:** grow grammar from the single der/die/das article‑ending drill into an ordered,
per‑language **topic ladder** (A1→A2) that unlocks at the right time, each topic introduced
by a short guide — which doubles as the planned in‑game glossary/wiki.

> This is the biggest phase. **Split across two sessions if it feels heavy** — 4a+4b in one,
> 4c+4d in the next.

**Depends on:** Phases 1–2 (icon set; the guide screen reuses Phase 2's intro pattern).

### 4a — Topic data model + gating
- [ ] Define a `GrammarTopic` (id, title, `requires: string[]` = prerequisite word ids +
      prior topic ids, `level`, drill generator(s), guide content). Extend `LangPack`
      (`src/content/lang/types.ts`) with `grammarTopics` alongside the existing
      `grammarItems`; expose an active live binding like `GRAMMAR_ITEMS` does in
      `src/content/grammarItems.ts`.
- [ ] **Author the German ladder** (`src/content/lang/de/grammar.ts`), ordered to track the
      frequency vocab: gender · ein/eine + kein · plurals → sein & haben · pronouns ·
      present tense · modal verbs → nominative+accusative · accusative prepositions ·
      possessives · dative+adjectives. Data already exists in `lemmas.ts`
      (`gender`, `plural`, verb `forms`, `pos`).
- [ ] **Gating via the existing engine:** reuse `isItemEligible`; the Practice grammar slot
      serves the **next unlocked‑but‑unpractised topic** rather than "N noun drills".
      Update `progression.ts` (`practiceNounsForBlock` → topic selection) and the Practice
      menu/gate in `App.tsx` accordingly.
- [ ] Add `seenGuides: string[]` to `PlayerState`; bump `STATE_VERSION`.

### 4b — Just‑in‑time guides + glossary/wiki drawer
- [ ] **Guide screen:** the first time a topic unlocks, show a one‑screen explainer (rule in
      a sentence + 1–2 color‑coded examples + "Got it → practise") before its drills; record
      it in `seenGuides` so it shows once; reopenable via a "?".
- [ ] **Glossary drawer on the RIGHT edge** of game screens, mirroring the crossword's left
      clue drawer (`src/games/crossword/components/CrosswordBoard.tsx`): term list →
      clickable wiki pages, cross‑linked (tapping "masc." opens the Articles page). This is
      the CLAUDE.md "in‑game glossary & wiki" idea — author each topic's guide once, surface
      it both just‑in‑time and on demand.

### 4c — Drill variety per topic
- [ ] Give topics their own drill types beyond letter‑ending typing: **gender tap**,
      **conjugation fill‑in** (type the verb form from `forms`), **pick‑the‑case/article**,
      **sentence‑build** (reuse Hurdle/cipher tile UI).

### 4d — Norwegian ladder
- [ ] Author the Norwegian topic ladder in `src/content/lang/no/grammar.ts` (en/ei/et,
      definite suffix ‑en/‑a/‑et, indefinite, plurals ‑er, invariant present tense ‑r,
      pronouns, possessives, adjective agreement). Per‑language, not shared.

**Touch points:** `src/content/lang/types.ts`, `src/content/grammarItems.ts`,
`src/content/lang/de/grammar.ts`, `src/content/lang/no/grammar.ts`,
`src/games/grammar/*`, `src/state/progression.ts`, `src/state/types.ts`,
`src/app/App.tsx`, new guide + glossary components.

**State changes:** yes — `seenGuides`, topic progress; `STATE_VERSION` bump.

**Tests:** extend `tests/content.invariants.mts` + `tests/content.no.mts` — every topic
reachable in frequency order, prerequisites satisfiable, every topic has a DE+EN guide,
gate stays stable once a block is learned.

**Done when:** grammar teaches a real sequence of concepts, each one explained at the moment
it becomes relevant and lookup‑able later, in both languages.

---

## Phase 5 — Audio & "Developer Voice" (FUTURE — do not start until 1–4 land)

**Why deferred:** audio is most valuable once the Learn/grammar structure is stable (so the
speaker buttons have a settled home), and Ari wants the option to ship **his own recorded
voice** — friends have promised to learn Norwegian if they can hear him. So this phase is as
much a **recording tool** as a playback feature, and recording quality control (no
weird‑sounding Norwegian) is a first‑class goal.

**The plan, in two halves:**

### 5a — Playback architecture (ship first, cheap)
- [ ] One abstraction: `speak(text, lang)` / `playWord(lemma)` service that the UI calls.
      The UI never knows the backend.
- [ ] **Resolution order:** Developer‑Voice clip (Ari's recording, keyed by lemma id) →
      pre‑generated cloud clip (optional, later) → **system fallback** (Web Speech API
      `speechSynthesis`, or a Capacitor native‑TTS plugin). Web Speech also covers full
      sentences for free.
- [ ] **Settings:** a "Voice" section — on/off, autoplay, and a **"Developer Voice"** toggle
      so end users hear Ari's recordings across everything (falling back to system voice for
      anything not yet recorded).
- [ ] Surface speaker buttons in the Learn intro/reveal (the Phase 2 placeholder), on word
      tiles, and on answer reveals in the games.

### 5b — "Recording studio" (Ari records his own voice, individually, with coverage)
- [ ] A **dev‑only "Record studio" screen** (gated like the existing dev recap button) that
      lets Ari **click through everything and record each item one at a time** so coverage is
      complete and every clip sounds right:
  - [ ] Walks the full lemma list per language in order; for each: shows word + gloss +
        gender, with **record / play back / re‑record / approve** controls
        (browser `MediaRecorder`).
  - [ ] Also enumerates the **generated sentences** (the cipher generator is deterministic
        and seeded, so the reachable sentence set is finite and listable) and any grammar
        example sentences, so those can be recorded too.
  - [ ] **Coverage dashboard** per language: recorded X / total, approved X / total, with a
        filter to jump straight to the gaps — this is how we guarantee nothing is missed and
        the Norwegian is verified by ear.
  - [ ] **Export** approved clips as files named by lemma id (+ a stable id for sentences)
        plus a manifest JSON listing which ids have approved audio. Those bundle into the app
        (or get hosted) as static assets; production just plays them via `playWord`.
- [ ] **Capacitor note:** recording is easiest in a dev/web build (`MediaRecorder`); the
      produced files ship as static assets, so the production native app only needs playback.

**State / assets:** a clip manifest (id → has‑audio) per language; audio files as bundled
assets; Settings flags. `STATE_VERSION` bump if any of this lands in `PlayerState`.

**Done when:** Ari can record his voice over every word/sentence with coverage tracking, end
users can switch on "Developer Voice", and anything unrecorded falls back to a system voice.

---

## Cross‑cutting conventions (all phases)

- Match the visual language: tokens in `tailwind.config.js`, Fraunces display / Inter body,
  calm spacing, **solid fills only**.
- New vocab/content must stay cipher‑ and grammar‑coverable for its block and get a clue —
  the content tests will flag gaps.
- Everything stays **per‑language via `LangPack`**; never branch on language inside a game.
- One phase per commit; verify the Vercel deploy after every push.
