/**
 * The language-pack abstraction. The app used to be German-only; everything the
 * games consume (vocabulary, alphabet, keyboard, articles, the cipher/grammar
 * generators and the clues) now comes from the ACTIVE language's `LangPack`.
 * German and Norwegian each provide one. The public content modules (`vocab`,
 * `cipherItems`, `crosswords`, `hurdleItems`, `grammarItems`, `clues`) dispatch
 * to the active pack so the games stay language-agnostic.
 *
 * Note on the `de` field of `Lemma`: it holds the word's SURFACE form in the
 * target language (German "Mann", Norwegian "mann"). The name is historical;
 * read it as "the lemma's written form". This keeps the ~50 `w.de` call sites
 * working unchanged for both languages.
 */
import type { Lemma, Gender, Pos, Register } from '../lemmas';
import type { CipherDraft } from '../generateCipher';
import type { GrammarContentItem } from '../grammarItems';
import type { Clue } from '../clues';

export type { Lemma, Gender, Pos, Register };

export interface LangPack {
  /** Stable code: 'de' | 'no'. Used for per-language storage + dispatch. */
  code: string;
  /** Display name in the language menu, e.g. "German". */
  name: string;
  /** Flag emoji for the menu. */
  flag: string;
  /** Sub-label in the menu, e.g. "Beginner · A1" or "Bokmål". */
  level: string;

  /** The full frequency-ordered lemma list for this language. */
  lemmas: Lemma[];

  // ── alphabet (cipher / hurdle / keyboards) ────────────────────────────────
  /** Distinct cipher letters (the keyboard + cryptogram alphabet). */
  alphabet: string[];
  /** Uppercase that preserves this language's single-letter quirks (ß, æøå…). */
  toUpper: (s: string) => string;
  /** Is this (already-uppercased) character one of the language's letters? */
  isLetter: (c: string) => boolean;
  /** On-screen keyboard rows (already uppercased). */
  keyboardRows: string[][];

  // ── articles / display ────────────────────────────────────────────────────
  /** A noun shown with its teaching article (de: "der Mann"; no: "en mann"). */
  withArticle: (w: Lemma) => string;
  /** The English shown with its article (de/no: "the man" / "a man"). */
  withArticleEn: (w: Lemma) => string;

  // ── generators ────────────────────────────────────────────────────────────
  /** The cipher sentences covering a block's new words (drives the cipher gate). */
  generateCipherDrafts: (block: number) => CipherDraft[];
  /** The article drills, one per gendered noun (drives the grammar gate). */
  grammarItems: GrammarContentItem[];
  /** Definitional crossword clues, keyed by lemma id. */
  clues: Record<string, Clue>;
}
