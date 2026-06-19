/**
 * Procedural cipher-sentence generator.
 *
 * The cipher game decodes short German sentences. With the move to a 2000-lemma
 * frequency curriculum there is no hand-authored sentence bank, so we GENERATE a
 * small set of sentences per block whose words, taken together, cover every word
 * newly learned in that block (the cipher Practice gate requires this). Sentences
 * grow richer as the player's vocabulary grows: early blocks lean on copula /
 * identity frames ("Das ist der Mann."), later blocks add adjectives, verbs,
 * prepositions, questions and subordinate clauses.
 *
 * GRAMMATICALITY IS THE HARD CONSTRAINT. The lemma dataset stores no inflection
 * beyond a 3rd-person-singular present form for irregular verbs (`forms[0]`), so
 * we only ever emit constructions that are provably correct without a full
 * conjugation / declension engine:
 *   - nominative definite article from gender (der/die/das) — never declined;
 *   - predicate adjectives (uninflected after "ist");
 *   - the copula `sein` (a fixed person table) and verbs in the 3rd-person
 *     singular only (the one form we can derive reliably);
 *   - locative adverbs as predicates, coordinating conjunctions joining whole
 *     clauses, and a few curated, position-safe particles/prepositions.
 * Anything a template cannot place safely falls back to a single-word puzzle, so
 * coverage is always 100% even when richness is not. Output is deterministic
 * (seeded per block) so the Practice session length is stable.
 */
import { LEMMAS, type Lemma, type Gender } from './lemmas';
import { PROGRESSION } from '../state/progressionConfig';

export interface CipherDraft {
  sentence: string;
  translation: string;
  /** Lemma ids the sentence is built from (drives eligibility + coverage). */
  requires: string[];
}

const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock; // 10

// --- morphology tables (only what is provably safe) ---------------------------
const ART_NOM: Record<Gender, string> = { m: 'der', f: 'die', n: 'das' };
const ART_ID: Record<Gender, string> = { m: 'l-der', f: 'l-die', n: 'l-das' };
const ART_DAT: Record<Gender, string> = { m: 'dem', f: 'der', n: 'dem' };

/** Subject pronoun -> (sein form, English subject, English copula). */
const SEIN: Record<string, [string, string, string]> = {
  'l-ich': ['bin', 'I', 'am'],
  'l-du': ['bist', 'you', 'are'],
  'l-er': ['ist', 'he', 'is'],
  'l-sie': ['ist', 'she', 'is'],
  'l-es': ['ist', 'it', 'is'],
  'l-wir': ['sind', 'we', 'are'],
  'l-ihr': ['seid', 'you', 'are'],
};

// Function words matched by exact surface + part of speech (so the noun "Weg"
// never sneaks into the adverb "weg" slot, etc.).
const LOC: Record<string, string> = {
  hier: 'here', da: 'there', dort: 'over there', draußen: 'outside',
  drin: 'inside', weg: 'away', zurück: 'back', allein: 'alone',
};
const INTENS: Record<string, string> = {
  sehr: 'very', so: 'so', ganz: 'quite', ziemlich: 'fairly',
  wirklich: 'really', echt: 'really', total: 'totally', richtig: 'really',
};
const PARTICLE: Record<string, string> = {
  auch: 'also', noch: 'still', schon: 'already', nur: 'only',
};
const FRONT: Record<string, string> = {
  jetzt: 'Now', dann: 'Then', heute: 'Today', morgen: 'Tomorrow',
  immer: 'Always', nie: 'Never', wieder: 'Again', bald: 'Soon',
  später: 'Later', nun: 'Now', vielleicht: 'Maybe', wirklich: 'Really',
  natürlich: 'Naturally', eigentlich: 'Actually', sogar: 'Even',
  manchmal: 'Sometimes', oft: 'Often',
};
const QNP: Record<string, string> = { wo: 'Where', wie: 'How' };
const SUB_CONJ: Record<string, string> = { dass: 'that', ob: 'whether', weil: 'because', wenn: 'if' };
// Verbs of saying/thinking that can take a "dass" clause.
const SAY: Record<string, string> = {
  'l-sagen': 'says', 'l-wissen': 'knows', 'l-glauben': 'believes',
  'l-denken': 'thinks', 'l-meinen': 'reckons', 'l-hoffen': 'hopes', 'l-sehen': 'sees',
};
// Nominative ein-word endings by gender (stem + suffix).
const DET: Record<string, [string, Record<Gender, string>]> = {
  ein: ['a', { m: '', f: 'e', n: '' }],
  kein: ['no', { m: '', f: 'e', n: '' }],
  mein: ['my', { m: '', f: 'e', n: '' }],
  dein: ['your', { m: '', f: 'e', n: '' }],
  unser: ['our', { m: '', f: 'e', n: '' }],
};
// Indefinite subjects with their copula agreement.
const INDEF: Record<string, [string, string, string]> = {
  alles: ['everything', 'ist', 'is'], nichts: ['nothing', 'ist', 'is'],
  etwas: ['something', 'ist', 'is'], alle: ['all', 'sind', 'are'],
};
const IPRON: Record<string, [string, string, string]> = {
  keiner: ['no one', 'ist', 'is'], jeder: ['everyone', 'ist', 'is'],
  jemand: ['someone', 'ist', 'is'], niemand: ['no one', 'ist', 'is'], einer: ['one', 'ist', 'is'],
};

/**
 * Curated verb table: 3rd-singular English gloss + frame. Only verbs that are
 * grammatical in a bare "Subj V." (intransitive) or "Subj V es." (transitive /
 * modal: "...does it / can do it") frame — no reflexive, separable-prefix,
 * dative or complement-hungry verbs (those fall back). Frequency is front-loaded,
 * so this small list covers the common verbs of the early blocks richly.
 */
const VERB: Record<string, [string, 'bare' | 'es']> = {
  // intransitive
  gehen: ['goes', 'bare'], kommen: ['comes', 'bare'], stehen: ['stands', 'bare'],
  liegen: ['lies', 'bare'], bleiben: ['stays', 'bare'], laufen: ['runs', 'bare'],
  fahren: ['drives', 'bare'], sterben: ['dies', 'bare'], schlafen: ['sleeps', 'bare'],
  arbeiten: ['works', 'bare'], spielen: ['plays', 'bare'], warten: ['waits', 'bare'],
  leben: ['lives', 'bare'], passieren: ['happens', 'bare'], funktionieren: ['works', 'bare'],
  reden: ['talks', 'bare'], scheinen: ['seems', 'bare'], klingen: ['sounds', 'bare'],
  verschwinden: ['disappears', 'bare'], lachen: ['laughs', 'bare'], weinen: ['cries', 'bare'],
  tanzen: ['dances', 'bare'], schwimmen: ['swims', 'bare'], denken: ['thinks', 'bare'],
  // transitive (+ es)
  machen: ['does', 'es'], sehen: ['sees', 'es'], wissen: ['knows', 'es'],
  sagen: ['says', 'es'], hören: ['hears', 'es'], brauchen: ['needs', 'es'],
  finden: ['finds', 'es'], suchen: ['looks for', 'es'], lieben: ['loves', 'es'],
  kaufen: ['buys', 'es'], holen: ['fetches', 'es'], meinen: ['means', 'es'],
  zeigen: ['shows', 'es'], tun: ['does', 'es'], kennen: ['knows', 'es'],
  verstehen: ['understands', 'es'], vergessen: ['forgets', 'es'], versuchen: ['tries', 'es'],
  nehmen: ['takes', 'es'], essen: ['eats', 'es'], trinken: ['drinks', 'es'],
  halten: ['holds', 'es'], tragen: ['carries', 'es'], bringen: ['brings', 'es'],
  geben: ['gives', 'es'], treffen: ['meets', 'es'], bezahlen: ['pays', 'es'],
  zahlen: ['pays', 'es'], hassen: ['hates', 'es'], fragen: ['asks', 'es'],
  glauben: ['believes', 'es'], erzählen: ['tells', 'es'], bedeuten: ['means', 'es'],
  retten: ['saves', 'es'], rufen: ['calls', 'es'], nennen: ['names', 'es'],
  lernen: ['learns', 'es'], töten: ['kills', 'es'], schaffen: ['manages', 'es'],
  bekommen: ['gets', 'es'], verlieren: ['loses', 'es'], haben: ['has', 'es'],
  helfen: ['helps', 'bare'], sprechen: ['speaks', 'bare'], hoffen: ['hopes', 'bare'],
  schauen: ['looks', 'bare'], kriegen: ['gets', 'es'], erwarten: ['expects', 'es'],
  erreichen: ['reaches', 'es'], verlassen: ['leaves', 'es'], gewinnen: ['wins', 'es'],
  fühlen: ['feels', 'es'], bauen: ['builds', 'es'], kochen: ['cooks', 'es'],
  // modal (+ es: "can do it" / "wants it")
  können: ['can manage', 'es'], müssen: ['must do', 'es'], wollen: ['wants', 'es'],
  sollen: ['should do', 'es'], dürfen: ['may do', 'es'], mögen: ['likes', 'es'],
};

// Adjectives that are attributive-only (ungrammatical as a predicate after sein).
const ATTRIB_ONLY = new Set([
  'andere', 'anderer', 'ganze', 'ganz', 'einzige', 'gesamte', 'meiste',
  'obere', 'untere', 'mehrere', 'einige', 'beide', 'solche',
  'beste', 'erste', 'letzte', 'nächste', 'gewisse', 'jeweilige',
]);
// Adjectives kept out of random predicate pairings for tone (a calm app).
const ADJ_SKIP = new Set(['sexy', 'schwul', 'geil', 'nackt', 'tot', 'schwanger']);
function predicateAdj(a: Lemma): boolean {
  const d = a.de.toLowerCase();
  return !ATTRIB_ONLY.has(d) && !ADJ_SKIP.has(d) && !d.endsWith('ste');
}
// Verb lemmas (by surface) we never conjugate — auxiliaries / special forms.
const VERB_EXCLUDE = new Set(['sein', 'werden', 'würde', 'wäre', 'sei', 'möchten', 'möchte', 'soll', 'lassen', 'tät']);
// A noun is animate (a sensible verb subject) if tagged people/family/animals.
const ANIMATE_TAGS = ['people', 'family', 'animals'];
function isAnimate(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => ANIMATE_TAGS.includes(t));
}
// Locative prepositions that read sensibly as "[someone] ist <prep> [a place]".
const LOC_PREP: Record<string, string> = {
  in: 'in', an: 'at', bei: 'near', vor: 'in front of', hinter: 'behind', neben: 'next to',
};
const PLACE_TAGS = ['home', 'travel', 'city', 'nature', 'school'];
function isPlace(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => PLACE_TAGS.includes(t));
}

// --- small utilities ----------------------------------------------------------
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
/** First clean English gloss (before any "/", "," or "("). */
function en1(x: Lemma): string {
  let s = x.en;
  for (const ch of ['/', ',', '(']) {
    const i = s.indexOf(ch);
    if (i >= 0) s = s.slice(0, i);
  }
  return s.trim() || x.en;
}
function levelForOrder(order: number): number {
  return Math.max(1, Math.min(6, Math.floor((order - 1) / 334) + 1));
}
/** Difficulty level (1–6) from the deepest word a sentence needs. */
export function levelForRequires(requires: string[], byId: Map<string, Lemma>): number {
  let maxOrder = 1;
  for (const id of requires) {
    const w = byId.get(id);
    if (w) maxOrder = Math.max(maxOrder, w.order);
  }
  return levelForOrder(maxOrder);
}

interface Candidate {
  score: number;
  tokens: string[];
  en: string;
  ids: string[];
  kind: string;
  head?: string;
}

/**
 * Generate the cipher sentences that cover block `b`'s newly-learned words.
 * Deterministic for a given block. Each draft's `requires` are lemma ids.
 */
export function generateBlockDrafts(b: number, lemmas: Lemma[] = LEMMAS): CipherDraft[] {
  const rng = mulberry32(7000 + b);
  const pool = lemmas.slice(0, (b + 1) * BLOCK_SIZE);
  const poolIds = new Set(pool.map((x) => x.id));
  const byId = new Map(pool.map((x) => [x.id, x]));
  const target = lemmas.slice(b * BLOCK_SIZE, b * BLOCK_SIZE + BLOCK_SIZE);

  const nouns = pool.filter((x) => x.pos === 'noun' && x.gender);
  const adjs = pool.filter((x) => x.pos === 'adj' && predicateAdj(x));
  const verbs = pool.filter((x) => x.pos === 'verb' && !!VERB[x.de] && !!verb3sg(x));
  const locs = pool.filter((x) => x.pos === 'adv' && x.de in LOC);

  const has = (id: string) => poolIds.has(id);
  const hasS = has('l-sein-verb');
  const hasDas = has('l-das');
  /** Find a pooled lemma by exact surface + an allowed part of speech. */
  const wordOf = (de: string, ...pos: Lemma['pos'][]) =>
    pool.find((x) => x.de === de && pos.includes(x.pos));
  const idOf = (de: string, ...pos: Lemma['pos'][]) => wordOf(de, ...pos)?.id;

  const choice = <T,>(arr: T[]): T | undefined => (arr.length ? arr[Math.floor(rng() * arr.length)] : undefined);

  const unc = new Set(target.map((x) => x.id));
  const usedNoun = new Set<string>();
  const out: CipherDraft[] = [];
  let prevKind = '';
  let prevHead = '';

  const pickNoun = (preferUnc = true, avoid = new Set<string>()): Lemma | undefined => {
    const opts = nouns.filter((n) => !avoid.has(n.id));
    if (preferUnc) {
      const u = opts.filter((n) => unc.has(n.id));
      if (u.length) return choice(u);
    }
    const fresh = opts.filter((n) => !usedNoun.has(n.de));
    return choice(fresh.length ? fresh : opts);
  };
  const pickAdj = (preferUnc = true): Lemma | undefined => {
    if (!adjs.length) return undefined;
    const u = adjs.filter((a) => unc.has(a.id));
    return choice(preferUnc && u.length ? u : adjs);
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

    // ADJ predicate: "Der Mann ist [sehr|nicht|auch] gut."
    if (hasS && adjs.length) {
      const a = pickAdj();
      const sp = pickNoun();
      if (a && sp) {
        let pre: string[] = [], preEn: string[] = [], preIds: string[] = [];
        const ik = Object.keys(INTENS).map((k) => idOf(k, 'adv', 'particle')).find((id) => id && unc.has(id));
        const r = rng();
        if (ik) { const w = byId.get(ik)!; pre = [w.de]; preEn = [INTENS[w.de]]; preIds = [ik]; }
        else if (r < 0.25 && has('l-nicht')) { pre = ['nicht']; preEn = ['not']; preIds = ['l-nicht']; }
        else if (r < 0.4) {
          const pk = Object.keys(PARTICLE).map((k) => idOf(k, 'adv', 'particle')).find((id) => id && unc.has(id));
          if (pk) { const w = byId.get(pk)!; pre = [w.de]; preEn = [PARTICLE[w.de]]; preIds = [pk]; }
        }
        push(
          [cap(ART_NOM[sp.gender!]), sp.de, 'ist', ...pre, a.de + '.'],
          `The ${en1(sp)} is ${preEn.length ? preEn.join(' ') + ' ' : ''}${en1(a)}.`,
          [ART_ID[sp.gender!], sp.id, 'l-sein-verb', a.id, ...preIds], 'adj', sp.de,
        );
      }
    }
    // INTENS targeted: "Das ist sehr gut."
    if (hasS && hasDas && adjs.length) {
      for (const k of Object.keys(INTENS)) {
        const id = idOf(k, 'adv', 'particle');
        if (id && unc.has(id)) {
          const a = pickAdj(false)!;
          push(['Das', 'ist', k, a.de + '.'], `That is ${INTENS[k]} ${en1(a)}.`,
            ['l-das', 'l-sein-verb', id, a.id], 'adj');
        }
      }
    }
    // IDENTITY: "Das ist [nicht] der Mann." (single clause; the assembler
    // coordinates several clauses with und / aber / oder).
    if (hasS && hasDas) {
      const sp = pickNoun();
      if (sp) {
        const neg = has('l-nicht') && unc.has('l-nicht');
        push(['Das', 'ist', ...(neg ? ['nicht'] : []), ART_NOM[sp.gender!], sp.de + '.'],
          `That is ${neg ? 'not ' : ''}the ${en1(sp)}.`,
          ['l-das', 'l-sein-verb', ...(neg ? ['l-nicht'] : []), ART_ID[sp.gender!], sp.id], 'ident', sp.de);
      }
    }
    // INDEFINITE-ARTICLE identity: "Das ist ein Mann." / "Das ist kein Haus."
    if (hasS && hasDas) {
      for (const [det, en] of [['ein', 'a'], ['kein', 'no']] as [string, string][]) {
        const id = idOf(det, 'art', 'pron');
        if (id && unc.has(id) && nouns.length) {
          const n = pickNoun();
          if (n) {
            const form = det + (n.gender === 'f' ? 'e' : '');
            push(['Das', 'ist', form, n.de + '.'], `That is ${en} ${en1(n)}.`,
              ['l-das', 'l-sein-verb', id, ART_ID[n.gender!], n.id], 'ident', n.de);
          }
        }
      }
    }
    // PARTICLE before NP: "Das ist auch der Mann." / "Das ist nur die Frau."
    if (hasS && hasDas) {
      for (const [pw, en] of [['auch', 'also'], ['nur', 'only']] as [string, string][]) {
        const id = idOf(pw, 'adv', 'particle');
        if (id && unc.has(id) && nouns.length) {
          const n = pickNoun();
          if (n) push(['Das', 'ist', pw, ART_NOM[n.gender!], n.de + '.'], `That is ${en} the ${en1(n)}.`,
            ['l-das', 'l-sein-verb', id, ART_ID[n.gender!], n.id], 'ident', n.de);
        }
      }
    }
    // DET subject: "Ein Mann ist hier." / "Mein Kind ist gut."
    for (const d of Object.keys(DET)) {
      const id = idOf(d, 'art', 'pron');
      if (id && unc.has(id) && hasS && nouns.length && (locs.length || adjs.length)) {
        const n = pickNoun(false);
        if (n) {
          const form = d + DET[d][1][n.gender!];
          if (locs.length) {
            const lv = choice(locs)!;
            push([cap(form), n.de, 'ist', lv.de + '.'], `${cap(DET[d][0])} ${en1(n)} is ${LOC[lv.de]}.`,
              [id, ART_ID[n.gender!], n.id, 'l-sein-verb', lv.id], 'det', n.de);
          } else {
            const a = pickAdj(false)!;
            push([cap(form), n.de, 'ist', a.de + '.'], `${cap(DET[d][0])} ${en1(n)} is ${en1(a)}.`,
              [id, ART_ID[n.gender!], n.id, 'l-sein-verb', a.id], 'det', n.de);
          }
        }
      }
    }
    // INDEF subject: "Alles ist gut." / "Alle sind hier."
    for (const k of Object.keys(INDEF)) {
      const id = idOf(k, 'pron');
      const [ken, vf, ve] = INDEF[k];
      if (id && unc.has(id) && hasS && (adjs.length || locs.length)) {
        if (locs.length) {
          const lv = choice(locs)!;
          push([cap(k), vf, lv.de + '.'], `${cap(ken)} ${ve} ${LOC[lv.de]}.`, [id, 'l-sein-verb', lv.id], 'indef');
        } else {
          const a = pickAdj(false)!;
          push([cap(k), vf, a.de + '.'], `${cap(ken)} ${ve} ${en1(a)}.`, [id, 'l-sein-verb', a.id], 'indef');
        }
      }
    }
    // INDEF PRONOUN subject: "Keiner ist hier."
    for (const k of Object.keys(IPRON)) {
      const id = idOf(k, 'pron');
      const [ken, vf, ve] = IPRON[k];
      if (id && unc.has(id) && hasS && (adjs.length || locs.length)) {
        if (locs.length) {
          const lv = choice(locs)!;
          push([cap(k), vf, lv.de + '.'], `${cap(ken)} ${ve} ${LOC[lv.de]}.`, [id, 'l-sein-verb', lv.id], 'ipron');
        } else {
          const a = pickAdj(false)!;
          push([cap(k), vf, a.de + '.'], `${cap(ken)} ${ve} ${en1(a)}.`, [id, 'l-sein-verb', a.id], 'ipron');
        }
      }
    }
    // PRON + predicate (locative / adjective / NP)
    if (hasS) {
      for (const p of Object.keys(SEIN)) {
        if (!has(p) || !unc.has(p)) continue;
        const [form, es, ev] = SEIN[p];
        if (locs.length) {
          const lv = choice(locs)!;
          push([cap(byId.get(p)!.de), form, lv.de + '.'], `${cap(es)} ${ev} ${LOC[lv.de]}.`, [p, 'l-sein-verb', lv.id], 'ploc');
        } else if (adjs.length) {
          const a = pickAdj(false)!;
          push([cap(byId.get(p)!.de), form, a.de + '.'], `${cap(es)} ${ev} ${en1(a)}.`, [p, 'l-sein-verb', a.id], 'padj');
        }
      }
    }
    // LOCATIVE predicate, noun subject: "Der Mann ist [noch] hier."
    if (hasS && locs.length && nouns.length) {
      const lv = choice(locs.filter((x) => unc.has(x.id)).length ? locs.filter((x) => unc.has(x.id)) : locs)!;
      const n = pickNoun();
      if (n) {
        const pk = Object.keys(PARTICLE).map((k) => idOf(k, 'adv', 'particle')).find((id) => id && unc.has(id));
        const pw = pk ? byId.get(pk)! : null;
        push([cap(ART_NOM[n.gender!]), n.de, 'ist', ...(pw ? [pw.de] : []), lv.de + '.'],
          `The ${en1(n)} is ${pw ? PARTICLE[pw.de] + ' ' : ''}${LOC[lv.de]}.`,
          ['l-sein-verb', ART_ID[n.gender!], n.id, lv.id, ...(pw ? [pw.id] : [])], 'loc', n.de);
      }
    }
    // VERB 3sg (curated; bare or "+ es")
    if (verbs.length) {
      const v = choice(verbs.filter((x) => unc.has(x.id)).length ? verbs.filter((x) => unc.has(x.id)) : verbs)!;
      const f3 = verb3sg(v)!;
      const animNouns = nouns.filter(isAnimate);
      const pronChoices = ['l-er', 'l-sie'].filter(has);
      const usePron = (rng() < 0.5 || !animNouns.length) && pronChoices.length > 0;
      let subT: string[] | null = null, subE = '', subI: string[] = [], head: string | undefined;
      if (usePron) {
        const p = choice(pronChoices)!;
        subT = [cap(byId.get(p)!.de)]; subE = { 'l-er': 'He', 'l-sie': 'She' }[p]!; subI = [p];
      } else if (animNouns.length) {
        const u = animNouns.filter((n) => unc.has(n.id));
        const n = choice(u.length ? u : animNouns)!;
        subT = [cap(ART_NOM[n.gender!]), n.de]; subE = `The ${en1(n)}`; subI = [ART_ID[n.gender!], n.id]; head = n.de;
      }
      if (subT) {
        const [eng, frame] = VERB[v.de];
        if (frame === 'es' && has('l-es')) {
          push([...subT, f3, 'es.'], `${subE} ${eng} it.`, [...subI, v.id, 'l-es'], 'verb', head);
        } else {
          push([...subT, f3 + '.'], `${subE} ${eng}.`, [...subI, v.id], 'verb', head);
        }
      }
    }
    // PREPOSITIONAL location: "Der Mann ist in dem Haus." (a person, at a place)
    if (hasS) {
      const prep = choice(pool.filter((x) => x.pos === 'prep' && x.de in LOC_PREP && unc.has(x.id)));
      const subs = nouns.filter(isAnimate);
      const places = nouns.filter(isPlace);
      if (prep && subs.length && places.length) {
        const subU = subs.filter((n) => unc.has(n.id));
        const sub = choice(subU.length ? subU : subs)!;
        const placePool = places.filter((n) => n.id !== sub.id);
        const placeU = placePool.filter((n) => unc.has(n.id));
        const obj = choice(placeU.length ? placeU : placePool);
        if (obj) push([cap(ART_NOM[sub.gender!]), sub.de, 'ist', prep.de, ART_DAT[obj.gender!], obj.de + '.'],
          `The ${en1(sub)} is ${LOC_PREP[prep.de]} the ${en1(obj)}.`,
          ['l-sein-verb', ART_ID[sub.gender!], sub.id, prep.id, ART_ID[obj.gender!], obj.id], 'pp', sub.de);
      }
    }
    // QUESTIONS
    if (hasS && hasDas && has('l-was') && unc.has('l-was')) push(['Was', 'ist', 'das?'], 'What is that?', ['l-was', 'l-sein-verb', 'l-das'], 'q');
    if (hasS && hasDas && has('l-wer') && unc.has('l-wer')) push(['Wer', 'ist', 'das?'], 'Who is that?', ['l-wer', 'l-sein-verb', 'l-das'], 'q');
    for (const q of pool.filter((x) => x.pos === 'adv' && x.de in QNP && unc.has(x.id))) {
      if (hasS && nouns.length) {
        const n = pickNoun(false)!;
        push([cap(q.de), 'ist', ART_NOM[n.gender!], n.de + '?'], `${QNP[q.de]} is the ${en1(n)}?`,
          [q.id, 'l-sein-verb', ART_ID[n.gender!], n.id], 'q', n.de);
      }
    }
    // FRONTED adverb (inversion): "Jetzt ist der Mann hier."
    for (const fa of pool.filter((x) => x.pos === 'adv' && x.de in FRONT && unc.has(x.id))) {
      if (hasS && nouns.length && (locs.length || adjs.length)) {
        const n = pickNoun(false)!;
        if (locs.length) {
          const lv = choice(locs)!;
          push([cap(fa.de), 'ist', ART_NOM[n.gender!], n.de, lv.de + '.'], `${FRONT[fa.de]} the ${en1(n)} is ${LOC[lv.de]}.`,
            [fa.id, 'l-sein-verb', ART_ID[n.gender!], n.id, lv.id], 'front', n.de);
        } else {
          const a = pickAdj(false)!;
          push([cap(fa.de), 'ist', ART_NOM[n.gender!], n.de, a.de + '.'], `${FRONT[fa.de]} the ${en1(n)} is ${en1(a)}.`,
            [fa.id, 'l-sein-verb', ART_ID[n.gender!], n.id, a.id], 'front', n.de);
        }
      }
    }
    // SUBORDINATE clause: "Er sagt, dass der Mann gut ist." / "Das ist gut, weil ... ist."
    for (const sc of pool.filter((x) => x.pos === 'conj' && x.de in SUB_CONJ && unc.has(x.id))) {
      if (!(hasS && adjs.length && nouns.length)) continue;
      const n = pickNoun(false)!;
      const a = pickAdj(false)!;
      if ((sc.de === 'dass' || sc.de === 'ob')) {
        const sv = Object.keys(SAY).find(has);
        if (sv) push(['Er', verb3sg(byId.get(sv)!)! + ',', sc.de, ART_NOM[n.gender!], n.de, a.de, 'ist.'],
          `He ${SAY[sv]} ${SUB_CONJ[sc.de]} the ${en1(n)} is ${en1(a)}.`,
          ['l-er', sv, sc.id, ART_ID[n.gender!], n.id, a.id], 'sub', n.de);
      } else {
        const a2 = pickAdj(false)!;
        push(['Das', 'ist', a.de + ',', sc.de, ART_NOM[n.gender!], n.de, a2.de, 'ist.'],
          `That is ${en1(a)} ${SUB_CONJ[sc.de]} the ${en1(n)} is ${en1(a2)}.`,
          ['l-das', 'l-sein-verb', a.id, sc.id, ART_ID[n.gender!], n.id, a2.id], 'sub', n.de);
      }
    }
    // INTERJECTIONS: "Ja, das ist der Mann."
    for (const [ik, iw] of [['l-ja', 'Yes'], ['l-nein', 'No']] as [string, string][]) {
      if (has(ik) && unc.has(ik) && hasS && hasDas && nouns.length) {
        const n = pickNoun(false)!;
        push([(ik === 'l-ja' ? 'Ja' : 'Nein') + ',', 'das', 'ist', ART_NOM[n.gender!], n.de + '.'],
          `${iw}, that is the ${en1(n)}.`, [ik, 'l-das', 'l-sein-verb', ART_ID[n.gender!], n.id], 'inter', n.de);
      }
    }
    // COORDINATION — only ever joins TWO complete, individually-valid clauses, so
    // the whole sentence reads naturally (never mismatched fragments). This is how
    // und / aber appear in real sentences.
    // "Der Mann ist gut und die Frau ist schön." (two facts)
    if (hasS && has('l-und') && adjs.length && nouns.length >= 2) {
      const n1 = pickNoun();
      const n2 = pickNoun(true, new Set(n1 ? [n1.id] : []));
      const a1 = pickAdj();
      const a2 = choice(adjs.length > 1 ? adjs.filter((a) => a.id !== a1?.id) : adjs);
      if (n1 && n2 && a1 && a2) {
        push([cap(ART_NOM[n1.gender!]), n1.de, 'ist', a1.de, 'und', ART_NOM[n2.gender!], n2.de, 'ist', a2.de + '.'],
          `The ${en1(n1)} is ${en1(a1)} and the ${en1(n2)} is ${en1(a2)}.`,
          [ART_ID[n1.gender!], n1.id, 'l-sein-verb', a1.id, 'l-und', ART_ID[n2.gender!], n2.id, a2.id], 'coord', n1.de);
      }
    }
    // "Der Mann ist groß und gut." (two qualities of one thing)
    if (hasS && has('l-und') && adjs.length >= 2 && nouns.length) {
      const n = pickNoun();
      const a1 = pickAdj();
      const a2 = choice(adjs.filter((a) => a.id !== a1?.id));
      if (n && a1 && a2) {
        push([cap(ART_NOM[n.gender!]), n.de, 'ist', a1.de, 'und', a2.de + '.'],
          `The ${en1(n)} is ${en1(a1)} and ${en1(a2)}.`,
          [ART_ID[n.gender!], n.id, 'l-sein-verb', a1.id, 'l-und', a2.id], 'coord', n.de);
      }
    }
    // "Der Mann ist groß, aber das Kind ist nicht groß." (a real contrast via negation)
    if (hasS && has('l-aber') && has('l-nicht') && adjs.length && nouns.length >= 2) {
      const n1 = pickNoun();
      const n2 = pickNoun(true, new Set(n1 ? [n1.id] : []));
      const a = pickAdj();
      if (n1 && n2 && a) {
        push([cap(ART_NOM[n1.gender!]), n1.de, 'ist', a.de + ',', 'aber', ART_NOM[n2.gender!], n2.de, 'ist', 'nicht', a.de + '.'],
          `The ${en1(n1)} is ${en1(a)}, but the ${en1(n2)} is not ${en1(a)}.`,
          [ART_ID[n1.gender!], n1.id, 'l-sein-verb', a.id, 'l-aber', ART_ID[n2.gender!], n2.id, 'l-nicht'], 'coord', n1.de);
      }
    }

    return cands;
  };

  // Each cipher sentence is ONE self-contained, individually sensible clause —
  // no chaining and no noun-list enumeration (both read as non-sequiturs, e.g.
  // "Those are the house, the day and the hand", which no one would say). We emit
  // the single best sentence per placeable word and stop at the cap; whatever a
  // block can't place into a natural sentence is simply left for the crossword,
  // which picks up the leftover words. So cipher = a few real sentences, not a
  // forced cover-everything dump.
  const MAX_SENTENCES = 4;
  let guard = 0;
  while (unc.size && guard < 80 && out.length < MAX_SENTENCES) {
    guard++;
    const ranked = buildCands().slice().sort((x, y) => y.score - x.score);
    if (!ranked.length) break; // nothing placeable left
    const best = ranked[0];
    out.push({ sentence: best.tokens.join(' '), translation: best.en, requires: [...new Set(best.ids)] });
    prevKind = best.kind;
    prevHead = best.head ?? '';
    if (best.head) usedNoun.add(best.head);
    for (const id of best.ids) unc.delete(id);
  }
  return out;
}

/** 3rd-person-singular present. Irregular/strong verbs read it from `forms`;
 *  regular weak verbs derive it; auxiliaries/special forms return null. */
export function verb3sg(v: Lemma): string | null {
  if (v.forms && v.forms.trim()) return v.forms.split(',')[0].trim();
  const de = v.de;
  if (VERB_EXCLUDE.has(de) || de === 'möchte') return null;
  if (de.endsWith('eln') || de.endsWith('ern')) return de.slice(0, -1) + 't';
  if (de.endsWith('en')) {
    const st = de.slice(0, -2);
    const last = st.slice(-1), c2 = st.slice(-2), c3 = st.slice(-3);
    if (last === 't' || last === 'd' || ['chn', 'ffn', 'ckn'].includes(c3) || ['gn', 'tm', 'dm'].includes(c2)) return st + 'et';
    return st + 't';
  }
  return null;
}
