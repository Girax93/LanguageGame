import { setActiveContentLanguage } from '../src/content/lang/registry';
setActiveContentLanguage('no');
import { LEMMAS_NO } from '../src/content/lang/no/lemmas.no';
import { cipherItemsForBlock } from '../src/content/cipherItems';
const BS=10; const nb=Math.floor(LEMMAS_NO.length/BS);
for(let b=0;b<nb;b++){
  for(const it of cipherItemsForBlock(b)) console.log(`${it.sentence}\t||\t${it.translation}`);
}
