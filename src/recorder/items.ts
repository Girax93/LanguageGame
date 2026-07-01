/**
 * Build the recording list for a language straight from the LIVE content, so
 * new vocab / regenerated sentences appear automatically. Three kinds:
 *   - word:     every lemma (spoken as its bare surface)
 *   - form:     inflected tokens that show up in cipher sentences but aren't a
 *               lemma surface (ist, dem, seid, verb-3sg …) — used for the
 *               word-by-word cipher read-out
 *   - sentence: every distinct generated cipher sentence (content-hash keyed)
 * Memoized per language code.
 */
import type { Lemma } from '../content/lemmas';
import { langByCode } from '../content/lang/registry';
import { cipherBlocksForLang } from '../content/cipherItems';
import type { RecItem } from './types';
import { sentenceKey, slugify } from './hash';

export interface ItemGroups {
  words: RecItem[];
  forms: RecItem[];
  sentences: RecItem[];
}

const PUNCT = /[.,!?;:"'„“”()¿¡»«…–—-]/g;
const cache = new Map<string, ItemGroups>();

function wordItem(w: Lemma, block: number, withArticle: (l: Lemma) => string): RecItem {
  const gloss = w.gender ? `${withArticle(w)} — ${w.en}` : w.en;
  return { key: w.id, kind: 'word', label: w.de, gloss, slug: slugify(w.de), block };
}

export function buildItems(code: string): ItemGroups {
  const hit = cache.get(code);
  if (hit) return hit;

  const pack = langByCode(code);
  if (!pack) {
    const empty: ItemGroups = { words: [], forms: [], sentences: [] };
    cache.set(code, empty);
    return empty;
  }

  const BLOCK = 10;

  // Words — in curriculum order.
  const words: RecItem[] = pack.lemmas.map((w, i) =>
    wordItem(w, Math.floor(i / BLOCK), pack.withArticle),
  );

  const lemmaSurfaces = new Set(pack.lemmas.map((w) => w.de.toLowerCase()));

  // Sentences + forms — walk the generated cipher blocks once.
  const sentByKey = new Map<string, RecItem>();
  const formByKey = new Map<string, RecItem>();
  const blocks = cipherBlocksForLang(code);
  blocks.forEach((items, b) => {
    for (const it of items) {
      const skey = sentenceKey(it.sentence);
      if (!sentByKey.has(skey)) {
        sentByKey.set(skey, {
          key: skey,
          kind: 'sentence',
          label: it.sentence,
          gloss: it.translation,
          slug: slugify(it.sentence),
          block: b,
        });
      }
      for (const raw of it.sentence.toLowerCase().replace(PUNCT, ' ').split(/\s+/)) {
        const tok = raw.trim();
        if (!tok || lemmaSurfaces.has(tok)) continue;
        const fkey = 'f-' + tok;
        if (!formByKey.has(fkey)) {
          formByKey.set(fkey, {
            key: fkey,
            kind: 'form',
            label: tok,
            gloss: '(sentence form)',
            slug: slugify(tok),
            block: b,
          });
        }
      }
    }
  });

  const sentences = [...sentByKey.values()].sort((a, b) => a.block - b.block);
  const forms = [...formByKey.values()].sort(
    (a, b) => a.block - b.block || a.label.localeCompare(b.label),
  );

  const groups: ItemGroups = { words, forms, sentences };
  cache.set(code, groups);
  return groups;
}
