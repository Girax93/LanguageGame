import { requiresFromText, levelForRequires } from './derive';

/**
 * Cipher sentences. `requires` (word-ids) and `level` are DERIVED from the
 * sentence so they can never drift from the actual words used. A sentence is
 * eligible only when every required word is mastered (see state/progression).
 */
export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  requires: string[];
  level: number;
}

interface RawCipher {
  id: string;
  sentence: string;
  translation: string;
}

const RAW: RawCipher[] = [
  { id: 'c-01', sentence: 'Der Mann ist gut.', translation: 'The man is good.' },
  { id: 'c-02', sentence: 'Der Hund ist gut.', translation: 'The dog is good.' },
  { id: 'c-03', sentence: 'Die Frau ist klein.', translation: 'The woman is small.' },
  { id: 'c-04', sentence: 'Das Kind ist klein.', translation: 'The child is small.' },
  { id: 'c-05', sentence: 'Der Mann ist klein.', translation: 'The man is small.' },
  { id: 'c-06', sentence: 'Das Haus ist groß.', translation: 'The house is big.' },
  { id: 'c-07', sentence: 'Das ist ein Haus.', translation: 'That is a house.' },
  { id: 'c-08', sentence: 'Der Hund ist nicht klein.', translation: 'The dog is not small.' },
  { id: 'c-09', sentence: 'Der Mann ist groß und gut.', translation: 'The man is big and good.' },
  { id: 'c-10', sentence: 'Ich bin müde.', translation: 'I am tired.' },
  { id: 'c-11', sentence: 'Der Mann hat ein Haus.', translation: 'The man has a house.' },
  { id: 'c-12', sentence: 'Das Auto ist neu.', translation: 'The car is new.' },
  { id: 'c-13', sentence: 'Die Katze ist schön.', translation: 'The cat is beautiful.' },
  { id: 'c-14', sentence: 'Das Auto ist nicht alt.', translation: 'The car is not old.' },
  { id: 'c-15', sentence: 'Die Katze ist klein und schön.', translation: 'The cat is small and beautiful.' },
  { id: 'c-16', sentence: 'Das Buch ist alt.', translation: 'The book is old.' },
  { id: 'c-17', sentence: 'Der Apfel ist gut.', translation: 'The apple is good.' },
  { id: 'c-18', sentence: 'Das Wasser ist gut.', translation: 'The water is good.' },
];

export const CIPHER_ITEMS: CipherContentItem[] = RAW.map((r) => {
  const requires = requiresFromText(r.sentence);
  return { ...r, requires, level: levelForRequires(requires) };
});
