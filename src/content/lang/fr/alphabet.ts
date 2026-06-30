/**
 * French alphabet, keyboard and article helpers. French uses A–Z plus the
 * accented letters that appear in everyday words — É È Ê À Â Ç Î Ô Û Ù — each a
 * distinct cipher/Hurdle letter (mirroring how German treats ä/ö/ü/ß and
 * Norwegian æ/ø/å). Uppercasing is standard: every accented letter has a clean
 * single-letter uppercase ('é'→'É', 'ç'→'Ç'), so there is no ß-style quirk.
 *
 * Nouns are NOT capitalised in French. Gender is the TWO-gender system
 * (masculine / feminine); the teaching article is the indefinite un / une — the
 * direct analogue of Norwegian's en/ei/et, and elision-free (unlike le/la → l').
 * The definite le/la is taught everywhere else (lemmas, Learn cards, sentences).
 */
import type { Lemma, Gender } from '../../lemmas';

// The ten accented letters used across the curriculum (ï/ë/œ are avoided in the
// word list so the on-screen keyboard stays a sensible size).
const ACCENTS = ['É', 'È', 'Ê', 'À', 'Â', 'Ç', 'Î', 'Ô', 'Û', 'Ù'];

export const FRENCH_ALPHABET: string[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...ACCENTS,
];

const LETTER_SET = new Set(FRENCH_ALPHABET);

/** Uppercase. French accented letters uppercase cleanly (no ß-style expansion). */
export function toUpperFR(input: string): string {
  return input.toUpperCase();
}

export function isLetterFR(ch: string): boolean {
  return LETTER_SET.has(ch);
}

/**
 * QWERTY base + a dedicated top accent row (Ari's call: keep the familiar QWERTY
 * rather than authentic AZERTY). Four rows; the LAST row is the short Z–M row, so
 * the Hurdle keyboard (which puts Enter/⌫ on the final row) stays uncramped.
 */
export const FRENCH_ROWS: string[][] = [
  ['É', 'È', 'Ê', 'À', 'Â', 'Ç', 'Î', 'Ô', 'Û', 'Ù'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

/** Indefinite article from gender — un (masc.) / une (fem.). */
export function articleFR(gender: Gender): string {
  return gender === 'f' ? 'une' : 'un';
}
/** A noun shown with its teaching article: "un homme", "une femme". */
export function withArticleFR(w: Lemma): string {
  return w.gender ? `${articleFR(w.gender)} ${w.de}` : w.de;
}
/** The English shown with its article: "a man" (indefinite, to match un/une). */
export function withArticleEnFR(w: Lemma): string {
  return w.gender ? `a ${w.en}` : w.en;
}
