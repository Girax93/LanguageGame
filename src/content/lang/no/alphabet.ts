/**
 * Norwegian alphabet, keyboard and article helpers. Norwegian uses A–Z plus
 * Æ, Ø, Å (29 letters). Uppercasing is standard (no ß-style quirk). Nouns are
 * NOT capitalised in Norwegian. Articles are the indefinite en/ei/et (the
 * three-gender system: en→m, ei→f, et→n).
 */
import type { Lemma, Gender } from '../../lemmas';

export const NORWEGIAN_ALPHABET: string[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Æ',
  'Ø',
  'Å',
];

const LETTER_SET = new Set(NORWEGIAN_ALPHABET);

/** Uppercase (Æ/Ø/Å uppercase cleanly; nothing expands to two letters). */
export function toUpperNO(input: string): string {
  return input.toUpperCase();
}

export function isLetterNO(ch: string): boolean {
  return LETTER_SET.has(ch);
}

/** Standard Norwegian (QWERTY) layout with Å, Ø, Æ. */
export const NORWEGIAN_ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ø', 'Æ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

/** Indefinite article from gender — en / ei / et. */
export function articleNO(gender: Gender): string {
  return gender === 'm' ? 'en' : gender === 'f' ? 'ei' : 'et';
}
/** A noun shown with its teaching article: "en mann", "ei jente", "et hus". */
export function withArticleNO(w: Lemma): string {
  return w.gender ? `${articleNO(w.gender)} ${w.de}` : w.de;
}
/** The English shown with its article: "a man" (indefinite, to match en/ei/et). */
export function withArticleEnNO(w: Lemma): string {
  return w.gender ? `a ${w.en}` : w.en;
}
