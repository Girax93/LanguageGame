/**
 * French lemma dataset — a polished ~420-lemma core (Ari's call: ship an
 * excellent verified core first, expand to ~2000 later). Ordered by
 * conversational frequency but pedagogically INTERLEAVED so every block of ten
 * mixes function words, nouns, verbs and adjectives — the same recipe as the
 * German and Norwegian openings.
 *
 * Gender is the TWO-gender French system (un→m, une→f); there is no neuter, so
 * every noun is m or f. The `de` field holds the French surface (lowercase).
 * Verb `forms` give the 3rd-person-singular present in forms[0] (e.g. "est",
 * "a", "va", "parle") — the one form the cipher generator needs; the rest is
 * optional colour. order = 1-based line index (append-friendly); rank = order.
 *
 * Single-token surfaces are letters-only (accents allowed) so every word is
 * spellable in the crossword/Hurdle; multi-word entries (e.g. "peut être",
 * "parce que") use a space, which excludes them there — exactly like German
 * "in dem".
 *
 * Columns: id|de|en|pos|gender|plural|forms|tags(csv)|register
 */
import type { Lemma, Pos, Gender, Register } from '../../lemmas';

const DATA = `
f-je|je|I|pron|||||function
f-tu|tu|you (singular)|pron|||||function
f-il|il|he|pron|||||people
f-elle|elle|she|pron|||||people
f-ce|ce|this / it|pron|||||function
f-etre|être|to be|verb|||est, était, été|function|neutral
f-un|un|a (masc.)|art|||||function
f-une|une|a (fem.)|art|||||function
f-homme|homme|man|noun|m|hommes||people,family|neutral
f-femme|femme|woman|noun|f|femmes||people,family|neutral
f-et|et|and|conj|||||function
f-ne|ne|not (ne ... pas)|adv|||||function
f-pas|pas|not (ne ... pas)|adv|||||function
f-le|le|the (masc.)|art|||||function
f-la|la|the (fem.)|art|||||function
f-grand|grand|big / tall|adj|||||function
f-petit|petit|small / little|adj|||||function
f-enfant|enfant|child|noun|m|enfants||family,people|neutral
f-bon|bon|good|adj|||||function
f-avoir|avoir|to have|verb|||a, avait, eu|function|neutral
f-ami|ami|friend|noun|m|amis||people|neutral
f-oui|oui|yes|particle|||||communication
f-non|non|no|particle|||||communication
f-ils|ils|they (masc.)|pron|||||people
f-maison|maison|house|noun|f|maisons||home|neutral
f-faire|faire|to do / to make|verb|||fait, faisait, fait|function|neutral
f-jour|jour|day|noun|m|jours||time|neutral
f-mais|mais|but|conj|||||function
f-nous|nous|we|pron|||||people
f-beau|beau|beautiful / handsome|adj|||||function
f-pour|pour|for|prep|||||function
f-chat|chat|cat|noun|m|chats||animals|neutral
f-aller|aller|to go|verb|||va, allait, allé|travel|neutral
f-vous|vous|you (plural / formal)|pron|||||people
f-ici|ici|here|adv|||||function
f-eau|eau|water|noun|f|eaux||drink,nature|neutral
f-merci|merci|thank you|interj|||||communication
f-dans|dans|in / inside|prep|||||function
f-chien|chien|dog|noun|m|chiens||animals|neutral
f-parler|parler|to speak / to talk|verb|||parle, parlait, parlé|communication|neutral
f-que|que|that (conjunction)|conj|||||function
f-très|très|very|adv|||||function
f-livre|livre|book|noun|m|livres||school|neutral
f-vouloir|vouloir|to want|verb|||veut, voulait, voulu|feelings|neutral
f-mère|mère|mother|noun|f|mères||family|neutral
f-père|père|father|noun|m|pères||family|neutral
f-aussi|aussi|also / too|adv|||||function
f-jouer|jouer|to play|verb|||joue, jouait, joué|function|neutral
f-avec|avec|with|prep|||||function
f-voir|voir|to see|verb|||voit, voyait, vu|body|neutral
f-temps|temps|time / weather|noun|m|temps||time|neutral
f-où|où|where|adv|||||question
f-pouvoir|pouvoir|to be able to / can|verb|||peut, pouvait, pu|function|neutral
f-jeune|jeune|young|adj|||||function
f-table|table|table|noun|f|tables||home|neutral
f-savoir|savoir|to know|verb|||sait, savait, su|communication|neutral
f-fille|fille|girl / daughter|noun|f|filles||people,family|neutral
f-à|à|to / at|prep|||||function
f-heureux|heureux|happy|adj|||||feelings
f-ville|ville|city / town|noun|f|villes||city|neutral
f-de|de|of / from|prep|||||function
f-fort|fort|strong|adj|||||function
f-manger|manger|to eat|verb|||mange, mangeait, mangé|food|neutral
f-garçon|garçon|boy|noun|m|garçons||people,family|neutral
f-qui|qui|who|pron|||||question
f-nouveau|nouveau|new|adj|||||function
f-voiture|voiture|car|noun|f|voitures||travel|neutral
f-venir|venir|to come|verb|||vient, venait, venu|travel|neutral
f-sur|sur|on / on top of|prep|||||function
f-mot|mot|word|noun|m|mots||communication|neutral
f-fleur|fleur|flower|noun|f|fleurs||nature|neutral
f-prendre|prendre|to take|verb|||prend, prenait, pris|function|neutral
f-vieux|vieux|old|adj|||||function
f-nuit|nuit|night|noun|f|nuits||time|neutral
f-dire|dire|to say / to tell|verb|||dit, disait, dit|communication|neutral
f-comment|comment|how|adv|||||question
f-content|content|glad / pleased|adj|||||feelings
f-pain|pain|bread|noun|m|pains||food|neutral
f-soeur|soeur|sister|noun|f|soeurs||family|neutral
f-mauvais|mauvais|bad|adj|||||function
f-rue|rue|street|noun|f|rues||city,travel|neutral
f-aimer|aimer|to love / to like|verb|||aime, aimait, aimé|feelings|neutral
f-quand|quand|when|adv|||||question
f-frère|frère|brother|noun|m|frères||family|neutral
f-joli|joli|pretty|adj|||||function
f-arbre|arbre|tree|noun|m|arbres||nature|neutral
f-falloir|falloir|to be necessary|verb|||faut, fallait, fallu|function|neutral
f-fenêtre|fenêtre|window|noun|f|fenêtres||home|neutral
f-fatigué|fatigué|tired|adj|||||feelings,body
f-école|école|school|noun|f|écoles||school|neutral
f-pourquoi|pourquoi|why|adv|||||question
f-trouver|trouver|to find|verb|||trouve, trouvait, trouvé|function|neutral
f-chambre|chambre|room / bedroom|noun|f|chambres||home|neutral
f-long|long|long|adj|||||function
f-oiseau|oiseau|bird|noun|m|oiseaux||animals,nature|neutral
f-donner|donner|to give|verb|||donne, donnait, donné|function|neutral
f-malade|malade|sick / ill|adj|||||health
f-chose|chose|thing|noun|f|choses||function|neutral
f-année|année|year|noun|f|années||time|neutral
f-on|on|one / we|pron|||||function
f-me|me|me / to me|pron|||||function
f-tout|tout|everything / all|pron|||||function
f-main|main|hand|noun|f|mains||body|neutral
f-penser|penser|to think|verb|||pense, pensait, pensé|feelings|neutral
f-rien|rien|nothing|pron|||||function
f-maman|maman|mum|noun|f|mamans||family|colloquial
f-autre|autre|other|adj|||||function
f-devoir|devoir|to have to / must|verb|||doit, devait, dû|function|neutral
f-deux|deux|two|num|||||numbers
f-se|se|oneself|pron|||||function
f-bien|bien|well / good|adv|||||function
f-tête|tête|head|noun|f|têtes||body|neutral
f-papa|papa|dad|noun|m|papas||family|colloquial
f-comme|comme|like / as|conj|||||function
f-gentil|gentil|kind / nice|adj|||||feelings
f-vie|vie|life|noun|f|vies||feelings|neutral
f-croire|croire|to believe|verb|||croit, croyait, cru|feelings|neutral
f-plus|plus|more|adv|||||function
f-lui|lui|him / to him|pron|||||function
f-soleil|soleil|sun|noun|m|soleils||nature|neutral
f-regarder|regarder|to look at / to watch|verb|||regarde, regardait, regardé|body|neutral
f-si|si|if|conj|||||function
f-froid|froid|cold|adj|||||weather
f-chaud|chaud|hot / warm|adj|||||weather
f-coeur|coeur|heart|noun|m|coeurs||body,feelings|neutral
f-trois|trois|three|num|||||numbers
f-toujours|toujours|always|adv|||||time
f-passer|passer|to pass / to spend (time)|verb|||passe, passait, passé|function|neutral
f-famille|famille|family|noun|f|familles||family|neutral
f-vrai|vrai|true|adj|||||function
f-pied|pied|foot|noun|m|pieds||body|neutral
f-rester|rester|to stay|verb|||reste, restait, resté|function|neutral
f-ça|ça|that|pron|||||function
f-monde|monde|world / people|noun|m|mondes||nature,people|neutral
f-jamais|jamais|never|adv|||||time
f-demander|demander|to ask|verb|||demande, demandait, demandé|communication|neutral
f-premier|premier|first|adj|||||numbers
f-mer|mer|sea|noun|f|mers||nature,travel|neutral
f-encore|encore|again / still|adv|||||time
f-fils|fils|son|noun|m|fils||family|neutral
f-méchant|méchant|mean / nasty|adj|||||feelings
f-comprendre|comprendre|to understand|verb|||comprend, comprenait, compris|communication|neutral
f-maintenant|maintenant|now|adv|||||time
f-porte|porte|door|noun|f|portes||home|neutral
f-fou|fou|crazy|adj|||||feelings
f-quatre|quatre|four|num|||||numbers
f-y|y|there / to it|pron|||||function
f-café|café|coffee / café|noun|m|cafés||drink,city|neutral
f-attendre|attendre|to wait (for)|verb|||attend, attendait, attendu|function|neutral
f-sans|sans|without|prep|||||function
f-mari|mari|husband|noun|m|maris||family|neutral
f-difficile|difficile|difficult / hard|adj|||||function
f-parce-que|parce que|because|conj|||||function
f-oeil|oeil|eye|noun|m|yeux||body|neutral
f-aider|aider|to help|verb|||aide, aidait, aidé|function|neutral
f-cinq|cinq|five|num|||||numbers
f-quel|quel|which / what|adj|||||question
f-route|route|road|noun|f|routes||travel|neutral
f-mettre|mettre|to put|verb|||met, mettait, mis|function|neutral
f-devenir|devenir|to become|verb|||devient, devenait, devenu|function|neutral
f-heure|heure|hour / time|noun|f|heures||time|neutral
f-connaître|connaître|to know (someone)|verb|||connaît, connaissait, connu|communication|neutral
f-seul|seul|alone / only|adj|||||feelings
f-argent|argent|money|noun|m|argents||money|neutral
f-trop|trop|too much|adv|||||function
f-écouter|écouter|to listen (to)|verb|||écoute, écoutait, écouté|communication|neutral
f-nom|nom|name|noun|m|noms||communication|neutral
f-important|important|important|adj|||||function
f-travailler|travailler|to work|verb|||travaille, travaillait, travaillé|work|neutral
f-soir|soir|evening|noun|m|soirs||time|neutral
f-gros|gros|big / fat|adj|||||function
f-chercher|chercher|to look for|verb|||cherche, cherchait, cherché|function|neutral
f-tante|tante|aunt|noun|f|tantes||family|neutral
f-six|six|six|num|||||numbers
f-lit|lit|bed|noun|m|lits||home|neutral
f-appeler|appeler|to call|verb|||appelle, appelait, appelé|communication|neutral
f-noir|noir|black|adj|||||function
f-matin|matin|morning|noun|m|matins||time|neutral
f-payer|payer|to pay|verb|||paie, payait, payé|money|neutral
f-histoire|histoire|story / history|noun|f|histoires||communication|neutral
f-blanc|blanc|white|adj|||||function
f-oncle|oncle|uncle|noun|m|oncles||family|neutral
f-arriver|arriver|to arrive / to happen|verb|||arrive, arrivait, arrivé|travel|neutral
f-sous|sous|under|prep|||||function
f-pomme|pomme|apple|noun|f|pommes||food|neutral
f-prêt|prêt|ready|adj|||||function
f-perdre|perdre|to lose|verb|||perd, perdait, perdu|function|neutral
f-jardin|jardin|garden|noun|m|jardins||home,nature|neutral
f-sept|sept|seven|num|||||numbers
f-facile|facile|easy|adj|||||function
f-lire|lire|to read|verb|||lit, lisait, lu|school|neutral
f-semaine|semaine|week|noun|f|semaines||time|neutral
f-chez|chez|at (someone's place)|prep|||||function
f-vert|vert|green|adj|||||function
f-rouge|rouge|red|adj|||||function
f-train|train|train|noun|m|trains||travel|neutral
f-écrire|écrire|to write|verb|||écrit, écrivait, écrit|communication|neutral
f-pauvre|pauvre|poor|adj|||||feelings
f-pluie|pluie|rain|noun|f|pluies||weather,nature|neutral
f-huit|huit|eight|num|||||numbers
f-personne|personne|person|noun|f|personnes||people|neutral
f-laisser|laisser|to leave / to let|verb|||laisse, laissait, laissé|function|neutral
f-cher|cher|expensive / dear|adj|||||money
f-terre|terre|earth / ground|noun|f|terres||nature|neutral
f-ouvrir|ouvrir|to open|verb|||ouvre, ouvrait, ouvert|function|neutral
f-malheureux|malheureux|unhappy|adj|||||feelings
f-pays|pays|country|noun|m|pays||nature,travel|neutral
f-neuf|neuf|nine|num|||||numbers
f-question|question|question|noun|f|questions||communication|neutral
f-tomber|tomber|to fall|verb|||tombe, tombait, tombé|function|neutral
f-mon|mon|my|pron|||||function
f-peur|peur|fear|noun|f|peurs||feelings|neutral
f-dernier|dernier|last|adj|||||numbers
f-sortir|sortir|to go out / to take out|verb|||sort, sortait, sorti|travel|neutral
f-déjà|déjà|already|adv|||||time
f-vin|vin|wine|noun|m|vins||drink|neutral
f-même|même|same / even|adj|||||function
f-ton|ton|your (singular)|pron|||||function
f-dormir|dormir|to sleep|verb|||dort, dormait, dormi|health|neutral
f-ciel|ciel|sky|noun|m|cieux||nature|neutral
f-alors|alors|so / then|adv|||||function
f-bleu|bleu|blue|adj|||||function
f-lettre|lettre|letter|noun|f|lettres||communication|neutral
f-son|son|his / her|pron|||||function
f-partir|partir|to leave|verb|||part, partait, parti|travel|neutral
f-beaucoup|beaucoup|a lot / many|adv|||||function
f-vent|vent|wind|noun|m|vents||weather,nature|neutral
f-triste|triste|sad|adj|||||feelings
f-dix|dix|ten|num|||||numbers
f-place|place|place / square|noun|f|places||city|neutral
f-vivre|vivre|to live|verb|||vit, vivait, vécu|function|neutral
f-leur|leur|their / them|pron|||||function
f-jambe|jambe|leg|noun|f|jambes||body|neutral
f-dur|dur|hard / tough|adj|||||function
f-essayer|essayer|to try|verb|||essaie, essayait, essayé|function|neutral
f-peut-etre|peut être|maybe|adv|||||function
f-lune|lune|moon|noun|f|lunes||nature|neutral
f-jaune|jaune|yellow|adj|||||function
f-repas|repas|meal|noun|m|repas||food|neutral
f-monter|monter|to go up / to climb|verb|||monte, montait, monté|travel|neutral
f-avant|avant|before|prep|||||time
f-chaise|chaise|chair|noun|f|chaises||home|neutral
f-rire|rire|to laugh|verb|||rit, riait, ri|feelings|neutral
f-sang|sang|blood|noun|m|sangs||body,health|neutral
f-doux|doux|soft / sweet / gentle|adj|||||function
f-après|après|after|prep|||||time
f-bras|bras|arm|noun|m|bras||body|neutral
f-chanter|chanter|to sing|verb|||chante, chantait, chanté|communication|neutral
f-libre|libre|free|adj|||||function
f-oeuf|oeuf|egg|noun|m|oeufs||food|neutral
f-quelque|quelque|some|adj|||||function
f-entendre|entendre|to hear|verb|||entend, entendait, entendu|body|neutral
f-haut|haut|high / tall|adj|||||function
f-roi|roi|king|noun|m|rois||people|neutral
f-pendant|pendant|during|prep|||||time
f-bouche|bouche|mouth|noun|f|bouches||body|neutral
f-tuer|tuer|to kill|verb|||tue, tuait, tué|function|neutral
f-certain|certain|certain / sure|adj|||||function
f-fromage|fromage|cheese|noun|m|fromages||food|neutral
f-revenir|revenir|to come back|verb|||revient, revenait, revenu|travel|neutral
f-vers|vers|towards|prep|||||function
f-rêve|rêve|dream|noun|m|rêves||feelings|neutral
f-plein|plein|full|adj|||||function
f-montrer|montrer|to show|verb|||montre, montrait, montré|communication|neutral
f-assez|assez|enough|adv|||||function
f-étoile|étoile|star|noun|f|étoiles||nature|neutral
f-acheter|acheter|to buy|verb|||achète, achetait, acheté|shopping,money|neutral
f-vide|vide|empty|adj|||||function
f-madame|madame|madam / Mrs|noun|f|mesdames||people|neutral
f-descendre|descendre|to go down|verb|||descend, descendait, descendu|travel|neutral
f-corps|corps|body|noun|m|corps||body|neutral
f-moins|moins|less|adv|||||function
f-pont|pont|bridge|noun|m|ponts||city,travel|neutral
f-repondre|répondre|to answer|verb|||répond, répondait, répondu|communication|neutral
f-toit|toit|roof|noun|m|toits||home|neutral
f-laid|laid|ugly|adj|||||function
f-classe|classe|class|noun|f|classes||school|neutral
f-boire|boire|to drink|verb|||boit, buvait, bu|drink|neutral
f-entre|entre|between|prep|||||function
f-magasin|magasin|shop / store|noun|m|magasins||shopping,city|neutral
f-apprendre|apprendre|to learn|verb|||apprend, apprenait, appris|school|neutral
f-prix|prix|price|noun|m|prix||money|neutral
f-presque|presque|almost|adv|||||function
f-oreille|oreille|ear|noun|f|oreilles||body|neutral
f-courir|courir|to run|verb|||court, courait, couru|body|neutral
f-leger|léger|light (weight)|adj|||||function
f-cours|cours|class / course|noun|m|cours||school|neutral
f-tenir|tenir|to hold|verb|||tient, tenait, tenu|function|neutral
f-donc|donc|so / therefore|conj|||||function
f-dent|dent|tooth|noun|f|dents||body|neutral
f-joyeux|joyeux|cheerful / joyful|adj|||||feelings
f-bateau|bateau|boat|noun|m|bateaux||travel|neutral
f-finir|finir|to finish|verb|||finit, finissait, fini|function|neutral
f-zéro|zéro|zero|num|||||numbers
f-vérité|vérité|truth|noun|f|vérités||communication|neutral
f-mourir|mourir|to die|verb|||meurt, mourait, mort|health|neutral
f-vraiment|vraiment|really|adv|||||function
f-doigt|doigt|finger|noun|m|doigts||body|neutral
f-changer|changer|to change|verb|||change, changeait, changé|function|neutral
f-bas|bas|low|adj|||||function
f-gare|gare|station|noun|f|gares||travel,city|neutral
f-sembler|sembler|to seem|verb|||semble, semblait, semblé|function|neutral
f-cent|cent|hundred|num|||||numbers
f-joie|joie|joy|noun|f|joies||feelings|neutral
f-recevoir|recevoir|to receive|verb|||reçoit, recevait, reçu|function|neutral
f-neige|neige|snow|noun|f|neiges||weather,nature|neutral
f-lourd|lourd|heavy|adj|||||function
f-voisin|voisin|neighbour|noun|m|voisins||people|neutral
f-commencer|commencer|to begin / to start|verb|||commence, commençait, commencé|function|neutral
f-enfin|enfin|finally / at last|adv|||||time
f-soupe|soupe|soup|noun|f|soupes||food|neutral
f-choisir|choisir|to choose|verb|||choisit, choisissait, choisi|function|neutral
f-propre|propre|clean / own|adj|||||function
f-cheveu|cheveu|hair|noun|m|cheveux||body|neutral
f-arrêter|arrêter|to stop|verb|||arrête, arrêtait, arrêté|function|neutral
f-mille|mille|thousand|num|||||numbers
f-espoir|espoir|hope|noun|m|espoirs||feelings|neutral
f-sale|sale|dirty|adj|||||function
f-pleurer|pleurer|to cry|verb|||pleure, pleurait, pleuré|feelings|neutral
f-puis|puis|then|adv|||||time
f-métier|métier|job / trade|noun|m|métiers||work|neutral
f-suivre|suivre|to follow|verb|||suit, suivait, suivi|function|neutral
f-faux|faux|false / wrong|adj|||||function
f-parole|parole|word / speech|noun|f|paroles||communication|neutral
f-réussir|réussir|to succeed|verb|||réussit, réussissait, réussi|work|neutral
f-calme|calme|calm / quiet|adj|||||feelings
f-rivière|rivière|river|noun|f|rivières||nature|neutral
f-rendre|rendre|to give back|verb|||rend, rendait, rendu|function|neutral
f-surtout|surtout|especially|adv|||||function
f-mur|mur|wall|noun|m|murs||home|neutral
f-sentir|sentir|to feel / to smell|verb|||sent, sentait, senti|body|neutral
f-chaque|chaque|each|adj|||||function
f-fruit|fruit|fruit|noun|m|fruits||food|neutral
f-entrer|entrer|to enter|verb|||entre, entrait, entré|travel|neutral
f-peau|peau|skin|noun|f|peaux||body|neutral
f-sur-adj|sûr|sure / safe|adj|||||function
f-oublier|oublier|to forget|verb|||oublie, oubliait, oublié|function|neutral
f-cuisine|cuisine|kitchen / cooking|noun|f|cuisines||home,food|neutral
f-gagner|gagner|to win / to earn|verb|||gagne, gagnait, gagné|money,work|neutral
f-là|là|there|adv|||||function
f-porter|porter|to carry / to wear|verb|||porte, portait, porté|function|neutral
f-problème|problème|problem|noun|m|problèmes||function|neutral
f-gris|gris|grey|adj|||||function
f-loin|loin|far|adv|||||function
f-poisson|poisson|fish|noun|m|poissons||food,animals|neutral
f-fermer|fermer|to close|verb|||ferme, fermait, fermé|function|neutral
f-idée|idée|idea|noun|f|idées||communication|neutral
f-court|court|short|adj|||||function
f-ensemble|ensemble|together|adv|||||function
f-musique|musique|music|noun|f|musiques||communication|neutral
f-marcher|marcher|to walk|verb|||marche, marchait, marché|body|neutral
f-fier|fier|proud|adj|||||feelings
f-guerre|guerre|war|noun|f|guerres||function|neutral
f-depuis|depuis|since / for|prep|||||time
f-jeu|jeu|game|noun|m|jeux||function|neutral
f-continuer|continuer|to continue|verb|||continue, continuait, continué|function|neutral
f-raison|raison|reason|noun|f|raisons||communication|neutral
f-large|large|wide|adj|||||function
f-bientôt|bientôt|soon|adv|||||time
f-visage|visage|face|noun|m|visages||body|neutral
f-espérer|espérer|to hope|verb|||espère, espérait, espéré|feelings|neutral
f-rose|rose|pink|adj|||||function
f-mort|mort|death|noun|f|morts||health|neutral
f-dehors|dehors|outside|adv|||||function
f-photo|photo|photo|noun|f|photos||communication|neutral
f-décider|décider|to decide|verb|||décide, décidait, décidé|function|neutral
f-force|force|strength / force|noun|f|forces||body|neutral
f-tard|tard|late|adv|||||time
f-légume|légume|vegetable|noun|m|légumes||food|neutral
f-toucher|toucher|to touch|verb|||touche, touchait, touché|body|neutral
f-occupé|occupé|busy|adj|||||function
f-bureau|bureau|office / desk|noun|m|bureaux||work|neutral
f-tôt|tôt|early|adv|||||time
f-montagne|montagne|mountain|noun|f|montagnes||nature|neutral
f-tourner|tourner|to turn|verb|||tourne, tournait, tourné|function|neutral
f-paix|paix|peace|noun|f|paix||function|neutral
f-vite|vite|quickly / fast|adv|||||function
f-exemple|exemple|example|noun|m|exemples||communication|neutral
f-raconter|raconter|to tell (a story)|verb|||raconte, racontait, raconté|communication|neutral
f-inquiet|inquiet|worried|adj|||||feelings
f-sac|sac|bag|noun|m|sacs||shopping|neutral
f-jeter|jeter|to throw|verb|||jette, jetait, jeté|function|neutral
f-clé|clé|key|noun|f|clés||home|neutral
f-partout|partout|everywhere|adv|||||function
f-animal|animal|animal|noun|m|animaux||animals|neutral
f-préférer|préférer|to prefer|verb|||préfère, préférait, préféré|feelings|neutral
f-profond|profond|deep|adj|||||function
f-forêt|forêt|forest|noun|f|forêts||nature|neutral
f-conduire|conduire|to drive|verb|||conduit, conduisait, conduit|travel|neutral
f-pourtant|pourtant|however / yet|adv|||||function
f-lait|lait|milk|noun|m|laits||drink,food|neutral
f-casser|casser|to break|verb|||casse, cassait, cassé|function|neutral
f-poli|poli|polite|adj|||||feelings
f-avion|avion|plane|noun|m|avions||travel|neutral
f-nager|nager|to swim|verb|||nage, nageait, nagé|body|neutral
f-près|près|near / close|adv|||||function
f-genou|genou|knee|noun|m|genoux||body|neutral
f-expliquer|expliquer|to explain|verb|||explique, expliquait, expliqué|communication|neutral
f-mince|mince|thin / slim|adj|||||function
f-film|film|film / movie|noun|m|films||communication|neutral
f-laver|laver|to wash|verb|||lave, lavait, lavé|home|neutral
f-cela|cela|that|pron|||||function
f-feu|feu|fire|noun|m|feux||nature|neutral
f-oser|oser|to dare|verb|||ose, osait, osé|feelings|neutral
f-papier|papier|paper|noun|m|papiers||school,work|neutral
f-sauter|sauter|to jump|verb|||saute, sautait, sauté|body|neutral
f-fâché|fâché|angry|adj|||||feelings
f-champ|champ|field|noun|m|champs||nature|neutral
f-manquer|manquer|to miss|verb|||manque, manquait, manqué|function|neutral
f-notre|notre|our|pron|||||function
f-chemin|chemin|path / way|noun|m|chemins||travel|neutral
f-embrasser|embrasser|to kiss|verb|||embrasse, embrassait, embrassé|feelings|neutral
f-entier|entier|whole / entire|adj|||||function
f-voyage|voyage|journey / trip|noun|m|voyages||travel|neutral
f-voler|voler|to fly / to steal|verb|||vole, volait, volé|travel|neutral
f-tellement|tellement|so much|adv|||||function
f-sel|sel|salt|noun|m|sels||food|neutral
f-tirer|tirer|to pull / to shoot|verb|||tire, tirait, tiré|function|neutral
f-votre|votre|your (plural)|pron|||||function
f-gâteau|gâteau|cake|noun|m|gâteaux||food|neutral
f-pousser|pousser|to push|verb|||pousse, poussait, poussé|function|neutral
`.trim();

const POSSET = new Set<Pos>([
  'noun', 'verb', 'adj', 'adv', 'pron', 'art', 'prep', 'conj', 'num', 'particle', 'interj',
]);

export const LEMMAS_FR: Lemma[] = DATA.split('\n').map((line, i) => {
  const [id, de, en, pos, gender, plural, forms, tags, register] = line.split('|');
  const w: Lemma = { id, de, en, pos: pos as Pos, order: i + 1, rank: i + 1 };
  if (gender) w.gender = gender as Gender;
  if (plural) w.plural = plural;
  if (forms) w.forms = forms;
  if (tags) w.tags = tags.split(',');
  if (register) w.register = register as Register;
  if (!POSSET.has(w.pos)) throw new Error(`lemmas.fr: bad pos "${pos}" on ${id}`);
  return w;
});
