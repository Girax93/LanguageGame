/**
 * Versioned localStorage persistence for PlayerState. Fails safe: any
 * problem (private mode, corrupt data, version mismatch) yields a fresh
 * default state instead of throwing.
 */
import { ECONOMY } from './economyConfig';
import { defaultPlayerState, STATE_VERSION, type PlayerState } from './types';

const KEY = 'languagegames:player';

export function loadPlayerState(now: number): PlayerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPlayerState(now, ECONOMY.focusStart);
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    if (parsed.version !== STATE_VERSION) {
      return defaultPlayerState(now, ECONOMY.focusStart);
    }
    // Merge over defaults so missing fields are filled in.
    return { ...defaultPlayerState(now, ECONOMY.focusStart), ...parsed } as PlayerState;
  } catch {
    return defaultPlayerState(now, ECONOMY.focusStart);
  }
}

export function savePlayerState(s: PlayerState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearPlayerState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
