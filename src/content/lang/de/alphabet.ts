/**
 * German alphabet, keyboard and article helpers — the canonical home for what
 * used to live in `games/fill-in-the-blanks/cipher.ts`. Kept dependency-free
 * (no registry import) so it can be a leaf in the language graph.
 *
 * German specifics: Ä, Ö, Ü and ß are their own distinct cipher letters, and
 * "ß".toUpperCase() === "SS" — which we must NOT do — so `toUpperDE` keeps ß.
 */
import type { Lemma, Gender } from '../../lemmas';

export const GERMAN_ALPHABET: string[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Ä',
  'Ö',
  'Ü',
  'ß',
];

const LETTER_SET = new Set(GERMAN_ALPHABET);

/** Uppercase that keeps ß as a single ß (instead of expanding to "SS"). */
export function toUpperDE(input: string): string {
  let out = '';
  for (const ch of input) {
    out += ch === 'ß' ? 'ß' : ch.toUpperCase();
  }
  return out;
}

/** Is this (already-uppercased) character one of our cipher letters? */
export function isLetterDE(ch: string): boolean {
  return LETTER_SET.has(ch);
}

/** QWERTZ-style German layout, including ä/ö/ü and ß as their own keys. */
export const GERMAN_ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['Y', 'X', 'C', 'V', 'B', 'N', 'M', 'ß'],
];

/** Definite article from gender (der / die / das). */
export function articleDE(gender: Gender): string {
  return gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
}
/** A noun shown with its teaching article: "der Mann". */
export function withArticleDE(w: Lemma): string {
  return w.gender ? `${articleDE(w.gender)} ${w.de}` : w.de;
}
/** The English shown with its article: "the man". */
export function withArticleEnDE(w: Lemma): string {
  return w.gender ? `the ${w.en}` : w.en;
}
