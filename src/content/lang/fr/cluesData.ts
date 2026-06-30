/**
 * French crossword clues: a short DEFINITION in French (`de` field) + its English
 * equivalent (`en`) — NOT the literal answer, so the word isn't given away. Keyed
 * by lemma id. Authored for the early-block crossword words (blocks 0–6); later
 * words fall back to the plain English gloss until clues are added.
 */
import type { Clue } from '../../clues';

export const CLUES_FR: Record<string, Clue> = {
  // ── pronouns ──
  "f-je": { de: "La personne qui parle", en: "The person who is speaking" },
  "f-tu": { de: "La personne à qui on parle", en: "The person being spoken to" },
  "f-il": { de: "Pronom pour un garçon ou un homme", en: "Pronoun for a boy or a man" },
  "f-elle": { de: "Pronom pour une fille ou une femme", en: "Pronoun for a girl or a woman" },
  "f-ce": { de: "Sert à montrer : ___ est un chat", en: "Used to point out: ___ is a cat" },
  "f-ils": { de: "Plusieurs garçons ou hommes", en: "Several boys or men" },
  "f-nous": { de: "Toi et moi, ensemble", en: "You and me, together" },
  "f-vous": { de: "Plusieurs personnes, ou forme polie", en: "Several people, or the polite form" },
  "f-on": { de: "Les gens en général", en: "People in general" },
  "f-qui": { de: "Mot pour demander quelle personne", en: "Word asking which person" },
  "f-tout": { de: "La totalité des choses", en: "The whole of things" },
  "f-rien": { de: "Pas une seule chose", en: "Not a single thing" },
  "f-me": { de: "Moi, comme objet de la phrase", en: "Me, as the object" },
  "f-ça": { de: "Cette chose-là", en: "That thing there" },

  // ── articles, conjunctions, adverbs ──
  "f-un": { de: "Article devant un mot masculin", en: "Article before a masculine word" },
  "f-une": { de: "Article devant un mot féminin", en: "Article before a feminine word" },
  "f-le": { de: "Article défini masculin", en: "The masculine definite article" },
  "f-la": { de: "Article défini féminin", en: "The feminine definite article" },
  "f-et": { de: "Relie deux mots ou deux idées", en: "Joins two words or ideas" },
  "f-mais": { de: "Marque une opposition", en: "Marks a contrast" },
  "f-ne": { de: "Avec « pas », forme la négation", en: "With 'pas', makes a negation" },
  "f-pas": { de: "Avec « ne », forme la négation", en: "With 'ne', makes a negation" },
  "f-ici": { de: "À cet endroit, près de moi", en: "At this spot, near me" },
  "f-aussi": { de: "De la même façon ; également", en: "Likewise; as well" },
  "f-très": { de: "À un très haut degré", en: "To a high degree" },
  "f-oui": { de: "Réponse positive", en: "A positive answer" },
  "f-non": { de: "Réponse négative", en: "A negative answer" },
  "f-merci": { de: "Mot de politesse pour remercier", en: "Polite word to give thanks" },
  "f-pour": { de: "Indique le but ou la destination", en: "Indicates a purpose or destination" },
  "f-dans": { de: "À l'intérieur de quelque chose", en: "Inside of something" },
  "f-avec": { de: "En compagnie de", en: "In the company of" },
  "f-que": { de: "Introduit une idée : je sais ___ …", en: "Introduces a clause: I know ___ …" },
  "f-comment": { de: "Mot pour demander de quelle manière", en: "Word asking in what way" },
  "f-où": { de: "Mot pour demander à quel endroit", en: "Word asking at which place" },
  "f-quand": { de: "Mot pour demander à quel moment", en: "Word asking at what time" },
  "f-pourquoi": { de: "Mot pour demander la raison", en: "Word asking the reason" },
  "f-sur": { de: "Posé au-dessus de quelque chose", en: "Resting on top of something" },
  "f-de": { de: "Indique l'origine ou l'appartenance", en: "Shows origin or belonging" },

  // ── verbs ──
  "f-etre": { de: "Exister ; se trouver quelque part", en: "To exist; to be somewhere" },
  "f-avoir": { de: "Posséder quelque chose", en: "To possess something" },
  "f-faire": { de: "Fabriquer ou réaliser quelque chose", en: "To make or carry something out" },
  "f-aller": { de: "Se déplacer vers un lieu", en: "To move toward a place" },
  "f-parler": { de: "Dire des mots à voix haute", en: "To say words out loud" },
  "f-jouer": { de: "S'amuser à un jeu", en: "To have fun at a game" },
  "f-voir": { de: "Percevoir avec les yeux", en: "To perceive with the eyes" },
  "f-vouloir": { de: "Avoir envie de quelque chose", en: "To desire something" },
  "f-manger": { de: "Prendre de la nourriture", en: "To take in food" },
  "f-venir": { de: "Se déplacer vers ici", en: "To move toward here" },
  "f-savoir": { de: "Connaître quelque chose dans sa tête", en: "To know something" },
  "f-pouvoir": { de: "Être capable de faire quelque chose", en: "To be able to do something" },

  // ── nouns ──
  "f-homme": { de: "Adulte de sexe masculin", en: "An adult male person" },
  "f-femme": { de: "Adulte de sexe féminin", en: "An adult female person" },
  "f-enfant": { de: "Jeune garçon ou jeune fille", en: "A young boy or girl" },
  "f-ami": { de: "Personne qu'on aime bien", en: "A person one is fond of" },
  "f-maison": { de: "Bâtiment où l'on habite", en: "A building one lives in" },
  "f-jour": { de: "Période de lumière entre deux nuits", en: "The light time between two nights" },
  "f-chat": { de: "Petit animal qui miaule", en: "A small animal that meows" },
  "f-chien": { de: "Animal fidèle qui aboie", en: "A loyal animal that barks" },
  "f-eau": { de: "Liquide transparent qu'on boit", en: "The clear liquid one drinks" },
  "f-livre": { de: "Objet avec des pages qu'on lit", en: "An object with pages one reads" },
  "f-mère": { de: "Le parent de sexe féminin", en: "The female parent" },
  "f-père": { de: "Le parent de sexe masculin", en: "The male parent" },
  "f-table": { de: "Meuble plat où l'on mange", en: "Flat furniture one eats at" },
  "f-fille": { de: "Jeune personne de sexe féminin", en: "A young female person" },
  "f-garçon": { de: "Jeune personne de sexe masculin", en: "A young male person" },
  "f-ville": { de: "Grand ensemble de maisons et de rues", en: "A large set of houses and streets" },
  "f-voiture": { de: "Véhicule à quatre roues", en: "A four-wheeled vehicle" },
  "f-temps": { de: "Les heures et les jours qui passent", en: "The passing hours and days" },
  "f-mot": { de: "Unité de langage qui a un sens", en: "A unit of language with a meaning" },

  // ── adjectives ──
  "f-grand": { de: "Contraire de petit", en: "The opposite of small" },
  "f-petit": { de: "Contraire de grand", en: "The opposite of big" },
  "f-bon": { de: "Contraire de mauvais ; agréable", en: "Opposite of bad; pleasant" },
  "f-beau": { de: "Agréable à regarder", en: "Pleasant to look at" },
  "f-jeune": { de: "Qui n'est pas vieux", en: "Not old" },
  "f-heureux": { de: "Qui ressent de la joie", en: "Feeling joy" },
  "f-fort": { de: "Contraire de faible", en: "The opposite of weak" },
  "f-nouveau": { de: "Qui vient d'arriver ; pas ancien", en: "Just arrived; not old" },
};
