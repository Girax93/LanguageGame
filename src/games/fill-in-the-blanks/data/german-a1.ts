import type { CipherDeck } from '../types';

/**
 * Beginner (A1) German cryptogram deck — short sentences and common
 * proverbs. The player decodes each one letter by letter.
 *
 * HOW TO ADD CONTENT
 * ------------------
 * Add an object to `items`. Copy an existing one and edit:
 *   - sentence:    German text in natural case. Umlauts (ä ö ü) and ß are
 *                  fine and become their own cipher letters. Punctuation
 *                  (. , ! ? …) is shown as-is and is not part of the cipher.
 *   - translation: English meaning (shown only when the hint is toggled on).
 *   - level:       'A1' | 'A2' | 'B1'.
 * Keep ids unique. Shorter sentences are easier puzzles.
 */
export const germanA1: CipherDeck = {
  name: 'German · Beginner (A1)',
  language: 'de',
  items: [
    { id: 'de-a1-001', sentence: 'Guten Morgen!', translation: 'Good morning!', level: 'A1' },
    { id: 'de-a1-002', sentence: 'Ich liebe dich.', translation: 'I love you.', level: 'A1' },
    { id: 'de-a1-003', sentence: 'Wie heißt du?', translation: 'What is your name?', level: 'A1' },
    { id: 'de-a1-004', sentence: 'Das Leben ist schön.', translation: 'Life is beautiful.', level: 'A1' },
    { id: 'de-a1-005', sentence: 'Die Katze schläft.', translation: 'The cat is sleeping.', level: 'A1' },
    { id: 'de-a1-006', sentence: 'Übung macht den Meister.', translation: 'Practice makes perfect.', level: 'A1' },
    { id: 'de-a1-007', sentence: 'Ende gut, alles gut.', translation: "All's well that ends well.", level: 'A1' },
    { id: 'de-a1-008', sentence: 'Aller Anfang ist schwer.', translation: 'Every beginning is hard.', level: 'A1' },
    { id: 'de-a1-009', sentence: 'Stille Wasser sind tief.', translation: 'Still waters run deep.', level: 'A2' },
    { id: 'de-a1-010', sentence: 'Der Apfel fällt nicht weit vom Stamm.', translation: "The apple doesn't fall far from the tree.", level: 'A2' },
    { id: 'de-a1-011', sentence: 'Morgenstund hat Gold im Mund.', translation: 'The early bird catches the worm.', level: 'A2' },
    { id: 'de-a1-012', sentence: 'Wer A sagt, muss auch B sagen.', translation: 'In for a penny, in for a pound.', level: 'A2' },
  ],
};
