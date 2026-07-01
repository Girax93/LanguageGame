/**
 * The voice recorder (dev-only, /recorder.html under `npm run dev`).
 *
 * Two views over the live content: a coverage DASHBOARD (searchable table of
 * every word / form / sentence, showing takes + voices + what's missing) and a
 * RECORD stage driven by the keyboard — R start, R stop, Space next. Every take
 * is registered against the item AND the current speaker's first name, so one
 * item holds many takes from many people (klein-ari-1, klein-jasmin-1, …); the
 * app later plays a random take. Nothing is overwritten; redo just adds a take.
 *
 * Files + the manifest are written straight into a folder you pick (Chrome/Edge
 * File System Access API). This tool never ships — Vite builds only index.html.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LANGS } from '../content/lang/registry';
import { buildItems } from './items';
import type { ItemGroups } from './items';
import type { RecItem, Manifest, Take, ItemKind } from './types';
import { emptyManifest } from './types';
import { hashText } from './hash';
import { Capture } from './wav';
import type { InputDevice } from './wav';
import {
  fsSupported, pickRoot, savedRoot, hasPermission, requestPermission,
  langDir, writeFileAt, removeFileAt, fileUrlAt, readBytesAt, readManifest, writeManifest,
} from './fs';
import { zipStore, unzipStore, zipText } from './zip';
import { encodeInvite, decodeInvite } from './invite';

type Dir = any; // File System Access handles — types vary; kept loose on purpose.
type Tab = keyof ItemGroups; // 'words' | 'forms' | 'sentences'
const TABS: Tab[] = ['words', 'forms', 'sentences'];
const TAB_LABEL: Record<Tab, string> = { words: 'Words', forms: 'Forms', sentences: 'Sentences' };
const KIND_FOLDER: Record<ItemKind, string> = { word: 'words', sentence: 'sentences', form: 'forms' };

const ls = {
  get: (k: string, d = '') => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

function personSlug(p: string): string {
  return p.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

// Contributor links carry ?c=<encrypted token> (name+lang, opaque + tamper-proof).
// The generator lives only in local dev, so only Ari can mint links; the deployed
// page refuses to open without a valid token.
const PARAMS = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
const TOKEN = (PARAMS.get('c') || '').trim();
const IS_DEV = !!import.meta.env.DEV;

interface InviteRec { name: string; lang: string; link: string; created: string; }
function loadInvites(): InviteRec[] {
  try { const v = JSON.parse(localStorage.getItem('rec.invites') || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function saveInvites(v: InviteRec[]): void {
  try { localStorage.setItem('rec.invites', JSON.stringify(v)); } catch { /* ignore */ }
}

export function RecorderApp() {
  const [code, setCode] = useState<string>(() => ls.get('rec.lang', 'de') || 'de');
  const [person, setPerson] = useState<string>(() => ls.get('rec.person', ''));
  const [tab, setTab] = useState<Tab>(() => (ls.get('rec.tab', 'words') as Tab) || 'words');
  const [view, setView] = useState<'dashboard' | 'record'>('record');
  const [showGuide, setShowGuide] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [access, setAccess] = useState<{ status: 'checking' | 'open' | 'contributor'; name?: string; lang?: string } | { status: 'denied' }>(
    () => (TOKEN ? { status: 'checking' } : IS_DEV ? { status: 'open' } : { status: 'denied' }),
  );
  const locked = access.status === 'contributor';

  const items = useMemo<ItemGroups>(() => buildItems(code), [code]);
  const list = items[tab];

  const [idx, setIdx] = useState(0);
  const [manifest, setManifest] = useState<Manifest>(() => emptyManifest(code));

  const capRef = useRef<Capture>(new Capture());
  const [devices, setDevices] = useState<InputDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [micReady, setMicReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [levelDb, setLevelDb] = useState(-60);
  const [gainDb, setGainDb] = useState<number>(() => Number(ls.get('rec.gain', '0')) || 0);
  const [eq, setEqState] = useState<{ low: number; mid: number; high: number }>(() => {
    try { const v = JSON.parse(ls.get('rec.eq', '')); if (v && typeof v.low === 'number') return v; } catch { /* default */ }
    return { low: 0, mid: 0, high: 0 };
  });
  const [takeLevelDb, setTakeLevelDb] = useState<number | null>(null);

  const rootRef = useRef<Dir | null>(null);
  const dirRef = useRef<Dir | null>(null);
  const [rootName, setRootName] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState('');

  useEffect(() => ls.set('rec.lang', code), [code]);
  useEffect(() => ls.set('rec.person', person), [person]);
  useEffect(() => ls.set('rec.tab', tab), [tab]);
  useEffect(() => { setIdx(0); setShowAll(false); }, [tab, code]);
  useEffect(() => ls.set('rec.gain', String(gainDb)), [gainDb]);
  useEffect(() => ls.set('rec.eq', JSON.stringify(eq)), [eq]);
  useEffect(() => setTakeLevelDb(null), [idx, tab, code]);

  // Decode a contributor token once on load (async) and gate access on the result.
  useEffect(() => {
    if (!TOKEN) return;
    let cancelled = false;
    void (async () => {
      const inv = await decodeInvite(TOKEN);
      if (cancelled) return;
      if (inv && LANGS.some((l) => l.code === inv.lang)) {
        setPerson(inv.name);
        setCode(inv.lang);
        setShowGuide(true);
        setAccess({ status: 'contributor', name: inv.name, lang: inv.lang });
      } else {
        setAccess({ status: 'denied' });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── takes helpers ──────────────────────────────────────────────────────────
  const takesOf = useCallback(
    (key: string): Take[] => manifest.takes[key] ?? [],
    [manifest],
  );
  const isCovered = useCallback(
    (key: string) => {
      const t = takesOf(key);
      return voiceFilter ? t.some((x) => x.person === voiceFilter) : t.length > 0;
    },
    [takesOf, voiceFilter],
  );

  const allPersons = useMemo(() => {
    const s = new Set<string>();
    for (const arr of Object.values(manifest.takes)) for (const t of arr) s.add(t.person);
    return [...s].sort();
  }, [manifest]);

  // ── folder wiring ──────────────────────────────────────────────────────────
  const openLangDir = useCallback(async (root: Dir, c: string) => {
    const dir = await langDir(root, c);
    dirRef.current = dir;
    const m = await readManifest(dir, c);
    setManifest(m);
  }, []);

  useEffect(() => {
    // Reconnect a previously-picked folder (permission may need a click).
    (async () => {
      if (!fsSupported()) { setErr('This browser lacks the File System Access API — use Chrome or Edge on desktop.'); return; }
      try {
        const saved = await savedRoot();
        if (saved) {
          rootRef.current = saved;
          setRootName(saved.name);
          if (await hasPermission(saved)) {
            await openLangDir(saved, code);
          } else {
            setStatus(`Folder “${saved.name}” remembered — click Reconnect to grant access.`);
          }
        }
      } catch (e) { setErr(String(e)); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rootRef.current) openLangDir(rootRef.current, code).catch((e) => setErr(String(e)));
  }, [code, openLangDir]);

  const isAbort = (e: unknown) => (e as { name?: string })?.name === 'AbortError';
  const chooseFolder = async () => {
    try {
      const root = await pickRoot();
      rootRef.current = root;
      setRootName(root.name);
      await openLangDir(root, code);
      setErr('');
      setStatus(`Folder “${root.name}” connected.`);
    } catch (e) {
      if (isAbort(e)) { setErr(''); setStatus('Folder pick was dismissed — click “Choose folder…” and select (or create) an empty folder to save takes.'); }
      else setErr(String(e));
    }
  };
  const reconnect = async () => {
    try {
      const saved = rootRef.current ?? (await savedRoot());
      if (saved && (await requestPermission(saved))) {
        rootRef.current = saved;
        setRootName(saved.name);
        await openLangDir(saved, code);
        setErr('');
        setStatus('Folder reconnected.');
      }
    } catch (e) {
      if (isAbort(e)) setErr(''); else setErr(String(e));
    }
  };

  // ── mic wiring ─────────────────────────────────────────────────────────────
  const enableMic = async (id?: string) => {
    try {
      await capRef.current.enable(id || undefined);
      capRef.current.setGain(gainDb);
      capRef.current.setEq(eq.low, eq.mid, eq.high);
      setMicReady(true);
      setDeviceId(capRef.current.deviceId ?? '');
      setDevices(await capRef.current.listInputs());
      setStatus('Input ready.');
    } catch (e) { setErr('Mic error: ' + String(e)); setMicReady(false); }
  };

  // level meter loop (only while recording view is up + mic ready)
  useEffect(() => {
    if (!micReady || view !== 'record') return;
    let raf = 0;
    const tick = () => { setLevelDb(capRef.current.meterDb()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [micReady, view]);

  // ── recording ──────────────────────────────────────────────────────────────
  const current: RecItem | undefined = list[idx];
  const canRecord = micReady && !!personSlug(person) && !!dirRef.current;

  const relPathFor = (item: RecItem, pslug: string, take: number): string => {
    const base = `${item.slug}-${pslug}-${take}`;
    let name = `${base}.wav`;
    // Guard against two different keys colliding on the same filename in a folder.
    for (const [k, arr] of Object.entries(manifest.takes)) {
      if (k === item.key) continue;
      if (arr.some((t) => t.file === name || t.file.endsWith(`/${name}`))) { name = `${base}-${hashText(item.key).slice(0, 4)}.wav`; break; }
    }
    // <person>/<words|sentences|forms>/<name>
    return `${pslug}/${KIND_FOLDER[item.kind]}/${name}`;
  };

  const persist = async (next: Manifest) => {
    setManifest(next);
    if (dirRef.current) await writeManifest(dirRef.current, next);
  };

  const saveTake = async (item: RecItem, blob: Blob) => {
    const pslug = personSlug(person);
    if (!dirRef.current || !pslug) return;
    const existing = manifest.takes[item.key] ?? [];
    const take = existing.filter((t) => t.person === pslug).reduce((m, t) => Math.max(m, t.take), 0) + 1;
    const file = relPathFor(item, pslug, take);
    try {
      await writeFileAt(dirRef.current, file, blob);
      const next: Manifest = { ...manifest, takes: { ...manifest.takes, [item.key]: [...existing, { person: pslug, take, file }] } };
      await persist(next);
      setTakeLevelDb(capRef.current.lastPeakDb);
      setStatus(`Saved ${file}`);
    } catch (e) { setErr('Save failed: ' + String(e)); }
  };

  const toggleRecord = useCallback(() => {
    if (!current) return;
    if (!canRecord) { setErr('Set a speaker name, choose a folder, and enable the input first.'); return; }
    if (capRef.current.isRecording) {
      const blob = capRef.current.end();
      setRecording(false);
      void saveTake(current, blob);
    } else {
      setErr('');
      capRef.current.begin();
      setRecording(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, canRecord, manifest, person]);

  const playFile = async (file: string) => {
    if (!dirRef.current) return;
    const url = await fileUrlAt(dirRef.current, file);
    if (!url) { setErr('Could not read ' + file); return; }
    const a = new Audio(url);
    a.onended = () => URL.revokeObjectURL(url);
    try { await a.play(); } catch (e) { setErr(String(e)); }
  };
  const playLast = () => {
    if (!current) return;
    const t = takesOf(current.key);
    if (t.length) void playFile(t[t.length - 1].file);
  };
  const changeGain = (db: number) => { setGainDb(db); capRef.current.setGain(db); };
  const applyEq = (next: { low: number; mid: number; high: number }) => { setEqState(next); capRef.current.setEq(next.low, next.mid, next.high); };
  const changeEq = (part: 'low' | 'mid' | 'high', v: number) => applyEq({ ...eq, [part]: v });

  // ── share: export my takes as a .zip / import a contributor's .zip ──────────
  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  const exportZip = async () => {
    if (!rootRef.current) { setErr('Choose your folder first.'); return; }
    try {
      const entries: { path: string; data: Uint8Array }[] = [];
      for (const l of LANGS) {
        let ld: Dir;
        try { ld = await rootRef.current.getDirectoryHandle(l.code); } catch { continue; }
        const m = await readManifest(ld, l.code);
        const keys = Object.keys(m.takes);
        if (!keys.length) continue;
        entries.push({ path: `${l.code}/audio-manifest.json`, data: zipText.encode(JSON.stringify(m, null, 2)) });
        for (const k of keys) for (const t of m.takes[k]) {
          const bytes = await readBytesAt(ld, t.file);
          if (bytes) entries.push({ path: `${l.code}/${t.file}`, data: bytes });
        }
      }
      if (!entries.length) { setStatus('Nothing recorded yet to export.'); return; }
      const who = personSlug(person) || 'me';
      download(zipStore(entries), `recordings-${who}-${new Date().toISOString().slice(0, 10)}.zip`);
      setErr(''); setStatus(`Exported your recordings — send the .zip file on.`);
    } catch (e) { setErr('Export failed: ' + String(e)); }
  };
  const importZip = async (file: File) => {
    if (!rootRef.current) { setErr('Choose your folder first.'); return; }
    try {
      const byPath = new Map(unzipStore(await file.arrayBuffer()).map((i) => [i.path, i.data]));
      let added = 0;
      const langs = new Set<string>();
      for (const l of LANGS) {
        const manData = byPath.get(`${l.code}/audio-manifest.json`);
        if (!manData) continue;
        let incoming: Manifest;
        try { incoming = JSON.parse(zipText.decode(manData)); } catch { continue; }
        const ld = await langDir(rootRef.current, l.code);
        const mine = await readManifest(ld, l.code);
        for (const [key, takes] of Object.entries(incoming.takes || {})) {
          const existing = mine.takes[key] ?? [];
          const seen = new Set(existing.map((t) => t.file));
          for (const t of takes as Take[]) {
            if (seen.has(t.file)) continue;
            const data = byPath.get(`${l.code}/${t.file}`);
            if (!data) continue;
            await writeFileAt(ld, t.file, new Blob([data]));
            existing.push(t); seen.add(t.file); added++;
          }
          mine.takes[key] = existing;
        }
        await writeManifest(ld, mine);
        langs.add(l.code);
        if (l.code === code) setManifest(mine);
      }
      setErr(''); setStatus(`Imported ${added} new take(s) across ${langs.size} language(s).`);
    } catch (e) { setErr('Import failed: ' + String(e)); }
  };
  const playReference = () => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('Hello, this is a test.');
      u.rate = 0.95;
      u.volume = 1;
      speechSynthesis.speak(u);
    } catch { /* no TTS available */ }
  };

  const deleteTake = async (item: RecItem, t: Take) => {
    if (dirRef.current) await removeFileAt(dirRef.current, t.file);
    const arr = (manifest.takes[item.key] ?? []).filter((x) => x.file !== t.file);
    const takes = { ...manifest.takes };
    if (arr.length) takes[item.key] = arr; else delete takes[item.key];
    await persist({ ...manifest, takes });
  };
  const deleteLast = () => {
    if (!current) return;
    const t = takesOf(current.key);
    if (t.length) void deleteTake(current, t[t.length - 1]);
  };

  const go = (d: number) => { if (!capRef.current.isRecording) setIdx((i) => Math.max(0, Math.min(list.length - 1, i + d))); };
  const jumpToFirstGap = () => {
    const i = list.findIndex((it) => !isCovered(it.key));
    if (i >= 0) setIdx(i);
  };

  // ── keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'record') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); toggleRecord(); }
      else if (e.key === ' ') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); playLast(); }
      else if (e.key === 'Backspace') { e.preventDefault(); deleteLast(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, toggleRecord, list, idx, manifest]);

  // ── coverage counts (memoized: recompute only when takes / voice change) ────
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { words: 0, forms: 0, sentences: 0 };
    for (const t of TABS) c[t] = items[t].reduce((n, it) => n + (isCovered(it.key) ? 1 : 0), 0);
    return c;
  }, [items, isCovered]);

  // ── dashboard rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((it) => {
      if (missingOnly && isCovered(it.key)) return false;
      if (!q) return true;
      return it.label.toLowerCase().includes(q) || it.gloss.toLowerCase().includes(q);
    });
  }, [list, query, missingOnly, isCovered]);
  const CAP = 400;
  const shown = showAll ? filtered : filtered.slice(0, CAP);

  const openItem = (it: RecItem) => { setIdx(list.indexOf(it)); setView('record'); };

  // ── render ─────────────────────────────────────────────────────────────────
  if (access.status === 'checking') {
    return <div className="rec-root"><div className="stage"><div className="gloss">Checking your invite…</div></div></div>;
  }
  if (access.status === 'denied') {
    return <DeniedScreen />;
  }
  return (
    <div className="rec-root">
      <div className="titlerow">
        <h1 className="title">🎙️ LanguageGame — Voice Recorder</h1>
        <div className="titlebtns">
          {IS_DEV && !locked && <button className="btn btn-sm" onClick={() => { setShowInvite((v) => !v); setShowGuide(false); }}>🔗 Invite a contributor</button>}
          <button className="btn btn-sm" onClick={() => { setShowGuide((v) => !v); setShowInvite(false); }}>{showGuide ? 'Hide guide' : '📖 Guide'}</button>
        </div>
      </div>
      {showInvite && IS_DEV && <InvitePanel onClose={() => setShowInvite(false)} />}
      {showGuide && <GuidePanel locked={locked} onClose={() => setShowGuide(false)} />}

      <div className="setup-bar">
        <div className="field">
          <label>{locked ? 'Language (set for you)' : 'Language'}</label>
          <select value={code} onChange={(e) => setCode(e.target.value)} disabled={locked} title={locked ? 'Set by your invite link' : undefined}>
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{locked ? 'Speaker (set for you)' : 'Speaker (first name)'}</label>
          <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="ari" disabled={locked} title={locked ? 'Set by your invite link' : undefined} />
        </div>
        <div className="field">
          <label>Input</label>
          {micReady ? (
            <select value={deviceId} onChange={(e) => { setDeviceId(e.target.value); void enableMic(e.target.value); }}>
              {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label}</option>)}
            </select>
          ) : (
            <button className="btn" onClick={() => void enableMic()}>Enable input</button>
          )}
        </div>
        <div className="field">
          <label>Audio folder</label>
          {rootName
            ? <div className="folderchip"><span className="pill">{rootName}</span><button className="btn btn-sm" onClick={chooseFolder} title="Pick a different folder">Change…</button></div>
            : <button className="btn" onClick={chooseFolder}>Choose folder…</button>}
        </div>
        {rootName && <button className="btn btn-sm" onClick={reconnect} title="Re-grant folder access">Reconnect</button>}
        {rootName && (
          <div className="field">
            <label>Share</label>
            <div className="folderchip">
              <button className="btn btn-sm" onClick={exportZip} title="Zip your recordings to send">Export .zip</button>
              <label className="btn btn-sm importbtn" title="Merge a contributor's .zip into your folder">Import…
                <input type="file" accept=".zip,application/zip" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importZip(f); e.currentTarget.value = ''; }} />
              </label>
            </div>
          </div>
        )}
        <div className="spacer" />
        <div className="field">
          <label>&nbsp;</label>
          <div className="tabs">
            <button className={`tab ${view === 'record' ? 'active' : ''}`} onClick={() => setView('record')}>Record</button>
            <button className={`tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>

      {(status || err) && (
        <div className={`status ${err ? 'warn' : 'ok'}`} style={{ marginBottom: 10 }}>
          {err || status}
          {err && rootName && <> · <a href="#" onClick={(e) => { e.preventDefault(); void reconnect(); }}>reconnect folder</a></>}
        </div>
      )}

      <div className="viewbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {TAB_LABEL[t]}<span className="frac">{counts[t]}/{items[t].length}</span>
            </button>
          ))}
        </div>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 13 }}>
          {voiceFilter ? `coverage for “${voiceFilter}”` : 'coverage: any voice'}
        </span>
        <select className="btn btn-sm" value={voiceFilter} onChange={(e) => setVoiceFilter(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="">any voice</option>
          {allPersons.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {view === 'record' ? (
        <RecordStage
          item={current} index={idx} total={list.length}
          takes={current ? takesOf(current.key) : []}
          recording={recording} levelDb={levelDb} canRecord={canRecord}
          gainDb={gainDb} onGainChange={changeGain}
          eq={eq} onEqChange={changeEq}
          onVoicePreset={() => applyEq({ low: 0, mid: 2, high: 3 })} onFlatEq={() => applyEq({ low: 0, mid: 0, high: 0 })}
          takeLevelDb={takeLevelDb} onReference={playReference}
          onToggle={toggleRecord} onNext={() => go(1)} onPrev={() => go(-1)}
          onPlay={playFile} onDelete={(t) => current && deleteTake(current, t)}
          onFirstGap={jumpToFirstGap}
        />
      ) : (
        <>
          <div className="toolbar">
            <input type="search" placeholder="Search word / gloss…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className="check"><input type="checkbox" checked={missingOnly} onChange={(e) => setMissingOnly(e.target.checked)} /> missing only</label>
            <span className="spacer" />
            <span className="shownote">{filtered.length} items</span>
          </div>
          <div className="tbl-scroll">
            <table className="table">
              <thead>
                <tr><th style={{ width: 34 }}></th><th>{TAB_LABEL[tab]}</th><th>Gloss / translation</th><th className="num">Takes</th><th>Voices</th></tr>
              </thead>
              <tbody>
                {shown.map((it) => {
                  const t = takesOf(it.key);
                  const voices = [...new Set(t.map((x) => x.person))].join(', ');
                  return (
                    <tr key={it.key} onClick={() => openItem(it)}>
                      <td><span className={`dot ${isCovered(it.key) ? 'have' : 'miss'}`} /></td>
                      <td className="label-cell">{it.label}</td>
                      <td className="gloss-cell">{it.gloss}</td>
                      <td className="num">{t.length || ''}</td>
                      <td className="voices">{voices}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!showAll && filtered.length > CAP && (
            <div className="shownote">Showing first {CAP} of {filtered.length}. <button className="btn btn-sm" onClick={() => setShowAll(true)}>Show all</button></div>
          )}
        </>
      )}

      <div className="help">
        <strong>Keys:</strong> <kbd>R</kbd> start · <kbd>R</kbd> stop (saves the take) · <kbd>Space</kbd> next ·
        {' '}<kbd>P</kbd> play last · <kbd>⌫</kbd> delete last · <kbd>←</kbd>/<kbd>→</kbd> move.
        Switch the <em>Speaker</em> name when a new voice sits down. Takes are saved per person as
        {' '}<code>{code}/name/words/word-name-1.wav</code> (and <code>…/sentences/…</code>), with
        {' '}<code>{code}/audio-manifest.json</code> tying them to the game. Run the ffmpeg script in
        {' '}<code>tools/</code> to make the small <code>.m4a</code> files for the phone.
      </div>
    </div>
  );
}

// ── access-denied screen (deployed page opened without a valid invite) ───────
function DeniedScreen() {
  return (
    <div className="rec-root">
      <div className="titlerow"><h1 className="title">🎙️ LanguageGame — Voice Recorder</h1></div>
      <div className="stage">
        <div className="big-word sentence">This is a private recording page</div>
        <div className="gloss">You need your personal invite link to record. If you were sent one, open that exact link — otherwise, ask Ari for an invite.</div>
      </div>
    </div>
  );
}

// ── contributor guide ───────────────────────────────────────────────────────
function GuidePanel({ onClose, locked }: { onClose: () => void; locked?: boolean }) {
  return (
    <div className="guide">
      <div className="guide-head">
        <strong>How to record for LanguageGame — about 2 minutes to set up</strong>
        <button className="btn btn-sm" onClick={onClose}>Close</button>
      </div>
      <ol>
        <li><b>Use Chrome or Edge</b> (on Windows <em>or</em> Mac). Safari and Firefox can't save into a folder, so they won't work here.</li>
        {locked
          ? <li>Your <b>name and language are already set</b> for you (shown greyed at the top) — nothing to change there.</li>
          : <li><b>Type your first name</b> in “Speaker” and pick your <b>language</b> at the top.</li>}
        <li><b>Click “Enable input”</b> and choose your microphone. A USB mic or a headset sounds much better than a laptop's built‑in mic.</li>
        <li><b>Click “Choose folder…”</b>, make a <b>new empty folder</b> (e.g. “MyRecordings”) anywhere, select it, and click <b>Allow / Edit files</b>. That's just where your own recordings are stored on your computer.</li>
        <li><b>Set your level:</b> talk normally and drag <b>Input gain</b> up until the meter sits in the <span className="tgt">green zone</span>. Tap <b>▶ Reference</b> to hear how clear and loud it should be. Leave the <b>Voice</b> tone preset on.</li>
        <li><b>Record:</b> a word appears — press <kbd>R</kbd> to start, <kbd>R</kbd> to stop, <kbd>Space</kbd> for the next. Fumbled one? <kbd>⌫</kbd> removes the last take, or just record it again.</li>
        <li><b>Work in batches</b> — 10 or 500, whenever suits you. The <b>Dashboard</b> shows what's done and what's left, and your progress is remembered when you return.</li>
        <li><b>When you're done (or after a batch):</b> click <b>Export .zip</b> and send the file to Ari. Done!</li>
      </ol>
      <div className="guide-tips"><b>For the best sound:</b> a quiet room, mic about a hand's width from your mouth, and a steady distance + volume. If a take says “clipping,” nudge Input gain down a little.</div>
    </div>
  );
}

// ── invite-link generator + contributor registry (local dev only) ────────────
function InvitePanel({ onClose }: { onClose: () => void }) {
  const [nm, setNm] = useState('');
  const [lg, setLg] = useState(LANGS[0].code);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState('');
  const [invites, setInvites] = useState<InviteRec[]>(() => loadInvites());
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  const generate = async () => {
    const name = nm.trim();
    if (!name) return;
    const token = await encodeInvite({ name, lang: lg });
    const url = `${base}?c=${token}`;
    setLink(url);
    const rec: InviteRec = { name, lang: lg, link: url, created: new Date().toISOString() };
    const next = [rec, ...invites.filter((i) => !(i.name.toLowerCase() === name.toLowerCase() && i.lang === lg))];
    setInvites(next);
    saveInvites(next);
  };
  const copy = (url: string, key: string) => {
    try { void navigator.clipboard?.writeText(url); setCopied(key); setTimeout(() => setCopied(''), 1500); } catch { /* */ }
  };
  const remove = (rec: InviteRec) => {
    const next = invites.filter((i) => i !== rec);
    setInvites(next);
    saveInvites(next);
  };
  const downloadCsv = () => {
    const rows = [['name', 'language', 'created', 'link'], ...invites.map((i) => [i.name, i.lang, i.created, i.link])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'contributors.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  return (
    <div className="guide">
      <div className="guide-head"><strong>Invite a contributor</strong><button className="btn btn-sm" onClick={onClose}>Close</button></div>
      <div className="inviterow">
        <label>Their first name <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Jasmin" /></label>
        <label>Language <select value={lg} onChange={(e) => setLg(e.target.value)}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}</select></label>
        <button className="btn btn-sm btn-primary" onClick={() => void generate()} disabled={!nm.trim()}>Generate link</button>
      </div>
      {link && (
        <div className="invitelink">
          <code>{link}</code>
          <button className="btn btn-sm btn-primary" onClick={() => copy(link, 'new')}>{copied === 'new' ? 'Copied ✓' : 'Copy link'}</button>
        </div>
      )}
      <div className="guide-tips">The link hides the name + language and can't be edited by the recipient. It only opens on the deployed page — send it to {nm.trim() || 'your contributor'}, who just picks a folder + mic and records.</div>

      {invites.length > 0 && (
        <>
          <div className="guide-head" style={{ marginTop: 12 }}>
            <strong>Your contributors ({invites.length})</strong>
            <button className="btn btn-sm" onClick={downloadCsv}>Download CSV</button>
          </div>
          <table className="table invites-table">
            <thead><tr><th>Name</th><th>Lang</th><th>Created</th><th>Link</th><th></th></tr></thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.link}>
                  <td className="label-cell">{i.name}</td>
                  <td>{i.lang}</td>
                  <td className="muted">{i.created.slice(0, 10)}</td>
                  <td><button className="btn btn-sm" onClick={() => copy(i.link, i.link)}>{copied === i.link ? 'Copied ✓' : 'Copy'}</button></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => remove(i)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// ── record stage ───────────────────────────────────────────────────────────
function RecordStage(props: {
  item?: RecItem; index: number; total: number; takes: Take[];
  recording: boolean; levelDb: number; canRecord: boolean;
  gainDb: number; onGainChange: (db: number) => void;
  eq: { low: number; mid: number; high: number }; onEqChange: (part: 'low' | 'mid' | 'high', v: number) => void;
  onVoicePreset: () => void; onFlatEq: () => void;
  takeLevelDb: number | null; onReference: () => void;
  onToggle: () => void; onNext: () => void; onPrev: () => void;
  onPlay: (file: string) => void; onDelete: (t: Take) => void; onFirstGap: () => void;
}) {
  const { item, index, total, takes, recording, levelDb, canRecord, gainDb, eq, takeLevelDb } = props;
  if (!item) return <div className="stage"><div className="gloss">No items — pick a language / tab.</div></div>;
  const pct = Math.max(0, Math.min(100, ((levelDb + 60) / 60) * 100));
  const clip = levelDb > -1.5;
  const fillClass = clip ? 'hot' : levelDb >= -18 ? 'good' : '';
  const dbText = levelDb <= -60 ? '—' : `${levelDb.toFixed(0)} dB`;
  let verdict = '';
  let verdictClass = '';
  if (takeLevelDb != null && takeLevelDb > -Infinity) {
    const v = takeLevelDb.toFixed(1);
    if (takeLevelDb > -1) { verdict = `Last take peaked at ${v} dBFS — clipping, lower the gain a touch`; verdictClass = 'warn'; }
    else if (takeLevelDb >= -12) { verdict = `Last take peaked at ${v} dBFS — good, clear level`; verdictClass = 'ok'; }
    else if (takeLevelDb >= -20) { verdict = `Last take peaked at ${v} dBFS — a little low, nudge the gain up`; verdictClass = ''; }
    else { verdict = `Last take peaked at ${v} dBFS — too quiet, raise the input gain`; verdictClass = 'warn'; }
  }
  return (
    <div className="stage">
      <div className="kindchip pill">{item.kind}{item.kind !== 'sentence' ? ` · block ${item.block + 1}` : ''}</div>
      <div className={`big-word ${item.kind === 'sentence' ? 'sentence' : ''}`}>{item.label}</div>
      <div className="gloss">{item.gloss}</div>
      <div className="counter">{index + 1} / {total} · {takes.length} take{takes.length === 1 ? '' : 's'} on this item</div>

      <div className="meter-wrap">
        <div className="meter">
          <div className="meter-target" />
          <div className={`meter-fill ${fillClass}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="meter-scale"><span>−60</span><span className="tgt">green = target (−18…−6 dB)</span><span>0 dBFS</span></div>
        <div className="meter-read">live input: <strong>{dbText}</strong></div>
      </div>

      <div className="gainrow">
        <label>Input gain <strong>+{gainDb} dB</strong></label>
        <input type="range" min={0} max={36} step={1} value={gainDb} onChange={(e) => props.onGainChange(Number(e.target.value))} />
        <button className="btn btn-sm" onClick={props.onReference} title="Hear a clear reference phrase to match">▶ Reference</button>
      </div>

      <div className="eqrow">
        <span className="eqlabel">Tone (EQ)</span>
        <label>Low<input type="range" min={-12} max={12} step={1} value={eq.low} onChange={(e) => props.onEqChange('low', Number(e.target.value))} /></label>
        <label>Mid<input type="range" min={-12} max={12} step={1} value={eq.mid} onChange={(e) => props.onEqChange('mid', Number(e.target.value))} /></label>
        <label>High<input type="range" min={-12} max={12} step={1} value={eq.high} onChange={(e) => props.onEqChange('high', Number(e.target.value))} /></label>
        <button className="btn btn-sm" onClick={props.onVoicePreset} title="Recommended voice curve: gentle mid + presence">Voice</button>
        <button className="btn btn-sm" onClick={props.onFlatEq}>Flat</button>
      </div>

      <div className="recbtn">
        <span className={`rec-dot ${recording ? 'live' : ''}`} />
        <button className={`btn ${recording ? 'btn-danger' : 'btn-primary'}`} onClick={props.onToggle} disabled={!canRecord && !recording}>
          {recording ? '■ Stop (R)' : '● Record (R)'}
        </button>
      </div>
      {verdict && <div className={`status ${verdictClass}`}>{verdict}</div>}
      {!canRecord && <div className="status warn">Set a speaker name, choose a folder, and enable the input to record.</div>}

      <div className="nav">
        <button className="btn" onClick={props.onPrev}>← Prev</button>
        <button className="btn" onClick={() => item && takes.length && props.onPlay(takes[takes.length - 1].file)} disabled={!takes.length}>▶ Play (P)</button>
        <button className="btn" onClick={props.onFirstGap}>→ First gap</button>
        <button className="btn btn-primary" onClick={props.onNext}>Next (Space) →</button>
      </div>

      {takes.length > 0 && (
        <div className="takes">
          <h4>Takes</h4>
          {takes.map((t) => (
            <div className="take" key={t.file}>
              <span className="who">{t.person}-{t.take}</span>
              <span className="fname">{t.file.split('/').pop()}</span>
              <button className="btn btn-sm" onClick={() => props.onPlay(t.file)}>▶</button>
              <button className="btn btn-sm btn-danger" onClick={() => props.onDelete(t)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="hint">Tip: switch the speaker name up top for a second voice on the same words — the app plays a random take.</div>
    </div>
  );
}
