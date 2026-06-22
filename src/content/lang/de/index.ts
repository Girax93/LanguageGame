/**
 * The German language pack. Assembles the existing German content (lemmas,
 * cipher generator, clues, alphabet) into a `LangPack`. Behaviour is identical
 * to the pre-multilanguage app — this is just the German implementation behind
 * the new abstraction.
 */
import type { LangPack } from '../types';
import { LEMMAS } from '../../lemmas';
import { generateBlockDrafts } from '../../generateCipher';
import { CLUES_DE } from './cluesData';
import { buildGermanGrammarItems } from './grammar';
import {
  GERMAN_ALPHABET,
  GERMAN_ROWS,
  toUpperDE,
  isLetterDE,
  withArticleDE,
  withArticleEnDE,
} from './alphabet';

export const de: LangPack = {
  code: 'de',
  name: 'German',
  flag: '🇩🇪',
  level: 'Beginner · A1',
  lemmas: LEMMAS,
  alphabet: GERMAN_ALPHABET,
  toUpper: toUpperDE,
  isLetter: isLetterDE,
  keyboardRows: GERMAN_ROWS,
  withArticle: withArticleDE,
  withArticleEn: withArticleEnDE,
  generateCipherDrafts: (block) => generateBlockDrafts(block, LEMMAS),
  grammarItems: buildGermanGrammarItems(LEMMAS),
  clues: CLUES_DE,
};
