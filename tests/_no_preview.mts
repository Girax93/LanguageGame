import { LEMMAS_NO } from '../src/content/lang/no/lemmas.no';
import { generateBlockDraftsNO } from '../src/content/lang/no/cipher';
const BS = 10;
const nb = Math.floor(LEMMAS_NO.length / BS);
for (let b = 0; b < nb; b++) {
  const newWords = LEMMAS_NO.slice(b * BS, b * BS + BS).map((w) => w.de).join(', ');
  console.log(`\n=== BLOCK ${b} (new: ${newWords}) ===`);
  for (const d of generateBlockDraftsNO(b, LEMMAS_NO)) {
    console.log(`  NO: ${d.sentence}`);
    console.log(`  EN: ${d.translation}`);
  }
}
