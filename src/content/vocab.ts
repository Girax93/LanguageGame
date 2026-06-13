/**
 * Vocabulary as a single ORDERED list, chunked into small SETS
 * (PROGRESSION.wordsPerSet). There is ONE cumulative mastered-words pool that
 * grows as the player learns sets in order.
 *
 * EVERY word that can appear in a sentence — nouns, verbs, adjectives AND
 * function words (articles, pronouns, conjunctions) — is a learnable item
 * here. Cipher/grammar puzzles require word-ids from this list, and a puzzle
 * is only eligible once ALL its required words are mastered.
 *
 * TO ADD WORDS: append to ORDERED_WORDS (unique ids; nouns get a gender). The
 * set boundaries follow automatically from wordsPerSet.
 */
import { PROGRESSION } from '../state/progressionConfig';

export type Gender = 'm' | 'f' | 'n';

export interface VocabWord {
  id: string;
  /** German surface form as it appears in sentences. */
  de: string;
  en: string;
  gender?: Gender;
}

export interface VocabSet {
  index: number;
  name: string;
  words: VocabWord[];
}

/** Order matters: early words must be able to form a few sentences. */
const ORDERED_WORDS: VocabWord[] = [
  // set 0
  { id: 'w-der', de: 'der', en: 'the (m.)' },
  { id: 'w-ist', de: 'ist', en: 'is' },
  { id: 'w-mann', de: 'Mann', en: 'man', gender: 'm' },
  { id: 'w-gut', de: 'gut', en: 'good' },
  { id: 'w-hund', de: 'Hund', en: 'dog', gender: 'm' },
  // set 1
  { id: 'w-die', de: 'die', en: 'the (f.)' },
  { id: 'w-das', de: 'das', en: 'the (n.) / that' },
  { id: 'w-frau', de: 'Frau', en: 'woman', gender: 'f' },
  { id: 'w-kind', de: 'Kind', en: 'child', gender: 'n' },
  { id: 'w-klein', de: 'klein', en: 'small' },
  // set 2
  { id: 'w-ein', de: 'ein', en: 'a / an' },
  { id: 'w-haus', de: 'Haus', en: 'house', gender: 'n' },
  { id: 'w-gross', de: 'groß', en: 'big' },
  { id: 'w-und', de: 'und', en: 'and' },
  { id: 'w-nicht', de: 'nicht', en: 'not' },
  // set 3
  { id: 'w-ich', de: 'ich', en: 'I' },
  { id: 'w-bin', de: 'bin', en: 'am' },
  { id: 'w-du', de: 'du', en: 'you' },
  { id: 'w-muede', de: 'müde', en: 'tired' },
  { id: 'w-hat', de: 'hat', en: 'has' },
  // set 4
  { id: 'w-auto', de: 'Auto', en: 'car', gender: 'n' },
  { id: 'w-neu', de: 'neu', en: 'new' },
  { id: 'w-katze', de: 'Katze', en: 'cat', gender: 'f' },
  { id: 'w-schoen', de: 'schön', en: 'beautiful' },
  { id: 'w-alt', de: 'alt', en: 'old' },
  // set 5
  { id: 'w-buch', de: 'Buch', en: 'book', gender: 'n' },
  { id: 'w-wasser', de: 'Wasser', en: 'water', gender: 'n' },
  { id: 'w-apfel', de: 'Apfel', en: 'apple', gender: 'm' },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const SETS: VocabSet[] = chunk(ORDERED_WORDS, PROGRESSION.wordsPerSet).map(
  (words, index) => ({ index, name: `Set ${index + 1}`, words }),
);

export const ALL_WORDS: VocabWord[] = ORDERED_WORDS;

const ID_TO_SET: Record<string, number> = Object.fromEntries(
  SETS.flatMap((s) => s.words.map((w) => [w.id, s.index])),
);

const SURFACE_TO_ID_MAP: Record<string, string> = Object.fromEntries(
  ALL_WORDS.map((w) => [w.de.toLowerCase(), w.id]),
);

export const SURFACE_TO_ID: Record<string, string> = SURFACE_TO_ID_MAP;

export function wordById(id: string): VocabWord | undefined {
  return ALL_WORDS.find((w) => w.id === id);
}

/** Which set a word belongs to (-1 if unknown). */
export function setIndexForWord(id: string): number {
  return ID_TO_SET[id] ?? -1;
}
