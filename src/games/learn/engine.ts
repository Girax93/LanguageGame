/**
 * Learn exercise framework (pure, React-free). One `Step` union describes every
 * micro-exercise; `makeExerciseStep` chooses a format for a word based on how
 * familiar it already is (recognition first, then production). The components in
 * `components.tsx` render each `Step`; `Learn.tsx` orchestrates the session.
 */
import {
  ALL_WORDS,
  germanWithArticle,
  englishWithArticle,
  answerMatches,
  type VocabWord,
} from '../../content/vocab';
import { rankedDistractors } from '../../content/derive';
import { shuffle } from '../../lib/array';

export type Step =
  | { kind: 'intro'; word: VocabWord }
  | {
      kind: 'choice';
      dir: 'de-en' | 'en-de';
      word: VocabWord;
      label: string;
      prompt: string;
      answer: string;
      options: string[];
    }
  | { kind: 'type'; word: VocabWord; prompt: string; answer: string }
  | { kind: 'scramble'; word: VocabWord; answer: string }
  | { kind: 'gender'; word: VocabWord }
  | { kind: 'pairs'; words: VocabWord[] };

/** Close-but-varied distractor strings: shuffle a top window of ranked candidates. */
export function variedDistractors(
  word: VocabWord,
  n: number,
  toText: (w: VocabWord) => string,
): string[] {
  const windowWords = shuffle(rankedDistractors(word, ALL_WORDS).slice(0, Math.max(n * 5, 12)));
  const answer = toText(word);
  const out: string[] = [];
  for (const w of windowWords) {
    const t = toText(w);
    if (answerMatches(t, answer)) continue;
    if (out.some((o) => answerMatches(o, t))) continue;
    out.push(t);
    if (out.length === n) break;
  }
  return out;
}

function choiceStep(word: VocabWord, dir: 'de-en' | 'en-de'): Step {
  const toText = dir === 'de-en' ? englishWithArticle : germanWithArticle;
  const prompt = dir === 'de-en' ? germanWithArticle(word) : englishWithArticle(word);
  const answer = toText(word);
  const options = shuffle([answer, ...variedDistractors(word, 3, toText)]);
  return {
    kind: 'choice',
    dir,
    word,
    label: dir === 'de-en' ? 'What does this mean?' : 'Say it in German',
    prompt,
    answer,
    options,
  };
}

/** Shuffle a word's letters so the tiles never start already solved. */
export function scrambleLetters(s: string): string[] {
  const chars = [...s];
  if (chars.length < 2) return chars;
  let out = shuffle(chars);
  if (out.join('') === s) out = shuffle(chars);
  return out;
}

/**
 * Pick an exercise for a word. Familiarity 0 (just introduced) -> gentle
 * recognition; once recognised, rotate through production formats (type the
 * word, unscramble, reverse recognition, and gender tap for nouns).
 */
export function makeExerciseStep(word: VocabWord, familiarity: number): Step {
  if (familiarity <= 0) return choiceStep(word, 'de-en');
  const options: Step[] = [
    choiceStep(word, 'en-de'),
    { kind: 'type', word, prompt: englishWithArticle(word), answer: germanWithArticle(word) },
    { kind: 'scramble', word, answer: word.de },
  ];
  if (word.gender) options.push({ kind: 'gender', word });
  return options[Math.floor(Math.random() * options.length)];
}
