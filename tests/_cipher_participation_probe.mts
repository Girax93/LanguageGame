// TEMPORARY probe: verify cipher block-only participation against real data.
// Replicates the board's classifier (no React import) on real generated sentences.
import { setActiveContentLanguage } from '../src/content/lang/registry.ts';
import { SETS, wordById } from '../src/content/vocab.ts';
import { blockWords } from '../src/state/progression.ts';
import { cipherItemsForBlock } from '../src/content/cipherItems.ts';
import { verb3sg } from '../src/content/generateCipher.ts';

const ARTICLE_SURFACES = new Set(['der','die','das','den','dem','des','ein','eine','einen','einem','eines','einer','en','ei','et']);
const norm = (s: string) => s.toLowerCase().replace(/[^a-zäöüßæøå]/g, '');

function buildParticipation(item: any, ids: Set<string>) {
  const surfaces = new Set<string>(ARTICLE_SURFACES);
  const surfaceToLemma = new Map<string, string>();
  for (const id of item.requires) {
    if (!ids.has(id)) continue;
    const w = wordById(id); if (!w) continue;
    const reportable = w.pos !== 'art';
    const add = (f?: string | null) => { const n = norm(f ?? ''); if (!n) return; surfaces.add(n); if (reportable && !surfaceToLemma.has(n)) surfaceToLemma.set(n, id); };
    add(w.de); if (w.pos === 'verb') add(verb3sg(w));
  }
  return { surfaces, surfaceToLemma };
}

for (const code of ['de', 'no']) {
  setActiveContentLanguage(code);
  let checked = 0, noDecode = 0, missedBlockWord = 0;
  for (let b = 1; b <= 30; b++) {
    const bwList = blockWords(SETS, b);
    const bw = new Set(bwList.map((w) => w.id));
    for (const item of cipherItemsForBlock(b)) {
      const part = buildParticipation(item, bw);
      const tokens = item.sentence.split(/\s+/).filter(Boolean);
      const decode: string[] = [], inert: string[] = [];
      for (const t of tokens) {
        const n = norm(t);
        (!n || part.surfaces.has(n) ? decode : inert).push(t);
      }
      checked++;
      if (!decode.some((t) => norm(t) && !ARTICLE_SURFACES.has(norm(t)))) noDecode++;
      // every block CONTENT word in requires whose surface appears should be decodable
      for (const id of item.requires) {
        if (!bw.has(id)) continue;
        const w = wordById(id); if (!w || w.pos === 'art') continue;
        const forms = [norm(w.de), w.pos === 'verb' ? norm(verb3sg(w) ?? '') : ''].filter(Boolean);
        const present = tokens.some((t) => forms.includes(norm(t)));
        const decodable = tokens.some((t) => forms.includes(norm(t)) && part.surfaces.has(norm(t)));
        if (present && !decodable) { missedBlockWord++; console.log(`  !! ${code} b${b} block word ${w.de} present but inert in "${item.sentence}"`); }
      }
      if (code === 'de' && b <= 3) console.log(`b${b} "${item.sentence}"\n   decode=[${decode.join(' ')}] inert=[${inert.join(' ')}] reports=${[...part.surfaceToLemma.values()].map((id)=>wordById(id)?.de).join(',')}`);
    }
  }
  console.log(`\n${code}: checked=${checked} sentencesWithNoContentDecode=${noDecode} blockWordsWronglyInert=${missedBlockWord}\n`);
}
