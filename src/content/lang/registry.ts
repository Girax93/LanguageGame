/**
 * The language registry: the single source of truth for which language is
 * active. Content modules dispatch through `getActiveCode()` / `getActiveLang()`
 * and rebuild their active view when `setActiveContentLanguage` fires (via
 * `onLanguageChange`). Default is German so the app boots exactly as before.
 */
import type { LangPack } from './types';
import { de } from './de/index';
import { no } from './no/index';

/** All registered language packs (order = language-menu order). */
export const LANGS: LangPack[] = [de, no];

const BY_CODE = new Map<string, LangPack>(LANGS.map((l) => [l.code, l]));

let activeCode = 'de';
const listeners: Array<(code: string) => void> = [];

/** Subscribe to language switches (modules rebuild their active view here). */
export function onLanguageChange(fn: (code: string) => void): void {
  listeners.push(fn);
}

export function getActiveCode(): string {
  return activeCode;
}
export function getActiveLang(): LangPack {
  return BY_CODE.get(activeCode) ?? LANGS[0];
}
export function langByCode(code: string): LangPack | undefined {
  return BY_CODE.get(code);
}

/** Switch the active content language and notify every subscriber. */
export function setActiveContentLanguage(code: string): void {
  if (!BY_CODE.has(code) || code === activeCode) return;
  activeCode = code;
  for (const fn of listeners) fn(code);
}
