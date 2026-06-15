import { SETS } from '../../content/vocab';
import { shuffle } from '../../lib/array';

/**
 * Order eligible puzzle items so that sentences using the words from the
 * most-recently-learned set come FIRST (guaranteeing newly-learned words are
 * exercised this round), then the rest — both groups shuffled for variety so
 * the same items rarely recur within a session.
 */
export function withNewWordsFirst<T extends { requires: string[] }>(
  eligible: T[],
  learnedWords: string[],
): T[] {
  const learned = new Set(learnedWords);
  let recentIdx = -1;
  for (let k = SETS.length - 1; k >= 0; k--) {
    if (SETS[k].words.some((w) => learned.has(w.id))) {
      recentIdx = k;
      break;
    }
  }
  const recent =
    recentIdx >= 0 ? new Set(SETS[recentIdx].words.map((w) => w.id)) : new Set<string>();
  const usesRecent = (i: T) => i.requires.some((r) => recent.has(r));
  return [...shuffle(eligible.filter(usesRecent)), ...shuffle(eligible.filter((i) => !usesRecent(i)))];
}
