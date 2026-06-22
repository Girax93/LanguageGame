/**
 * German article drills, one per gendered noun: fill the ending of the definite
 * article (d-er / d-ie / d-as). Built straight from the German lemma list so the
 * pack has no dependency on the active-language `vocab` module.
 */
import type { Lemma, Gender } from '../../lemmas';
import type { GrammarContentItem } from '../../grammarItems';

function endingFor(g: Gender): string {
  return g === 'm' ? 'er' : g === 'f' ? 'ie' : 'as';
}
function levelForOrder(order: number): number {
  return Math.max(1, Math.min(6, Math.floor((order - 1) / 334) + 1));
}

export function buildGermanGrammarItems(lemmas: Lemma[]): GrammarContentItem[] {
  return lemmas
    .filter((w) => w.pos === 'noun' && !!w.gender)
    .map((noun) => ({
      id: `g-${noun.id}`,
      before: '',
      stem: 'd',
      ending: endingFor(noun.gender!),
      after: ` ${noun.de}`,
      translation: `the ${noun.en}`,
      gender: noun.gender!,
      requires: [noun.id],
      level: levelForOrder(noun.order),
    }));
}
