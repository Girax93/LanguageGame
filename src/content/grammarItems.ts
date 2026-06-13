import type { Gender } from './vocab';
import { requiresFromText, levelForRequires } from './derive';

/**
 * Grammar: article-ending drill. The article shows its STEM with the ENDING
 * blank and NO number, so it must be recalled. `before`/`after` are natural
 * case (uppercased for display by the board).
 *
 * `requires` = the article's base word + every word in before/after; `level`
 * derived from those. Eligible only when all required words are mastered.
 */
export interface GrammarContentItem {
  id: string;
  before: string;
  stem: string;
  ending: string;
  after: string;
  translation: string;
  gender: Gender;
  requires: string[];
  level: number;
}

interface RawGrammar {
  id: string;
  before: string;
  stem: string;
  ending: string;
  after: string;
  translation: string;
  gender: Gender;
}

const RAW: RawGrammar[] = [
  { id: 'g-01', before: '', stem: 'd', ending: 'er', after: ' Mann ist gut.', translation: 'The man is good.', gender: 'm' },
  { id: 'g-02', before: '', stem: 'd', ending: 'er', after: ' Hund ist gut.', translation: 'The dog is good.', gender: 'm' },
  { id: 'g-03', before: '', stem: 'd', ending: 'ie', after: ' Frau ist klein.', translation: 'The woman is small.', gender: 'f' },
  { id: 'g-04', before: '', stem: 'd', ending: 'as', after: ' Kind ist klein.', translation: 'The child is small.', gender: 'n' },
  { id: 'g-05', before: '', stem: 'd', ending: 'as', after: ' Haus ist groß.', translation: 'The house is big.', gender: 'n' },
  { id: 'g-06', before: '', stem: 'd', ending: 'as', after: ' Auto ist neu.', translation: 'The car is new.', gender: 'n' },
  { id: 'g-07', before: '', stem: 'd', ending: 'ie', after: ' Katze ist schön.', translation: 'The cat is beautiful.', gender: 'f' },
  { id: 'g-08', before: 'Das ist ', stem: 'ein', ending: 'e', after: ' Katze.', translation: 'That is a cat.', gender: 'f' },
];

function articleBaseId(stem: string, gender: Gender): string {
  if (stem.toLowerCase() === 'ein') return 'w-ein';
  return gender === 'm' ? 'w-der' : gender === 'f' ? 'w-die' : 'w-das';
}

export const GRAMMAR_ITEMS: GrammarContentItem[] = RAW.map((r) => {
  const requires = Array.from(
    new Set([articleBaseId(r.stem, r.gender), ...requiresFromText(r.before + ' ' + r.after)]),
  );
  return { ...r, requires, level: levelForRequires(requires) };
});
