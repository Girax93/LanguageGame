/**
 * Crossword clues: a short DEFINITIONAL German clue plus its English equivalent
 * (the same idea in both languages, e.g. "Eine weibliche Person" / "A female
 * person") — NOT the literal translation, so the answer isn't given away. The
 * crossword board shows the German clue by default with a DE/EN toggle.
 *
 * Keyed by lemma id (`l-*`). Authored for the words that appear in the early
 * blocks' crosswords (roughly blocks 0–20); words beyond that fall back to the
 * plain English gloss until their clues are added. Extend as the curriculum
 * deepens — `tests/content.invariants.mts` checks every early crossword word
 * has a clue here.
 */
import { wordById } from './vocab';

export interface Clue {
  de: string;
  en: string;
}

export const CLUES: Record<string, Clue> = {
  // ── pronouns ──────────────────────────────────────────────────────────────
  "l-ich": { de: "Die Person, die spricht", en: "The person who is speaking" },
  "l-du": { de: "Die Person, mit der man spricht", en: "The person you are talking to" },
  "l-er": { de: "Dritte Person, männlich", en: "Third person, male" },
  "l-sie": { de: "Dritte Person: weiblich oder Mehrzahl", en: "Third person: she, or they" },
  "l-es": { de: "Sächliches Pronomen: ___ regnet", en: "Neuter pronoun: ___ is raining" },
  "l-wir": { de: "Ich und andere zusammen", en: "Me and others together" },
  "l-man": { de: "Irgendjemand; die Leute allgemein", en: "Someone; people in general" },
  "l-sich": { de: "Bezieht sich auf das Subjekt zurück", en: "Refers back to the subject" },
  "l-sein-pron": { de: "Gehört ihm", en: "Belonging to him" },
  "l-alles": { de: "Jede Sache; nichts fehlt", en: "Every thing; nothing missing" },
  "l-nichts": { de: "Keine einzige Sache", en: "Not a single thing" },
  "l-alle": { de: "Jeder, ohne Ausnahme", en: "Everyone, without exception" },
  "l-viele": { de: "Eine große Zahl von Dingen", en: "A large number of things" },
  "l-wer": { de: "Frage nach einer Person", en: "Asks which person" },
  "l-dieser": { de: "Dieses Ding hier", en: "This one here" },
  "l-selbst": { de: "Persönlich, ohne Hilfe", en: "In person; without help" },

  // ── nouns ───────────────────────────────────────────────────────────────--
  "l-frau": { de: "Eine weibliche Person", en: "A female person" },
  "l-kind": { de: "Ein junger Mensch", en: "A young person" },
  "l-hand": { de: "Körperteil am Ende des Arms", en: "The body part at the end of the arm" },
  "l-haus": { de: "Ein Gebäude, in dem man wohnt", en: "A building people live in" },
  "l-auto": { de: "Ein Fahrzeug mit vier Rädern", en: "A vehicle with four wheels" },
  "l-jahr": { de: "Zwölf Monate", en: "Twelve months" },
  "l-leben-noun": { de: "Das Gegenteil von Tod", en: "The opposite of death" },
  "l-zeit": { de: "Stunden, Minuten und Sekunden", en: "Hours, minutes and seconds" },
  "l-leid": { de: "In „tut mir ___“: eine Entschuldigung", en: "In 'tut mir ___': an apology" },
  "l-vater": { de: "Der männliche Elternteil", en: "The male parent" },
  "l-mutter": { de: "Der weibliche Elternteil", en: "The female parent" },
  "l-gott": { de: "Höheres Wesen in einer Religion", en: "A higher being in a religion" },
  "l-liebe": { de: "Ein starkes, warmes Gefühl für jemanden", en: "A strong, warm feeling for someone" },
  "l-geld": { de: "Münzen und Scheine", en: "Coins and notes" },
  "l-paar": { de: "Zwei, die zusammengehören", en: "Two that belong together" },
  "l-nacht": { de: "Die dunkle Zeit zum Schlafen", en: "The dark time for sleeping" },
  "l-ordnung": { de: "In „in ___“: alles ist gut", en: "In 'in ___': everything is fine" },
  "l-recht-noun": { de: "Das, worauf man Anspruch hat; Gesetz", en: "What one is entitled to; law" },
  "l-maedchen": { de: "Ein junges weibliches Kind", en: "A young female child" },
  "l-freund": { de: "Eine Person, die man mag und der man vertraut", en: "A person you like and trust" },
  "l-welt": { de: "Die Erde und alles darauf", en: "The Earth and everything on it" },
  "l-angst": { de: "Das Gefühl bei Gefahr", en: "The feeling you get in danger" },
  "l-leute": { de: "Mehrere Menschen; Personen", en: "Several people; persons" },
  "l-scheisse": { de: "Grobes Wort für Ärger", en: "A crude word for trouble" },
  "l-moment": { de: "Ein sehr kurzer Augenblick", en: "A very short instant" },
  "l-mensch": { de: "Eine menschliche Person", en: "A human being" },

  // ── verbs ───────────────────────────────────────────────────────────────--
  "l-haben": { de: "Besitzen, sein Eigen nennen", en: "To own, to possess" },
  "l-koennen": { de: "Fähig sein, etwas zu tun", en: "To be able to do something" },
  "l-werden": { de: "Zu etwas anderem ___", en: "To turn into something else" },
  "l-wissen": { de: "Etwas im Kopf sicher kennen", en: "To know something for certain" },
  "l-muessen": { de: "Etwas tun, weil es nötig ist", en: "To have to do something" },
  "l-gehen": { de: "Sich zu Fuß fortbewegen", en: "To move on foot" },
  "l-wollen": { de: "Etwas haben oder tun mögen", en: "To want something" },
  "l-sagen": { de: "Etwas mit Worten äußern", en: "To express in words" },
  "l-machen": { de: "Etwas tun oder herstellen", en: "To do or make something" },
  "l-sehen": { de: "Mit den Augen wahrnehmen", en: "To perceive with the eyes" },
  "l-geben": { de: "Jemandem etwas reichen", en: "To hand something to someone" },
  "l-lassen": { de: "Zulassen oder zurücklassen", en: "To let, or to leave behind" },
  "l-denken": { de: "Im Kopf Gedanken bilden", en: "To form thoughts in the mind" },
  "l-essen": { de: "Nahrung zu sich nehmen", en: "To take in food" },
  "l-stimmen": { de: "Richtig sein; auch: wählen", en: "To be correct; also: to vote" },
  "l-moechten": { de: "Höflich etwas haben wollen", en: "To want something politely" },
  "l-sollen": { de: "Etwas tun, weil andere es erwarten", en: "To be supposed to do something" },
  "l-soll": { de: "Form von „sollen“: wird erwartet", en: "Form of 'sollen': is expected to" },
  "l-sei": { de: "Befehlsform von „sein“: ___ still!", en: "Imperative of 'to be': ___ quiet!" },
  "l-waere": { de: "Möglichkeitsform von „sein“", en: "The 'would-be' form of 'to be'" },
  "l-wuerde": { de: "Höfliches „würde“: ich ___ gern …", en: "Polite 'would': I ___ like to …" },
  "l-nehmen": { de: "Etwas mit der Hand greifen und halten", en: "To grasp and hold something" },

  // ── prepositions ──────────────────────────────────────────────────────────
  "l-zu": { de: "Richtung auf ein Ziel: ___ Hause", en: "Toward a goal: ___ home" },
  "l-mit": { de: "Zusammen ___ jemandem", en: "Together ___ someone" },
  "l-auf": { de: "Oben auf einer Fläche", en: "On top of a surface" },
  "l-fuer": { de: "Zugunsten von jemandem: ein Geschenk ___ dich", en: "On behalf of someone: a gift ___ you" },
  "l-von": { de: "Gibt Herkunft oder Besitz an", en: "Shows origin or possession" },
  "l-aus": { de: "Von innen nach außen", en: "From the inside to the outside" },
  "l-um": { de: "Rund um etwas herum", en: "Round about something" },
  "l-nach": { de: "Später als; in Richtung", en: "Later than; in the direction of" },
  "l-ueber": { de: "Höher als etwas; zum Thema", en: "Higher than something; about a topic" },
  "l-bis": { de: "So lange wie: ___ morgen", en: "Up until: ___ tomorrow" },
  "l-ab": { de: "Von einem Punkt weg: ___ jetzt", en: "Starting from: ___ now" },
  "l-durch": { de: "Von einer Seite zur anderen hindurch", en: "From one side through to the other" },
  "l-ohne": { de: "Nicht mit; es fehlt etwas", en: "Not with; something is missing" },
  "l-unter": { de: "Tiefer als etwas; dazwischen", en: "Below something; among" },
  "l-seit": { de: "Von einem früheren Zeitpunkt an bis jetzt", en: "From a past point in time until now" },
  "l-wegen": { de: "Aus einem bestimmten Grund", en: "For a particular reason" },
  "l-gegen": { de: "In die entgegengesetzte Richtung; dagegen", en: "Against; in opposition" },
  "l-in": { de: "Innerhalb von etwas: ___ dem Haus", en: "Inside something: ___ the house" },

  // ── adverbs ─────────────────────────────────────────────────────────────--
  "l-wie": { de: "Frage nach der Art: ___ geht es dir?", en: "Asks in what way: ___ are you?" },
  "l-so": { de: "Auf diese Weise", en: "In this way" },
  "l-hier": { de: "An diesem Ort", en: "At this place" },
  "l-dann": { de: "Danach; zu der Zeit", en: "After that; at that time" },
  "l-auch": { de: "Ebenso; zusätzlich", en: "As well; in addition" },
  "l-mehr": { de: "Eine größere Menge", en: "A greater amount" },
  "l-warum": { de: "Frage nach dem Grund", en: "Asks for the reason" },
  "l-wieso": { de: "Aus welchem Grund?", en: "For what reason?" },
  "l-wieder": { de: "Noch einmal", en: "Once again" },
  "l-vielleicht": { de: "Möglich, aber nicht sicher", en: "Possible, but not certain" },
  "l-wirklich": { de: "Tatsächlich, in Wahrheit", en: "Truly, in fact" },
  "l-viel": { de: "Eine große Menge", en: "A large amount" },
  "l-gerade": { de: "Genau jetzt; auch: nicht krumm", en: "Right now; also: not crooked" },
  "l-raus": { de: "Nach draußen", en: "To the outside" },
  "l-rein-adv": { de: "Nach drinnen", en: "To the inside" },
  "l-lange": { de: "Über viel Zeit hinweg", en: "Over a lot of time" },
  "l-weiter": { de: "Noch mehr; vorwärts", en: "Further; onward" },
  "l-davon": { de: "Von dieser Sache", en: "Of that thing" },
  "l-dafuer": { de: "Für diese Sache; zugunsten", en: "For that; in favour" },
  "l-hin": { de: "Vom Sprecher weg, dorthin", en: "Away from the speaker, to there" },
  "l-her": { de: "Zum Sprecher, hierher", en: "Toward the speaker, to here" },
  "l-gar": { de: "Verstärkt eine Verneinung: ___ nicht", en: "Intensifies a negation: not ___ at all" },
  "l-zusammen": { de: "Gemeinsam, nicht allein", en: "Jointly, not alone" },
  "l-erst": { de: "Nicht früher als; zuerst", en: "Not before; first" },
  "l-genug": { de: "So viel wie nötig", en: "As much as is needed" },
  "l-genau": { de: "Ganz richtig; präzise", en: "Exactly right; precise" },

  // ── conjunctions ──────────────────────────────────────────────────────────
  "l-dass": { de: "Leitet einen Nebensatz ein: ich weiß, ___ …", en: "Introduces a clause: I know ___ …" },
  "l-aber": { de: "Drückt einen Gegensatz aus", en: "Expresses a contrast" },
  "l-wenn": { de: "Unter dieser Bedingung; falls", en: "Under this condition; if" },
  "l-als": { de: "Vergleich; oder: zu einem Zeitpunkt früher", en: "In a comparison; or: at a past moment" },
  "l-oder": { de: "Bietet eine Wahl: Tee ___ Kaffee", en: "Offers a choice: tea ___ coffee" },
  "l-denn": { de: "Gibt einen Grund an; weil", en: "Gives a reason; for" },
  "l-damit": { de: "Zu dem Zweck, dass", en: "So that; in order that" },
  "l-und": { de: "Verbindet zwei Dinge: Brot ___ Butter", en: "Joins two things: bread ___ butter" },

  // ── particles / interjections ───────────────────────────────────────────--
  "l-nein": { de: "Verneinende Antwort", en: "A negative answer" },
  "l-schon": { de: "Früher als erwartet; bereits", en: "Earlier than expected; already" },
  "l-mal": { de: "Ein einziges Mal; lockert eine Bitte", en: "One time; softens a request" },
  "l-doch": { de: "Widerspricht einer Verneinung", en: "Contradicts a 'no'" },
  "l-also": { de: "Folglich; nun", en: "Therefore; well then" },
  "l-bitte": { de: "Höfliches Wort bei einer Bitte", en: "The polite word when asking" },
  "l-los": { de: "Frei, nicht fest; „___!“ = beweg dich!", en: "Loose; '___!' = get going!" },
  "l-wohl": { de: "Wahrscheinlich; auch: es geht mir ___", en: "Probably; also: feeling ___ (well)" },
  "l-oh": { de: "Ausruf der Überraschung", en: "An exclamation of surprise" },
  "l-ach": { de: "Ausruf des Bedauerns oder Staunens", en: "An exclamation of regret or wonder" },
  "l-danke": { de: "Wort des Dankes", en: "A word of thanks" },
  "l-okay": { de: "Einverstanden; in Ordnung", en: "Agreed; fine" },
  "l-ok": { de: "Kurz für „okay“", en: "Short for 'okay'" },
  "l-hey": { de: "Ruf, um Aufmerksamkeit zu bekommen", en: "A shout to get attention" },
  "l-na": { de: "Lockerer Gesprächsanfang: „___, wie geht's?“", en: "A casual opener: '___, how are you?'" },
  "l-hallo": { de: "Gruß zur Begrüßung", en: "A word of greeting" },

  // ── adjectives ────────────────────────────────────────────────────────────
  "l-schoen": { de: "Schön anzusehen; angenehm", en: "Lovely to look at; pleasant" },
  "l-andere": { de: "Nicht dieselbe; eine weitere", en: "Not the same; a further one" },
  "l-tot": { de: "Nicht mehr lebendig", en: "No longer alive" },
  "l-ganze": { de: "Vollständig; kein Teil fehlt", en: "Complete; no part missing" },

  // ── numbers ─────────────────────────────────────────────────────────────--
  "l-zwei": { de: "Die Zahl 2", en: "The number 2" },
  "l-drei": { de: "Die Zahl 3", en: "The number 3" },
  "l-dein": { de: "Gehört dir: ___ Haus", en: "Belonging to you: ___ house" },
  "l-reden": { de: "Mit Worten sprechen", en: "To talk; to speak" },
};

export function clueFor(wordId: string, lang: 'de' | 'en'): string {
  const c = CLUES[wordId];
  if (!c) return wordById(wordId)?.en ?? wordId;
  return lang === 'de' ? c.de : c.en;
}
