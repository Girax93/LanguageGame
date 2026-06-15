import { PROGRESSION } from '../state/progressionConfig';

export type Gender = 'm' | 'f' | 'n';

export interface VocabWord {
  id: string;
  de: string;
  en: string;
  gender?: Gender;
  /** Always-available in the Practice scope (function/glue + core nouns). */
  filler?: boolean;
}

export interface VocabSet {
  index: number;
  name: string;
  words: VocabWord[];
}

const ORDERED_WORDS: VocabWord[] = [
  { id: "w-der", de: "der", en: "the (m.)", filler: true },
  { id: "w-ist", de: "ist", en: "is", filler: true },
  { id: "w-mann", de: "Mann", en: "man", gender: "m", filler: true },
  { id: "w-gut", de: "gut", en: "good" },
  { id: "w-gross", de: "groß", en: "big" },
  { id: "w-die", de: "die", en: "the (f.)", filler: true },
  { id: "w-frau", de: "Frau", en: "woman", gender: "f", filler: true },
  { id: "w-schoen", de: "schön", en: "beautiful" },
  { id: "w-und", de: "und", en: "and", filler: true },
  { id: "w-auch", de: "auch", en: "also", filler: true },
  { id: "w-das", de: "das", en: "the (n.) / that", filler: true },
  { id: "w-kind", de: "Kind", en: "child", gender: "n", filler: true },
  { id: "w-klein", de: "klein", en: "small" },
  { id: "w-sehr", de: "sehr", en: "very", filler: true },
  { id: "w-nicht", de: "nicht", en: "not", filler: true },
  { id: "w-ich", de: "ich", en: "I", filler: true },
  { id: "w-bin", de: "bin", en: "am", filler: true },
  { id: "w-du", de: "du", en: "you", filler: true },
  { id: "w-bist", de: "bist", en: "are (you)", filler: true },
  { id: "w-muede", de: "müde", en: "tired" },
  { id: "w-ein", de: "ein", en: "a (m./n.)", filler: true },
  { id: "w-hund", de: "Hund", en: "dog", gender: "m" },
  { id: "w-hat", de: "hat", en: "has", filler: true },
  { id: "w-einen", de: "einen", en: "a (m. acc.)", filler: true },
  { id: "w-garten", de: "Garten", en: "garden", gender: "m" },
  { id: "w-haus", de: "Haus", en: "house", gender: "n" },
  { id: "w-neu", de: "neu", en: "new" },
  { id: "w-alt", de: "alt", en: "old" },
  { id: "w-hier", de: "hier", en: "here", filler: true },
  { id: "w-heute", de: "heute", en: "today", filler: true },
  { id: "w-katze", de: "Katze", en: "cat", gender: "f" },
  { id: "w-eine", de: "eine", en: "a (f.)", filler: true },
  { id: "w-auto", de: "Auto", en: "car", gender: "n" },
  { id: "w-schnell", de: "schnell", en: "fast" },
  { id: "w-langsam", de: "langsam", en: "slow" },
  { id: "w-wir", de: "wir", en: "we", filler: true },
  { id: "w-sind", de: "sind", en: "are", filler: true },
  { id: "w-ihr", de: "ihr", en: "you (pl.)", filler: true },
  { id: "w-seid", de: "seid", en: "are (you pl.)", filler: true },
  { id: "w-gluecklich", de: "glücklich", en: "happy" },
  { id: "w-trinkt", de: "trinkt", en: "drinks" },
  { id: "w-wasser", de: "Wasser", en: "water", gender: "n" },
  { id: "w-kaffee", de: "Kaffee", en: "coffee", gender: "m" },
  { id: "w-gern", de: "gern", en: "gladly", filler: true },
  { id: "w-tee", de: "Tee", en: "tea", gender: "m" },
  { id: "w-buch", de: "Buch", en: "book", gender: "n" },
  { id: "w-liest", de: "liest", en: "reads" },
  { id: "w-interessant", de: "interessant", en: "interesting" },
  { id: "w-oder", de: "oder", en: "or", filler: true },
  { id: "w-aber", de: "aber", en: "but", filler: true },
  { id: "w-apfel", de: "Apfel", en: "apple", gender: "m" },
  { id: "w-isst", de: "isst", en: "eats" },
  { id: "w-brot", de: "Brot", en: "bread", gender: "n" },
  { id: "w-jetzt", de: "jetzt", en: "now", filler: true },
  { id: "w-oft", de: "oft", en: "often", filler: true },
  { id: "w-stadt", de: "Stadt", en: "city", gender: "f" },
  { id: "w-wohnt", de: "wohnt", en: "lives" },
  { id: "w-schule", de: "Schule", en: "school", gender: "f" },
  { id: "w-lehrer", de: "Lehrer", en: "teacher", gender: "m" },
  { id: "w-freund", de: "Freund", en: "friend", gender: "m" },
  { id: "w-kommt", de: "kommt", en: "comes" },
  { id: "w-geht", de: "geht", en: "goes" },
  { id: "w-immer", de: "immer", en: "always", filler: true },
  { id: "w-nie", de: "nie", en: "never", filler: true },
  { id: "w-bald", de: "bald", en: "soon", filler: true },
  { id: "w-er", de: "er", en: "he", filler: true },
  { id: "w-sie", de: "sie", en: "she", filler: true },
  { id: "w-es", de: "es", en: "it", filler: true },
  { id: "w-macht", de: "macht", en: "makes / does" },
  { id: "w-was", de: "was", en: "what", filler: true },
  { id: "w-wer", de: "wer", en: "who", filler: true },
  { id: "w-wie", de: "wie", en: "how", filler: true },
  { id: "w-wo", de: "wo", en: "where", filler: true },
  { id: "w-wann", de: "wann", en: "when", filler: true },
  { id: "w-warum", de: "warum", en: "why", filler: true },
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
  { id: "w-mit", de: "mit", en: "with", filler: true },
  { id: "w-dem", de: "dem", en: "the (dat.)", filler: true },
  { id: "w-uebrigens", de: "übrigens", en: "by the way", filler: true },
  { id: "w-irgendwie", de: "irgendwie", en: "somehow", filler: true },
  { id: "w-wirklich", de: "wirklich", en: "really", filler: true },
  { id: "w-nur", de: "nur", en: "only", filler: true },
  { id: "w-schon", de: "schon", en: "already", filler: true },
  { id: "w-in", de: "in", en: "in", filler: true },
  { id: "w-noch", de: "noch", en: "still", filler: true },
  { id: "w-dann", de: "dann", en: "then", filler: true },
  { id: "w-leider", de: "leider", en: "unfortunately", filler: true },
  { id: "w-vielleicht", de: "vielleicht", en: "maybe", filler: true },
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

/**
 * "Always available" words for the Practice scope: function/glue words plus the
 * core subject nouns (Mann/Frau/Kind) the learner leans on to build sentences.
 * In Practice, a sentence's NON-filler words must come from the current or
 * previous set; filler words may appear regardless of which set introduced them
 * (they are still mastery-gated like any other word). Recap ignores this scope
 * and draws from the whole learned pool.
 */
export const FILLER_IDS: Set<string> = new Set(
  ALL_WORDS.filter((w) => w.filler).map((w) => w.id),
);

export function isFiller(id: string): boolean {
  return FILLER_IDS.has(id);
}

// ── Display + answer-matching helpers ───────────────────────────────────────

/** Nominative definite article for a noun's gender. */
export function articleFor(gender: Gender): string {
  return gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
}

/** German display form: nouns carry their definite article ("der Hund");
 *  everything else is shown bare. */
export function germanWithArticle(w: VocabWord): string {
  return w.gender ? `${articleFor(w.gender)} ${w.de}` : w.de;
}

/** English gloss as presented: an article+noun phrase composes to "the <noun>"
 *  (so "der Hund" -> "the dog"); non-nouns stay bare. */
export function englishWithArticle(w: VocabWord): string {
  return w.gender ? `the ${w.en}` : w.en;
}

/** Definite articles (English + German) treated as "the" when matching answers. */
const DEFINITE_ARTICLES = ['the', 'der', 'die', 'das', 'den', 'dem', 'des'];

/** Drop a single leading definite article for tolerant matching:
 *  "the man" -> "man", "der Hund" -> "Hund". */
export function stripArticle(s: string): string {
  const t = s.trim();
  const lower = t.toLowerCase();
  for (const a of DEFINITE_ARTICLES) {
    if (lower.startsWith(a + ' ')) return t.slice(a.length + 1).trim();
  }
  return t;
}

/** Case-insensitive answer equality that accepts the form WITH or WITHOUT a
 *  leading definite article, so a learner is never penalised for "the". */
export function answerMatches(a: string, b: string): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  return stripArticle(a).toLowerCase() === stripArticle(b).toLowerCase();
}
