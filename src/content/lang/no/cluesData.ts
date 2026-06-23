/**
 * Norwegian crossword clues: a short DEFINITION in Norwegian (`de` field) + its
 * English equivalent (`en`) — NOT the literal answer, so the word isn't given
 * away. Keyed by lemma id. Authored for the early-block crossword words; later
 * words fall back to the plain English gloss until clues are added.
 */
import type { Clue } from '../../clues';

export const CLUES_NO: Record<string, Clue> = {
  // ── pronouns ──
  "n-vi": { de: "Meg og andre, sett sammen", en: "Me and others together" },
  "n-de": { de: "Andre personer, i flertall", en: "Other people, plural" },
  "n-som": { de: "Bindeord: mannen ___ sover", en: "Linking word: the man ___ sleeps" },
  "n-meg": { de: "Meg selv, som objekt", en: "Myself, as an object" },
  "n-deg": { de: "Den jeg snakker til, som objekt", en: "The one I'm talking to, as object" },
  "n-den": { de: "Viser til én ting man har nevnt", en: "Points to a thing already mentioned" },
  "n-seg": { de: "Viser tilbake til subjektet", en: "Refers back to the subject" },
  "n-hva": { de: "Spør om en ting", en: "Asks about a thing" },

  // ── conjunctions / adverbs ──
  "n-og": { de: "Binder sammen to ting", en: "Joins two things together" },
  "n-ikke": { de: "Gjør en setning til en nektelse", en: "Makes a sentence negative" },
  "n-at": { de: "Innleder en leddsetning: jeg vet ___ …", en: "Introduces a clause: I know ___ …" },
  "n-men": { de: "Viser en motsetning", en: "Shows a contrast" },

  // ── prepositions ──
  "n-paa": { de: "Oppå noe; ___ bordet", en: "On top of something; ___ the table" },
  "n-med": { de: "Sammen med noen", en: "Together with someone" },
  "n-til": { de: "Retning mot et mål; ___ byen", en: "Toward a goal; ___ town" },
  "n-fra": { de: "Bort fra et sted", en: "Away from a place" },
  "n-om": { de: "Angår et tema; en bok ___ dyr", en: "Concerning a topic; a book ___ animals" },

  // ── verb ──
  "n-vaere": { de: "Å eksistere; å ___ til stede", en: "To exist; to ___ present" },

  // ── adjectives ──
  "n-stor": { de: "Motsatt av liten", en: "The opposite of small" },
  "n-viktig": { de: "Noe som betyr mye", en: "Something that matters a lot" },
  "n-riktig": { de: "Motsatt av feil", en: "The opposite of wrong" },

  // ── nouns ──
  "n-mann": { de: "Voksen, mannlig person", en: "An adult male person" },
  "n-jente": { de: "Ung kvinne", en: "A young female" },
  "n-hus": { de: "Bygning man bor i", en: "A building you live in" },
  "n-barn": { de: "Et ungt menneske", en: "A young human" },
  "n-venn": { de: "En kamerat man liker", en: "A buddy you like" },
  "n-kvinne": { de: "Voksen, kvinnelig person", en: "An adult female person" },
  "n-dag": { de: "24 timer; motsatt av natt", en: "24 hours; the opposite of night" },
  "n-ting": { de: "En gjenstand", en: "An object" },
  "n-gutt": { de: "Ungt, mannlig menneske", en: "A young male" },
  "n-bok": { de: "Sider med tekst man leser", en: "Pages of text that you read" },
};
