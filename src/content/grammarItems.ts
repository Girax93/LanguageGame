/**
 * Article drills for the ACTIVE language. Each `LangPack` builds its own items
 * (German d-er/d-ie/d-as; Norwegian en/ei/et), and this module exposes the
 * active set as a live binding that swaps on a language switch.
 */
import type { Gender } from './lemmas';
import { LANGS, getActiveCode, onLanguageChange } from './lang/registry';

export interface GrammarContentItem {
  id: string;
  before: string;
  stem: string;
  ending: string;
  after: string;
  translation: string;
  gender: Gender;
  requires: string[];
  level: number;
}

const BY_LANG = new Map<string, GrammarContentItem[]>(LANGS.map((l) => [l.code, l.grammarItems]));

export let GRAMMAR_ITEMS: GrammarContentItem[] = BY_LANG.get(getActiveCode()) ?? [];

onLanguageChange((code) => {
  GRAMMAR_ITEMS = BY_LANG.get(code) ?? [];
});
