# AUDIO_PLAN.md — Natural-voice audio for LanguageGame

Planning notes for adding human voice recordings throughout the app (German +
Norwegian first). Companion to `NEXT_PHASE.md`; audio was the deferred Phase-5
item ("Developer Voice" + a recording studio).

## Decisions (this round)

- Recording tool: **custom web recorder** (built into the repo).
- Coverage: **record everything enumerable in Ari's voice** — words *and*
  sentences. The only non-pre-recordable case (per-player focus sentences) plays by
  **stitching recorded word clips** together. No TTS / synthetic voice.
- In-game: as each cipher **word** is completed it's read aloud (its clip); when the
  **whole sentence** is completed, the sentence clip plays (stitched words if dynamic).

## By the numbers (German course; Norwegian is similar)

| Set | Count | Source |
|---|---|---|
| Words (lemmas) | **2000** | the lemma dataset |
| Distinct spoken word-forms in ciphers | **1233** | lemma surfaces + inflected forms (ist, der/die/das, dem, verb-3sg…) |
| Distinct generated sentences | **628** | deterministic, 1–4 per block over 200 blocks, zero duplicates |

So the German recording job = **2000 words + 65 inflected forms + 628 sentences =
2,693 clips** (Norwegian: 2000 + 61 + 796 = 2,857; French core so far: 113 + 21 + 40).
Verified by running the enumerator over the live content. The recorder generates the
exact list, so you never count by hand. Sentences read fast — a self-paced day or two.

## TL;DR

- **Record words + sentences, all in your voice.** Every lemma has a permanent id
  and every generated sentence gets a stable content-hash id, so each clip wires to
  exactly where it belongs.
- **The one unavoidable fallback: stitching.** Focus-mode ciphers are generated from
  each player's personal miss pool, so those specific sentences can't be known in
  advance — they play as your word clips concatenated. (Flatter prosody than a real
  take, but it's the only case, and still your voice.)
- **Best tool for you: a tiny custom web recorder** built into the repo. It shows one
  item at a time and saves the file *already named* (`l-mann.m4a`, `s-3f9a…​.m4a`),
  eliminating the one painful part of a ~2,800-file session — matching each file to
  the right word/sentence. Cubase is the fallback if you'd rather track in a DAW.
- **Integration is trivial because of the id key.** A file named by id auto-wires to
  everywhere it's used. A manifest makes the speaker icon appear only where audio
  exists → release partial coverage and grow it with zero code changes.
- **Re-recording is incremental, not all-or-nothing.** If you later tweak the
  generator, only the *changed* sentence hashes need re-recording; every unchanged
  word and sentence keeps working.

## What actually needs a voice

| Surface | Volume (DE) | Keying | Plan |
|---|---|---|---|
| **Words (lemmas)** | 2000 | stable lemma id `l-…` | **Record** |
| **Inflected cipher forms** | ⊂ 1233 surfaces | surface string | **Record** the extras not equal to a lemma's base form (ist, dem, verb-3sg…) |
| **Cipher sentences** | 628 | content-hash `s-…` | **Record** (stable per generator version) |
| Example sentences (Learn) | — | — | Same pool as cipher sentences — not separate |
| Focus-mode sentences | per-player | — | **Stitch** from word clips (only non-recordable case) |
| Crossword clues | authored definitions | — | Skip (reading aid, not a pronunciation target) |
| Grammar drills (der/die/das + noun) | — | — | Play the noun's word clip (+ article clip) |
| Hurdle reveal | the hidden word | lemma id | Already covered by word audio |

## Stable vs. dynamic — how the hybrid works

- A **word** is a permanent `l-…` id → record once, wired forever.
- A **generated sentence** is deterministic, so we hash its text to a stable id
  (`s-<hash>`) and record it. If you later change the generator, only the sentences
  whose text actually changed get a new hash and need a re-take; everything else
  keeps playing. So it's incremental, not a treadmill.
- A **focus-mode** cipher is built per-player from their miss pool — its exact
  wording isn't known ahead of time, so it can't be pre-recorded. It plays as your
  **word clips stitched in order** (small gaps between). Flatter than a real take,
  but it's the only case and it's still your voice.
- **In-game behavior you asked for:** when a cipher word is solved, play that word's
  clip; when the sentence is finished, play the sentence clip — or, if it's a dynamic
  focus sentence, the stitched word sequence.

## Software

| Tool | Cost | Best at | The catch |
|---|---|---|---|
| **Custom web recorder** (recommended) | free, I build it | one word at a time, auto-named files, instant redo, manifest | desktop Chrome/Edge (folder-write API) |
| Cubase (you own it) | owned | comfort, your mic chain, punch-and-roll | doesn't solve naming/aligning 4000 exports |
| Reaper | ~$60 | region batch-export with wildcard names | still a manual region/naming discipline |
| Audacity | free | long takes → Label Sounds → Export Multiple | auto-split + position-naming drifts over thousands |

Every DAW route shares one problem: you record `word001…word4000`, then have to
*prove* file N is lemma N. Over 4000 items, one extra take shifts everything after
it. The custom recorder removes that whole class of error by naming at capture time.

### The recorder — final spec

Runs as a hidden dev-only route in the app (`/recorder` under `npm run dev`), so it
reads the **live** lemma + generated-sentence data directly — add vocab later and it
shows up automatically. It has two views.

**1. Dashboard (the map).** A lean, searchable table of every word and every
sentence, one row each: item · gloss/translation · # takes · which voices · status
(missing / covered). Filters: *missing only*, *by voice*, free-text search; separate
tabs for words vs sentences. Click a row → jump straight to recording it. This is how
you see coverage at a glance and hop around.

**2. Record view.** Shows just the current item + its gloss. Dead-simple keys —
nothing about the backend on screen:

- **R** = start recording, **R** = stop.
- **Space** = next item.
- (quiet extras: **P** = play back the take, **Backspace** = discard it, **←/→** =
  move around.)

**Multiple voices / takes.** Before recording you set the **speaker's first name**
(a field at the top — switch it when a new person sits down). Every take is
registered against the item *and* the person, so one word can hold many takes from
many people: `klein-ari-1`, `klein-ari-2`, `klein-jasmin-1`, … The app later picks a
take **at random** per playback → the "more dynamic" feel you want. Nothing is ever
overwritten; redo just adds a take, and you can delete any take from the dashboard.

**One clip, many scenarios.** A word is recorded **once per (person, take)** and
reused everywhere it appears — crossword solve, cipher reveal, Learn, hurdle,
vocab lists. There's no per-context recording; playback is keyed by the word's id, so
every surface that shows that word can speak it.

**Capture + files.** Clean signal from your interface (`getUserMedia` with
echoCancellation / noiseSuppression / autoGainControl **off** → studio quality, no
browser DSP). Writes straight into a folder you pick (File System Access API) — no
"Save as" prompts. Files are human-readable — `klein-ari-1.wav`,
`das-ist-der-mann-ari-1.wav` — while `audio-manifest.json` is the source of truth
(maps the canonical id → its takes, each with person + take #). One `ffmpeg` pass
converts the folder to mono AAC `.m4a` ~96 kbps (~10 KB each).

**Self-paced + versatile.** Resumable — stop anytime; the dashboard remembers what's
done. New vocab/sentences appear as *missing* rows the moment they're in the content.
Redo, re-voice, or add people at any time without touching what's already recorded.

Realistic pace: ~4–6 s/item; a word is a second, a sentence a few. Both languages
stay a self-paced day or two.

If you ever prefer Cubase for a batch: I generate a numbered read-script (exact
order) + a rename script, and you track one block per take with a spoken slate so
naming can't drift. But the recorder above is the versatile path.

### How to run it

Built and shipping in the repo (`recorder.html` + `src/recorder/`, dev-only — Vite
builds only the main app, so it never reaches production). No new dependencies.

1. `npm run dev`, then open **http://localhost:5173/recorder.html**.
2. Top bar, once: pick **Language**, type a **Speaker** first name, click **Enable
   input** and select your interface, then **Choose folder…** and pick an empty
   folder (e.g. `LanguageGameAudio`, kept *outside* the repo — the WAV masters are
   large). The folder is remembered next visit (one click to reconnect).
3. **Record:** big word on screen → **R** start, **R** stop (auto-saves the take),
   **Space** next. **P** replays, **⌫** deletes the last take. Change the Speaker name
   when a new person records — takes stack as `klein-ari-1`, `klein-jasmin-1`, …
4. **Dashboard:** the full table — search, *missing only*, filter coverage *by voice*,
   click a row to jump to it.
5. Convert to app format when ready (per language or all at once):
   - Windows: `powershell -ExecutionPolicy Bypass -File tools\convert-audio.ps1 -Root "C:\…\LanguageGameAudio"` (needs ffmpeg — `winget install Gyan.FFmpeg`).
   - Makes `.m4a` next to each `.wav`. Later we copy `<lang>/*.m4a` + `audio-manifest.json` into `public/audio/<lang>/` and wire playback.

Chrome or Edge on desktop (the folder API isn't in Firefox/Safari).

## App integration

- **Format:** mono **AAC `.m4a`** (or mp3). iOS WKWebView plays AAC/mp3 natively; it
  does **not** play opus/webm — so convert, don't ship the browser's raw recording.
- **Naming / keying:** clips live at `public/audio/<lang>/…` (served by Vercel at
  `/audio/de/…`). Files are human-readable per take (`klein-ari-1.m4a`); the canonical
  key is the **lemma id** (words) or **content-hash** (sentences).
- **Manifest:** `audio-manifest.json` maps each id → its **list of takes**
  (`{person, take#, file}`). The UI shows the speaker icon only for ids that have ≥1
  take → ship a few blocks today, grow coverage later, no code change. Multiple takes
  per id are the whole point of the multi-voice design.
- **Playback:** a small `playAudio(id)` that reads the manifest, **picks a random
  take** (→ varied voices), and plays it. Drop a speaker button on Learn cards, vocab
  / block-word lists, grammar drills, and hurdle / crossword reveals; the cipher game
  calls it per word on solve and per sentence on completion. Lazy-loaded,
  browser-cached; optionally pre-cache the active language to device (Capacitor
  Filesystem) for offline.
- **iOS silent switch:** set the audio session to "playback" (small Capacitor/native
  tweak) so taps play even when the ringer is off — otherwise word audio is silent on
  muted iPhones, a classic gotcha.
- **Size:** ~40–60 MB for both languages — fine to host on Vercel and lazy-load; no
  need to bloat the app bundle.

## Suggested order

1. I build the recorder + a `playAudio(id)` helper (words, sentences, stitched
   fallback) + manifest plumbing (one phase).
2. You record German — words first (ship that), then the 628 sentences. Drop the
   folder in, run the one ffmpeg command.
3. Speaker icons + word-on-solve / sentence-on-complete playback light up
   automatically as the manifest fills. Test on phone.
4. Repeat for Norwegian.
5. Freeze the generator before the sentence pass so hashes are stable; any later
   generator change only re-records the sentences whose text changed.
