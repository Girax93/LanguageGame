/**
 * The Norwegian (Bokmål) language pack. Assembles the Norwegian lemmas, cipher
 * generator, clues, grammar drills and alphabet into a `LangPack`.
 */
import type { LangPack } from '../types';
import { LEMMAS_NO } from './lemmas.no';
import { generateBlockDraftsNO } from './cipher';
import { CLUES_NO } from './cluesData';
import { buildNorwegianGrammarItems } from './grammar';
import {
  NORWEGIAN_ALPHABET,
  NORWEGIAN_ROWS,
  toUpperNO,
  isLetterNO,
  withArticleNO,
  withArticleEnNO,
} from './alphabet';

export const no: LangPack = {
  code: 'no',
  name: 'Norwegian',
  flag: '🇳🇴',
  level: 'Bokmål · A1',
  lemmas: LEMMAS_NO,
  alphabet: NORWEGIAN_ALPHABET,
  toUpper: toUpperNO,
  isLetter: isLetterNO,
  keyboardRows: NORWEGIAN_ROWS,
  withArticle: withArticleNO,
  withArticleEn: withArticleEnNO,
  generateCipherDrafts: (block) => generateBlockDraftsNO(block, LEMMAS_NO),
  grammarItems: buildNorwegianGrammarItems(LEMMAS_NO),
  clues: CLUES_NO,
};
