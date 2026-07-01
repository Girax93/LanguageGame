// ─────────────────────────────────────────────────────────────────────────
// ONE-TIME helper. Downloads two open German word-data sources this project
// needs, and writes them next to this file:
//   • freq-de-top.txt    — OpenSubtitles frequency ranking (Hermit Dave, CC-BY-SA)
//   • buchmeier-de.txt    — German↔English frequency list w/ glosses+genders (Wiktionary)
//
// HOW TO RUN (same terminal/folder where you run `npm run dev`):
//     node fetch-freq.mjs
//
// Re-running is safe. Then tell Claude it's done. Delete this script afterwards.
// ─────────────────────────────────────────────────────────────────────────
import { writeFileSync, existsSync } from 'node:fs';

if (typeof fetch !== 'function') {
  console.error('\n✗ Your Node.js is too old (need v18+). Run `node -v`, update Node, retry.\n');
  process.exit(1);
}

const UA = { 'User-Agent': 'LanguageGame-learning-app/1.0 (personal study project)' };
const here = (name) => new URL('./' + name, import.meta.url);

async function get(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.text();
}

// 1) OpenSubtitles frequency ranking (skip if already present) ---------------
if (existsSync(here('freq-de-top.txt'))) {
  console.log('• freq-de-top.txt already present — skipping.');
} else {
  const FREQ = [
    'https://cdn.jsdelivr.net/gh/hermitdave/FrequencyWords@master/content/2018/de/de_50k.txt',
    'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt',
  ];
  let text = null;
  for (const url of FREQ) {
    try { console.log('Downloading frequency list from', url, '…'); text = await get(url); break; }
    catch (e) { console.log('  (failed:', e.message, '— trying next)'); }
  }
  if (!text) { console.error('\n✗ Could not download the frequency list.\n'); process.exit(1); }
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 10000);
  writeFileSync(here('freq-de-top.txt'), lines.join('\n') + '\n');
  console.log(`✓ wrote ${lines.length} lines to freq-de-top.txt`);
}

// 2) Buchmeier German↔English glossed list (try whole page, then chunks) ------
const BUCH = [
  'https://en.wiktionary.org/wiki/User:Matthias_Buchmeier/German_frequency_list-1-5000?action=raw',
  'https://en.wiktionary.org/wiki/User:Matthias_Buchmeier/German_frequency_list-1-2000?action=raw',
  'https://en.wiktionary.org/wiki/User:Matthias_Buchmeier/German_frequency_list-2001-4000?action=raw',
  'https://en.wiktionary.org/wiki/User:Matthias_Buchmeier/German_frequency_list-4001-6000?action=raw',
];
let buch = '';
for (const url of BUCH) {
  try {
    const t = await get(url);
    // a real list page is long; a "page does not exist" stub is tiny — keep only real ones
    if (t && t.length > 2000) { buch += '\n' + t; console.log('✓ got', url.split('/').pop().split('?')[0], `(${t.length} chars)`); }
    else console.log('• skipped (empty/stub):', url.split('/').pop().split('?')[0]);
  } catch (e) { console.log('  (failed:', url.split('/').pop().split('?')[0], '-', e.message, ')'); }
}
if (buch.length > 2000) {
  writeFileSync(here('buchmeier-de.txt'), buch.trim() + '\n');
  console.log(`✓ wrote buchmeier-de.txt (${buch.length} chars)`);
} else {
  console.log('• Could not get the Buchmeier glossed list — that\'s OK, Claude can proceed without it.');
}

console.log('\n✓ All done. Tell Claude: "the files are ready."\n');
