/**
 * Procedural French cipher-sentence generator. Mirrors the German/Norwegian
 * ones but uses French grammar. GRAMMATICALITY IS THE HARD CONSTRAINT — we only
 * emit constructions that are provably correct without a full conjugation /
 * agreement engine:
 *
 *  - Copula `être`: a fixed person table (je suis, tu es, il/elle est, …). Verb
 *    sentences use a 3rd-person subject (il/elle, or a singular noun) so the one
 *    derivable form — 3rd-person-singular present, `forms[0]` — is always right.
 *  - Predicate ADJECTIVES agree in gender. A masculine subject (il / un m-noun)
 *    takes the BASE form; a feminine subject (elle / une f-noun) takes the
 *    curated feminine (`ADJ_FEM`). We only ever use adjectives whose feminine is
 *    curated, so agreement is always correct. Plurals are avoided entirely.
 *  - Negation is the wrapped `ne … pas` (elided to `n'` before a vowel).
 *  - Identity is `C'est un / une …` (indefinite never elides). Transitive verbs
 *    take the post-verbal pronoun `ça` ("Il voit ça."), which needs no agreement.
 *  - Definite `le / la` elide to `l'` before a vowel/mute-h (handled).
 *
 * Anything that can't be placed safely is skipped (covered later by the
 * crossword / Hurdle). Output is deterministic (seeded per block).
 */
import type { Lemma } from '../../lemmas';
import type { CipherDraft } from '../../generateCipher';
import { PROGRESSION } from '../../../state/progressionConfig';

const BLOCK_SIZE = PROGRESSION.wordsPerSet * PROGRESSION.setsPerBlock; // 10

// être conjugation by subject pronoun id (the only verb with a person table).
// id -> [surface, EnglishSubject, copula(FR), EnglishCopula, animacy]
const PRON: Record<string, [string, string, string, string, 'person']> = {
  'f-je': ['je', 'I', 'suis', 'am', 'person'],
  'f-tu': ['tu', 'You', 'es', 'are', 'person'],
  'f-il': ['il', 'He', 'est', 'is', 'person'],
  'f-elle': ['elle', 'She', 'est', 'is', 'person'],
  'f-on': ['on', 'We', 'est', 'are', 'person'],
};

// Locative adverbs that read as a bare predicate: "[subj] est <loc>".
const LOC: Record<string, string> = {
  ici: 'here', là: 'there', dehors: 'outside', loin: 'far away',
};
const INTENS: Record<string, string> = {
  très: 'very', vraiment: 'really', si: 'so', tellement: 'so',
};
const PART: Record<string, string> = { aussi: 'also' };

// Curated verb table: infinitive -> [English 3rd-singular, frame].
// 'bare' = intransitive ("Il dort."), 'ça' = transitive ("Il voit ça.").
const VERB: Record<string, [string, 'bare' | 'ça']> = {
  parler: ['talks', 'bare'], jouer: ['plays', 'bare'], penser: ['thinks', 'bare'],
  dormir: ['sleeps', 'bare'], courir: ['runs', 'bare'], marcher: ['walks', 'bare'],
  tomber: ['falls', 'bare'], arriver: ['arrives', 'bare'], entrer: ['comes in', 'bare'],
  monter: ['goes up', 'bare'], partir: ['leaves', 'bare'], sortir: ['goes out', 'bare'],
  rester: ['stays', 'bare'], passer: ['passes by', 'bare'], chanter: ['sings', 'bare'],
  pleurer: ['cries', 'bare'], rire: ['laughs', 'bare'], nager: ['swims', 'bare'],
  sauter: ['jumps', 'bare'], travailler: ['works', 'bare'], venir: ['comes', 'bare'],
  revenir: ['comes back', 'bare'], descendre: ['goes down', 'bare'], vivre: ['lives', 'bare'],
  mourir: ['dies', 'bare'], répondre: ['answers', 'bare'], finir: ['finishes', 'bare'],
  voir: ['sees', 'ça'], regarder: ['watches', 'ça'], manger: ['eats', 'ça'],
  aimer: ['loves', 'ça'], croire: ['believes', 'ça'], lire: ['reads', 'ça'],
  écrire: ['writes', 'ça'], boire: ['drinks', 'ça'], comprendre: ['understands', 'ça'],
  apprendre: ['learns', 'ça'], oublier: ['forgets', 'ça'], gagner: ['wins', 'ça'],
  perdre: ['loses', 'ça'], porter: ['carries', 'ça'], pousser: ['pushes', 'ça'],
  tirer: ['pulls', 'ça'], jeter: ['throws', 'ça'], casser: ['breaks', 'ça'],
  laver: ['washes', 'ça'], toucher: ['touches', 'ça'], montrer: ['shows', 'ça'],
  trouver: ['finds', 'ça'], prendre: ['takes', 'ça'], mettre: ['puts', 'ça'],
  faire: ['does', 'ça'], dire: ['says', 'ça'], entendre: ['hears', 'ça'],
  tenir: ['holds', 'ça'], recevoir: ['gets', 'ça'], changer: ['changes', 'ça'],
};

// Feminine forms for the adjectives the cipher may use. Only adjectives listed
// here are eligible (so gender agreement is always correct); the rest are still
// taught via the crossword / Hurdle. Mirrors Norwegian's curated ADJ_NEUTER.
const ADJ_FEM: Record<string, string> = {
  grand: 'grande', petit: 'petite', bon: 'bonne', beau: 'belle', nouveau: 'nouvelle',
  vieux: 'vieille', fort: 'forte', long: 'longue', gros: 'grosse', joli: 'jolie',
  mauvais: 'mauvaise', heureux: 'heureuse', malheureux: 'malheureuse', content: 'contente',
  triste: 'triste', jeune: 'jeune', malade: 'malade', fatigué: 'fatiguée', gentil: 'gentille',
  méchant: 'méchante', fou: 'folle', seul: 'seule', prêt: 'prête', froid: 'froide',
  chaud: 'chaude', noir: 'noire', blanc: 'blanche', vert: 'verte', bleu: 'bleue',
  jaune: 'jaune', rouge: 'rouge', gris: 'grise', rose: 'rose', cher: 'chère',
  pauvre: 'pauvre', dur: 'dure', doux: 'douce', haut: 'haute', bas: 'basse',
  plein: 'pleine', vide: 'vide', laid: 'laide', léger: 'légère', lourd: 'lourde',
  propre: 'propre', sale: 'sale', calme: 'calme', court: 'courte', large: 'large',
  profond: 'profonde', mince: 'mince', fier: 'fière', poli: 'polie', inquiet: 'inquiète',
  fâché: 'fâchée', joyeux: 'joyeuse', occupé: 'occupée', vrai: 'vraie', faux: 'fausse',
  certain: 'certaine', important: 'importante', difficile: 'difficile', facile: 'facile',
  libre: 'libre',
};
// Adjectives that only fit a PERSON (never an inanimate thing / "ce").
const ADJ_PERSON_ONLY = new Set([
  'heureux', 'malheureux', 'fatigué', 'malade', 'content', 'triste', 'gentil',
  'méchant', 'fou', 'prêt', 'fier', 'inquiet', 'fâché', 'joyeux', 'occupé', 'seul', 'poli', 'jeune',
]);
// Adjectives that only describe a STATEMENT ("C'est vrai") — never a concrete noun.
const ADJ_ABSTRACT_ONLY = new Set([
  'vrai', 'faux', 'certain', 'important', 'difficile', 'facile', 'libre',
]);
// Size/physical adjectives that read wrong on an abstract noun.
const ADJ_PHYSICAL = new Set([
  'grand', 'petit', 'gros', 'long', 'court', 'large', 'haut', 'bas', 'lourd',
  'léger', 'profond', 'mince', 'plein', 'vide',
]);
// Dimension adjectives that fit a thing but not a person ("une rue longue" ✓,
// but never "elle est longue").
const ADJ_THING_ONLY = new Set([
  'long', 'large', 'haut', 'bas', 'profond', 'court', 'plein', 'vide', 'lourd', 'léger',
]);
// Colours describe things, not people ("le train est vert" ✓, not "il est rouge").
const COLOR = new Set(['noir', 'blanc', 'vert', 'bleu', 'jaune', 'rouge', 'gris', 'rose']);
// Mass / abstract / time nouns that read wrong after "c'est un/une …".
const NO_IDENTITY = new Set([
  'eau', 'argent', 'lait', 'sang', 'sel', 'sucre', 'neige', 'pluie', 'musique',
  'temps', 'paix', 'force', 'joie', 'peur', 'espoir', 'amour', 'vérité', 'guerre',
  'jour', 'année', 'heure', 'nuit', 'soir', 'matin', 'semaine', 'mois', 'moment', 'vie', 'mort',
]);
// Uncountable substances — they take no size adjective ("l'eau est grande" ✗).
const MASS = new Set([
  'eau', 'argent', 'lait', 'sang', 'sel', 'sucre', 'neige', 'pluie', 'vin', 'café', 'soupe', 'musique',
]);

const ANIMATE_TAGS = ['people', 'family', 'animals'];
const CONCRETE_TAGS = ['home', 'body', 'food', 'drink', 'animals', 'travel', 'people', 'family', 'nature', 'city', 'school', 'shopping', 'clothing'];
function isAnimate(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => ANIMATE_TAGS.includes(t));
}
function isConcrete(n: Lemma): boolean {
  return !!n.tags && n.tags.some((t) => CONCRETE_TAGS.includes(t));
}
function adjNounFit(a: Lemma, n: Lemma): boolean {
  return !ADJ_PHYSICAL.has(a.de) || isConcrete(n);
}

// ── small utilities ─────────────────────────────────────────────
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
/** Fix English indefinite articles: "a apple" -> "an apple". */
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
/** A French word that elides a preceding le/la/ne (vowel or mute h). */
function elides(word: string): boolean {
  return /^[aeiouàâäéèêëîïôûùyh]/i.test(word);
}
/** Present 3rd-singular: forms[0] if given, else a regular derivation. */
function present(v: Lemma): string {
  if (v.forms && v.forms.trim()) return v.forms.split(',')[0].trim();
  const w = v.de;
  if (w.endsWith('er')) return w.slice(0, -2) + 'e';
  if (w.endsWith('ir')) return w.slice(0, -2) + 'it';
  if (w.endsWith('re')) return w.slice(0, -1);
  return w;
}
/** Fits a person subject: not abstract-only, not a thing-only dimension. */
function adjFitsPerson(a: Lemma): boolean {
  return !ADJ_ABSTRACT_ONLY.has(a.de) && !ADJ_THING_ONLY.has(a.de) && !COLOR.has(a.de);
}
/** Fits a concrete thing: not person-only, not abstract-only. */
function adjFitsThing(a: Lemma): boolean {
  return !ADJ_PERSON_ONLY.has(a.de) && !ADJ_ABSTRACT_ONLY.has(a.de);
}

interface Candidate {
  score: number;
  tokens: string[];
  en: string;
  ids: string[];
  kind: string;
  head?: string;
}

export function generateBlockDraftsFR(b: number, lemmas: Lemma[]): CipherDraft[] {
  const rng = mulberry32(5000 + b);
  const pool = lemmas.slice(0, (b + 1) * BLOCK_SIZE);
  const poolIds = new Set(pool.map((x) => x.id));
  const target = lemmas.slice(b * BLOCK_SIZE, b * BLOCK_SIZE + BLOCK_SIZE);
  const byId = new Map(pool.map((x) => [x.id, x]));

  const has = (id: string) => poolIds.has(id);
  /** id of a pooled lemma by exact surface + allowed part(s) of speech. */
  const idOf = (surface: string, ...pos: Lemma['pos'][]): string | undefined =>
    pool.find((x) => x.de === surface && pos.includes(x.pos))?.id;
  const hasSurface = (surface: string, ...pos: Lemma['pos'][]) => !!idOf(surface, ...pos);

  const COP = idOf('être', 'verb');
  const CE = idOf('ce', 'pron');
  const UN = idOf('un', 'art');
  const UNE = idOf('une', 'art');
  const NE = idOf('ne', 'adv');
  const PAS = idOf('pas', 'adv');
  const LE = idOf('le', 'art');
  const LA = idOf('la', 'art');

  const nouns = pool.filter((x) => x.pos === 'noun' && x.gender);
  const adjs = pool.filter((x) => x.pos === 'adj' && !!ADJ_FEM[x.de]);
  const verbs = pool.filter((x) => x.pos === 'verb' && !!VERB[x.de]);
  const locs = pool.filter((x) => x.pos === 'adv' && x.de in LOC);

  const choice = <T,>(arr: T[]): T | undefined =>
    arr.length ? arr[Math.floor(rng() * arr.length)] : undefined;

  const unc = new Set(target.map((x) => x.id));
  const usedNoun = new Set<string>();
  const out: CipherDraft[] = [];
  let prevKind = '';
  let prevHead = '';

  const artFor = (n: Lemma) => (n.gender === 'f' ? 'une' : 'un');
  const artId = (n: Lemma) => (n.gender === 'f' ? UNE : UN);
  /** Definite subject NP with elision: "le chat" / "la femme" / "l'oiseau". */
  const def = (n: Lemma): { tok: string; en: string; ids: (string | undefined)[] } => {
    if (elides(n.de)) return { tok: `l'${n.de}`, en: `the ${en1(n)}`, ids: [n.gender === 'f' ? LA : LE, n.id] };
    return n.gender === 'f'
      ? { tok: `la ${n.de}`, en: `the ${en1(n)}`, ids: [LA, n.id] }
      : { tok: `le ${n.de}`, en: `the ${en1(n)}`, ids: [LE, n.id] };
  };

  const pickNoun = (preferUnc = true, filter?: (n: Lemma) => boolean): Lemma | undefined => {
    let opts = filter ? nouns.filter(filter) : nouns;
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
  const adjForm = (a: Lemma, fem: boolean) => (fem ? ADJ_FEM[a.de] : a.de);

  let cands: Candidate[] = [];
  const push = (tokens: (string | undefined)[], en: string, ids: (string | undefined)[], kind: string, head?: string, bonus = 0) => {
    const clean = ids.filter((x): x is string => !!x);
    const cov = clean.filter((i) => unc.has(i));
    if (!cov.length && !bonus) return;
    let pen = 0;
    if (prevKind === kind) pen += 3;
    if (head && prevHead === head) pen += 4;
    cands.push({
      score: cov.length * 10 + Math.max(0, cov.length - 1) * 6 + bonus - pen + rng(),
      tokens: tokens.filter((x): x is string => !!x), en, ids: [...new Set(clean)], kind, head,
    });
  };

  const buildCands = (): Candidate[] => {
    cands = [];
    if (!COP) return cands; // no être yet — nothing safe to build

    // IDENTITY: "C'est un homme." / negated "Ce n'est pas une femme."
    if (CE) {
      const n = pickNoun(true, (x) => !NO_IDENTITY.has(x.de));
      if (n) {
        const neg = !!NE && !!PAS && (unc.has(NE) || unc.has(PAS));
        if (neg) {
          push(["Ce", "n'est", 'pas', artFor(n), n.de + '.'], `That is not ${artFor(n) === 'une' ? 'a' : 'a'} ${en1(n)}.`,
            [CE, NE, COP, PAS, artId(n), n.id], 'ident', n.de);
        } else {
          push(["C'est", artFor(n), n.de + '.'], `That is a ${en1(n)}.`,
            [CE, COP, artId(n), n.id], 'ident', n.de);
        }
      }
    }
    // STATEMENT adjective: "C'est vrai." / "C'est très bon." (masc form; abstract lives here)
    if (CE) {
      const a = pickAdj(true, adjFitsPerson);
      if (a) {
        const ik = Object.keys(INTENS).map((k) => idOf(k, 'adv')).find((id) => id && unc.has(id));
        if (ik) {
          const w = byId.get(ik)!;
          push(["C'est", w.de, a.de + '.'], `That is ${INTENS[w.de]} ${en1(a)}.`, [CE, COP, ik, a.id], 'sadj');
        } else {
          push(["C'est", a.de + '.'], `That is ${en1(a)}.`, [CE, COP, a.id], 'sadj');
        }
      }
    }
    // PRONOUN + predicate adjective: "Il est grand." / "Elle est grande." Only
    // il/elle (clear gender); je/tu/on are gender-ambiguous for agreement.
    for (const p of ['f-il', 'f-elle']) {
      if (!has(p) || !unc.has(p)) continue;
      const [surf, es, cop, ev] = PRON[p];
      const fem = p === 'f-elle';
      const a = pickAdj(false, adjFitsPerson);
      if (a) push([cap(surf), cop, adjForm(a, fem) + '.'], `${es} ${ev} ${en1(a)}.`, [p, COP, a.id], 'padj');
    }
    // NOUN + predicate adjective: "Le chat est noir." / "La maison est grande."
    {
      const n = pickNoun(true, (x) => isConcrete(x) && !MASS.has(x.de));
      const a = n ? pickAdj(true, (x) => adjFitsThing(x) && adjNounFit(x, n)) : undefined;
      if (n && a) {
        const d = def(n);
        push([cap(d.tok), 'est', adjForm(a, n.gender === 'f') + '.'], `${cap(d.en)} is ${en1(a)}.`,
          [...d.ids, COP, a.id], 'nadj', n.de);
      }
    }
    // PRON + locative: "Il est ici." / "Je suis là."
    if (locs.length) {
      const lv = choice(locs.filter((x) => unc.has(x.id)).length ? locs.filter((x) => unc.has(x.id)) : locs)!;
      const p = ['f-il', 'f-elle', 'f-je', 'f-tu', 'f-on'].find(has);
      if (p) { const [surf, es, cop, ev] = PRON[p]; push([cap(surf), cop, lv.de + '.'], `${es} ${ev} ${LOC[lv.de]}.`, [p, COP, lv.id], 'loc'); }
      const n = pickNoun(true, isAnimate);
      if (n) { const d = def(n); push([cap(d.tok), 'est', lv.de + '.'], `${cap(d.en)} is ${LOC[lv.de]}.`, [...d.ids, COP, lv.id], 'loc', n.de); }
    }
    // VERB: "Il dort." / "Elle voit ça." / "Le chien dort."
    const caHas = hasSurface('ça', 'pron');
    const usableVerbs = verbs.filter((x) => VERB[x.de][1] === 'bare' || caHas);
    if (usableVerbs.length) {
      const v = choice(usableVerbs.filter((x) => unc.has(x.id)).length ? usableVerbs.filter((x) => unc.has(x.id)) : usableVerbs)!;
      const [eng, frame] = VERB[v.de];
      const f = present(v);
      const animN = nouns.filter(isAnimate);
      const useNoun = rng() < 0.45 && animN.length > 0;
      let subT: string, subE: string, subI: (string | undefined)[], head: string | undefined;
      if (useNoun) {
        const u = animN.filter((n) => unc.has(n.id));
        const n = choice(u.length ? u : animN)!;
        const d = def(n); subT = cap(d.tok); subE = cap(d.en); subI = d.ids; head = n.de;
      } else {
        const p = ['f-il', 'f-elle'].find(has) ?? 'f-il';
        subT = cap(PRON[p][0]); subE = PRON[p][1]; subI = [p];
      }
      if (frame === 'ça' && hasSurface('ça', 'pron')) {
        push([subT, f, 'ça.'], `${subE} ${eng} that.`, [...subI, v.id, idOf('ça', 'pron')], 'verb', head);
      } else {
        push([subT, f + '.'], `${subE} ${eng}.`, [...subI, v.id], 'verb', head);
      }
    }
    // THERE IS: "Il y a un chat." (idiomatic; needs y + avoir)
    {
      const Y = idOf('y', 'pron');
      const AV = idOf('avoir', 'verb');
      if (Y && AV && (unc.has(Y) || unc.has(AV))) {
        const n = pickNoun(false, (x) => !NO_IDENTITY.has(x.de));
        if (n) push(['Il', 'y', 'a', artFor(n), n.de + '.'], `There is a ${en1(n)}.`, [Y, AV, artId(n), n.id], 'ilya', n.de);
      }
    }
    // PARTICLE before NP: "C'est aussi un chat."
    for (const k of Object.keys(PART)) {
      const id = idOf(k, 'adv');
      if (id && unc.has(id) && CE) {
        const n = pickNoun(false, (x) => !NO_IDENTITY.has(x.de));
        if (n) push(["C'est", k, artFor(n), n.de + '.'], `That is ${PART[k]} a ${en1(n)}.`, [CE, COP, id, artId(n), n.id], 'part', n.de);
      }
    }
    // PREPOSITIONAL location: "Le chat est dans la maison." (someone, at a place)
    {
      const PP_PLACES: Record<string, [string, Set<string>]> = {
        dans: ['in', new Set(['maison', 'chambre', 'ville', 'jardin', 'cuisine', 'forêt', 'voiture', 'classe', 'magasin', 'bureau', 'rue', 'gare'])],
        sur: ['on', new Set(['table', 'lit', 'chaise', 'toit', 'pont', 'route', 'mur'])],
        sous: ['under', new Set(['table', 'lit', 'pont', 'arbre', 'toit'])],
      };
      const prep = pool.find((x) => x.pos === 'prep' && x.de in PP_PLACES && unc.has(x.id));
      const subs = nouns.filter(isAnimate);
      if (prep && subs.length) {
        const [prepEn, ok] = PP_PLACES[prep.de];
        const places = nouns.filter((n) => ok.has(n.de) && !elides(n.de));
        if (places.length) {
          const sub = choice(subs.filter((n) => unc.has(n.id)).length ? subs.filter((n) => unc.has(n.id)) : subs)!;
          const obj = choice(places.filter((n) => n.id !== sub.id));
          if (obj) {
            const ds = def(sub);
            const dPlace = obj.gender === 'f' ? `la ${obj.de}` : `le ${obj.de}`;
            push([cap(ds.tok), 'est', prep.de, dPlace + '.'],
              `${cap(ds.en)} is ${prepEn} the ${en1(obj)}.`,
              [...ds.ids, COP, prep.id, obj.gender === 'f' ? LA : LE, obj.id], 'pp', sub.de);
          }
        }
      }
    }
    // QUESTIONS: "Qui est-ce ?" / "Est-ce un chat ?" / "Où est le chat ?"
    if (CE) {
      const QUI = idOf('qui', 'pron');
      if (QUI && unc.has(QUI)) push(['Qui', 'est-ce', '?'], 'Who is it?', [QUI, COP, CE], 'q');
      const n = pickNoun(false, (x) => !NO_IDENTITY.has(x.de));
      if (n) push(['Est-ce', artFor(n), n.de, '?'], `Is it a ${en1(n)}?`, [COP, CE, artId(n), n.id], 'q', n.de);
    }
    {
      const OU = idOf('où', 'adv');
      if (OU && unc.has(OU)) {
        const n = pickNoun(false, isConcrete);
        if (n) { const d = def(n); push(['Où', 'est', d.tok, '?'], `Where is ${d.en}?`, [OU, COP, ...d.ids], 'q', n.de); }
      }
    }
    // COORDINATION: "Il est grand et elle est petite." (two valid clauses)
    {
      const ET = idOf('et', 'conj');
      if (ET && has('f-il') && has('f-elle')) {
        const a1 = pickAdj(true, adjFitsPerson);
        const a2 = pickAdj(true, adjFitsPerson);
        if (a1 && a2) push(['Il', 'est', a1.de, 'et', 'elle', 'est', adjForm(a2, true) + '.'],
          `He is ${en1(a1)} and she is ${en1(a2)}.`, ['f-il', COP, a1.id, ET, 'f-elle', a2.id], 'coord');
      }
    }
    // CONTRAST: "Il est grand mais elle n'est pas grande."
    {
      const MAIS = idOf('mais', 'conj');
      if (MAIS && NE && PAS && has('f-il') && has('f-elle')) {
        const a = pickAdj(true, adjFitsPerson);
        if (a) push(['Il', 'est', a.de, 'mais', 'elle', "n'est", 'pas', adjForm(a, true) + '.'],
          `He is ${en1(a)} but she is not ${en1(a)}.`, ['f-il', COP, a.id, MAIS, 'f-elle', NE, PAS], 'coord');
      }
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
