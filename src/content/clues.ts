/**
 * Crossword clues for the ACTIVE language. Each `LangPack` supplies its own clue
 * map (keyed by lemma id). A clue is a short DEFINITION in the course language
 * (`de` field — German for German, Norwegian for Norwegian) plus its English
 * equivalent (`en`), NOT the literal translation.
 */
import { wordById } from './vocab';
import { LANGS, getActiveCode, onLanguageChange } from './lang/registry';

export interface Clue {
  de: string;
  en: string;
}

const BY_LANG = new Map<string, Record<string, Clue>>(LANGS.map((l) => [l.code, l.clues]));

export let CLUES: Record<string, Clue> = BY_LANG.get(getActiveCode()) ?? {};

onLanguageChange((code) => {
  CLUES = BY_LANG.get(code) ?? {};
});

export function clueFor(wordId: string, lang: 'de' | 'en'): string {
  const c = CLUES[wordId];
  if (!c) return wordById(wordId)?.en ?? wordId;
  return lang === 'de' ? c.de : c.en;
}
