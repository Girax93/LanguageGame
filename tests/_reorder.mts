import { writeFileSync } from 'node:fs';
import { LEMMAS_NO } from '../src/content/lang/no/lemmas.no';

const ORDER = [
  'n-jeg','n-vaere','n-du','n-det','n-ikke','n-og','n-en','n-mann','n-god','n-her',
  'n-han','n-hun','n-ei','n-jente','n-stor','n-paa','n-et','n-hus','n-fin','n-der',
  'n-vi','n-de','n-ha','n-barn','n-ny','n-med','n-til','n-venn','n-gammel','n-gaa',
  'n-som','n-at','n-kvinne','n-liten','n-se','n-men','n-aa','n-dag','n-glad','n-komme',
  'n-meg','n-deg','n-far','n-mor','n-snakke','n-fra','n-om','n-ting','n-viktig','n-si',
  'n-den','n-seg','n-gutt','n-vakker','n-ta','n-hva','n-hvem','n-bok','n-riktig','n-vite',
  'n-naa','n-for','n-by','n-varm','n-like','n-kunne','n-ville','n-land','n-sterk','n-hoere',
  'n-hvor','n-eller','n-aar','n-kald','n-finne','n-skulle','n-maatte','n-vann','n-lang','n-gi',
  'n-ja','n-nei','n-tid','n-natt','n-elske','n-trenge','n-hvis','n-fordi','n-naar','n-tro',
  'n-bare','n-ogsaa','n-veldig','n-navn','n-liv','n-gjoere','n-tenke','n-mat','n-snill','n-bo',
  'n-mer','n-saa','n-kanskje','n-haand','n-oeye','n-spise','n-drikke','n-bil','n-hund','n-katt',
  'n-skole','n-jobb','n-hjem','n-doer','n-bord','n-ord','n-gud','n-familie','n-verden','n-hete',
  'n-mye','n-faa','n-hvordan','n-hvorfor','n-aldri','n-alltid','n-igjen','n-sammen','n-ute','n-inne',
  'n-borte','n-ganske','n-helt','n-hjemme','n-vanskelig','n-lett','n-to','n-tre','n-fire','n-fem',
  'n-takk','n-hei',
];

const byId = new Map(LEMMAS_NO.map((w) => [w.id, w]));
const seen = new Set<string>();
const ordered = [];
for (const id of ORDER) { const w = byId.get(id); if (w) { ordered.push(w); seen.add(id); } else console.error('MISSING in ORDER:', id); }
for (const w of LEMMAS_NO) if (!seen.has(w.id)) { ordered.push(w); console.error('APPENDED (not in ORDER):', w.id); }
if (ordered.length !== LEMMAS_NO.length) console.error('COUNT MISMATCH', ordered.length, LEMMAS_NO.length);

const ser = (w) => [w.id, w.de, w.en, w.pos, w.gender ?? '', w.plural ?? '', w.forms ?? '', (w.tags ?? []).join(','), w.register ?? ''].join('|');
const data = ordered.map(ser).join('\n');

const file = `/**
 * Norwegian (Bokmål) lemma dataset — ~2000 lemmas ordered by a pedagogical
 * frequency that interleaves content words (nouns/verbs/adjectives) with the
 * function words from the very first sets, so every block has teachable,
 * cipher-able material. Mirrors the German \`lemmas.ts\`, but pipe-delimited and
 * WITHOUT order/rank: order = 1-based line index (append-friendly), rank = order.
 *
 * Gender is the THREE-gender Bokmål system: en→m, ei→f, et→n. The \`de\` field
 * holds the Norwegian surface (lowercase). Verb \`forms\` are "present, past,
 * perfect" (present in forms[0], e.g. "er" for være).
 *
 * Columns: id|de|en|pos|gender|plural|forms|tags(csv)|register
 */
import type { Lemma, Pos, Gender, Register } from '../../lemmas';

const DATA = \`
${data}
\`.trim();

const POSSET = new Set<Pos>([
  'noun','verb','adj','adv','pron','art','prep','conj','num','particle','interj',
]);

export const LEMMAS_NO: Lemma[] = DATA.split('\\n').map((line, i) => {
  const [id, de, en, pos, gender, plural, forms, tags, register] = line.split('|');
  const w: Lemma = { id, de, en, pos: pos as Pos, order: i + 1, rank: i + 1 };
  if (gender) w.gender = gender as Gender;
  if (plural) w.plural = plural;
  if (forms) w.forms = forms;
  if (tags) w.tags = tags.split(',');
  if (register) w.register = register as Register;
  if (!POSSET.has(w.pos)) throw new Error(\`lemmas.no: bad pos "\${pos}" on \${id}\`);
  return w;
});
`;
writeFileSync(new URL('../src/content/lang/no/lemmas.no.ts', import.meta.url), file);
console.log('Wrote reordered lemmas.no.ts with', ordered.length, 'lemmas');
