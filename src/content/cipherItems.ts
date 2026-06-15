import { requiresFromText, levelForRequires } from './derive';

export interface CipherContentItem {
  id: string;
  sentence: string;
  translation: string;
  requires: string[];
  level: number;
}

interface RawCipher {
  id: string;
  sentence: string;
  translation: string;
}

const RAW: RawCipher[] = [
  { id: 'c-001', sentence: "Der Mann ist gut.", translation: "The man is good." },
  { id: 'c-002', sentence: "Der Mann ist groß.", translation: "The man is big." },
  { id: 'c-003', sentence: "Die Frau ist schön.", translation: "The woman is beautiful." },
  { id: 'c-004', sentence: "Der Mann ist gut und die Frau ist schön.", translation: "The man is good and the woman is beautiful." },
  { id: 'c-005', sentence: "Die Frau ist auch groß.", translation: "The woman is also big." },
  { id: 'c-006', sentence: "Das Kind ist klein.", translation: "The child is small." },
  { id: 'c-007', sentence: "Das Kind ist sehr klein.", translation: "The child is very small." },
  { id: 'c-008', sentence: "Der Mann ist nicht groß.", translation: "The man is not big." },
  { id: 'c-009', sentence: "Die Frau ist nicht müde.", translation: "The woman is not tired." },
  { id: 'c-010', sentence: "Ich bin müde.", translation: "I am tired." },
  { id: 'c-011', sentence: "Du bist müde.", translation: "You are tired." },
  { id: 'c-012', sentence: "Ich bin nicht müde.", translation: "I am not tired." },
  { id: 'c-013', sentence: "Der Mann hat einen Hund.", translation: "The man has a dog." },
  { id: 'c-014', sentence: "Das ist ein Hund.", translation: "That is a dog." },
  { id: 'c-015', sentence: "Der Mann hat einen Garten.", translation: "The man has a garden." },
  { id: 'c-016', sentence: "Der Garten ist groß.", translation: "The garden is big." },
  { id: 'c-017', sentence: "Das Haus ist neu.", translation: "The house is new." },
  { id: 'c-018', sentence: "Das Haus ist alt.", translation: "The house is old." },
  { id: 'c-019', sentence: "Der Mann ist heute hier.", translation: "The man is here today." },
  { id: 'c-020', sentence: "Das Kind ist heute müde.", translation: "The child is tired today." },
  { id: 'c-021', sentence: "Die Frau hat eine Katze.", translation: "The woman has a cat." },
  { id: 'c-022', sentence: "Das Auto ist schnell.", translation: "The car is fast." },
  { id: 'c-023', sentence: "Das Auto ist nicht langsam.", translation: "The car is not slow." },
  { id: 'c-024', sentence: "Die Katze ist klein und schön.", translation: "The cat is small and beautiful." },
  { id: 'c-025', sentence: "Wir sind glücklich.", translation: "We are happy." },
  { id: 'c-026', sentence: "Ihr seid müde.", translation: "You (pl.) are tired." },
  { id: 'c-027', sentence: "Wir sind hier.", translation: "We are here." },
  { id: 'c-028', sentence: "Der Mann trinkt Wasser.", translation: "The man drinks water." },
  { id: 'c-029', sentence: "Die Frau trinkt gern Kaffee.", translation: "The woman likes drinking coffee." },
  { id: 'c-030', sentence: "Das Kind trinkt Wasser.", translation: "The child drinks water." },
  { id: 'c-031', sentence: "Der Mann trinkt gern Tee.", translation: "The man likes drinking tea." },
  { id: 'c-032', sentence: "Das Buch ist interessant.", translation: "The book is interesting." },
  { id: 'c-033', sentence: "Der Mann liest ein Buch.", translation: "The man reads a book." },
  { id: 'c-034', sentence: "Das Buch ist neu oder alt.", translation: "The book is new or old." },
  { id: 'c-035', sentence: "Die Frau liest, aber das Kind spielt nicht.", translation: "The woman reads, but the child does not play." },
  { id: 'c-036', sentence: "Das Kind isst einen Apfel.", translation: "The child eats an apple." },
  { id: 'c-037', sentence: "Die Frau isst Brot.", translation: "The woman eats bread." },
  { id: 'c-038', sentence: "Der Mann trinkt jetzt Kaffee.", translation: "The man is drinking coffee now." },
  { id: 'c-039', sentence: "Das Kind isst oft Brot.", translation: "The child often eats bread." },
  { id: 'c-040', sentence: "Der Mann wohnt hier.", translation: "The man lives here." },
  { id: 'c-041', sentence: "Der Mann ist Lehrer.", translation: "The man is a teacher." },
  { id: 'c-042', sentence: "Der Freund ist gut.", translation: "The friend is good." },
  { id: 'c-043', sentence: "Die Stadt ist groß.", translation: "The city is big." },
  { id: 'c-044', sentence: "Die Schule ist neu.", translation: "The school is new." },
  { id: 'c-045', sentence: "Der Mann kommt heute.", translation: "The man is coming today." },
  { id: 'c-046', sentence: "Die Frau geht jetzt.", translation: "The woman is leaving now." },
  { id: 'c-047', sentence: "Das Kind kommt immer.", translation: "The child always comes." },
  { id: 'c-048', sentence: "Der Hund kommt nie.", translation: "The dog never comes." },
  { id: 'c-049', sentence: "Der Freund kommt bald.", translation: "The friend is coming soon." },
  { id: 'c-050', sentence: "Er ist müde.", translation: "He is tired." },
  { id: 'c-051', sentence: "Sie ist schön.", translation: "She is beautiful." },
  { id: 'c-052', sentence: "Es ist klein.", translation: "It is small." },
  { id: 'c-053', sentence: "Was macht der Mann?", translation: "What is the man doing?" },
  { id: 'c-054', sentence: "Wer ist das?", translation: "Who is that?" },
  { id: 'c-055', sentence: "Wie ist der Kaffee?", translation: "How is the coffee?" },
  { id: 'c-056', sentence: "Wo ist der Hund?", translation: "Where is the dog?" },
  { id: 'c-057', sentence: "Wann kommt die Frau?", translation: "When is the woman coming?" },
  { id: 'c-058', sentence: "Warum ist das Kind müde?", translation: "Why is the child tired?" },
  { id: 'c-059', sentence: "Das Kind ist eins.", translation: "The child is one." },
  { id: 'c-060', sentence: "Der Hund ist zwei.", translation: "The dog is two." },
  { id: 'c-061', sentence: "Das Kind ist drei.", translation: "The child is three." },
  { id: 'c-062', sentence: "Die Katze ist vier.", translation: "The cat is four." },
  { id: 'c-063', sentence: "Das Kind ist fünf.", translation: "The child is five." },
  { id: 'c-064', sentence: "Der Mann möchte Kaffee.", translation: "The man would like coffee." },
  { id: 'c-065', sentence: "Der Tisch ist neu.", translation: "The table is new." },
  { id: 'c-066', sentence: "Der Stuhl ist alt.", translation: "The chair is old." },
  { id: 'c-067', sentence: "Die Frau kauft einen Tisch.", translation: "The woman buys a table." },
  { id: 'c-068', sentence: "Das Auto ist teuer.", translation: "The car is expensive." },
  { id: 'c-069', sentence: "Das Buch ist billig.", translation: "The book is cheap." },
  { id: 'c-070', sentence: "Der Kaffee ist warm.", translation: "The coffee is warm." },
  { id: 'c-071', sentence: "Das Wasser ist kalt.", translation: "The water is cold." },
  { id: 'c-072', sentence: "Das Wetter ist schön.", translation: "The weather is beautiful." },
  { id: 'c-073', sentence: "Die Sonne ist warm.", translation: "The sun is warm." },
  { id: 'c-074', sentence: "Das Kind spielt hier.", translation: "The child plays here." },
  { id: 'c-075', sentence: "Der Park ist groß.", translation: "The park is big." },
  { id: 'c-076', sentence: "Der Hund spielt mit dem Ball.", translation: "The dog plays with the ball." },
  { id: 'c-077', sentence: "Die Frau spielt mit dem Kind.", translation: "The woman plays with the child." },
  { id: 'c-078', sentence: "Das ist übrigens gut.", translation: "That is good, by the way." },
  { id: 'c-079', sentence: "Das Kind ist irgendwie müde.", translation: "The child is somehow tired." },
  { id: 'c-080', sentence: "Der Mann ist wirklich groß.", translation: "The man is really big." },
  { id: 'c-081', sentence: "Die Frau trinkt nur Wasser.", translation: "The woman drinks only water." },
  { id: 'c-082', sentence: "Das Kind isst schon Brot.", translation: "The child is already eating bread." },
  { id: 'c-083', sentence: "Der Mann ist noch hier.", translation: "The man is still here." },
  { id: 'c-084', sentence: "Dann geht die Frau.", translation: "Then the woman leaves." },
  { id: 'c-085', sentence: "Das ist leider teuer.", translation: "That is unfortunately expensive." },
  { id: 'c-086', sentence: "Vielleicht kommt der Hund.", translation: "Maybe the dog is coming." },
  { id: 'c-087', sentence: "Das Kind ist in der Schule.", translation: "The child is at school." },
  { id: 'c-088', sentence: "Der Freund wohnt in der Stadt.", translation: "The friend lives in the city." },
];

export const CIPHER_ITEMS: CipherContentItem[] = RAW.map((r) => {
  const requires = requiresFromText(r.sentence);
  return { ...r, requires, level: levelForRequires(requires) };
});
