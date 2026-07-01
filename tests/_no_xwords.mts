import { setActiveContentLanguage } from '../src/content/lang/registry';
import { crosswordWordsForBlock, crosswordItemsForBlock } from '../src/content/crosswords';
import { wordById } from '../src/content/vocab';
setActiveContentLanguage('no');
const need = new Set<string>();
for (let b = 0; b < 14; b++) {
  const words = crosswordWordsForBlock(b);
  const item = crosswordItemsForBlock(b);
  const placed = item ? item.entries.map((e) => e.wordId) : [];
  for (const id of words) need.add(id);
  console.log(`block ${b}: pool=[${words.map((id)=>wordById(id)?.de).join(', ')}] placed=${placed.length}`);
}
console.log('\nWORDS NEEDING CLUES (' + need.size + '):');
console.log([...need].map((id)=>`${id}=${wordById(id)?.de}`).join('  '));
