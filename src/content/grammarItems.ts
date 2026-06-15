import type { Gender } from './vocab';
import { requiresFromText, levelForRequires } from './derive';

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
  { id: 'g-001', before: "", stem: "d", ending: "er", after: " Mann ist gut.", translation: "The man is good.", gender: "m" },
  { id: 'g-002', before: "", stem: "d", ending: "ie", after: " Frau ist schön.", translation: "The woman is beautiful.", gender: "f" },
  { id: 'g-003', before: "", stem: "d", ending: "as", after: " Kind ist klein.", translation: "The child is small.", gender: "n" },
  { id: 'g-004', before: "", stem: "d", ending: "er", after: " Hund ist groß.", translation: "The dog is big.", gender: "m" },
  { id: 'g-005', before: "", stem: "d", ending: "er", after: " Garten ist schön.", translation: "The garden is beautiful.", gender: "m" },
  { id: 'g-006', before: "", stem: "d", ending: "as", after: " Haus ist neu.", translation: "The house is new.", gender: "n" },
  { id: 'g-007', before: "", stem: "d", ending: "ie", after: " Katze ist schnell.", translation: "The cat is fast.", gender: "f" },
  { id: 'g-008', before: "", stem: "d", ending: "as", after: " Auto ist schnell.", translation: "The car is fast.", gender: "n" },
  { id: 'g-009', before: "", stem: "d", ending: "er", after: " Kaffee ist gut.", translation: "The coffee is good.", gender: "m" },
  { id: 'g-010', before: "", stem: "d", ending: "er", after: " Tee ist gut.", translation: "The tea is good.", gender: "m" },
  { id: 'g-011', before: "", stem: "d", ending: "as", after: " Buch ist interessant.", translation: "The book is interesting.", gender: "n" },
  { id: 'g-012', before: "", stem: "d", ending: "er", after: " Apfel ist gut.", translation: "The apple is good.", gender: "m" },
  { id: 'g-013', before: "", stem: "d", ending: "as", after: " Brot ist gut.", translation: "The bread is good.", gender: "n" },
  { id: 'g-014', before: "", stem: "d", ending: "ie", after: " Stadt ist groß.", translation: "The city is big.", gender: "f" },
  { id: 'g-015', before: "", stem: "d", ending: "ie", after: " Schule ist neu.", translation: "The school is new.", gender: "f" },
  { id: 'g-016', before: "", stem: "d", ending: "er", after: " Lehrer ist gut.", translation: "The teacher is good.", gender: "m" },
  { id: 'g-017', before: "", stem: "d", ending: "er", after: " Freund ist gut.", translation: "The friend is good.", gender: "m" },
  { id: 'g-018', before: "", stem: "d", ending: "er", after: " Tisch ist neu.", translation: "The table is new.", gender: "m" },
  { id: 'g-019', before: "", stem: "d", ending: "er", after: " Stuhl ist alt.", translation: "The chair is old.", gender: "m" },
  { id: 'g-020', before: "", stem: "d", ending: "as", after: " Wetter ist schön.", translation: "The weather is beautiful.", gender: "n" },
  { id: 'g-021', before: "", stem: "d", ending: "ie", after: " Sonne ist warm.", translation: "The sun is warm.", gender: "f" },
  { id: 'g-022', before: "", stem: "d", ending: "er", after: " Park ist groß.", translation: "The park is big.", gender: "m" },
  { id: 'g-023', before: "", stem: "d", ending: "er", after: " Ball ist klein.", translation: "The ball is small.", gender: "m" },
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
