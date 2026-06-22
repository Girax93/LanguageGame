/**
 * Procedural Norwegian (Bokmål) cipher-sentence generator. Mirrors the German
 * one but uses Norwegian grammar. GRAMMATICALITY IS THE HARD CONSTRAINT — we
 * only emit constructions that are provably correct:
 *
 *  - Copula `være` is ALWAYS "er" (same for every person) — no person table.
 *  - Present tense is the SAME for every person (forms[0], e.g. "snakker"),
 *    so verb sentences use a 3rd-person subject (han/hun, or "en/ei/et NOUN")
 *    to keep the English a clean 3rd-singular.
 *  - Predicate adjective with a COMMON-gender subject (han/hun/den, or an m/f
 *    noun) = the BASE form, which is always correct — so ANY adjective is safe
 *    there. With a NEUTER subject (det, or a neuter noun) the adjective needs
 *    its -t form, so we only use adjectives whose neuter is curated (ADJ_NEUTER).
 *  - Attributive "en/ei [adj] [m/f noun]" = base; "et [adj+t] [neuter noun]" =
 *    curated neuter only.
 *  - Coordinating conjunctions only ever join two complete, valid clauses.
 *
 * Anything that can't be placed safely is simply skipped (covered later by the
 * crossword / Hurdle). Output is deterministic (seeded per block).
 */
import type { Lemma, Gender } from '../../lemmas';
import type { CipherDraft } from '../../generateCipher';
import { PROGRESSION } from '../../../state/progressionConfig';

const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock; // 10

const ART: Record<Gender, string> = { m: 'en', f: 'ei', n: 'et' };
const ART_ID: Record<Gender, string> = { m: 'n-en', f: 'n-ei', n: 'n-et' };
const COP_ID = 'n-vaere';

/** Subject pronoun id -> [surface, EnglishSubject, EnglishCopula, animacy]. */
const PRON: Record<string, [string, string, string, 'person' | 'thing']> = {
  'n-jeg': ['jeg', 'I', 'am', 'person'],
  'n-du': ['du', 'You', 'are', 'person'],
  'n-han': ['han', 'He', 'is', 'person'],
  'n-hun': ['hun', 'She', 'is', 'person'],
  'n-den': ['den', 'It', 'is', 'thing'],
  'n-vi': ['vi', 'We', 'are', 'person'],
  'n-de': ['de', 'They', 'are', 'person'],
};

// Locative adverbs that read as "[subj] er <loc>".
const LOC: Record<string, string> = {
  her: 'here', der: 'there', hjemme: 'at home', ute: 'outside',
  inne: 'inside', borte: 'away', oppe: 'up', nede: 'down',
};
const INTENS: Record<string, string> = {
  veldig: 'very', så: 'so', ganske: 'quite', helt: 'completely', virkelig: 'really',
};
const PART: Record<string, string> = { også: 'also', bare: 'only' };
const QWORD: Record<string, string> = { hva: 'What', hvem: 'Who', hvor: 'Where', hvordan: 'How' };

// Curated verb table: infinitive surface -> [English 3rd-singular, frame].
// 'bare' = intransitive ("Han snakker."), 'det' = transitive ("Han ser det.").
const VERB: Record<string, [string, 'bare' | 'det']> = {
  gå: ['walks', 'bare'], komme: ['comes', 'bare'], sove: ['sleeps', 'bare'],
  løpe: ['runs', 'bare'], le: ['laughs', 'bare'], gråte: ['cries', 'bare'],
  bo: ['lives', 'bare'], jobbe: ['works', 'bare'], snakke: ['talks', 'bare'],
  svømme: ['swims', 'bare'], danse: ['dances', 'bare'], leve: ['lives', 'bare'],
  smile: ['smiles', 'bare'], sitte: ['sits', 'bare'], stå: ['stands', 'bare'],
  ligge: ['lies', 'bare'], vente: ['waits', 'bare'], tenke: ['thinks', 'bare'],
  se: ['sees', 'det'], høre: ['hears', 'det'], ta: ['takes', 'det'],
  gjøre: ['does', 'det'], like: ['likes', 'det'], elske: ['loves', 'det'],
  trenge: ['needs', 'det'], finne: ['finds', 'det'], gi: ['gives', 'det'],
  lese: ['reads', 'det'], skrive: ['writes', 'det'], spise: ['eats', 'det'],
  drikke: ['drinks', 'det'], kjøpe: ['buys', 'det'], lage: ['makes', 'det'],
  bruke: ['uses', 'det'], vite: ['knows', 'det'], forstå: ['understands', 'det'],
  tro: ['believes', 'det'], huske: ['remembers', 'det'], glemme: ['forgets', 'det'],
  kjenne: ['knows', 'det'], hate: ['hates', 'det'], hjelpe: ['helps', 'det'],
  ha: ['has', 'det'], si: ['says', 'det'],
};

// Neuter (-t) forms for predicate/attributive use with neuter subjects.
const ADJ_NEUTER: Record<string, string> = {
  god: 'godt', stor: 'stort', liten: 'lite', ny: 'nytt', gammel: 'gammelt',
  fin: 'fint', vakker: 'vakkert', varm: 'varmt', kald: 'kaldt', lang: 'langt',
  kort: 'kort', sterk: 'sterkt', svak: 'svakt', snill: 'snilt', lett: 'lett',
  tung: 'tungt', rik: 'rikt', dyr: 'dyrt', billig: 'billig', ren: 'rent',
  pen: 'pent', stygg: 'stygt', full: 'fullt', tom: 'tomt', hvit: 'hvitt',
  svart: 'svart', rød: 'rødt', blå: 'blått', grønn: 'grønt', gul: 'gult',
  viktig: 'viktig', riktig: 'riktig', vanskelig: 'vanskelig', vanlig: 'vanlig',
  mulig: 'mulig', umulig: 'umulig', sann: 'sant', klar: 'klart', sikker: 'sikkert',
  ferdig: 'ferdig', dårlig: 'dårlig', viktigst: 'viktigst', nær: 'nært', fri: 'fritt',
};

// Adjectives that only fit a PERSON (never a thing / "det").
const ADJ_PERSON_ONLY = new Set([
  'glad', 'lei', 'trøtt', 'sliten', 'sulten', 'tørst', 'syk', 'frisk', 'våken',
  'redd', 'sint', 'snill', 'grei', 'ærlig', 'smart', 'dum', 'lat', 'modig',
  'sjenert', 'nervøs', 'ensom', 'stolt', 'forelsket', 'gift', 'flink', 'vennlig',
]);
// Adjectives that only describe a statement / "det" (never a concrete noun).
const ADJ_ABSTRACT_ONLY = new Set([
  'riktig', 'sann', 'klar', 'mulig', 'umulig', 'nødvendig', 'logisk', 'vanlig',
  'sant', 'feil', 'rett', 'lett', 'vanskelig', 'viktig',
]);
// Attributive-only adjectives (ungrammatical as a bare predicate) — keep out.
// Only these (curated, broadly-sensible) adjectives are used in cipher sentences,
// so no odd agent pairings like "a fattig godhet" appear. Any other adjective is
// still taught — just via the crossword / Hurdle instead of a sentence.
const ADJ_SAFE = new Set<string>([
  ...Object.keys(ADJ_NEUTER), ...ADJ_PERSON_ONLY, ...ADJ_ABSTRACT_ONLY,
]);
const ATTRIB_ONLY = new Set([
  'egen', 'samme', 'hele', 'eneste', 'første', 'andre', 'tredje', 'siste',
  'neste', 'forrige', 'verste', 'beste',
]);
const ADJ_SKIP = new Set(['naken', 'død', 'gravid', 'kåt']);

const ANIMATE_TAGS = ['people', 'family', 'animals'];
const PLACE_TAGS = ['home', 'travel', 'city', 'nature', 'school'];
function isAnimate(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => ANIMATE_TAGS.includes(t));
}

// Size/physical adjectives that read wrong on an abstract noun ("a big time").
const ADJ_PHYSICAL = new Set([
  'stor', 'liten', 'tung', 'tykk', 'tynn', 'bred', 'smal', 'dyp', 'høy', 'lav', 'rund',
]);
const CONCRETE_TAGS = ['home', 'body', 'food', 'animals', 'travel', 'people', 'family', 'nature', 'city', 'school'];
function isConcrete(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => CONCRETE_TAGS.includes(t));
}
/** Does adjective `a` make sense on noun `n`? (a physical-size adj needs a concrete noun.) */
function adjNounFit(a: Lemma, n: Lemma): boolean {
  return !ADJ_PHYSICAL.has(a.de.toLowerCase()) || isConcrete(n);
}

// ── small utilities ──────────────────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
/** Fix English indefinite articles: "a apple" -> "an apple", "A old" -> "An old". */
function fixArticles(text: string): string {
  return text.replace(/\b([Aa]) ([aeiouAEIOU])/g, (_m, art, v) => (art === 'A' ? 'An' : 'an') + ' ' + v);
}
function en1(x: Lemma): string {
  let s = x.en;
  for (const ch of ['/', ',', '(']) {
    const i = s.indexOf(ch);
    if (i >= 0) s = s.slice(0, i);
  }
  return s.trim() || x.en;
}
/** Present tense: forms[0] if given, else infinitive + "r" (regular Norwegian). */
function present(v: Lemma): string {
  if (v.forms && v.forms.trim()) return v.forms.split(',')[0].trim();
  return v.de.endsWith('e') || /[aeiouyæøå]$/.test(v.de) ? v.de + 'r' : v.de + 'er';
}

function predicateAdj(a: Lemma): boolean {
  const d = a.de.toLowerCase();
  return !ATTRIB_ONLY.has(d) && !ADJ_SKIP.has(d) && !d.endsWith('ende');
}
function adjNeuter(a: Lemma): string | null {
  return ADJ_NEUTER[a.de.toLowerCase()] ?? null;
}
/** Fits a common-gender subject (person or m/f thing): not abstract-only. */
function adjFitsCommon(a: Lemma): boolean {
  return !ADJ_ABSTRACT_ONLY.has(a.de.toLowerCase());
}
/** Fits a concrete m/f noun: not person-only, not abstract-only. */
function adjFitsThing(a: Lemma): boolean {
  const d = a.de.toLowerCase();
  return !ADJ_PERSON_ONLY.has(d) && !ADJ_ABSTRACT_ONLY.has(d);
}

interface Candidate {
  score: number;
  tokens: string[];
  en: string;
  ids: string[];
  kind: string;
  head?: string;
}

export function generateBlockDraftsNO(b: number, lemmas: Lemma[]): CipherDraft[] {
  const rng = mulberry32(9000 + b);
  const pool = lemmas.slice(0, (b + 1) * BLOCK_SIZE);
  const poolIds = new Set(pool.map((x) => x.id));
  const target = lemmas.slice(b * BLOCK_SIZE, b * BLOCK_SIZE + BLOCK_SIZE);

  const has = (id: string) => poolIds.has(id);
  const hasCop = has(COP_ID);
  const byId = new Map(pool.map((x) => [x.id, x]));

  const nouns = pool.filter((x) => x.pos === 'noun' && x.gender);
  const adjs = pool.filter((x) => x.pos === 'adj' && predicateAdj(x) && ADJ_SAFE.has(x.de.toLowerCase()));
  const verbs = pool.filter((x) => x.pos === 'verb' && !!VERB[x.de]);
  const locs = pool.filter((x) => x.pos === 'adv' && x.de in LOC);

  const choice = <T,>(arr: T[]): T | undefined =>
    arr.length ? arr[Math.floor(rng() * arr.length)] : undefined;
  const idBySurface = (surface: string, ...pos: Lemma['pos'][]): string | undefined =>
    pool.find((x) => x.de === surface && pos.includes(x.pos))?.id;

  const unc = new Set(target.map((x) => x.id));
  const usedNoun = new Set<string>();
  const out: CipherDraft[] = [];
  let prevKind = '';
  let prevHead = '';

  const pickNoun = (preferUnc = true, avoid = new Set<string>(), filter?: (n: Lemma) => boolean): Lemma | undefined => {
    let opts = nouns.filter((n) => !avoid.has(n.id));
    if (filter) opts = opts.filter(filter);
    if (!opts.length) return undefined;
    if (preferUnc) {
      const u = opts.filter((n) => unc.has(n.id));
      if (u.length) return choice(u);
    }
    const fresh = opts.filter((n) => !usedNoun.has(n.de));
    return choice(fresh.length ? fresh : opts);
  };
  const pickAdj = (preferUnc: boolean, filter: (a: Lemma) => boolean): Lemma | undefined => {
    const optsAll = adjs.filter(filter);
    if (!optsAll.length) return undefined;
    const u = optsAll.filter((a) => unc.has(a.id));
    return choice(preferUnc && u.length ? u : optsAll);
  };

  let cands: Candidate[] = [];
  const push = (tokens: string[], en: string, ids: string[], kind: string, head?: string, bonus = 0) => {
    const clean = ids.filter(Boolean);
    const cov = clean.filter((i) => unc.has(i));
    if (!cov.length && !bonus) return;
    let pen = 0;
    if (prevKind === kind) pen += 3;
    if (head && prevHead === head) pen += 4;
    cands.push({
      score: cov.length * 10 + Math.max(0, cov.length - 1) * 6 + bonus - pen + rng(),
      tokens: tokens.filter(Boolean), en, ids: [...new Set(clean)], kind, head,
    });
  };

  const buildCands = (): Candidate[] => {
    cands = [];
    if (!hasCop) return cands;

    // IDENTITY: "Det er en mann." / "Det er ikke et hus."
    if (has('n-det')) {
      const n = pickNoun();
      if (n) {
        const neg = has('n-ikke') && unc.has('n-ikke');
        push(
          ['Det', 'er', ...(neg ? ['ikke'] : []), ART[n.gender!], n.de + '.'],
          `That is ${neg ? 'not ' : ''}${ART[n.gender!] === 'et' ? 'a' : 'a'} ${en1(n)}.`,
          ['n-det', COP_ID, ...(neg ? ['n-ikke'] : []), ART_ID[n.gender!], n.id], 'ident', n.de,
        );
      }
    }
    // ATTRIBUTIVE identity: "Det er en stor mann." (m/f any adj) / "et stort hus" (curated).
    if (has('n-det')) {
      const n = pickNoun(true, new Set(), (x) => x.gender !== 'n' && isConcrete(x));
      const a = n ? pickAdj(true, (x) => adjFitsThing(x) && adjNounFit(x, n)) : undefined;
      if (n && a) {
        push(['Det', 'er', ART[n.gender!], a.de, n.de + '.'], `That is a ${en1(a)} ${en1(n)}.`,
          ['n-det', COP_ID, ART_ID[n.gender!], a.id, n.id], 'attrib', n.de);
      }
      const nn = pickNoun(true, new Set(), (x) => x.gender === 'n' && isConcrete(x));
      const an = nn ? pickAdj(true, (x) => adjFitsThing(x) && !!adjNeuter(x) && adjNounFit(x, nn)) : undefined;
      if (nn && an) {
        push(['Det', 'er', 'et', adjNeuter(an)!, nn.de + '.'], `That is a ${en1(an)} ${en1(nn)}.`,
          ['n-det', COP_ID, 'n-et', an.id, nn.id], 'attrib', nn.de);
      }
    }
    // PREDICATE adj, noun subject: "En mann er stor." (m/f) / "Et hus er stort." (curated).
    {
      const n = pickNoun(true, new Set(), (x) => x.gender !== 'n' && isConcrete(x));
      const a = n ? pickAdj(true, (x) => adjFitsThing(x) && adjNounFit(x, n)) : undefined;
      if (n && a) {
        push([cap(ART[n.gender!]), n.de, 'er', a.de + '.'], `A ${en1(n)} is ${en1(a)}.`,
          [ART_ID[n.gender!], n.id, COP_ID, a.id], 'pred', n.de);
      }
      const nn = pickNoun(true, new Set(), (x) => x.gender === 'n' && isConcrete(x));
      const an = nn ? pickAdj(true, (x) => adjFitsThing(x) && !!adjNeuter(x) && adjNounFit(x, nn)) : undefined;
      if (nn && an) {
        push(['Et', nn.de, 'er', adjNeuter(an)! + '.'], `A ${en1(nn)} is ${en1(an)}.`,
          ['n-et', nn.id, COP_ID, an.id], 'pred', nn.de);
      }
    }
    // PRONOUN + predicate adj: "Han er stor." / "Det er godt." (curated neuter for det)
    for (const p of Object.keys(PRON)) {
      if (!has(p) || !unc.has(p)) continue;
      if (p === 'n-vi' || p === 'n-de') continue; // plural predicate adj needs -e; skip
      const [surf, es, ev, anim] = PRON[p];
      if (anim === 'person') {
        const a = pickAdj(false, (x) => adjFitsCommon(x));
        if (a) push([cap(surf), 'er', a.de + '.'], `${es} ${ev} ${en1(a)}.`, [p, COP_ID, a.id], 'padj');
      } else {
        const a = pickAdj(false, (x) => adjFitsThing(x) && !!adjNeuter(x));
        if (a) push([cap(surf), 'er', adjNeuter(a)! + '.'], `${es} ${ev} ${en1(a)}.`, [p, COP_ID, a.id], 'padj');
      }
    }
    // STATEMENT adj: "Det er godt." / "Det er viktig." (curated neuter; abstract lives here)
    if (has('n-det')) {
      const a = pickAdj(true, (x) => !!adjNeuter(x) && !ADJ_PERSON_ONLY.has(x.de.toLowerCase()));
      if (a) push(['Det', 'er', adjNeuter(a)! + '.'], `That is ${en1(a)}.`, ['n-det', COP_ID, a.id], 'sadj');
    }
    // INTENSIFIER: "Det er veldig godt." / "Han er veldig glad."
    for (const k of Object.keys(INTENS)) {
      const id = idBySurface(k, 'adv');
      if (!id || !unc.has(id)) continue;
      if (has('n-det')) {
        const a = pickAdj(false, (x) => !!adjNeuter(x) && !ADJ_PERSON_ONLY.has(x.de.toLowerCase()));
        if (a) { push(['Det', 'er', k, adjNeuter(a)! + '.'], `That is ${INTENS[k]} ${en1(a)}.`, ['n-det', COP_ID, id, a.id], 'intens'); continue; }
      }
      const p = ['n-han', 'n-hun'].find(has);
      const a2 = p ? pickAdj(false, adjFitsCommon) : undefined;
      if (p && a2) push([cap(PRON[p][0]), 'er', k, a2.de + '.'], `${PRON[p][1]} ${PRON[p][2]} ${INTENS[k]} ${en1(a2)}.`, [p, COP_ID, id, a2.id], 'intens');
    }
    // LOCATIVE predicate: "Han er her." / "En mann er hjemme."
    if (locs.length) {
      const lv = choice(locs.filter((x) => unc.has(x.id)).length ? locs.filter((x) => unc.has(x.id)) : locs)!;
      const p = ['n-han', 'n-hun', 'n-jeg', 'n-du', 'n-vi', 'n-de'].find(has);
      if (p) push([cap(PRON[p][0]), 'er', lv.de + '.'], `${PRON[p][1]} ${PRON[p][2]} ${LOC[lv.de]}.`, [p, COP_ID, lv.id], 'loc');
      const n = pickNoun(true, new Set(), isAnimate);
      if (n) push([cap(ART[n.gender!]), n.de, 'er', lv.de + '.'], `A ${en1(n)} is ${LOC[lv.de]}.`, [ART_ID[n.gender!], n.id, COP_ID, lv.id], 'loc', n.de);
    }
    // VERB: "Han snakker." / "Hun ser det." / "En mann jobber."
    if (verbs.length) {
      const v = choice(verbs.filter((x) => unc.has(x.id)).length ? verbs.filter((x) => unc.has(x.id)) : verbs)!;
      const [eng, frame] = VERB[v.de];
      const f = present(v);
      const animN = nouns.filter(isAnimate);
      const useNoun = rng() < 0.45 && animN.length > 0;
      let subT: string[], subE: string, subI: string[], head: string | undefined;
      if (useNoun) {
        const u = animN.filter((n) => unc.has(n.id));
        const n = choice(u.length ? u : animN)!;
        subT = [cap(ART[n.gender!]), n.de]; subE = `A ${en1(n)}`; subI = [ART_ID[n.gender!], n.id]; head = n.de;
      } else {
        const p = ['n-han', 'n-hun'].find(has) ?? 'n-han';
        subT = [cap(PRON[p][0])]; subE = PRON[p][1]; subI = [p];
      }
      if (frame === 'det' && has('n-det')) {
        push([...subT, f, 'det.'], `${subE} ${eng} it.`, [...subI, v.id, 'n-det'], 'verb', head);
      } else {
        push([...subT, f + '.'], `${subE} ${eng}.`, [...subI, v.id], 'verb', head);
      }
    }
    // PARTICLE before NP: "Det er også en mann."
    for (const k of Object.keys(PART)) {
      const id = idBySurface(k, 'adv');
      if (id && unc.has(id) && has('n-det') && nouns.length) {
        const n = pickNoun(false);
        if (n) push(['Det', 'er', k, ART[n.gender!], n.de + '.'], `That is ${PART[k]} a ${en1(n)}.`,
          ['n-det', COP_ID, id, ART_ID[n.gender!], n.id], 'part', n.de);
      }
    }
    // QUESTIONS: "Hva er det?" / "Hvem er det?" / "Er det en mann?"
    if (has('n-det')) {
      if (has('n-hva') && unc.has('n-hva')) push(['Hva', 'er', 'det?'], 'What is that?', ['n-hva', COP_ID, 'n-det'], 'q');
      if (has('n-hvem') && unc.has('n-hvem')) push(['Hvem', 'er', 'det?'], 'Who is that?', ['n-hvem', COP_ID, 'n-det'], 'q');
      const n = pickNoun(false);
      if (n) push(['Er', 'det', ART[n.gender!], n.de + '?'], `Is that a ${en1(n)}?`, [COP_ID, 'n-det', ART_ID[n.gender!], n.id], 'q', n.de);
    }
    // COORDINATION: "Han er stor og hun er fin." (two valid clauses)
    if (has('n-og') && has('n-han') && has('n-hun') && adjs.length) {
      const a1 = pickAdj(true, adjFitsCommon);
      const a2 = pickAdj(true, adjFitsCommon);
      if (a1 && a2) push(['Han', 'er', a1.de, 'og', 'hun', 'er', a2.de + '.'],
        `He is ${en1(a1)} and she is ${en1(a2)}.`, ['n-han', COP_ID, a1.id, 'n-og', 'n-hun', a2.id], 'coord');
    }
    // CONTRAST: "Han er stor, men hun er ikke stor."
    if (has('n-men') && has('n-ikke') && has('n-han') && has('n-hun') && adjs.length) {
      const a = pickAdj(true, adjFitsCommon);
      if (a) push(['Han', 'er', a.de + ',', 'men', 'hun', 'er', 'ikke', a.de + '.'],
        `He is ${en1(a)}, but she is not ${en1(a)}.`, ['n-han', COP_ID, a.id, 'n-men', 'n-hun', 'n-ikke'], 'coord');
    }

    return cands;
  };

  const MAX_SENTENCES = 4;
  let guard = 0;
  while (unc.size && guard < 80 && out.length < MAX_SENTENCES) {
    guard++;
    const ranked = buildCands().slice().sort((x, y) => y.score - x.score);
    if (!ranked.length) break;
    const best = ranked[0];
    out.push({ sentence: best.tokens.join(' '), translation: fixArticles(best.en), requires: [...new Set(best.ids)] });
    prevKind = best.kind;
    prevHead = best.head ?? '';
    if (best.head) usedNoun.add(best.head);
    for (const id of best.ids) unc.delete(id);
  }
  return out;
}
