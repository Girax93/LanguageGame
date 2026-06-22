/**
 * Pure helpers for the grammar (article-ending) drill. The player fills the
 * article ending letter by letter; there are no numbers, so the ending must
 * be recalled, not deduced.
 */
import { toUpperActive } from '../../content/lang/alphabet';

/** The ending as an array of single uppercase letters (slots to fill). */
export function endingLetters(ending: string): string[] {
  return [...toUpperActive(ending)];
}

/** Does `typed` match the ending letter at `index`? */
export function isEndingLetterCorrect(
  ending: string,
  index: number,
  typed: string,
): boolean {
  const letters = endingLetters(ending);
  if (index < 0 || index >= letters.length) return false;
  return letters[index] === toUpperActive(typed);
}

/** The full article (stem + ending), uppercased. */
export function fullArticle(stem: string, ending: string): string {
  return toUpperActive(stem 