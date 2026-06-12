import type { FillBlankDeck } from '../types';

/**
 * Beginner (A1) German starter deck.
 *
 * HOW TO ADD CONTENT
 * ------------------
 * Each item is one object in the `items` array below. Copy an existing
 * one and edit the fields:
 *
 *   - sentence:    the German sentence. Put "___" (three underscores)
 *                  exactly where the missing word goes.
 *   - answer:      the word that fills the blank.
 *   - translation: the English meaning of the whole sentence.
 *   - hint:        (optional) a short nudge shown under the sentence.
 *   - options:     (optional) your own list of wrong choices. If you
 *                  leave this out, the game auto-picks distractors from
 *                  the other answers in the deck.
 *   - level:       'A1' | 'A2' | 'B1'.
 *
 * Keep ids unique. That's it — save and the new item appears in the game.
 */
export const germanA1: FillBlankDeck = {
  name: 'German · Beginner (A1)',
  language: 'de',
  items: [
    {
      id: 'de-a1-001',
      sentence: 'Ich ___ Anna.',
      answer: 'heiße',
      translation: 'My name is Anna.',
      hint: 'heißen — to be called',
      level: 'A1',
    },
    {
      id: 'de-a1-002',
      sentence: 'Wie ___ es dir?',
      answer: 'geht',
      translation: 'How are you?',
      level: 'A1',
    },
    {
      id: 'de-a1-003',
      sentence: 'Ich ___ aus Deutschland.',
      answer: 'komme',
      translation: 'I come from Germany.',
      hint: 'kommen — to come',
      level: 'A1',
    },
    {
      id: 'de-a1-004',
      sentence: 'Wir ___ Wasser.',
      answer: 'trinken',
      translation: 'We drink water.',
      level: 'A1',
    },
    {
      id: 'de-a1-005',
      sentence: 'Sie ___ einen Bruder.',
      answer: 'hat',
      translation: 'She has a brother.',
      hint: 'haben — to have',
      level: 'A1',
    },
    {
      id: 'de-a1-006',
      sentence: 'Das ___ mein Vater.',
      answer: 'ist',
      translation: 'This is my father.',
      level: 'A1',
    },
    {
      id: 'de-a1-007',
      sentence: 'Ich ___ Deutsch.',
      answer: 'lerne',
      translation: 'I am learning German.',
      hint: 'lernen — to learn',
      level: 'A1',
    },
    {
      id: 'de-a1-008',
      sentence: 'Er ___ ein Buch.',
      answer: 'liest',
      translation: 'He is reading a book.',
      hint: 'lesen — to read',
      level: 'A1',
    },
    {
      id: 'de-a1-009',
      sentence: 'Wir ___ nach Berlin.',
      answer: 'fahren',
      translation: 'We are going to Berlin.',
      hint: 'fahren — to go / drive',
      level: 'A1',
    },
    {
      id: 'de-a1-010',
      sentence: 'Ich ___ einen Hund.',
      answer: 'habe',
      translation: 'I have a dog.',
      level: 'A1',
    },
    {
      id: 'de-a1-011',
      sentence: 'Die Kinder ___ im Park.',
      answer: 'spielen',
      translation: 'The children are playing in the park.',
      level: 'A1',
    },
    {
      id: 'de-a1-012',
      sentence: 'Was ___ du gern?',
      answer: 'isst',
      translation: 'What do you like to eat?',
      hint: 'essen — to eat',
      level: 'A1',
    },
    {
      id: 'de-a1-013',
      sentence: 'Ich ___ einen Kaffee, bitte.',
      answer: 'möchte',
      translation: 'I would like a coffee, please.',
      level: 'A1',
    },
    {
      id: 'de-a1-014',
      sentence: 'Heute ___ das Wetter schön.',
      answer: 'ist',
      translation: 'Today the weather is nice.',
      level: 'A1',
    },
    {
      id: 'de-a1-015',
      sentence: 'Wo ___ die Toilette?',
      answer: 'ist',
      translation: 'Where is the toilet?',
      level: 'A1',
    },
    {
      id: 'de-a1-016',
      sentence: 'Ich ___ müde.',
      answer: 'bin',
      translation: 'I am tired.',
      hint: 'sein — to be (ich-form)',
      level: 'A1',
    },
    {
      id: 'de-a1-017',
      sentence: 'Wir ___ gute Freunde.',
      answer: 'sind',
      translation: 'We are good friends.',
      hint: 'sein — to be (wir-form)',
      level: 'A1',
    },
    {
      id: 'de-a1-018',
      sentence: 'Kannst du mir ___?',
      answer: 'helfen',
      translation: 'Can you help me?',
      level: 'A1',
    },
    {
      id: 'de-a1-019',
      sentence: 'Ich ___ ins Kino.',
      answer: 'gehe',
      translation: 'I am going to the cinema.',
      hint: 'gehen — to go',
      level: 'A1',
    },
    {
      id: 'de-a1-020',
      sentence: 'Sie ___ sehr gut Englisch.',
      answer: 'spricht',
      translation: 'She speaks English very well.',
      hint: 'sprechen — to speak',
      level: 'A1',
    },
    {
      id: 'de-a1-021',
      sentence: 'Wie viel ___ das?',
      answer: 'kostet',
      translation: 'How much does this cost?',
      hint: 'kosten — to cost',
      level: 'A1',
    },
    {
      id: 'de-a1-022',
      sentence: 'Der Zug ___ um neun Uhr.',
      answer: 'kommt',
      translation: 'The train arrives at nine o’clock.',
      level: 'A1',
    },
  ],
};
