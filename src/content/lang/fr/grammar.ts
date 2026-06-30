/**
 * French article drills, one per gendered noun: fill the INDEFINITE article
 * un / une (the two-gender system: un→m, une→f). The whole article is the slot
 * (stem is empty), e.g. "__ homme" → "un homme". Built straight from the French
 * lemma list. Indefinite un/une is used (not definite le/la) because it never
 * elides — le/la become l' before a vowel, which would break the letter-fill —
 * and it mirrors Norwegian's en/ei/et drill exactly.
 */
import type { Lemma, Gender } from '../../lemmas';
import type { GrammarContentItem } from '../../grammarItems';

function endingForFR(g: Gender): string {
  return g === 'f' ? 'une' : 'un';
}
function levelForOrder(order: number): number {
  return Math.max(1, Math.min(6, Math.floor((order - 1) / 334) + 1));
}

export function buildFrenchGrammarItems(lemmas: Lemma[]): GrammarContentItem[] {
  return lemmas
    .filter((w) => w.pos === 'noun' && !!w.gender)
    .map((noun) => ({
      id: `g-${noun.id}`,
      before: '',
      stem: '',
      ending: endingForFR(noun.gender!),
      after: ` ${noun.de}`,
      translation: `a ${noun.en}`,
      gender: noun.gender!,
      requires: [noun.id],
      level: levelForOrder(noun.order),
    }));
}
