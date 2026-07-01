/**
 * Shared types for the voice recorder (dev-only tool). A "recording item" is
 * anything we want spoken — a word, an inflected sentence form, or a whole
 * sentence — identified by a STABLE key so takes survive content edits:
 *   - words:     the lemma id            (l-mann)
 *   - forms:     f-<surface>             (f-ist)      inflected tokens seen in ciphers
 *   - sentences: s-<hash>                (s-3f9a1b2c) content-hash of the text
 * The manifest maps key -> list of takes; the app plays a random take.
 */

export type ItemKind = 'word' | 'form' | 'sentence';

export interface RecItem {
  /** Stable canonical key (see file header). */
  key: string;
  kind: ItemKind;
  /** Big display text (the surface word / the sentence). */
  label: string;
  /** Secondary context: gloss / translation / note. */
  gloss: string;
  /** Filename-safe base for takes (no person/take suffix, no extension). */
  slug: string;
  /** Curriculum block this item first appears in (ordering + grouping). */
  block: number;
}

export interface Take {
  /** Speaker first name, lowercased (ari, jasmin, …). */
  person: string;
  /** 1-based take number for this (key, person). */
  take: number;
  /** WAV filename inside the language folder (source of truth is the manifest). */
  file: string;
}

export interface Manifest {
  version: number;
  lang: string;
  updated: string;
  /** key -> takes. */
  takes: Record<string, Take[]>;
}

export function emptyManifest(lang: string): Manifest {
  return { version: 1, lang, updated: new Date().toISOString(), takes: {} };
}
