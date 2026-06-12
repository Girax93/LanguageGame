/**
 * Vocabulary, organized into PACKS of ~20 words. The player learns a pack in
 * LEARN mode; cipher & grammar content is gated on learned packs.
 *
 * Ship: Pack 1 (20 beginner words) + a partial Pack 2 (to demo unlocking).
 *
 * TO ADD WORDS: append to a pack's `words` (unique ids). To add a pack, add a
 * VocabPack with the next `pack` number. Cipher/grammar items reference these
 * by pack number (see cipherItems.ts / grammarItems.ts).
 */
export type Gender = 'm' | 'f' | 'n';

export interface VocabWord {
  id: string;
  /** German surface form as it appears in sentences. */
  de: string;
  en: string;
  /** Gender for nouns (drives the grammar article drill). */
  gender?: Gender;
  pack: number;
}

export interface VocabPack {
  pack: number;
  name: string;
  words: VocabWord[];
}

export const PACKS: VocabPack[] = [
  {
    pack: 1,
    name: 'Pack 1 · First Words',
    words: [
      { id: 'w-ich', de: 'ich', en: 'I', pack: 1 },
      { id: 'w-du', de: 'du', en: 'you', pack: 1 },
      { id: 'w-ist', de: 'ist', en: 'is', pack: 1 },
      { id: 'w-bin', de: 'bin', en: 'am', pack: 1 },
      { id: 'w-hat', de: 'hat', en: 'has', pack: 1 },
      { id: 'w-und', de: 'und', en: 'and', pack: 1 },
      { id: 'w-nicht', de: 'nicht', en: 'not', pack: 1 },
      { id: 'w-der', de: 'der', en: 'the (m.)', pack: 1 },
      { id: 'w-die', de: 'die', en: 'the (f.)', pack: 1 },
      { id: 'w-das', de: 'das', en: 'the (n.) / that', pack: 1 },
      { id: 'w-ein', de: 'ein', en: 'a / an', pack: 1 },
      { id: 'w-mann', de: 'Mann', en: 'man', gender: 'm', pack: 1 },
      { id: 'w-frau', de: 'Frau', en: 'woman', gender: 'f', pack: 1 },
      { id: 'w-kind', de: 'Kind', en: 'child', gender: 'n', pack: 1 },
      { id: 'w-hund', de: 'Hund', en: 'dog', gender: 'm', pack: 1 },
      { id: 'w-haus', de: 'Haus', en: 'house', gender: 'n', pack: 1 },
      { id: 'w-gut', de: 'gut', en: 'good', pack: 1 },
      { id: 'w-gross', de: 'groß', en: 'big', pack: 1 },
      { id: 'w-klein', de: 'klein', en: 'small', pack: 1 },
      { id: 'w-muede', de: 'müde', en: 'tired', pack: 1 },
    ],
  },
  {
    pack: 2,
    name: 'Pack 2 · More Things',
    words: [
      { id: 'w-auto', de: 'Auto', en: 'car', gender: 'n', pack: 2 },
      { id: 'w-buch', de: 'Buch', en: 'book', gender: 'n', pack: 2 },
      { id: 'w-katze', de: 'Katze', en: 'cat', gender: 'f', pack: 2 },
      { id: 'w-wasser', de: 'Wasser', en: 'water', gender: 'n', pack: 2 },
      { id: 'w-apfel', de: 'Apfel', en: 'apple', gender: 'm', pack: 2 },
      { id: 'w-schoen', de: 'schön', en: 'beautiful', pack: 2 },
      { id: 'w-alt', de: 'alt', en: 'old', pack: 2 },
      { id: 'w-neu', de: 'neu', en: 'new', pack: 2 },
    ],
  },
];

export const ALL_WORDS: VocabWord[] = PACKS.flatMap((p) => p.words);

export function wordById(id: string): VocabWord | undefined {
  return ALL_WORDS.find((w) => w.id === id);
}

/** Lowercased German surface -> pack number, for content validation. */
export const SURFACE_TO_PACK: Record<string, number> = Object.fromEntries(
  ALL_WORDS.map((w) => [w.de.toLowerCase(), w.pack]),
);
