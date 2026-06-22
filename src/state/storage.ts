/**
 * Versioned localStorage persistence for PlayerState, namespaced PER LANGUAGE so
 * German and Norwegian progress never collide. The chosen language is stored
 * separately. Fails safe: any problem yields a fresh default state.
 */
import { ECONOMY } from './economyConfig';
import { defaultPlayerState, STATE_VERSION, type PlayerState } from './types';

const PREFIX = 'languagegames:player';
const LANG_KEY = 'languagegames:lang';
const LEGACY_KEY = 'languagegames:player'; // pre-multilanguage (German) save

function keyFor(code: string): string {
  return `${PREFIX}:${code}`;
}

export function loadActiveLanguage(): string {
  try {
    return localStorage.getItem(LANG_KEY) || 'de';
  } catch {
    return 'de';
  }
}
export function saveActiveLanguage(code: string): void {
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch {
    /* ignore */
  }
}

export function loadPlayerState(now: number, code: string): PlayerState {
  try {
    let raw = localStorage.getItem(keyFor(code));
    // One-time migration: fold a pre-multilanguage German save into 'de'.
    if (!raw && code === 'de') raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return defaultPlayerState(now, ECONOMY.focusStart);
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    if (parsed.version !== STATE_VERSION) {
      return defaultPlayerState(now, ECONOMY.focusStart);
    }
    return { ...defaultPlayerState(now, ECONOMY.focusStart), ...parsed } as PlayerState;
  } catch {
    return defaultPlayerState(now, ECONOMY.focusStart);
  }
}

export function savePlayerState(s: PlayerState, code: string): void {
  try {
    localStorage.setItem(keyFor(code), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearPlayerState(code: string): void {
  try {
    localStorage.removeItem(keyFor(code));
  } catch {
    /* ignore */
  }
}
