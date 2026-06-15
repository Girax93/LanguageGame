import { PROGRESSION } from '../state/progressionConfig';

export type Gender = 'm' | 'f' | 'n';

export interface VocabWord {
  id: string;
  de: string;
  en: string;
  gender?: Gender;
}

export interface VocabSet {
  index: number;
  name: string;
  words: VocabWord[];
}

const ORDERED_WORDS: VocabWord[] = [
  { id: "w-der", de: "der", en: "the (m.)" },
  { id: "w-ist", de: "ist", en: "is" },
  { id: "w-mann", de: "Mann", en: "man", gender: "m" },
  { id: "w-gut", de: "gut", en: "good" },
  { id: "w-gross", de: "groß", en: "big" },
  { id: "w-die", de: "die", en: "the (f.)" },
  { id: "w-frau", de: "Frau", en: "woman", gender: "f" },
  { id: "w-schoen", de: "schön", en: "beautiful" },
  { id: "w-und", de: "und", en: "and" },
  { id: "w-auch", de: "auch", en: "also" },
  { id: "w-das", de: "das", en: "the (n.) / that" },
  { id: "w-kind", de: "Kind", en: "child", gender: "n" },
  { id: "w-klein", de: "klein", en: "small" },
  { id: "w-sehr", de: "sehr", en: "very" },
  { id: "w-nicht", de: "nicht", en: "not" },
  { id: "w-ich", de: "ich", en: "I" },
  { id: "w-bin", de: "bin", en: "am" },
  { id: "w-du", de: "du", en: "you" },
  { id: "w-bist", de: "bist", en: "are (you)" },
  { id: "w-muede", de: "müde", en: "tired" },
  { id: "w-ein", de: "ein", en: "a (m./n.)" },
  { id: "w-hund", de: "Hund", en: "dog", gender: "m" },
  { id: "w-hat", de: "hat", en: "has" },
  { id: "w-einen", de: "einen", en: "a (m. acc.)" },
  { id: "w-garten", de: "Garten", en: "garden", gender: "m" },
  { id: "w-haus", de: "Haus", en: "house", gender: "n" },
  { id: "w-neu", de: "neu", en: "new" },
  { id: "w-alt", de: "alt", en: "old" },
  { id: "w-hier", de: "hier", en: "here" },
  { id: "w-heute", de: "heute", en: "today" },
  { id: "w-katze", de: "Katze", en: "cat", gender: "f" },
  { id: "w-eine", de: "eine", en: "a (f.)" },
  { id: "w-auto", de: "Auto", en: "car", gender: "n" },
  { id: "w-schnell", de: "schnell", en: "fast" },
  { id: "w-langsam", de: "langsam", en: "slow" },
  { id: "w-wir", de: "wir", en: "we" },
  { id: "w-sind", de: "sind", en: "are" },
  { id: "w-ihr", de: "ihr", en: "you (pl.)" },
  { id: "w-seid", de: "seid", en: "are (you pl.)" },
  { id: "w-gluecklich", de: "glücklich", en: "happy" },
  { id: "w-trinkt", de: "trinkt", en: "drinks" },
  { id: "w-wasser", de: "Wasser", en: "water", gender: "n" },
  { id: "w-kaffee", de: "Kaffee", en: "coffee", gender: "m" },
  { id: "w-gern", de: "gern", en: "gladly" },
  { id: "w-tee", de: "Tee", en: "tea", gender: "m" },
  { id: "w-buch", de: "Buch", en: "book", gender: "n" },
  { id: "w-liest", de: "liest", en: "reads" },
  { id: "w-interessant", de: "interessant", en: "interesting" },
  { id: "w-oder", de: "oder", en: "or" },
  { id: "w-aber", de: "aber", en: "but" },
  { id: "w-apfel", de: "Apfel", en: "apple", gender: "m" },
  { id: "w-isst", de: "isst", en: "eats" },
  { id: "w-brot", de: "Brot", en: "bread", gender: "n" },
  { id: "w-jetzt", de: "jetzt", en: "now" },
  { id: "w-oft", de: "oft", en: "often" },
  { id: "w-stadt", de: "Stadt", en: "city", gender: "f" },
  { id: "w-wohnt", de: "wohnt", en: "lives" },
  { id: "w-schule", de: "Schule", en: "school", gender: "f" },
  { id: "w-lehrer", de: "Lehrer", en: "teacher", gender: "m" },
  { id: "w-freund", de: "Freund", en: "friend", gender: "m" },
  { id: "w-kommt", de: "kommt", en: "comes" },
  { id: "w-geht", de: "geht", en: "goes" },
  { id: "w-immer", de: "immer", en: "always" },
  { id: "w-nie", de: "nie", en: "never" },
  { id: "w-bald", de: "bald", en: "soon" },
  { id: "w-er", de: "er", en: "he" },
  { id: "w-sie", de: "sie", en: "she" },
  { id: "w-es", de: "es", en: "it" },
  { id: "w-macht", de: "macht", en: "makes / does" },
  { id: "w-was", de: "was", en: "what" },
  { id: "w-wer", de: "wer", en: "who" },
  { id: "w-wie", de: "wie", en: "how" },
  { id: "w-wo", de: "wo", en: "where" },
  { id: "w-wann", de: "wann", en: "when" },
  { id: "w-warum", de: "warum", en: "why" },
  { id: "w-eins", de: "eins", en: "one" },
  { id: "w-zwei", de: "zwei", en: "two" },
  { id: "w-drei", de: "drei", en: "three" },
  { id: "w-vier", de: "vier", en: "four" },
  { id: "w-fuenf", de: "fünf", en: "five" },
  { id: "w-moechte", de: "möchte", en: "would like" },
  { id: "w-tisch", de: "Tisch", en: "table", gender: "m" },
  { id: "w-stuhl", de: "Stuhl", en: "chair", gender: "m" },
  { id: "w-kauft", de: "kauft", en: "buys" },
  { id: "w-teuer", de: "teuer", en: "expensive" },
  { id: "w-billig", de: "billig", en: "cheap" },
  { id: "w-warm", de: "warm", en: "warm" },
  { id: "w-kalt", de: "kalt", en: "cold" },
  { id: "w-wetter", de: "Wetter", en: "weather", gender: "n" },
  { id: "w-sonne", de: "Sonne", en: "sun", gender: "f" },
  { id: "w-spielt", de: "spielt", en: "plays" },
  { id: "w-park", de: "Park", en: "park", gender: "m" },
  { id: "w-ball", de: "Ball", en: "ball", gender: "m" },
  { id: "w-mit", de: "mit", en: "with" },
  { id: "w-dem", de: "dem", en: "the (dat.)" },
  { id: "w-uebrigens", de: "übrigens", en: "by the way" },
  { id: "w-irgendwie", de: "irgendwie", en: "somehow" },
  { id: "w-wirklich", de: "wirklich", en: "really" },
  { id: "w-nur", de: "nur", en: "only" },
  { id: "w-schon", de: "schon", en: "already" },
  { id: "w-in", de: "in", en: "in" },
  { id: "w-noch", de: "noch", en: "still" },
  { id: "w-dann", de: "dann", en: "then" },
  { id: "w-leider", de: "leider", en: "unfortunately" },
  { id: "w-vielleicht", de: "vielleicht", en: "maybe" },
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
  SETS.flatMap((set) => set.words.map((w) => [w.id, set.index])),
);

export const SURFACE_TO_ID: Record<string, string> = Object.fromEntries(
  ALL_WORDS.map((w) => [w.de.toLowerCase(), w.id]),
);

export function wordById(id: string): VocabWord | undefined {
  return ALL_WORDS.find((w) => w.id === id);
}

export function setIndexForWord(id: string): number {
  return ID_TO_SET[id] ?? -1;
}
