import type { Level } from '../games/fill-in-the-blanks/types';

/**
 * Cipher sentences. Each is tagged with the PACK it belongs to and a LEVEL
 * (difficulty, see state/difficulty.ts). Every word in a sentence must exist
 * in vocab at a pack <= the item's pack (validated in tests) so a sentence
 * never shows a word the player hasn't learned.
 */
export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  pack: number;
  level: Level;
}

export const CIPHER_ITEMS: CipherContentItem[] = [
  // --- Pack 1 (gentle levels) ---
  { id: 'c1-01', sentence: 'Der Mann ist gut.', translation: 'The man is good.', pack: 1, level: 1 },
  { id: 'c1-02', sentence: 'Die Frau ist müde.', translation: 'The woman is tired.', pack: 1, level: 1 },
  { id: 'c1-03', sentence: 'Das ist ein Hund.', translation: 'That is a dog.', pack: 1, level: 1 },
  { id: 'c1-04', sentence: 'Das Kind ist klein.', translation: 'The child is small.', pack: 1, level: 2 },
  { id: 'c1-05', sentence: 'Das Haus ist groß.', translation: 'The house is big.', pack: 1, level: 2 },
  { id: 'c1-06', sentence: 'Der Mann hat ein Haus.', translation: 'The man has a house.', pack: 1, level: 2 },
  { id: 'c1-07', sentence: 'Der Hund ist nicht klein.', translation: 'The dog is not small.', pack: 1, level: 3 },

  // --- Pack 2 (fades the scaffolding) ---
  { id: 'c2-01', sentence: 'Das Auto ist neu.', translation: 'The car is new.', pack: 2, level: 2 },
  { id: 'c2-02', sentence: 'Der Apfel ist gut.', translation: 'The apple is good.', pack: 2, level: 3 },
  { id: 'c2-03', sentence: 'Das Buch ist alt.', translation: 'The book is old.', pack: 2, level: 4 },
  { id: 'c2-04', sentence: 'Das Wasser ist gut.', translation: 'The water is good.', pack: 2, level: 4 },
  { id: 'c2-05', sentence: 'Das Auto ist nicht alt.', translation: 'The car is not old.', pack: 2, level: 5 },
  { id: 'c2-06', sentence: 'Die Katze ist klein und schön.', translation: 'The cat is small and beautiful.', pack: 2, level: 6 },
];
