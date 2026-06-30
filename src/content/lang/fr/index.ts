/**
 * The French language pack. Assembles the French lemmas, cipher generator, clues,
 * grammar drills and alphabet into a `LangPack`. Gender is two-way (un/une); the
 * games are unchanged — everything French-specific lives in this folder.
 */
import type { LangPack } from '../types';
import { LEMMAS_FR } from './lemmas.fr';
import { generateBlockDraftsFR } from './cipher';
import { CLUES_FR } from './cluesData';
import { buildFrenchGrammarItems } from './grammar';
import {
  FRENCH_ALPHABET,
  FRENCH_ROWS,
  toUpperFR,
  isLetterFR,
  withArticleFR,
  withArticleEnFR,
} from './alphabet';

export const fr: LangPack = {
  code: 'fr',
  name: 'French',
  flag: '🇫🇷',
  level: 'Beginner · A1',
  lemmas: LEMMAS_FR,
  alphabet: FRENCH_ALPHABET,
  toUpper: toUpperFR,
  isLetter: isLetterFR,
  keyboardRows: FRENCH_ROWS,
  withArticle: withArticleFR,
  withArticleEn: withArticleEnFR,
  generateCipherDrafts: (block) => generateBlockDraftsFR(block, LEMMAS_FR),
  grammarItems: buildFrenchGrammarItems(LEMMAS_FR),
  clues: CLUES_FR,
};
