import { setActiveContentLanguage } from '../src/content/lang/registry';
setActiveContentLanguage('no');
import { crosswordWordsForBlock, crosswordItemsForBlock } from '../src/content/crosswords';
import { wordById } from '../src/content/vocab';
for (let b = 0; b < 6; b++) {
  const item = crosswordItemsForBlock(b);
  const placed = new Set(item ? item.entries.map((e) => e.wordId) : []);
  const words = crosswordWordsForBlock(b);
  console.log(`\nBLOCK ${b}  (placed=${placed.size}):`);
  for (const id of words) {
    const w = wordById(id);
    console.log(`  ${placed.has(id) ? 'PLACED' : '  pool'}  ${id}\t${w?.de}\t= ${w?.en}\t[${w?.gender || w?.pos}]`);
  }
}
