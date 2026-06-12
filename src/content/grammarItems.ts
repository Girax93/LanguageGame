import type { Gender } from './vocab';

/**
 * Grammar: German article-ending drill. The article is shown as a STEM plus a
 * blank ENDING with NO number under it, so the ending can't be deduced — the
 * player must recall the gender/case. Letters are uppercased to match the
 * cipher's look; the player types the ending on the same keyboard.
 *
 * Tagged with PACK (the noun's pack) for gating and LEVEL for difficulty feel.
 * Keep sentences within learned vocabulary (only the article is inflected).
 */
export interface GrammarContentItem {
  id: string;
  /** Text shown before the article (already display-cased). */
  before: string;
  /** The visible stem of the article, e.g. "D" or "EIN". */
  stem: string;
  /** The ending the player must fill, e.g. "ER", "IE", "AS", "E". */
  ending: string;
  /** Text shown after the article. */
  after: string;
  translation: string;
  gender: Gender;
  pack: number;
  level: number;
}

export const GRAMMAR_ITEMS: GrammarContentItem[] = [
  // --- Pack 1: nominative der/die/das ---
  { id: 'g1-01', before: '', stem: 'D', ending: 'ER', after: ' MANN IST GROSS.', translation: 'The man is big.', gender: 'm', pack: 1, level: 1 },
  { id: 'g1-02', before: '', stem: 'D', ending: 'IE', after: ' FRAU IST MÜDE.', translation: 'The woman is tired.', gender: 'f', pack: 1, level: 1 },
  { id: 'g1-03', before: '', stem: 'D', ending: 'AS', after: ' KIND IST KLEIN.', translation: 'The child is small.', gender: 'n', pack: 1, level: 1 },
  { id: 'g1-04', before: '', stem: 'D', ending: 'ER', after: ' HUND IST GUT.', translation: 'The dog is good.', gender: 'm', pack: 1, level: 2 },
  { id: 'g1-05', before: '', stem: 'D', ending: 'AS', after: ' HAUS IST GROSS.', translation: 'The house is big.', gender: 'n', pack: 1, level: 2 },

  // --- Pack 2: more nouns + an ein-form ---
  { id: 'g2-01', before: '', stem: 'D', ending: 'AS', after: ' AUTO IST NEU.', translation: 'The car is new.', gender: 'n', pack: 2, level: 1 },
  { id: 'g2-02', before: '', stem: 'D', ending: 'IE', after: ' KATZE IST SCHÖN.', translation: 'The cat is beautiful.', gender: 'f', pack: 2, level: 2 },
  { id: 'g2-03', before: '', stem: 'D', ending: 'ER', after: ' APFEL IST ALT.', translation: 'The apple is old.', gender: 'm', pack: 2, level: 2 },
  { id: 'g2-04', before: 'DAS IST ', stem: 'EIN', ending: 'E', after: ' KATZE.', translation: 'That is a cat.', gender: 'f', pack: 2, level: 2 },
];
