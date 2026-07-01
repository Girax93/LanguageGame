/**
 * Folder + manifest persistence via the File System Access API. You pick a root
 * folder once; the handle is stashed in IndexedDB so the tool reconnects on the
 * next visit (one click to re-grant permission). Each language gets a subfolder
 * (de/ no/ fr/) holding the take WAVs + audio-manifest.json (the source of truth
 * mapping key -> takes). Chrome/Edge desktop only — Firefox/Safari lack the API.
 */
import type { Manifest } from './types';
import { emptyManifest } from './types';

// The API's TS types are patchy across versions; keep the casts local + loud.
type DirHandle = FileSystemDirectoryHandle & {
  entries?: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  queryPermission?: (o: { mode: string }) => Promise<PermissionState>;
  requestPermission?: (o: { mode: string }) => Promise<PermissionState>;
};

const MANIFEST_NAME = 'audio-manifest.json';
const IDB_DB = 'lg-recorder';
const IDB_STORE = 'kv';
const HANDLE_KEY = 'rootHandle';

export function fsSupported(): boolean {
  return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';
}

// ── tiny IndexedDB kv (to remember the folder handle) ────────────────────────
function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key: string, val: unknown): Promise<void> {
  const db = await idb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idb();
  const out = await new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const r = tx.objectStore(IDB_STORE).get(key);
    r.onsuccess = () => resolve(r.result as T | undefined);
    r.onerror = () => reject(r.error);
  });
  db.close();
  return out;
}

// ── permissions ──────────────────────────────────────────────────────────────
export async function hasPermission(handle: DirHandle): Promise<boolean> {
  if (!handle.queryPermission) return true;
  return (await handle.queryPermission({ mode: 'readwrite' })) === 'granted';
}
export async function requestPermission(handle: DirHandle): Promise<boolean> {
  if (!handle.requestPermission) return true;
  return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
}

// ── folder selection + reconnection ──────────────────────────────────────────
export async function pickRoot(): Promise<DirHandle> {
  const picker = (window as unknown as {
    showDirectoryPicker: (o: { id?: string; mode?: string; startIn?: string }) => Promise<DirHandle>;
  }).showDirectoryPicker;
  // id + startIn give a stable, sensible default location Chrome remembers.
  const handle = await picker({ id: 'lg-audio', mode: 'readwrite', startIn: 'documents' });
  await idbSet(HANDLE_KEY, handle);
  return handle;
}
export async function savedRoot(): Promise<DirHandle | undefined> {
  return idbGet<DirHandle>(HANDLE_KEY);
}

export async function langDir(root: DirHandle, code: string): Promise<DirHandle> {
  return (await root.getDirectoryHandle(code, { create: true })) as DirHandle;
}

// ── files ────────────────────────────────────────────────────────────────────
export async function writeFile(dir: DirHandle, name: string, data: Blob): Promise<void> {
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(data);
  await w.close();
}
export async function removeFile(dir: DirHandle, name: string): Promise<void> {
  try {
    await dir.removeEntry(name);
  } catch {
    /* already gone */
  }
}

// ── nested paths inside a language folder (e.g. "ari/words/jeg-ari-1.wav") ────
async function walkTo(langDirH: DirHandle, relPath: string, create: boolean): Promise<{ parent: DirHandle; name: string }> {
  const parts = relPath.split('/').filter(Boolean);
  const name = parts.pop() as string;
  let d = langDirH;
  for (const p of parts) d = (await d.getDirectoryHandle(p, { create })) as DirHandle;
  return { parent: d, name };
}
export async function writeFileAt(langDirH: DirHandle, relPath: string, data: Blob): Promise<void> {
  const { parent, name } = await walkTo(langDirH, relPath, true);
  const fh = await parent.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(data);
  await w.close();
}
export async function removeFileAt(langDirH: DirHandle, relPath: string): Promise<void> {
  try {
    const { parent, name } = await walkTo(langDirH, relPath, false);
    await parent.removeEntry(name);
  } catch {
    /* already gone */
  }
}
export async function fileUrlAt(langDirH: DirHandle, relPath: string): Promise<string | null> {
  try {
    const { parent, name } = await walkTo(langDirH, relPath, false);
    const file = await (await parent.getFileHandle(name)).getFile();
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}
export async function readBytesAt(langDirH: DirHandle, relPath: string): Promise<Uint8Array | null> {
  try {
    const { parent, name } = await walkTo(langDirH, relPath, false);
    const file = await (await parent.getFileHandle(name)).getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}
export async function listWavs(dir: DirHandle): Promise<Set<string>> {
  const names = new Set<string>();
  if (!dir.entries) return names;
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind === 'file' && name.toLowerCase().endsWith('.wav')) names.add(name);
  }
  return names;
}

// ── manifest ─────────────────────────────────────────────────────────────────
export async function readManifest(dir: DirHandle, code: string): Promise<Manifest> {
  try {
    const fh = await dir.getFileHandle(MANIFEST_NAME);
    const text = await (await fh.getFile()).text();
    const m = JSON.parse(text) as Manifest;
    if (!m.takes) m.takes = {};
    m.lang = code;
    return m;
  } catch {
    return emptyManifest(code);
  }
}
export async function writeManifest(dir: DirHandle, manifest: Manifest): Promise<void> {
  manifest.updated = new Date().toISOString();
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  await writeFile(dir, MANIFEST_NAME, blob);
}
