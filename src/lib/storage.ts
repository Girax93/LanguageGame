/**
 * Tiny typed wrapper around localStorage that fails silently. Used for
 * lightweight progress (best streak, etc.). Works in the browser and in
 * the Capacitor WebView; degrades gracefully if storage is unavailable.
 */
export function loadNumber(key: string, fallback = 0): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore: private mode / storage disabled */
  }
}
