/**
 * Norwegian article drills, one per gendered noun: fill the INDEFINITE article
 * en / ei / et (the three-gender Bokmål system). The whole article is the slot
 * (stem is empty), e.g. "__ mann" → "en mann". Built straight from the Norwegian
 * lemma list.
 */
import type { Lemma, Gender } from '../../lemmas';
import type { GrammarContentItem } from '../../grammarItems';

function endingForNO(g: Gender): string {
  return g === 'm' ? 'en' : g === 'f' ? 'ei' : 'et';
}
function levelForOrder(order: number): number {
  return Math.max(1, Math.min(6, Math.floor((order - 1) / 334) + 1));
}

export function buildNorwegianGrammarItems(lemmas: Lemma[]): GrammarContentItem[] {
  return lemmas
    .filter((w) => w.pos === 'noun' && !!w.gender)
    .map((noun) => ({
      id: `g-${noun.id}`,
      before: '',
      stem: '',
      ending: endingForNO(noun.gender!),
      after: ` ${noun.de}`,
      translation: `a ${noun.en}`,
      gender: noun.gender!,
      requires: [noun.id],
      level: levelForOrder(noun.order),
    }));
}
