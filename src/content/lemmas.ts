/**
 * The vocabulary dataset: ~2000 German lemmas ordered by conversational
 * frequency (OpenSubtitles), each with an English gloss, part of speech,
 * gender + plural for nouns, principal forms for irregular verbs, topic tags,
 * a register flag, and its frequency rank. Single source of truth for the
 * curriculum order; `vocab.ts` derives sets/blocks and lookups from it.
 *
 * Stored compactly (one tab-separated row per lemma) and parsed at load to keep
 * the source small. GENERATED from the frequency pipeline + multi-agent review.
 * Columns: id, de, en, pos, order, rank, gender, plural, forms, tags(csv), register
 */
export type Pos =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'pron'
  | 'art' | 'prep' | 'conj' | 'num' | 'particle' | 'interj';
export type Gender = 'm' | 'f' | 'n';
export type Register = 'colloquial' | 'neutral' | 'formal';

export interface Lemma {
  id: string;
  de: string;
  en: string;
  pos: Pos;
  order: number;
  rank: number;
  gender?: Gender;
  plural?: string;
  forms?: string;
  tags?: string[];
  register?: Register;
}

const DATA = `l-ich	ich	I	pron	1	1				function	neutral
l-sie	sie	she / they	pron	2	2				function	neutral
l-der	der	the	art	3	3				function	neutral
l-sein-verb	sein	to be	verb	4	4			ist, war, ist gewesen	function	neutral
l-du	du	you (sg)	pron	5	5				function	neutral
l-nicht	nicht	not	adv	6	6				function	neutral
l-es	es	it	pron	7	8				function	neutral
l-und	und	and	conj	8	9				function	neutral
l-wir	wir	we	pron	9	11				function	neutral
l-was	was	what	pron	10	12				question,function	neutral
l-zu	zu	to / too	prep	11	13				function	neutral
l-er	er	he	pron	12	14				function	neutral
l-ein	ein	a / an	art	13	15				function	neutral
l-in	in	in	prep	14	16				function	neutral
l-ja	ja	yes	particle	15	17				communication	neutral
l-mit	mit	with	prep	16	19				function	neutral
l-wie	wie	how / as	adv	17	20				question,function	neutral
l-auf	auf	on / onto	prep	18	23				function	neutral
l-dass	dass	that	conj	19	24				function	neutral
l-aber	aber	but	conj	20	25				function	neutral
l-so	so	so / thus	adv	21	27				function	neutral
l-hier	hier	here	adv	22	29				function	neutral
l-haben	haben	to have	verb	23	30			hat, hatte, hat gehabt	function	neutral
l-fuer	für	for	prep	24	31				function	neutral
l-von	von	from / of	prep	25	34				function	neutral
l-wenn	wenn	if / when	conj	26	35				function	neutral
l-ihr	ihr	her / their / you (pl)	pron	27	37				function	neutral
l-nein	nein	no	particle	28	38				communication	neutral
l-an	an	at / on	prep	29	40				function	neutral
l-noch	noch	still / yet	adv	30	42				function	neutral
l-nur	nur	only	adv	31	43				function	neutral
l-da	da	there	adv	32	44				function	neutral
l-sich	sich	oneself	pron	33	46				function	neutral
l-koennen	können	to be able to / can	verb	34	51			kann, konnte, hat gekonnt	function	neutral
l-gut	gut	good	adj	35	52				feelings	neutral
l-auch	auch	also / too	adv	36	53				function	neutral
l-schon	schon	already	particle	37	54				time,function	neutral
l-als	als	when / as / than	conj	38	55				function	neutral
l-sein-pron	sein	his / its	pron	39	56				function	neutral
l-mal	mal	just / once	particle	40	57				function	colloquial
l-jetzt	jetzt	now	adv	41	58				time	neutral
l-dann	dann	then	adv	42	60				time,function	neutral
l-aus	aus	out / from	prep	43	61				function	neutral
l-mein	mein	my	pron	44	62				function	neutral
l-um	um	around / at	prep	45	63				function	neutral
l-in-dem	in dem	in the (im)	prep	46	64				function	neutral
l-werden	werden	to become / will	verb	47	65			wird, wurde, ist geworden	function	neutral
l-doch	doch	yet / after all	particle	48	68				function	neutral
l-alles	alles	everything	pron	49	69				function	neutral
l-wissen	wissen	to know	verb	50	70			weiß, wusste, hat gewusst	communication	neutral
l-kein	kein	no / not any	pron	51	71				function	neutral
l-oder	oder	or	conj	52	72				function	neutral
l-nach	nach	after / to	prep	53	73				function	neutral
l-nichts	nichts	nothing	pron	54	74				function	neutral
l-man	man	one / you (impersonal)	pron	55	75				function	neutral
l-muessen	müssen	to have to / must	verb	56	76			muss, musste, hat gemusst	function	neutral
l-wollen	wollen	to want	verb	57	78			will, wollte, hat gewollt	feelings	neutral
l-gehen	gehen	to go	verb	58	80			geht, ging, ist gegangen	travel	neutral
l-wo	wo	where	adv	59	81				question,function	neutral
l-etwas	etwas	something	pron	60	82				function	neutral
l-oh	oh	oh	interj	61	83				communication	colloquial
l-mehr	mehr	more	adv	62	84				function	neutral
l-bei	bei	at / near / with	prep	63	85				function	neutral
l-also	also	so / well	particle	64	86				function	neutral
l-bitte	bitte	please	particle	65	87				communication	neutral
l-immer	immer	always	adv	66	88				time	neutral
l-warum	warum	why	adv	67	90				question	neutral
l-vor	vor	before / in front of	prep	68	91				function	neutral
l-los	los	go on / loose	particle	69	92				function	colloquial
l-wieder	wieder	again	adv	70	94				time,function	neutral
l-sagen	sagen	to say	verb	71	95			sagt, sagte, hat gesagt	communication	neutral
l-machen	machen	to do / make	verb	72	96				function	neutral
l-danke	danke	thanks	interj	73	97				communication	neutral
l-sehr	sehr	very	adv	74	98				function	neutral
l-alle	alle	all	pron	75	99				function	neutral
l-denn	denn	because / then	conj	76	100				function	neutral
l-mann	Mann	man / husband	noun	77	101	m	Männer		people,family	neutral
l-tun	tun	to do	verb	78	102			tut, tat, hat getan	function	neutral
l-zu-dem	zu dem	to the (zum)	prep	79	104				function	neutral
l-sehen	sehen	to see	verb	80	106			sieht, sah, hat gesehen	body	neutral
l-vielleicht	vielleicht	maybe / perhaps	adv	81	107				function	neutral
l-wer	wer	who	pron	82	109				question,function	neutral
l-dieser	dieser	this	pron	83	111				function	neutral
l-kommen	kommen	to come	verb	84	114			kommt, kam, ist gekommen	travel	neutral
l-ueber	über	over / about	prep	85	115				function	neutral
l-geben	geben	to give	verb	86	116			gibt, gab, hat gegeben	function	neutral
l-okay	okay	okay	interj	87	117				communication	colloquial
l-dein	dein	your (sg)	pron	88	119				function	neutral
l-soll	soll	should / ought to	verb	89	120			soll, sollte, hat gesollt	function	neutral
l-nie	nie	never	adv	90	123				time	neutral
l-wirklich	wirklich	really	adv	91	124				function	neutral
l-hey	hey	hey	interj	92	125				communication	colloquial
l-viel	viel	much / a lot	adv	93	127				function	neutral
l-weg-adv	weg	away / gone	adv	94	128				function	neutral
l-wuerde	würde	would	verb	95	129				function	neutral
l-an-dem	an dem	at the (am)	prep	96	131				function	neutral
l-leben-noun	Leben	life	noun	97	134	n	Leben		feelings	neutral
l-zeit	Zeit	time	noun	98	136	f	Zeiten		time	neutral
l-weil	weil	because	conj	99	137				function	neutral
l-heute	heute	today	adv	100	141				time	neutral
l-damit	damit	so that / with it	conj	101	144				function	neutral
l-waere	wäre	would be	verb	102	146				function	neutral
l-ok	ok	ok	interj	103	149				communication	colloquial
l-sicher	sicher	sure / safe	adj	104	150				feelings	neutral
l-frau	Frau	woman / wife	noun	105	152	f	Frauen		people,family	neutral
l-nun	nun	now / well	adv	106	153				time,function	neutral
l-bis	bis	until	prep	107	154				time,function	neutral
l-leid	Leid	sorrow (tut mir leid: sorry)	noun	108	156	n			feelings	neutral
l-na	na	well	interj	109	157				communication	colloquial
l-zurueck	zurück	back	adv	110	161				travel	neutral
l-lassen	lassen	to let / leave	verb	111	162			lässt, ließ, hat gelassen	function	neutral
l-hallo	hallo	hello	interj	112	163				communication	neutral
l-gott	Gott	god	noun	113	165	m	Götter		feelings	neutral
l-zwei	zwei	two	num	114	168				numbers	neutral
l-genau	genau	exactly	adv	115	170				function	neutral
l-zu-der	zu der	to the (zur)	prep	116	172				function	neutral
l-klar	klar	clear / sure	adj	117	174				function	neutral
l-morgen	morgen	tomorrow	adv	118	175				time	neutral
l-leute	Leute	people	noun	119	176		Leute		people	neutral
l-vater	Vater	father	noun	120	177	m	Väter		family,people	neutral
l-schoen	schön	beautiful / nice	adj	121	178				feelings	neutral
l-glauben	glauben	to believe	verb	122	179				feelings	neutral
l-ab	ab	off / from	prep	123	180				function	neutral
l-gerade	gerade	just / straight	adv	124	181				time,function	neutral
l-tag	Tag	day	noun	125	182	m	Tage		time	neutral
l-reden	reden	to talk	verb	126	184				communication	neutral
l-wohl	wohl	probably / well	particle	127	185				function	neutral
l-liebe	Liebe	love	noun	128	186	f			feelings	neutral
l-sollen	sollen	should / to be supposed to	verb	129	187			soll, sollte, hat gesollt	function	neutral
l-jemand	jemand	someone	pron	130	190				people,function	neutral
l-geld	Geld	money	noun	131	191	n			money	neutral
l-durch	durch	through	prep	132	192				function	neutral
l-ob	ob	whether / if	conj	133	193				function	neutral
l-mutter	Mutter	mother	noun	134	195	f	Mütter		family,people	neutral
l-raus	raus	out	adv	135	196				function	colloquial
l-paar	Paar	couple / pair	noun	136	198	n	Paare		people	neutral
l-passieren	passieren	to happen	verb	137	200				function	neutral
l-denken	denken	to think	verb	138	201			denkt, dachte, hat gedacht	feelings	neutral
l-besser	besser	better	adj	139	202				function	neutral
l-wieso	wieso	why	adv	140	204				question	neutral
l-selbst	selbst	self / even	pron	141	207				function	neutral
l-hoeren	hören	to hear	verb	142	208				body	neutral
l-moechten	möchten	would like	verb	143	209				feelings	neutral
l-ohne	ohne	without	prep	144	210				function	neutral
l-her	her	here / hither	adv	145	212				function	neutral
l-andere	andere	other	adj	146	215				function	neutral
l-helfen	helfen	to help	verb	147	216			hilft, half, hat geholfen	function	neutral
l-nacht	Nacht	night	noun	148	217	f	Nächte		time	neutral
l-finden	finden	to find	verb	149	218			findet, fand, hat gefunden	function	neutral
l-lange	lange	long / for a long time	adv	150	222				time	neutral
l-natuerlich	natürlich	of course / natural	adv	151	223				function	neutral
l-ach	ach	oh / ah	interj	152	224				communication	colloquial
l-gar	gar	at all	adv	153	226				function	neutral
l-in-das	in das	into the (ins)	prep	154	227				function	neutral
l-sei	sei	be (imperative)	verb	155	228				function	neutral
l-dort	dort	there	adv	156	229				function	neutral
l-weiter	weiter	further / on	adv	157	230				function	neutral
l-seit	seit	since	prep	158	232				time,function	neutral
l-recht-noun	Recht	right / law	noun	159	235	n	Rechte		function	neutral
l-richtig	richtig	right / correct	adj	160	237				function	neutral
l-ordnung	Ordnung	order (in Ordnung: okay)	noun	161	238	f	Ordnungen		function	neutral
l-von-dem	von dem	from the (vom)	prep	162	239				function	neutral
l-davon	davon	of it / from it	adv	163	242				function	neutral
l-dafuer	dafür	for it / in favor	adv	164	243				function	neutral
l-wegen	wegen	because of	prep	165	246				function	neutral
l-haus	Haus	house	noun	166	247	n	Häuser		home	neutral
l-maedchen	Mädchen	girl	noun	167	249	n	Mädchen		people,family	neutral
l-hin	hin	there / thither	adv	168	250				function	neutral
l-abend	Abend	evening	noun	169	252	m	Abende		time	neutral
l-viele	viele	many	pron	170	255				function	neutral
l-drei	drei	three	num	171	256				numbers	neutral
l-freund	Freund	friend	noun	172	258	m	Freunde		people	neutral
l-warten	warten	to wait	verb	173	261				function	neutral
l-mensch	Mensch	human / person	noun	174	263	m	Menschen		people	neutral
l-essen	essen	to eat	verb	175	264			isst, aß, hat gegessen	food	neutral
l-angst	Angst	fear	noun	176	265	f	Ängste		feelings	neutral
l-bleiben	bleiben	to stay	verb	177	266			bleibt, blieb, ist geblieben	function	neutral
l-zusammen	zusammen	together	adv	178	267				function	neutral
l-welt	Welt	world	noun	179	268	f	Welten		nature	neutral
l-unter	unter	under / among	prep	180	269				function	neutral
l-schnell	schnell	fast / quick	adj	181	271				function	neutral
l-tot	tot	dead	adj	182	273				health	neutral
l-duerfen	dürfen	to be allowed to / may	verb	183	275			darf, durfte, hat gedurft	function	neutral
l-erst	erst	only / not until	adv	184	276				time,function	neutral
l-rein-adv	rein	in / inside	adv	185	277				function	colloquial
l-stimmen	stimmen	to be right / vote	verb	186	278				function	neutral
l-nehmen	nehmen	to take	verb	187	279			nimmt, nahm, hat genommen	function	neutral
l-kind	Kind	child	noun	188	280	n	Kinder		family,people	neutral
l-bringen	bringen	to bring	verb	189	283			bringt, brachte, hat gebracht	function	neutral
l-ganze	ganze	whole / entire	adj	190	284				function	neutral
l-genug	genug	enough	adv	191	285				function	neutral
l-scheisse	Scheiße	shit / crap	noun	192	286	f			feelings	colloquial
l-brauchen	brauchen	to need	verb	193	287				function	neutral
l-gegen	gegen	against	prep	194	288				function	neutral
l-moment	Moment	moment	noun	195	289	m	Momente		time	neutral
l-junge	Junge	boy	noun	196	290	m	Jungen		people,family	neutral
l-stehen	stehen	to stand	verb	197	291			steht, stand, hat gestanden	body	neutral
l-sonst	sonst	otherwise / else	adv	198	292				function	neutral
l-musik	Musik	music	noun	199	293	f			communication	neutral
l-arbeit	Arbeit	work	noun	200	294	f	Arbeiten		work	neutral
l-fragen	fragen	to ask	verb	201	297				communication	neutral
l-herr	Herr	gentleman / Mr.	noun	202	298	m	Herren		people	neutral
l-dabei	dabei	with it / present	adv	203	299				function	neutral
l-heissen	heißen	to be called / mean	verb	204	300			heißt, hieß, hat geheißen	communication	neutral
l-familie	Familie	family	noun	205	301	f	Familien		family,people	neutral
l-niemand	niemand	nobody	pron	206	303				people,function	neutral
l-sofort	sofort	immediately	adv	207	304				time	neutral
l-bevor	bevor	before	conj	208	305				time,function	neutral
l-jahr	Jahr	year	noun	209	306	n	Jahre		time	neutral
l-einmal	einmal	once	adv	210	307				time	neutral
l-problem	Problem	problem	noun	211	308	n	Probleme		function	neutral
l-sohn	Sohn	son	noun	212	309	m	Söhne		family,people	neutral
l-wann	wann	when	adv	213	310				question,time	neutral
l-fertig	fertig	ready / finished	adj	214	312				function	neutral
l-halt	halt	just / simply	particle	215	313				function	colloquial
l-allein	allein	alone	adv	216	314				feelings	neutral
l-bei-dem	bei dem	at the (beim)	prep	217	315				function	neutral
l-sprechen	sprechen	to speak	verb	218	316			spricht, sprach, hat gesprochen	communication	neutral
l-beide	beide	both	pron	219	317				function	neutral
l-sache	Sache	thing / matter	noun	220	320	f	Sachen		function	neutral
l-hilfe	Hilfe	help	noun	221	321	f	Hilfen		function	neutral
l-ne	ne	right? / no (casual)	particle	222	323				communication	colloquial
l-jeder	jeder	every / everyone	pron	223	324				function	neutral
l-gern	gern	gladly / with pleasure	adv	224	326				feelings	neutral
l-darueber	darüber	about it / over it	adv	225	328				function	neutral
l-halten	halten	to hold / stop	verb	226	329			hält, hielt, hat gehalten	function	neutral
l-verstehen	verstehen	to understand	verb	227	331			versteht, verstand, hat verstanden	communication	neutral
l-wahr	wahr	true	adj	228	336				function	neutral
l-dazu	dazu	to it / in addition	adv	229	338				function	neutral
l-bruder	Bruder	brother	noun	230	339	m	Brüder		family,people	neutral
l-daran	daran	on it / about it	adv	231	340				function	neutral
l-dank	Dank	thanks / gratitude	noun	232	344	m			communication	neutral
l-lieber	lieber	rather / preferably	adv	233	346				feelings	neutral
l-fall	Fall	case / fall	noun	234	347	m	Fälle		function	neutral
l-egal	egal	no matter / whatever	adj	235	350				function	neutral
l-kennen	kennen	to know	verb	236	351			kennt, kannte, hat gekannt	communication	neutral
l-vergessen	vergessen	to forget	verb	237	353			vergisst, vergaß, hat vergessen		neutral
l-frage	Frage	question	noun	238	354	f	Fragen		question,communication	neutral
l-moegen	mögen	to like	verb	239	358			mag, mochte, hat gemocht	feelings	neutral
l-echt	echt	real / really	adj	240	360					colloquial
l-eigentlich	eigentlich	actually	adv	241	362					colloquial
l-uhr	Uhr	clock / o'clock	noun	242	366	f	Uhren		time	neutral
l-stadt	Stadt	city / town	noun	243	367	f	Städte		city	neutral
l-baby	Baby	baby	noun	244	369	n	Babys		family,people	neutral
l-fahren	fahren	to drive / to go	verb	245	370			fährt, fuhr, ist gefahren	travel	neutral
l-name	Name	name	noun	246	371	m	Namen		communication	neutral
l-bekommen	bekommen	to get / receive	verb	247	372			bekommt, bekam, hat bekommen		neutral
l-kopf	Kopf	head	noun	248	373	m	Köpfe		body	neutral
l-klein	klein	small / little	adj	249	376					neutral
l-spaeter	später	later	adv	250	377				time	neutral
l-glueck	Glück	luck / happiness	noun	251	378	n			feelings	neutral
l-letzte	letzte	last	adj	252	379				time	neutral
l-all	all	all	pron	253	381				function	neutral
l-darauf	darauf	on it / thereupon	adv	254	382				function	neutral
l-ende	Ende	end	noun	255	383	n	Enden		time	neutral
l-bald	bald	soon	adv	256	384				time	neutral
l-toeten	töten	to kill	verb	257	385					neutral
l-ding	Ding	thing	noun	258	386	n	Dinge		function	neutral
l-meinen	meinen	to mean / think	verb	259	387				communication	neutral
l-toll	toll	great / cool	adj	260	388				feelings	colloquial
l-eins	eins	one	num	261	389				numbers	neutral
l-minute	Minute	minute	noun	262	390	f	Minuten		time	neutral
l-bereit	bereit	ready	adj	263	392					neutral
l-weit	weit	far / wide	adj	264	393					neutral
l-ahnung	Ahnung	idea / clue	noun	265	394	f	Ahnungen		communication	neutral
l-bisschen	bisschen	a little bit	adv	266	396				function	neutral
l-tuer	Tür	door	noun	267	397	f	Türen		home	neutral
l-auto	Auto	car	noun	268	398	n	Autos		travel	neutral
l-auge	Auge	eye	noun	269	401	n	Augen		body	neutral
l-polizei	Polizei	police	noun	270	402	f			city,work	neutral
l-sterben	sterben	to die	verb	271	404			stirbt, starb, ist gestorben	health	neutral
l-draussen	draußen	outside	adv	272	406				function	neutral
l-fast	fast	almost	adv	273	408				function	neutral
l-runter	runter	down	adv	274	409				function	colloquial
l-vorbei	vorbei	past / over	adv	275	410				function	neutral
l-treffen	treffen	to meet / hit	verb	276	411			trifft, traf, hat getroffen	communication	neutral
l-gerne	gerne	gladly	adv	277	412				feelings	neutral
l-dran	dran	on it / one's turn	adv	278	413				function	colloquial
l-arbeiten	arbeiten	to work	verb	279	415				work	neutral
l-verrueckt	verrückt	crazy	adj	280	417				feelings,health	neutral
l-neu	neu	new	adj	281	418					neutral
l-hinter	hinter	behind	prep	282	420				function	neutral
l-sorge	Sorge	worry / concern	noun	283	421	f	Sorgen		feelings	neutral
l-einzige	einzige	only / sole	adj	284	422				function	neutral
l-darum	darum	therefore / about it	adv	285	424				function	neutral
l-tochter	Tochter	daughter	noun	286	425	f	Töchter		family	neutral
l-idee	Idee	idea	noun	287	427	f	Ideen		communication	neutral
l-schwester	Schwester	sister	noun	288	428	f	Schwestern		family	neutral
l-drin	drin	inside / in it	adv	289	429				function	colloquial
l-ruhig	ruhig	calm / quiet	adj	290	430				feelings	neutral
l-ganz	ganz	whole / entirely	adj	291	432				function	neutral
l-spaet	spät	late	adj	292	433				time	neutral
l-ziemlich	ziemlich	quite / fairly	adv	293	434				function	neutral
l-sogar	sogar	even	adv	294	437				function	neutral
l-kurz	kurz	short / briefly	adj	295	438				time	neutral
l-kerl	Kerl	guy / fellow	noun	296	439	m	Kerle		people	colloquial
l-liegen	liegen	to lie / be located	verb	297	441			liegt, lag, hat gelegen		neutral
l-suchen	suchen	to search / look for	verb	298	442					neutral
l-je	je	ever	adv	299	444				time,function	neutral
l-woher	woher	from where	adv	300	445				question	neutral
l-lang	lang	long	adj	301	446				time	neutral
l-job	Job	job	noun	302	447	m	Jobs		work	neutral
l-keiner	keiner	no one / none	pron	303	448				function	neutral
l-spielen	spielen	to play	verb	304	452					neutral
l-ueberhaupt	überhaupt	at all	adv	305	453				function	neutral
l-teufel	Teufel	devil	noun	306	454	m	Teufel			neutral
l-verlieren	verlieren	to lose	verb	307	456			verliert, verlor, hat verloren		neutral
l-gross	groß	big / tall	adj	308	457					neutral
l-hand	Hand	hand	noun	309	458	f	Hände		body	neutral
l-grund	Grund	reason / ground	noun	310	459	m	Gründe		communication	neutral
l-ruhe	Ruhe	quiet / calm	noun	311	463	f			feelings	neutral
l-tod	Tod	death	noun	312	465	m	Tode		health	neutral
l-stunde	Stunde	hour	noun	313	466	f	Stunden		time	neutral
l-hoffen	hoffen	to hope	verb	314	467				feelings	neutral
l-oben	oben	above / up top	adv	315	469				function	neutral
l-gestern	gestern	yesterday	adv	316	470				time	neutral
l-versuchen	versuchen	to try	verb	317	471					neutral
l-art	Art	kind / way	noun	318	472	f	Arten		function	neutral
l-schatz	Schatz	treasure / sweetheart	noun	319	474	m	Schätze		feelings,money	colloquial
l-endlich	endlich	finally	adv	320	475				time	neutral
l-etwa	etwa	approximately / perhaps	adv	321	478				function	neutral
l-erzaehlen	erzählen	to tell / narrate	verb	322	479				communication	neutral
l-laufen	laufen	to run / walk	verb	323	480			läuft, lief, ist gelaufen	body	neutral
l-schwer	schwer	heavy / difficult	adj	324	481					neutral
l-anders	anders	different / differently	adv	325	482				function	neutral
l-fuenf	fünf	five	num	326	485				numbers	neutral
l-wasser	Wasser	water	noun	327	486	n	Wasser		drink,nature	neutral
l-erste	erste	first	adj	328	488				numbers	neutral
l-geschichte	Geschichte	story / history	noun	329	491	f	Geschichten		communication	neutral
l-holen	holen	to fetch / get	verb	330	493					neutral
l-bedeuten	bedeuten	to mean	verb	331	494				communication	neutral
l-nett	nett	nice / kind	adj	332	495				feelings	neutral
l-wahrheit	Wahrheit	truth	noun	333	496	f	Wahrheiten		communication	neutral
l-woche	Woche	week	noun	334	497	f	Wochen		time	neutral
l-deshalb	deshalb	therefore	adv	335	499				function	neutral
l-welche	welche	which	pron	336	500				question	neutral
l-bestimmt	bestimmt	certainly / definite	adv	337	501				function	neutral
l-hoch	hoch	high	adj	338	502					neutral
l-alter	Alter	age	noun	339	503	n			time	neutral
l-schauen	schauen	to look	verb	340	505				body	neutral
l-land	Land	country / land	noun	341	507	n	Länder		nature,travel	neutral
l-zimmer	Zimmer	room	noun	342	508	n	Zimmer		home	neutral
l-wagen	Wagen	car / cart	noun	343	509	m	Wagen		travel	neutral
l-vier	vier	four	num	344	510				numbers	neutral
l-gefallen	gefallen	to please / to be liked	verb	345	511			gefällt, gefiel, hat gefallen	feelings	neutral
l-spass	Spaß	fun	noun	346	512	m	Späße		feelings	neutral
l-niemals	niemals	never	adv	347	513				time	neutral
l-schuld	Schuld	guilt / blame	noun	348	514	f			feelings	neutral
l-verlassen	verlassen	to leave / abandon	verb	349	517			verlässt, verließ, hat verlassen		neutral
l-zeigen	zeigen	to show	verb	350	518				communication	neutral
l-beste	beste	best	adj	351	519					neutral
l-ernst	ernst	serious	adj	352	520				feelings	neutral
l-ort	Ort	place / location	noun	353	523	m	Orte		city,travel	neutral
l-manchmal	manchmal	sometimes	adv	354	526				time	neutral
l-seite	Seite	side / page	noun	355	528	f	Seiten		function	neutral
l-zwischen	zwischen	between	prep	356	530				function	neutral
l-eben	eben	just / exactly	particle	357	531				function	colloquial
l-waehrend	während	during / while	prep	358	532				time,function	neutral
l-spiel	Spiel	game	noun	359	533	n	Spiele			neutral
l-chance	Chance	chance / opportunity	noun	360	537	f	Chancen			neutral
l-freundin	Freundin	girlfriend / friend	noun	361	538	f	Freundinnen		people	neutral
l-krieg	Krieg	war	noun	362	539	m	Kriege			neutral
l-entschuldigen	entschuldigen	to excuse / apologize	verb	363	545				communication	neutral
l-wichtig	wichtig	important	adj	364	546					neutral
l-bett	Bett	bed	noun	365	549	n	Betten		home	neutral
l-schlecht	schlecht	bad	adj	366	552				feelings	neutral
l-schule	Schule	school	noun	367	553	f	Schulen		school	neutral
l-entschuldigung	Entschuldigung	apology / sorry	noun	368	554	f	Entschuldigungen		communication	neutral
l-wort	Wort	word	noun	369	555	n	Wörter		communication	neutral
l-typ	Typ	guy / type	noun	370	559	m	Typen		people	colloquial
l-schlafen	schlafen	to sleep	verb	371	560			schläft, schlief, hat geschlafen	health	neutral
l-aeh	äh	uh / um	interj	372	561				communication	colloquial
l-gesicht	Gesicht	face	noun	373	565	n	Gesichter		body	neutral
l-falls	falls	in case / if	conj	374	566				function	neutral
l-bloss	bloß	merely / just	particle	375	568				function	colloquial
l-unten	unten	below / down	adv	376	569				function	neutral
l-teil	Teil	part	noun	377	570	m	Teile		function	neutral
l-stellen	stellen	to put / place	verb	378	574					neutral
l-oft	oft	often	adv	379	575				time	neutral
l-trinken	trinken	to drink	verb	380	579			trinkt, trank, hat getrunken	drink	neutral
l-einige	einige	some / several	pron	381	580				function	neutral
l-dies	dies	this	pron	382	581				function	neutral
l-kriegen	kriegen	to get	verb	383	584					colloquial
l-blut	Blut	blood	noun	384	585	n			body,health	neutral
l-ehrlich	ehrlich	honest	adj	385	586				feelings	neutral
l-eltern	Eltern	parents	noun	386	587		Eltern		family	neutral
l-scheinen	scheinen	to seem / shine	verb	387	588			scheint, schien, hat geschienen		neutral
l-herz	Herz	heart	noun	388	589	n	Herzen		body,feelings	neutral
l-gluecklich	glücklich	happy	adj	389	591				feelings	neutral
l-alt	alt	old	adj	390	593					neutral
l-wiedersehen	Wiedersehen	goodbye / reunion	noun	391	595	n			communication	neutral
l-frei	frei	free	adj	392	596					neutral
l-wen	wen	whom	pron	393	597				question	neutral
l-drauf	drauf	on it / on top	adv	394	598				function	colloquial
l-moeglich	möglich	possible	adj	395	599				function	neutral
l-irgendwie	irgendwie	somehow	adv	396	600				function	colloquial
l-reichen	reichen	to suffice / hand	verb	397	601					neutral
l-fest	fest	firm / solid	adj	398	602					neutral
l-irgendwas	irgendwas	something	pron	399	606				function	colloquial
l-klingen	klingen	to sound	verb	400	607			klingt, klang, hat geklungen		neutral
l-platz	Platz	place / square / seat	noun	401	608	m	Plätze		city	neutral
l-papa	Papa	dad	noun	402	611	m	Papas		family	colloquial
l-falsch	falsch	wrong / false	adj	403	612					neutral
l-sondern	sondern	but rather	conj	404	613				function	neutral
l-nummer	Nummer	number	noun	405	615	f	Nummern		numbers	neutral
l-frueher	früher	earlier / in the past	adv	406	616				time	neutral
l-wohin	wohin	where to	adv	407	618				question	neutral
l-ausser	außer	except / besides	prep	408	619				function	neutral
l-frueh	früh	early	adj	409	620				time	neutral
l-setzen	setzen	to set / sit down	verb	410	621				body	neutral
l-zuerst	zuerst	first / at first	adv	411	622				time	neutral
l-wahrscheinlich	wahrscheinlich	probably	adv	412	623				function	neutral
l-arsch	Arsch	ass / butt	noun	413	626	m	Ärsche		body	colloquial
l-telefon	Telefon	telephone	noun	414	627	n	Telefone		communication	neutral
l-willkommen	willkommen	welcome	adj	415	630				communication	neutral
l-plan	Plan	plan	noun	416	631	m	Pläne		work	neutral
l-retten	retten	to save / rescue	verb	417	633				health	neutral
l-hierher	hierher	here / to here	adv	418	634				function	neutral
l-fehler	Fehler	mistake / error	noun	419	637	m	Fehler		function	neutral
l-dollar	Dollar	dollar	noun	420	639	m	Dollar		money	neutral
l-zehn	zehn	ten	num	421	640				numbers	neutral
l-passen	passen	to fit / suit	verb	422	642					neutral
l-naechste	nächste	next	adj	423	643				time	neutral
l-menge	Menge	amount / crowd	noun	424	647	f	Mengen		function	neutral
l-langsam	langsam	slow / slowly	adj	425	648					neutral
l-bereits	bereits	already	adv	426	649				time	neutral
l-sechs	sechs	six	num	427	651				numbers	neutral
l-lieben	lieben	to love	verb	428	652				feelings	neutral
l-buero	Büro	office	noun	429	654	n	Büros		work	neutral
l-rufen	rufen	to call / shout	verb	430	658			ruft, rief, hat gerufen	communication	neutral
l-schaffen	schaffen	to manage / create	verb	431	659				work	neutral
l-leider	leider	unfortunately	adv	432	660				feelings	neutral
l-hoelle	Hölle	hell	noun	433	662	f	Höllen			neutral
l-trotzdem	trotzdem	nevertheless	adv	434	663				function	neutral
l-doktor	Doktor	doctor	noun	435	664	m	Doktoren		health,work	neutral
l-tja	tja	well / hmm	interj	436	665				communication	colloquial
l-voll	voll	full / totally	adj	437	667					colloquial
l-film	Film	film / movie	noun	438	668	m	Filme			neutral
l-ueberall	überall	everywhere	adv	439	669				function	neutral
l-hund	Hund	dog	noun	440	670	m	Hunde		animals	neutral
l-direkt	direkt	direct / directly	adv	441	672				function	neutral
l-schiff	Schiff	ship	noun	442	676	n	Schiffe		travel	neutral
l-koenig	König	king	noun	443	679	m	Könige		people	neutral
l-danach	danach	afterwards	adv	444	680				time	neutral
l-funktionieren	funktionieren	to function / work	verb	445	681					neutral
l-lernen	lernen	to learn	verb	446	683				school	neutral
l-deswegen	deswegen	because of that	adv	447	684				function	neutral
l-wow	wow	wow	interj	448	685				feelings	colloquial
l-nennen	nennen	to name / call	verb	449	686			nennt, nannte, hat genannt	communication	neutral
l-hm	hm	hmm	interj	450	687				communication	colloquial
l-feuer	Feuer	fire	noun	451	688	n	Feuer		nature	neutral
l-alleine	alleine	alone	adv	452	690				feelings	neutral
l-erinnern	erinnern	to remember / remind	verb	453	691				communication	neutral
l-voellig	völlig	completely	adv	454	692				function	neutral
l-kumpel	Kumpel	buddy / pal	noun	455	696	m	Kumpel		people	colloquial
l-kaffee	Kaffee	coffee	noun	456	700	m	Kaffees		drink	neutral
l-luft	Luft	air	noun	457	701	f	Lüfte		nature	neutral
l-ziehen	ziehen	to pull / move	verb	458	704			zieht, zog, hat gezogen		neutral
l-verschwinden	verschwinden	to disappear	verb	459	705			verschwindet, verschwand, ist verschwunden		neutral
l-aufhoeren	aufhören	to stop	verb	460	708			hört auf, hörte auf, hat aufgehört		neutral
l-eigen	eigen	own	adj	461	709					neutral
l-unser	unser	our	pron	462	711				function	neutral
l-zwar	zwar	admittedly / indeed	particle	463	713				function	neutral
l-buch	Buch	book	noun	464	716	n	Bücher		school	neutral
l-krank	krank	sick / ill	adj	465	717				health	neutral
l-fuehlen	fühlen	to feel	verb	466	718				feelings	neutral
l-wert	Wert	value / worth	noun	467	721	m	Werte		money	neutral
l-arzt	Arzt	doctor	noun	468	722	m	Ärzte		health,work	neutral
l-froh	froh	glad / happy	adj	469	723				feelings	neutral
l-strasse	Straße	street	noun	470	725	f	Straßen		city,travel	neutral
l-heiraten	heiraten	to marry	verb	471	727				family	neutral
l-super	super	great / super	adj	472	728				feelings	colloquial
l-leben-verb	leben	to live	verb	473	730					neutral
l-onkel	Onkel	uncle	noun	474	733	m	Onkel		family	neutral
l-total	total	totally / complete	adv	475	734					colloquial
l-party	Party	party	noun	476	736	f	Partys		feelings	colloquial
l-erklaeren	erklären	to explain	verb	477	737				communication	neutral
l-wahl	Wahl	choice / election	noun	478	739	f	Wahlen			neutral
l-vertrauen	vertrauen	to trust	verb	479	740				feelings	neutral
l-damals	damals	back then	adv	480	741				time	neutral
l-leicht	leicht	easy / light	adj	481	743					neutral
l-nachdem	nachdem	after	conj	482	744				time,function	neutral
l-gefuehl	Gefühl	feeling	noun	483	746	n	Gefühle		feelings	neutral
l-kaufen	kaufen	to buy	verb	484	747				shopping,money	neutral
l-interessieren	interessieren	to interest	verb	485	750				feelings	neutral
l-irgendwo	irgendwo	somewhere	adv	486	755					neutral
l-stueck	Stück	piece	noun	487	756	n	Stücke			neutral
l-genauso	genauso	just as / equally	adv	488	757					neutral
l-zukunft	Zukunft	future	noun	489	760	f			time	neutral
l-weniger	weniger	less / fewer	adv	490	761				function	neutral
l-cool	cool	cool	adj	491	762				feelings	colloquial
l-licht	Licht	light	noun	492	763	n	Lichter		home,nature	neutral
l-himmel	Himmel	sky / heaven	noun	493	765	m	Himmel		nature	neutral
l-nachricht	Nachricht	message / news	noun	494	766	f	Nachrichten		communication	neutral
l-drueben	drüben	over there	adv	495	767					colloquial
l-kuemmern	kümmern	to care for	verb	496	770				feelings	neutral
l-laut	laut	loud	adj	497	771					neutral
l-anrufen	anrufen	to call (phone)	verb	498	773			ruft an, rief an, hat angerufen	communication	neutral
l-sitzen	sitzen	to sit	verb	499	774			sitzt, saß, hat gesessen	body	neutral
l-erde	Erde	earth / ground	noun	500	776	f			nature	neutral
l-schluessel	Schlüssel	key	noun	501	778	m	Schlüssel		home	neutral
l-rest	Rest	rest / remainder	noun	502	779	m	Reste			neutral
l-eher	eher	rather / sooner	adv	503	781					neutral
l-gefaengnis	Gefängnis	prison	noun	504	783	n	Gefängnisse			neutral
l-opfer	Opfer	victim / sacrifice	noun	505	784	n	Opfer		people	neutral
l-koerper	Körper	body	noun	506	785	m	Körper		body	neutral
l-solch	solch	such	pron	507	786				function	neutral
l-mist	Mist	crap / damn	noun	508	787	m			feelings	colloquial
l-schreiben	schreiben	to write	verb	509	789			schreibt, schrieb, hat geschrieben	communication	neutral
l-boese	böse	evil / angry	adj	510	791				feelings	neutral
l-vorstellen	vorstellen	to imagine / introduce	verb	511	794			stellt vor, stellte vor, hat vorgestellt	communication	neutral
l-wovon	wovon	of what / about what	adv	512	795				question	neutral
l-sobald	sobald	as soon as	conj	513	796				time,function	neutral
l-nochmal	nochmal	again / once more	adv	514	797				time	colloquial
l-sex	Sex	sex	noun	515	799	m			body	neutral
l-waffe	Waffe	weapon	noun	516	800	f	Waffen			neutral
l-wohnung	Wohnung	apartment / flat	noun	517	801	f	Wohnungen		home	neutral
l-weh	weh	sore / painful	adj	518	802				health,body	neutral
l-krankenhaus	Krankenhaus	hospital	noun	519	804	n	Krankenhäuser		health,city	neutral
l-million	Million	million	noun	520	807	f	Millionen		numbers	neutral
l-klasse	Klasse	class / grade	noun	521	808	f	Klassen		school	neutral
l-hart	hart	hard / tough	adj	522	809					neutral
l-sinn	Sinn	sense / meaning	noun	523	811	m	Sinne			neutral
l-ausserdem	außerdem	besides / moreover	adv	524	812				function	neutral
l-verletzen	verletzen	to injure / hurt	verb	525	813				health,body	neutral
l-aendern	ändern	to change	verb	526	814					neutral
l-erfahren	erfahren	to learn / find out	verb	527	815			erfährt, erfuhr, hat erfahren	communication	neutral
l-tragen	tragen	to carry / wear	verb	528	816			trägt, trug, hat getragen	clothing	neutral
l-wenigstens	wenigstens	at least	adv	529	817					neutral
l-vorsichtig	vorsichtig	careful	adj	530	818					neutral
l-stolz	stolz	proud	adj	531	820				feelings	neutral
l-stark	stark	strong	adj	532	821				body	neutral
l-fallen	fallen	to fall	verb	533	822			fällt, fiel, ist gefallen		neutral
l-besonders	besonders	especially	adv	534	825					neutral
l-schicken	schicken	to send	verb	535	827				communication	neutral
l-person	Person	person	noun	536	828	f	Personen		people	neutral
l-schaetzen	schätzen	to guess / value	verb	537	829				feelings	neutral
l-solange	solange	as long as	conj	538	830				time,function	neutral
l-grossartig	großartig	great / fantastic	adj	539	832				feelings	neutral
l-lachen	lachen	to laugh	verb	540	833				feelings	neutral
l-stand	Stand	stand / status	noun	541	835	m	Stände			neutral
l-erwarten	erwarten	to expect	verb	542	838				feelings	neutral
l-boden	Boden	floor / ground	noun	543	839	m	Böden		home,nature	neutral
l-boss	Boss	boss	noun	544	840	m	Bosse		work	colloquial
l-stimme	Stimme	voice / vote	noun	545	841	f	Stimmen		body,communication	neutral
l-still	still	quiet / still	adj	546	843					neutral
l-sicherheit	Sicherheit	safety / security	noun	547	844	f	Sicherheiten			neutral
l-mund	Mund	mouth	noun	548	847	m	Münder		body	neutral
l-kaempfen	kämpfen	to fight	verb	549	848					neutral
l-zeug	Zeug	stuff	noun	550	852	n				colloquial
l-lustig	lustig	funny	adj	551	853				feelings	neutral
l-umbringen	umbringen	to kill	verb	552	854			bringt um, brachte um, hat umgebracht		neutral
l-hassen	hassen	to hate	verb	553	856				feelings	neutral
l-schlimm	schlimm	bad / terrible	adj	554	857				feelings	neutral
l-unglaublich	unglaublich	unbelievable	adj	555	858				feelings	neutral
l-laden	Laden	shop / store	noun	556	860	m	Läden		shopping,city	neutral
l-fuehren	führen	to lead	verb	557	861					neutral
l-meinung	Meinung	opinion	noun	558	864	f	Meinungen		communication	neutral
l-lesen	lesen	to read	verb	559	865			liest, las, hat gelesen	school	neutral
l-moerder	Mörder	murderer	noun	560	866	m	Mörder		people	neutral
l-aehm	ähm	um / er	interj	561	868				communication	colloquial
l-geschehen	geschehen	to happen	verb	562	869			geschieht, geschah, ist geschehen		neutral
l-geschaeft	Geschäft	business / shop	noun	563	870	n	Geschäfte		work,shopping	neutral
l-idiot	Idiot	idiot	noun	564	871	m	Idioten		people	colloquial
l-verzeihung	Verzeihung	pardon / sorry	noun	565	872	f			communication	neutral
l-fliegen	fliegen	to fly	verb	566	873			fliegt, flog, ist geflogen	travel	neutral
l-team	Team	team	noun	567	875	n	Teams		work	neutral
l-general	General	general	noun	568	876	m	Generäle		work,people	neutral
l-vorher	vorher	before / beforehand	adv	569	880				time	neutral
l-schluss	Schluss	end / conclusion	noun	570	881	m	Schlüsse			neutral
l-verdienen	verdienen	to earn / deserve	verb	571	884				money,work	neutral
l-meist	meist	mostly	adj	572	886				function	neutral
l-perfekt	perfekt	perfect	adj	573	889					neutral
l-versprechen	versprechen	to promise	verb	574	890			verspricht, versprach, hat versprochen	communication	neutral
l-handy	Handy	cell phone / mobile	noun	575	891	n	Handys		communication	neutral
l-hinten	hinten	behind / at the back	adv	576	892					neutral
l-monat	Monat	month	noun	577	893	m	Monate		time	neutral
l-acht	acht	eight	num	578	895				numbers	neutral
l-noetig	nötig	necessary	adj	579	899					neutral
l-mord	Mord	murder	noun	580	900	m	Morde			neutral
l-heraus	heraus	out	adv	581	901					neutral
l-unmoeglich	unmöglich	impossible	adj	582	903					neutral
l-liebling	Liebling	darling / favorite	noun	583	904	m	Lieblinge		feelings,family	colloquial
l-tatsaechlich	tatsächlich	actually / indeed	adv	584	906					neutral
l-folgen	folgen	to follow	verb	585	907					neutral
l-bitten	bitten	to ask / request	verb	586	908			bittet, bat, hat gebeten	communication	neutral
l-behalten	behalten	to keep	verb	587	909			behält, behielt, hat behalten		neutral
l-naehe	Nähe	vicinity / closeness	noun	588	910	f				neutral
l-verdammt	verdammt	damn / damned	adj	589	913				feelings	colloquial
l-ploetzlich	plötzlich	suddenly	adv	590	914				time	neutral
l-tisch	Tisch	table	noun	591	917	m	Tische		home	neutral
l-jemals	jemals	ever	adv	592	920				time	neutral
l-verkaufen	verkaufen	to sell	verb	593	922				shopping,money	neutral
l-gefaehrlich	gefährlich	dangerous	adj	594	923					neutral
l-anfangen	anfangen	to begin / start	verb	595	924			fängt an, fing an, hat angefangen		neutral
l-ha	ha	ha	interj	596	927				feelings	colloquial
l-hotel	Hotel	hotel	noun	597	928	n	Hotels		travel,city	neutral
l-meister	Meister	master / champion	noun	598	931	m	Meister		work	neutral
l-kampf	Kampf	fight / battle	noun	599	932	m	Kämpfe			neutral
l-antwort	Antwort	answer	noun	600	933	f	Antworten		communication	neutral
l-obwohl	obwohl	although	conj	601	937				function	neutral
l-sieben	sieben	seven	num	602	938				numbers	neutral
l-komisch	komisch	strange / funny	adj	603	939				feelings	neutral
l-gewinnen	gewinnen	to win	verb	604	940			gewinnt, gewann, hat gewonnen		neutral
l-bezahlen	bezahlen	to pay	verb	605	942				money,shopping	neutral
l-unterwegs	unterwegs	on the move	adv	606	945				travel	neutral
l-dumm	dumm	stupid / dumb	adj	607	946				feelings	neutral
l-aerger	Ärger	trouble / anger	noun	608	947	m			feelings	neutral
l-bild	Bild	picture / image	noun	609	948	n	Bilder			neutral
l-dagegen	dagegen	against it	adv	610	952				function	neutral
l-leiche	Leiche	corpse / body	noun	611	957	f	Leichen			neutral
l-arschloch	Arschloch	asshole	noun	612	960	n	Arschlöcher		people	colloquial
l-verheiratet	verheiratet	married	adj	613	961				family	neutral
l-agent	Agent	agent	noun	614	966	m	Agenten		work,people	neutral
l-traum	Traum	dream	noun	615	967	m	Träume		feelings	neutral
l-entscheidung	Entscheidung	decision	noun	616	968	f	Entscheidungen			neutral
l-regel	Regel	rule	noun	617	970	f	Regeln			neutral
l-fenster	Fenster	window	noun	618	971	n	Fenster		home	neutral
l-fangen	fangen	to catch	verb	619	972			fängt, fing, hat gefangen		neutral
l-fort	fort	away / gone	adv	620	973					neutral
l-staendig	ständig	constantly	adv	621	974				time	neutral
l-gefahr	Gefahr	danger	noun	622	976	f	Gefahren			neutral
l-absolut	absolut	absolutely	adv	623	977					neutral
l-augenblick	Augenblick	moment	noun	624	979	m	Augenblicke		time	neutral
l-bescheid	Bescheid	notice / information	noun	625	980	m			communication	neutral
l-gedanke	Gedanke	thought	noun	626	982	m	Gedanken			neutral
l-ziel	Ziel	goal / target	noun	627	984	n	Ziele			neutral
l-benutzen	benutzen	to use	verb	628	985					neutral
l-bewegung	Bewegung	movement	noun	629	986	f	Bewegungen		body	neutral
l-wuenschen	wünschen	to wish	verb	630	988				feelings	neutral
l-welcher	welcher	which	pron	631	991				question,function	neutral
l-zahlen	zahlen	to pay / count	verb	632	992				money	neutral
l-anfang	Anfang	beginning / start	noun	633	993	m	Anfänge		time	neutral
l-legen	legen	to lay / put	verb	634	994					neutral
l-anwalt	Anwalt	lawyer	noun	635	996	m	Anwälte		work	neutral
l-offen	offen	open	adj	636	1000					neutral
l-arm-noun	Arm	arm	noun	637	1004	m	Arme		body	neutral
l-bier	Bier	beer	noun	638	1005	n	Biere		drink	neutral
l-partner	Partner	partner	noun	639	1007	m	Partner		people,work	neutral
l-klappe	Klappe	flap / trap (mouth)	noun	640	1010	f	Klappen			colloquial
l-suess	süß	sweet / cute	adj	641	1011				food,feelings	neutral
l-herum	herum	around	adv	642	1012					neutral
l-finger	Finger	finger	noun	643	1013	m	Finger		body	neutral
l-ehe	Ehe	marriage	noun	644	1014	f	Ehen		family	neutral
l-rolle	Rolle	role / roll	noun	645	1015	f	Rollen			neutral
l-gleich	gleich	same / equal / soon	adj	646	1017					neutral
l-hochzeit	Hochzeit	wedding	noun	647	1019	f	Hochzeiten		family	neutral
l-wach	wach	awake	adj	648	1023				health	neutral
l-wozu	wozu	what for / why	adv	649	1024				question	neutral
l-arm-adj	arm	poor	adj	650	1025				money,feelings	neutral
l-chef	Chef	boss / chief	noun	651	1027	m	Chefs		work	neutral
l-information	Information	information	noun	652	1029	f	Informationen		communication	neutral
l-erledigen	erledigen	to handle / finish	verb	653	1030				work	neutral
l-hoffentlich	hoffentlich	hopefully	adv	654	1031				feelings	neutral
l-tanzen	tanzen	to dance	verb	655	1034					neutral
l-ansehen	ansehen	to look at / watch	verb	656	1035			sieht an, sah an, hat angesehen		neutral
l-zuhause	Zuhause	home	noun	657	1037	n			home	neutral
l-wunderbar	wunderbar	wonderful	adj	658	1038				feelings	neutral
l-reise	Reise	journey / trip	noun	659	1040	f	Reisen		travel	neutral
l-dame	Dame	lady	noun	660	1042	f	Damen		people	neutral
l-irgendwann	irgendwann	sometime / eventually	adv	661	1043				time	neutral
l-stecken	stecken	to stick / be stuck	verb	662	1046					neutral
l-jedenfalls	jedenfalls	anyway / in any case	adv	663	1047					neutral
l-schreien	schreien	to scream / shout	verb	664	1048			schreit, schrie, hat geschrien	communication	neutral
l-rueber	rüber	over / across	adv	665	1050					colloquial
l-tschuess	tschüss	bye	interj	666	1051				communication	colloquial
l-raum	Raum	room / space	noun	667	1053	m	Räume		home	neutral
l-heiss	heiß	hot	adj	668	1054				nature	neutral
l-foto	Foto	photo	noun	669	1055	n	Fotos		communication	neutral
l-kalt	kalt	cold	adj	670	1056				nature	neutral
l-irgendetwas	irgendetwas	something	pron	671	1058				function	neutral
l-weile	Weile	while / a bit	noun	672	1059	f			time	neutral
l-bisher	bisher	so far / until now	adv	673	1060				time	neutral
l-unbedingt	unbedingt	absolutely	adv	674	1062				function	neutral
l-zug	Zug	train	noun	675	1063	m	Züge		travel	neutral
l-sekunde	Sekunde	second	noun	676	1064	f	Sekunden		time	neutral
l-wofuer	wofür	what for	adv	677	1065				question	neutral
l-nen	nen	a (shortened ein)	art	678	1067				function	colloquial
l-beweis	Beweis	proof / evidence	noun	679	1068	m	Beweise		function	neutral
l-freuen	freuen	to be glad / look forward	verb	680	1071				feelings	neutral
l-seele	Seele	soul	noun	681	1072	f	Seelen		feelings	neutral
l-schiessen	schießen	to shoot	verb	682	1073			schießt, schoss, hat geschossen	function	neutral
l-muede	müde	tired	adj	683	1074				body,feelings	neutral
l-dauern	dauern	to last / take time	verb	684	1075				time	neutral
l-brief	Brief	letter	noun	685	1078	m	Briefe		communication	neutral
l-bekannt	bekannt	known / famous	adj	686	1081				function	neutral
l-unfall	Unfall	accident	noun	687	1083	m	Unfälle		health,travel	neutral
l-dahin	dahin	there / to that place	adv	688	1084				travel	neutral
l-kontrolle	Kontrolle	control	noun	689	1085	f	Kontrollen		function	neutral
l-beispiel	Beispiel	example	noun	690	1086	n	Beispiele		communication	neutral
l-dasselbe	dasselbe	the same	pron	691	1088				function	neutral
l-schlagen	schlagen	to hit / beat	verb	692	1090			schlägt, schlug, hat geschlagen	function	neutral
l-wuetend	wütend	angry / furious	adj	693	1091				feelings	neutral
l-weise	weise	wise	adj	694	1092				feelings	neutral
l-darin	darin	in it / therein	adv	695	1094				function	neutral
l-fehlen	fehlen	to be missing / lack	verb	696	1097				function	neutral
l-vorsicht	Vorsicht	caution / careful!	noun	697	1098	f			communication	neutral
l-beweisen	beweisen	to prove	verb	698	1100			beweist, bewies, hat bewiesen	function	neutral
l-zumindest	zumindest	at least	adv	699	1102				function	neutral
l-vermissen	vermissen	to miss (someone)	verb	700	1103				feelings	neutral
l-huebsch	hübsch	pretty	adj	701	1104				feelings	neutral
l-verbindung	Verbindung	connection	noun	702	1106	f	Verbindungen		communication	neutral
l-tief	tief	deep	adj	703	1107				nature	neutral
l-richtung	Richtung	direction	noun	704	1108	f	Richtungen		travel	neutral
l-lage	Lage	situation / position	noun	705	1109	f	Lagen		function	neutral
l-sowieso	sowieso	anyway	adv	706	1110				function	colloquial
l-kraft	Kraft	strength / force	noun	707	1111	f	Kräfte		body	neutral
l-normal	normal	normal	adj	708	1112				function	neutral
l-ehre	Ehre	honor	noun	709	1114	f	Ehren		feelings	neutral
l-geschenk	Geschenk	gift / present	noun	710	1116	n	Geschenke		shopping	neutral
l-bar	Bar	bar	noun	711	1117	f	Bars		drink,city	neutral
l-tasche	Tasche	bag / pocket	noun	712	1118	f	Taschen		clothing	neutral
l-stehlen	stehlen	to steal	verb	713	1122			stiehlt, stahl, hat gestohlen	function	neutral
l-hunger	Hunger	hunger	noun	714	1123	m			food,body	neutral
l-luegen	lügen	to lie	verb	715	1125			lügt, log, hat gelogen	communication	neutral
l-beziehung	Beziehung	relationship	noun	716	1126	f	Beziehungen		feelings,family	neutral
l-naechst	nächst	next	adj	717	1130				time	neutral
l-preis	Preis	price / prize	noun	718	1132	m	Preise		money,shopping	neutral
l-witz	Witz	joke	noun	719	1133	m	Witze		communication	neutral
l-liste	Liste	list	noun	720	1135	f	Listen		communication	neutral
l-geist	Geist	ghost / spirit / mind	noun	721	1136	m	Geister		feelings	neutral
l-neben	neben	next to / beside	prep	722	1137				function	neutral
l-firma	Firma	company / firm	noun	723	1139	f	Firmen		work	neutral
l-ruecken	Rücken	back (body)	noun	724	1141	m	Rücken		body	neutral
l-schrecklich	schrecklich	terrible / awful	adj	725	1142				feelings	neutral
l-letzt	letzt	last	adj	726	1143				time	neutral
l-verliebt	verliebt	in love	adj	727	1144				feelings	neutral
l-oeffnen	öffnen	to open	verb	728	1145				function	neutral
l-boot	Boot	boat	noun	729	1147	n	Boote		travel	neutral
l-seltsam	seltsam	strange / odd	adj	730	1148				feelings	neutral
l-verstecken	verstecken	to hide	verb	731	1149				function	neutral
l-fuerchten	fürchten	to fear / be afraid	verb	732	1150				feelings	neutral
l-erwischen	erwischen	to catch / nab	verb	733	1152				function	colloquial
l-tante	Tante	aunt	noun	734	1154	f	Tanten		family	neutral
l-pferd	Pferd	horse	noun	735	1156	n	Pferde		animals	neutral
l-wunder	Wunder	miracle / wonder	noun	736	1157	n	Wunder		feelings	neutral
l-sauer	sauer	sour / annoyed	adj	737	1158				feelings,food	neutral
l-vermutlich	vermutlich	presumably / probably	adv	738	1159				function	neutral
l-nah	nah	near / close	adj	739	1160				travel	neutral
l-jung	jung	young	adj	740	1162				people	neutral
l-majestaet	Majestät	majesty	noun	741	1163	f	Majestäten		people	formal
l-aussehen	aussehen	to look / appear	verb	742	1164			sieht aus, sah aus, hat ausgesehen	body	neutral
l-links	links	left	adv	743	1168				travel	neutral
l-welch	welch	which	pron	744	1170				question	neutral
l-beschuetzen	beschützen	to protect	verb	745	1171				function	neutral
l-geboren	geboren	born	adj	746	1172				people,time	neutral
l-erreichen	erreichen	to reach / achieve	verb	747	1173				function	neutral
l-punkt	Punkt	point / dot	noun	748	1174	m	Punkte		function	neutral
l-kirche	Kirche	church	noun	749	1176	f	Kirchen		city	neutral
l-verraten	verraten	to betray / reveal	verb	750	1177			verrät, verriet, hat verraten	communication	neutral
l-selber	selber	oneself	pron	751	1178				function	colloquial
l-befehl	Befehl	order / command	noun	752	1179	m	Befehle		communication,work	neutral
l-geburtstag	Geburtstag	birthday	noun	753	1183	m	Geburtstage		time,family	neutral
l-haut	Haut	skin	noun	754	1184	f	Häute		body	neutral
l-wette	Wette	bet	noun	755	1185	f	Wetten		money	neutral
l-reich	reich	rich	adj	756	1186				money	neutral
l-schwoeren	schwören	to swear / vow	verb	757	1189			schwört, schwor, hat geschworen	communication	neutral
l-traurig	traurig	sad	adj	758	1195				feelings	neutral
l-anruf	Anruf	phone call	noun	759	1196	m	Anrufe		communication	neutral
l-frieden	Frieden	peace	noun	760	1198	m			feelings	neutral
l-karte	Karte	card / map / ticket	noun	761	1199	f	Karten		travel	neutral
l-guete	Güte	kindness / goodness	noun	762	1200	f			feelings	neutral
l-diesmal	diesmal	this time	adv	763	1202				time	neutral
l-schade	schade	a pity / too bad	adj	764	1203				feelings	neutral
l-persoenlich	persönlich	personal(ly)	adj	765	1204				function	neutral
l-veraendern	verändern	to change	verb	766	1208				function	neutral
l-sonne	Sonne	sun	noun	767	1209	f	Sonnen		nature	neutral
l-lieb	lieb	dear / kind	adj	768	1210				feelings	neutral
l-naemlich	nämlich	namely / that is	adv	769	1211				function	neutral
l-professor	Professor	professor	noun	770	1215	m	Professoren		school,work	neutral
l-gericht	Gericht	court / dish	noun	771	1216	n	Gerichte		function,food	neutral
l-nase	Nase	nose	noun	772	1217	f	Nasen		body	neutral
l-ewig	ewig	eternal / forever	adj	773	1218				time	neutral
l-singen	singen	to sing	verb	774	1219			singt, sang, hat gesungen	communication	neutral
l-bank	Bank	bank / bench	noun	775	1220	f	Banken		money,city	neutral
l-beschaeftigt	beschäftigt	busy	adj	776	1221				work	neutral
l-computer	Computer	computer	noun	777	1222	m	Computer		work,communication	neutral
l-weihnachten	Weihnachten	Christmas	noun	778	1225	n			time	neutral
l-offensichtlich	offensichtlich	obvious(ly)	adv	779	1226				function	neutral
l-naja	naja	well / oh well	interj	780	1227				communication	colloquial
l-fuss	Fuß	foot	noun	781	1230	m	Füße		body	neutral
l-ueberraschung	Überraschung	surprise	noun	782	1232	f	Überraschungen		feelings	neutral
l-geheimnis	Geheimnis	secret	noun	783	1233	n	Geheimnisse		communication	neutral
l-kontakt	Kontakt	contact	noun	784	1235	m	Kontakte		communication	neutral
l-gold	Gold	gold	noun	785	1236	n			money	neutral
l-droge	Droge	drug	noun	786	1237	f	Drogen		health	neutral
l-regierung	Regierung	government	noun	787	1238	f	Regierungen		function	neutral
l-wein	Wein	wine	noun	788	1239	m	Weine		drink	neutral
l-ermorden	ermorden	to murder	verb	789	1241				function	neutral
l-entfernt	entfernt	distant / removed	adj	790	1243				travel	neutral
l-manche	manche	some	pron	791	1245				function	neutral
l-manch	manch	some / many a	pron	792	1245				function	neutral
l-ran	ran	get to it / closer	adv	793	1247				function	colloquial
l-gegenueber	gegenüber	opposite / across from	prep	794	1248				travel	neutral
l-schlaf	Schlaf	sleep	noun	795	1249	m			body	neutral
l-lust	Lust	desire / mood for	noun	796	1250	f			feelings	neutral
l-wunderschoen	wunderschön	beautiful / gorgeous	adj	797	1251				feelings	neutral
l-witzig	witzig	funny	adj	798	1252				feelings	neutral
l-zerstoeren	zerstören	to destroy	verb	799	1254				function	neutral
l-uebrigens	übrigens	by the way	adv	800	1255				communication	neutral
l-wille	Wille	will / volition	noun	801	1256	m			feelings	neutral
l-heim	Heim	home	noun	802	1257	n	Heime		home	neutral
l-gehoeren	gehören	to belong	verb	803	1263				function	neutral
l-blick	Blick	look / glance / view	noun	804	1266	m	Blicke		body	neutral
l-besuch	Besuch	visit	noun	805	1267	m	Besuche		travel	neutral
l-bewegen	bewegen	to move	verb	806	1269				body	neutral
l-haar	Haar	hair	noun	807	1270	n	Haare		body	neutral
l-antworten	antworten	to answer	verb	808	1271				communication	neutral
l-praesident	Präsident	president	noun	809	1272	m	Präsidenten		work,people	neutral
l-hoffnung	Hoffnung	hope	noun	810	1274	f	Hoffnungen		feelings	neutral
l-rechts	rechts	right (direction)	adv	811	1277				travel	neutral
l-interessant	interessant	interesting	adj	812	1278				feelings	neutral
l-entscheiden	entscheiden	to decide	verb	813	1279			entscheidet, entschied, hat entschieden	function	neutral
l-miteinander	miteinander	with each other	adv	814	1280				function	neutral
l-indem	indem	by (doing)	conj	815	1283				function	neutral
l-wohnen	wohnen	to live / reside	verb	816	1286				home	neutral
l-weder	weder	neither	conj	817	1287				function	neutral
l-moeglichkeit	Möglichkeit	possibility / option	noun	818	1288	f	Möglichkeiten		function	neutral
l-kaputt	kaputt	broken	adj	819	1289				function	colloquial
l-flugzeug	Flugzeug	airplane	noun	820	1291	n	Flugzeuge		travel	neutral
l-vergangenheit	Vergangenheit	past	noun	821	1292	f			time	neutral
l-ander	ander	other	adj	822	1293				function	neutral
l-zweite	zweite	second	num	823	1294				numbers	neutral
l-armee	Armee	army	noun	824	1295	f	Armeen		function	neutral
l-tee	Tee	tea	noun	825	1297	m	Tees		drink	neutral
l-entweder	entweder	either	conj	826	1298				function	neutral
l-aufhalten	aufhalten	to stop / detain	verb	827	1302			hält auf, hielt auf, hat aufgehalten	function	neutral
l-ueberrascht	überrascht	surprised	adj	828	1305				feelings	neutral
l-sauber	sauber	clean	adj	829	1306				home	neutral
l-hauen	hauen	to hit / clear off	verb	830	1307				function	colloquial
l-nervoes	nervös	nervous	adj	831	1315				feelings	neutral
l-gesellschaft	Gesellschaft	society / company	noun	832	1316	f	Gesellschaften		people,work	neutral
l-schuldig	schuldig	guilty	adj	833	1318				feelings	neutral
l-hals	Hals	neck / throat	noun	834	1319	m	Hälse		body	neutral
l-schuetzen	schützen	to protect	verb	835	1320				function	neutral
l-besuchen	besuchen	to visit	verb	836	1321				travel	neutral
l-ueberleben	überleben	to survive	verb	837	1324				health	neutral
l-erhalten	erhalten	to receive / preserve	verb	838	1325			erhält, erhielt, hat erhalten	function	neutral
l-teilen	teilen	to share / divide	verb	839	1326				function	neutral
l-gebaeude	Gebäude	building	noun	840	1327	n	Gebäude		city,home	neutral
l-schicksal	Schicksal	fate / destiny	noun	841	1328	n	Schicksale		feelings	neutral
l-zeichen	Zeichen	sign / symbol	noun	842	1329	n	Zeichen		communication	neutral
l-richter	Richter	judge	noun	843	1330	m	Richter		work	neutral
l-besorgt	besorgt	worried / concerned	adj	844	1331				feelings	neutral
l-kueche	Küche	kitchen	noun	845	1332	f	Küchen		home,food	neutral
l-vergnuegen	Vergnügen	pleasure	noun	846	1334	n	Vergnügen		feelings	neutral
l-volk	Volk	people / nation	noun	847	1336	n	Völker		people	neutral
l-herausfinden	herausfinden	to find out	verb	848	1338			findet heraus, fand heraus, hat herausgefunden	function	neutral
l-koenigin	Königin	queen	noun	849	1339	f	Königinnen		people	neutral
l-soldat	Soldat	soldier	noun	850	1340	m	Soldaten		work,people	neutral
l-feiern	feiern	to celebrate	verb	851	1341				feelings	neutral
l-situation	Situation	situation	noun	852	1342	f	Situationen		function	neutral
l-allerdings	allerdings	however / though	adv	853	1345				function	neutral
l-soweit	soweit	as far as / so far	adv	854	1346				function	neutral
l-bord	Bord	board (on board)	noun	855	1349	n			travel	neutral
l-rat	Rat	advice / counsel	noun	856	1358	m			communication	neutral
l-worauf	worauf	what for / on what	adv	857	1359				question	neutral
l-kamera	Kamera	camera	noun	858	1362	f	Kameras		communication	neutral
l-achtung	Achtung	attention / watch out	noun	859	1363	f			communication	neutral
l-schuh	Schuh	shoe	noun	860	1366	m	Schuhe		clothing	neutral
l-glueckwunsch	Glückwunsch	congratulations	noun	861	1368	m	Glückwünsche		communication	neutral
l-statt	statt	instead of	prep	862	1371				function	neutral
l-uebernehmen	übernehmen	to take over	verb	863	1372			übernimmt, übernahm, hat übernommen	work	neutral
l-gegend	Gegend	area / region	noun	864	1373	f	Gegenden		travel,city	neutral
l-wald	Wald	forest / woods	noun	865	1374	m	Wälder		nature	neutral
l-erkennen	erkennen	to recognize	verb	866	1379			erkennt, erkannte, hat erkannt	function	neutral
l-glas	Glas	glass	noun	867	1380	n	Gläser		drink,home	neutral
l-verantwortlich	verantwortlich	responsible	adj	868	1382				work	neutral
l-stoehnen	stöhnen	to groan / moan	verb	869	1384				body	neutral
l-herein	herein	come in / inward	adv	870	1385				function	neutral
l-kleid	Kleid	dress	noun	871	1386	n	Kleider		clothing	neutral
l-jawohl	jawohl	yes sir / certainly	interj	872	1388				communication	neutral
l-abendessen	Abendessen	dinner / supper	noun	873	1391	n	Abendessen		food	neutral
l-gesetz	Gesetz	law	noun	874	1392	n	Gesetze		function	neutral
l-gemeinsam	gemeinsam	together / joint	adj	875	1393				function	neutral
l-schritt	Schritt	step	noun	876	1397	m	Schritte		body	neutral
l-gucken	gucken	to look / watch	verb	877	1398				body	colloquial
l-quasi	quasi	practically / so to speak	adv	878	1400				function	colloquial
l-beginnen	beginnen	to begin	verb	879	1401			beginnt, begann, hat begonnen	time	neutral
l-band	Band	ribbon / tape	noun	880	1403	n	Bänder		communication	neutral
l-ungefaehr	ungefähr	approximately	adv	881	1404				numbers	neutral
l-aufgabe	Aufgabe	task / assignment	noun	882	1405	f	Aufgaben		work,school	neutral
l-neun	neun	nine	num	883	1406				numbers	neutral
l-furchtbar	furchtbar	terrible / awful	adj	884	1407				feelings	neutral
l-drinnen	drinnen	inside / indoors	adv	885	1408				home	neutral
l-zuvor	zuvor	before / previously	adv	886	1409				time	neutral
l-uebrig	übrig	left over / remaining	adj	887	1413				function	neutral
l-spur	Spur	trace / track / lane	noun	888	1414	f	Spuren		travel	neutral
l-melden	melden	to report / notify	verb	889	1417				communication	neutral
l-werfen	werfen	to throw	verb	890	1419			wirft, warf, hat geworfen	function	neutral
l-haengen	hängen	to hang	verb	891	1423			hängt, hing, hat gehangen	home	neutral
l-freude	Freude	joy	noun	892	1424	f	Freuden		feelings	neutral
l-ehemann	Ehemann	husband	noun	893	1425	m	Ehemänner		family	neutral
l-erschiessen	erschießen	to shoot dead	verb	894	1426			erschießt, erschoss, hat erschossen	function	neutral
l-verzeihen	verzeihen	to forgive	verb	895	1427			verzeiht, verzieh, hat verziehen	feelings	neutral
l-schwein	Schwein	pig	noun	896	1428	n	Schweine		animals	neutral
l-uh	uh	uh	interj	897	1429				communication	colloquial
l-monster	Monster	monster	noun	898	1430	n	Monster		feelings	neutral
l-mission	Mission	mission	noun	899	1432	f	Missionen		work	neutral
l-vorne	vorne	in front / at the front	adv	900	1436				function	neutral
l-stopp	Stopp	stop	noun	901	1437	m	Stopps		travel	neutral
l-uebel	übel	nasty / queasy	adj	902	1438				health	neutral
l-schlampe	Schlampe	slut / bitch	noun	903	1439	f	Schlampen		people	colloquial
l-adresse	Adresse	address	noun	904	1441	f	Adressen		home,communication	neutral
l-unsinn	Unsinn	nonsense	noun	905	1442	m			communication	neutral
l-messer	Messer	knife	noun	906	1443	n	Messer		food,home	neutral
l-gesund	gesund	healthy	adj	907	1444				health	neutral
l-respekt	Respekt	respect	noun	908	1445	m			feelings	neutral
l-leisten	leisten	to afford / accomplish	verb	909	1447				money,work	neutral
l-davor	davor	before that / in front of it	adv	910	1448				time	neutral
l-ball	Ball	ball	noun	911	1451	m	Bälle		function	neutral
l-mitnehmen	mitnehmen	to take along	verb	912	1452			nimmt mit, nahm mit, hat mitgenommen	travel	neutral
l-schwierigkeit	Schwierigkeit	difficulty / trouble	noun	913	1455	f	Schwierigkeiten		feelings	neutral
l-haelfte	Hälfte	half	noun	914	1456	f	Hälften		numbers	neutral
l-planet	Planet	planet	noun	915	1460	m	Planeten		nature	neutral
l-schwanger	schwanger	pregnant	adj	916	1461				health,family	neutral
l-gruppe	Gruppe	group	noun	917	1462	f	Gruppen		people	neutral
l-verhaften	verhaften	to arrest	verb	918	1464				function	neutral
l-deal	Deal	deal	noun	919	1465	m	Deals		money,work	colloquial
l-irgendwelche	irgendwelche	any / some	pron	920	1467				function	neutral
l-drehen	drehen	to turn / spin	verb	921	1470				function	neutral
l-eis	Eis	ice / ice cream	noun	922	1471	n			food,nature	neutral
l-danken	danken	to thank	verb	923	1472				communication	neutral
l-erfolg	Erfolg	success	noun	924	1473	m	Erfolge		work	neutral
l-zufrieden	zufrieden	satisfied / content	adj	925	1474				feelings	neutral
l-schliessen	schließen	to close	verb	926	1475			schließt, schloss, hat geschlossen	function	neutral
l-besorgen	besorgen	to get / obtain	verb	927	1476				shopping	neutral
l-wochenende	Wochenende	weekend	noun	928	1477	n	Wochenenden		time	neutral
l-worueber	worüber	about what	adv	929	1478				question	neutral
l-bein	Bein	leg	noun	930	1483	n	Beine		body	neutral
l-verbrechen	Verbrechen	crime	noun	931	1484	n	Verbrechen		function	neutral
l-bericht	Bericht	report	noun	932	1485	m	Berichte		communication,work	neutral
l-nachts	nachts	at night	adv	933	1486				time	neutral
l-prinzessin	Prinzessin	princess	noun	934	1488	f	Prinzessinnen		people	neutral
l-schmerz	Schmerz	pain	noun	935	1489	m	Schmerzen		health,feelings	neutral
l-klingeln	klingeln	to ring	verb	936	1490				communication	neutral
l-position	Position	position	noun	937	1491	f	Positionen		function	neutral
l-fernsehen	Fernsehen	television	noun	938	1494	n			communication,home	neutral
l-wunsch	Wunsch	wish	noun	939	1495	m	Wünsche		feelings	neutral
l-schliesslich	schließlich	finally / after all	adv	940	1496				time	neutral
l-gefangen	gefangen	captured / trapped	adj	941	1497				function	neutral
l-schaetzchen	Schätzchen	sweetheart / darling	noun	942	1498	n	Schätzchen		people,feelings	colloquial
l-schwierig	schwierig	difficult	adj	943	1500				function	neutral
l-angebot	Angebot	offer	noun	944	1501	n	Angebote		shopping,money	neutral
l-ring	Ring	ring	noun	945	1506	m	Ringe		clothing	neutral
l-rennen	rennen	to run	verb	946	1507			rennt, rannte, ist gerannt	body	neutral
l-lied	Lied	song	noun	947	1508	n	Lieder		communication	neutral
l-ei	Ei	egg	noun	948	1509	n	Eier		food	neutral
l-fantastisch	fantastisch	fantastic	adj	949	1512				feelings	neutral
l-falle	Falle	trap	noun	950	1515	f	Fallen		function	neutral
l-drink	Drink	drink	noun	951	1516	m	Drinks		drink	colloquial
l-insel	Insel	island	noun	952	1517	f	Inseln		nature	neutral
l-daher	daher	therefore / from there	adv	953	1519				function	neutral
l-zufaellig	zufällig	by chance / random	adj	954	1520				function	neutral
l-dorf	Dorf	village	noun	955	1521	n	Dörfer		city,home	neutral
l-mitten	mitten	in the middle	adv	956	1524				function	neutral
l-bulle	Bulle	cop / bull	noun	957	1525	m	Bullen		people	colloquial
l-feind	Feind	enemy	noun	958	1526	m	Feinde		people	neutral
l-einverstanden	einverstanden	agreed / in agreement	adj	959	1527				communication	neutral
l-bauen	bauen	to build	verb	960	1529				work,home	neutral
l-deren	deren	whose / their	pron	961	1533				function	neutral
l-halb	halb	half	adj	962	1534				numbers	neutral
l-verpassen	verpassen	to miss	verb	963	1535				time	neutral
l-leise	leise	quiet / soft	adj	964	1537				communication	neutral
l-unternehmen	Unternehmen	company / enterprise	noun	965	1541	n	Unternehmen		work	neutral
l-kosten	kosten	to cost	verb	966	1544				money,shopping	neutral
l-entlang	entlang	along	prep	967	1547				travel	neutral
l-tier	Tier	animal	noun	968	1550	n	Tiere		animals	neutral
l-freiheit	Freiheit	freedom	noun	969	1551	f	Freiheiten		feelings	neutral
l-aha	aha	aha / I see	interj	970	1553				communication	colloquial
l-unterhalten	unterhalten	to converse / entertain	verb	971	1554			unterhält, unterhielt, hat unterhalten	communication	neutral
l-einladen	einladen	to invite	verb	972	1555			lädt ein, lud ein, hat eingeladen	communication,people	neutral
l-schaden	Schaden	damage / harm	noun	973	1556	m	Schäden		function	neutral
l-beenden	beenden	to end / finish	verb	974	1558				time	neutral
l-laecherlich	lächerlich	ridiculous	adj	975	1562				feelings	neutral
l-park	Park	park	noun	976	1564	m	Parks		city,nature	neutral
l-energie	Energie	energy	noun	977	1570	f	Energien		nature	neutral
l-fleisch	Fleisch	meat / flesh	noun	978	1571	n			food	neutral
l-besondere	besondere	special / particular	adj	979	1572				function	neutral
l-besonder	besonder	special	adj	980	1572				function	neutral
l-bestehen	bestehen	to pass / consist / insist	verb	981	1573			besteht, bestand, hat bestanden	school	neutral
l-zeitung	Zeitung	newspaper	noun	982	1576	f	Zeitungen		communication	neutral
l-worum	worum	about what	adv	983	1577				question	neutral
l-nachdenken	nachdenken	to think over / reflect	verb	984	1578			denkt nach, dachte nach, hat nachgedacht	communication	neutral
l-betrunken	betrunken	drunk	adj	985	1579				drink,health	neutral
l-sowas	sowas	such a thing	pron	986	1580				function	colloquial
l-patient	Patient	patient	noun	987	1581	m	Patienten		health,people	neutral
l-gespraech	Gespräch	conversation	noun	988	1582	n	Gespräche		communication	neutral
l-leiden	leiden	to suffer	verb	989	1583			leidet, litt, hat gelitten	health,feelings	neutral
l-taxi	Taxi	taxi	noun	990	1584	n	Taxis		travel,city	neutral
l-see	See	lake	noun	991	1586	m	Seen		nature	neutral
l-unterschied	Unterschied	difference	noun	992	1587	m	Unterschiede		function	neutral
l-wind	Wind	wind	noun	993	1588	m	Winde		nature	neutral
l-wand	Wand	wall	noun	994	1593	f	Wände		home	neutral
l-bus	Bus	bus	noun	995	1594	m	Busse		travel,city	neutral
l-angriff	Angriff	attack	noun	996	1596	m	Angriffe		function	neutral
l-verhalten	Verhalten	behavior	noun	997	1597	n			feelings	neutral
l-loch	Loch	hole	noun	998	1598	n	Löcher		function	neutral
l-interesse	Interesse	interest	noun	999	1599	n	Interessen		feelings	neutral
l-treten	treten	to step / kick	verb	1000	1600			tritt, trat, ist/hat getreten	body	neutral
l-quatsch	Quatsch	nonsense	noun	1001	1601	m			communication	colloquial
l-polizist	Polizist	police officer	noun	1002	1603	m	Polizisten		people,city	neutral
l-blume	Blume	flower	noun	1003	1604	f	Blumen		nature	neutral
l-neuigkeit	Neuigkeit	piece of news	noun	1004	1605	f	Neuigkeiten		communication	neutral
l-flasche	Flasche	bottle	noun	1005	1607	f	Flaschen		drink,home	neutral
l-schuss	Schuss	shot	noun	1006	1609	m	Schüsse		function	neutral
l-fassen	fassen	to grasp / seize	verb	1007	1610				body	neutral
l-meer	Meer	sea / ocean	noun	1008	1611	n	Meere		nature	neutral
l-maschine	Maschine	machine	noun	1009	1614	f	Maschinen		work	neutral
l-verbringen	verbringen	to spend (time)	verb	1010	1619			verbringt, verbrachte, hat verbracht	time	neutral
l-bloed	blöd	stupid / dumb	adj	1011	1621				feelings	colloquial
l-fruehstueck	Frühstück	breakfast	noun	1012	1622	n	Frühstücke		food,time	neutral
l-meter	Meter	meter	noun	1013	1624	m	Meter		numbers	neutral
l-aufpassen	aufpassen	to watch out / pay attention	verb	1014	1626			passt auf, passte auf, hat aufgepasst	function	neutral
l-dessen	dessen	whose / of which	pron	1015	1628				function	neutral
l-engel	Engel	angel	noun	1016	1631	m	Engel		feelings	neutral
l-offenbar	offenbar	apparently / evidently	adv	1017	1632				function	neutral
l-gelegenheit	Gelegenheit	opportunity / occasion	noun	1018	1633	f	Gelegenheiten		time	neutral
l-luege	Lüge	lie	noun	1019	1635	f	Lügen		communication	neutral
l-ohr	Ohr	ear	noun	1020	1636	n	Ohren		body	neutral
l-au	au	ow / ouch	interj	1021	1637				feelings	colloquial
l-antun	antun	to do (to someone)	verb	1022	1638			tut an, tat an, hat angetan	function	neutral
l-beeilen	beeilen	to hurry	verb	1023	1639				time	neutral
l-brechen	brechen	to break	verb	1024	1640			bricht, brach, hat gebrochen	function	neutral
l-zeitpunkt	Zeitpunkt	point in time / moment	noun	1025	1642	m	Zeitpunkte		time	neutral
l-ecke	Ecke	corner	noun	1026	1644	f	Ecken		function	neutral
l-bruecke	Brücke	bridge	noun	1027	1645	f	Brücken		city,travel	neutral
l-druck	Druck	pressure / print	noun	1028	1646	m	Drücke		feelings	neutral
l-mitbringen	mitbringen	to bring along	verb	1029	1647			bringt mit, brachte mit, hat mitgebracht	function	neutral
l-seufzen	seufzen	to sigh	verb	1030	1648				feelings	neutral
l-date	Date	date (romantic)	noun	1031	1649	n	Dates		people,feelings	colloquial
l-haufen	Haufen	heap / pile	noun	1032	1650	m	Haufen		function	neutral
l-oma	Oma	grandma	noun	1033	1651	f	Omas		family	colloquial
l-auftrag	Auftrag	order / assignment	noun	1034	1652	m	Aufträge		work	neutral
l-leer	leer	empty	adj	1035	1653				function	neutral
l-entkommen	entkommen	to escape	verb	1036	1654			entkommt, entkam, ist entkommen	function	neutral
l-weiss	weiß	white	adj	1037	1656				colors	neutral
l-loesung	Lösung	solution	noun	1038	1657	f	Lösungen		function	neutral
l-pause	Pause	break / pause	noun	1039	1659	f	Pausen		time,work	neutral
l-irre	irre	crazy / insane	adj	1040	1660				feelings	colloquial
l-keller	Keller	basement / cellar	noun	1041	1662	m	Keller		home	neutral
l-weinen	weinen	to cry	verb	1042	1664				feelings	neutral
l-nutzen	nutzen	to use / benefit	verb	1043	1665				function	neutral
l-maul	Maul	mouth (animal) / trap	noun	1044	1668	n	Mäuler		body,animals	colloquial
l-verantwortung	Verantwortung	responsibility	noun	1045	1669	f	Verantwortungen		work,feelings	neutral
l-schloss	Schloss	castle / lock	noun	1046	1670	n	Schlösser		home,city	neutral
l-hut	Hut	hat	noun	1047	1671	m	Hüte		clothing	neutral
l-laecheln	Lächeln	smile	noun	1048	1672	n			feelings,body	neutral
l-grad	Grad	degree	noun	1049	1675	m	Grade		numbers,nature	neutral
l-zweit	zweit	second	num	1050	1676				numbers	neutral
l-hinaus	hinaus	out / outward	adv	1051	1677				function	neutral
l-mitkommen	mitkommen	to come along	verb	1052	1678			kommt mit, kam mit, ist mitgekommen	travel	neutral
l-vorhin	vorhin	earlier / a while ago	adv	1053	1679				time	neutral
l-fahrt	Fahrt	trip / ride	noun	1054	1680	f	Fahrten		travel	neutral
l-ernsthaft	ernsthaft	serious / earnest	adj	1055	1682				feelings	neutral
l-bombe	Bombe	bomb	noun	1056	1684	f	Bomben		function	neutral
l-operation	Operation	operation / surgery	noun	1057	1694	f	Operationen		health	neutral
l-dach	Dach	roof	noun	1058	1699	n	Dächer		home	neutral
l-folge	Folge	consequence / episode	noun	1059	1700	f	Folgen		function	neutral
l-schwarz	schwarz	black	adj	1060	1702				colors	neutral
l-dankbar	dankbar	grateful	adj	1061	1703				feelings	neutral
l-gehirn	Gehirn	brain	noun	1062	1704	n	Gehirne		body	neutral
l-maedel	Mädel	girl / lass	noun	1063	1706	n	Mädels		people	colloquial
l-mut	Mut	courage	noun	1064	1707	m			feelings	neutral
l-heilig	heilig	holy / sacred	adj	1065	1708				feelings	neutral
l-system	System	system	noun	1066	1711	n	Systeme		function	neutral
l-wahnsinn	Wahnsinn	madness / insanity	noun	1067	1713	m			feelings	neutral
l-nee	nee	nope / nah	particle	1068	1714				communication	colloquial
l-rose	Rose	rose	noun	1069	1715	f	Rosen		nature	neutral
l-club	Club	club	noun	1070	1716	m	Clubs		city	neutral
l-geschlossen	geschlossen	closed / shut	adj	1071	1717				function	neutral
l-hintern	Hintern	backside / butt	noun	1072	1718	m	Hintern		body	colloquial
l-thema	Thema	topic / subject	noun	1073	1720	n	Themen		communication	neutral
l-dorthin	dorthin	there / to that place	adv	1074	1723				travel	neutral
l-urlaub	Urlaub	vacation / holiday	noun	1075	1724	m	Urlaube		travel,time	neutral
l-steigen	steigen	to climb / rise	verb	1076	1725			steigt, stieg, ist gestiegen	body	neutral
l-vorwaerts	vorwärts	forward	adv	1077	1726				travel	neutral
l-ueberpruefen	überprüfen	to check / verify	verb	1078	1727				function	neutral
l-baum	Baum	tree	noun	1079	1730	m	Bäume		nature	neutral
l-anscheinend	anscheinend	apparently	adv	1080	1733				function	neutral
l-lehrer	Lehrer	teacher	noun	1081	1734	m	Lehrer		school,people	neutral
l-nachmittag	Nachmittag	afternoon	noun	1082	1738	m	Nachmittage		time	neutral
l-risiko	Risiko	risk	noun	1083	1740	n	Risiken		function	neutral
l-knast	Knast	jail / prison	noun	1084	1742	m			city	colloquial
l-gelten	gelten	to be valid / apply	verb	1085	1744			gilt, galt, hat gegolten	function	neutral
l-held	Held	hero	noun	1086	1745	m	Helden		people	neutral
l-daraus	daraus	out of it / from that	adv	1087	1746				function	neutral
l-fraeulein	Fräulein	young lady / miss	noun	1088	1748	n	Fräulein		people	neutral
l-prima	prima	great / super	adj	1089	1750				feelings	colloquial
l-gewalt	Gewalt	violence / force	noun	1090	1752	f			feelings	neutral
l-tor	Tor	gate / goal	noun	1091	1757	n	Tore		home	neutral
l-erfahrung	Erfahrung	experience	noun	1092	1758	f	Erfahrungen		work	neutral
l-jagen	jagen	to hunt / chase	verb	1093	1760				animals	neutral
l-katze	Katze	cat	noun	1094	1761	f	Katzen		animals	neutral
l-runde	Runde	round / lap	noun	1095	1762	f	Runden		function	neutral
l-deutsch	deutsch	German	adj	1096	1763				communication	neutral
l-schwanz	Schwanz	tail / cock	noun	1097	1764	m	Schwänze		animals,body	colloquial
l-tat	Tat	deed / act	noun	1098	1765	f	Taten		function	neutral
l-dringend	dringend	urgent	adj	1099	1767				time	neutral
l-grossvater	Großvater	grandfather	noun	1100	1769	m	Großväter		family	neutral
l-sommer	Sommer	summer	noun	1101	1770	m	Sommer		time,nature	neutral
l-hinterlassen	hinterlassen	to leave behind	verb	1102	1772			hinterlässt, hinterließ, hat hinterlassen	function	neutral
l-gewissen	Gewissen	conscience	noun	1103	1773	n	Gewissen		feelings	neutral
l-kunde	Kunde	customer	noun	1104	1777	m	Kunden		shopping,work	neutral
l-zeuge	Zeuge	witness	noun	1105	1779	m	Zeugen		people	neutral
l-planen	planen	to plan	verb	1106	1780				work	neutral
l-stoeren	stören	to disturb	verb	1107	1783				communication	neutral
l-stein	Stein	stone	noun	1108	1784	m	Steine		nature	neutral
l-atmen	atmen	to breathe	verb	1109	1785				body,health	neutral
l-hose	Hose	trousers / pants	noun	1110	1786	f	Hosen		clothing	neutral
l-prinz	Prinz	prince	noun	1111	1792	m	Prinzen		people	neutral
l-behandeln	behandeln	to treat	verb	1112	1793				health	neutral
l-ueberlegen	überlegen	to consider	verb	1113	1795				communication	neutral
l-restaurant	Restaurant	restaurant	noun	1114	1798	n	Restaurants		food,city	neutral
l-natur	Natur	nature	noun	1115	1801	f			nature	neutral
l-mami	Mami	mommy	noun	1116	1804	f	Mamis		family	colloquial
l-lauten	lauten	to be / go (wording)	verb	1117	1806				communication	neutral
l-streit	Streit	quarrel / argument	noun	1118	1807	m			feelings,communication	neutral
l-kuessen	küssen	to kiss	verb	1119	1808				feelings,body	neutral
l-laengst	längst	long since	adv	1120	1810				time	neutral
l-drueber	drüber	about it / over it	adv	1121	1812				function	colloquial
l-erlauben	erlauben	to allow	verb	1122	1814				function	neutral
l-einzig	einzig	only / single	adj	1123	1815				function	neutral
l-bad	Bad	bath / bathroom	noun	1124	1816	n	Bäder		home	neutral
l-schmecken	schmecken	to taste	verb	1125	1817				food	neutral
l-kugel	Kugel	ball / bullet	noun	1126	1818	f	Kugeln		function	neutral
l-normalerweise	normalerweise	normally	adv	1127	1819				time	neutral
l-rauf	rauf	up / upward	adv	1128	1821				function	colloquial
l-flug	Flug	flight	noun	1129	1822	m	Flüge		travel	neutral
l-beruhigen	beruhigen	to calm down	verb	1130	1823				feelings	neutral
l-entdecken	entdecken	to discover	verb	1131	1829				function	neutral
l-morgens	morgens	in the morning	adv	1132	1830				time	neutral
l-vollkommen	vollkommen	completely / perfect	adv	1133	1832				function	neutral
l-verfolgen	verfolgen	to pursue / follow	verb	1134	1834				function	neutral
l-eh	eh	anyway	particle	1135	1839				function	colloquial
l-schwert	Schwert	sword	noun	1136	1840	n	Schwerter		function	neutral
l-riechen	riechen	to smell	verb	1137	1845			riecht, roch, hat gerochen	body	neutral
l-labor	Labor	laboratory	noun	1138	1846	n	Labore		work,school	neutral
l-mindestens	mindestens	at least	adv	1139	1850				numbers	neutral
l-fisch	Fisch	fish	noun	1140	1851	m	Fische		animals,food	neutral
l-euer	euer	your	pron	1141	1852				function	neutral
l-kuchen	Kuchen	cake	noun	1142	1856	m	Kuchen		food	neutral
l-zustand	Zustand	condition / state	noun	1143	1858	m	Zustände		health	neutral
l-gast	Gast	guest	noun	1144	1860	m	Gäste		people,home	neutral
l-erwaehnen	erwähnen	to mention	verb	1145	1861				communication	neutral
l-farbe	Farbe	color	noun	1146	1862	f	Farben		colors	neutral
l-zufall	Zufall	coincidence	noun	1147	1865	m	Zufälle		function	neutral
l-garten	Garten	garden	noun	1148	1866	m	Gärten		home,nature	neutral
l-absehen	absehen	to foresee / apart from	verb	1149	1869			sieht ab, sah ab, hat abgesehen	function	neutral
l-vertraut	vertraut	familiar	adj	1150	1871				feelings	neutral
l-koffer	Koffer	suitcase	noun	1151	1872	m	Koffer		travel	neutral
l-kurs	Kurs	course / rate	noun	1152	1874	m	Kurse		school,money	neutral
l-wirken	wirken	to seem / take effect	verb	1153	1875				function	neutral
l-seitdem	seitdem	since then	adv	1154	1878				time	neutral
l-angreifen	angreifen	to attack	verb	1155	1879			greift an, griff an, hat angegriffen	function	neutral
l-wahnsinnig	wahnsinnig	crazy / insanely	adj	1156	1881				feelings	colloquial
l-aehnlich	ähnlich	similar	adj	1157	1882				function	neutral
l-aufgeben	aufgeben	to give up	verb	1158	1884			gibt auf, gab auf, hat aufgegeben	feelings	neutral
l-entfuehren	entführen	to kidnap	verb	1159	1886				function	neutral
l-mistkerl	Mistkerl	bastard	noun	1160	1887	m	Mistkerle		people	colloquial
l-solcher	solcher	such	pron	1161	1888				function	neutral
l-lager	Lager	camp / warehouse	noun	1162	1891	n	Lager		home,work	neutral
l-besprechen	besprechen	to discuss	verb	1163	1892			bespricht, besprach, hat besprochen	communication	neutral
l-reihe	Reihe	row / series	noun	1164	1893	f	Reihen		function	neutral
l-vogel	Vogel	bird	noun	1165	1895	m	Vögel		animals	neutral
l-strand	Strand	beach	noun	1166	1897	m	Strände		nature,travel	neutral
l-amerikaner	Amerikaner	American	noun	1167	1898	m	Amerikaner		people	neutral
l-fern	fern	far / distant	adj	1168	1900				travel	neutral
l-ficken	ficken	to fuck	verb	1169	1901				body	colloquial
l-scherz	Scherz	joke	noun	1170	1902	m	Scherze		communication	neutral
l-wichser	Wichser	wanker	noun	1171	1905	m	Wichser		people	colloquial
l-langweilig	langweilig	boring	adj	1172	1907				feelings	neutral
l-womit	womit	with what	adv	1173	1908				question	neutral
l-kapieren	kapieren	to get / grasp	verb	1174	1911				communication	colloquial
l-nachher	nachher	afterward	adv	1175	1912				time	neutral
l-verlangen	verlangen	to demand	verb	1176	1913				communication	neutral
l-ueberzeugen	überzeugen	to convince	verb	1177	1915				communication	neutral
l-irgendjemand	irgendjemand	someone	pron	1178	1916				people	neutral
l-rot	rot	red	adj	1179	1917				colors	neutral
l-vorbereiten	vorbereiten	to prepare	verb	1180	1919				work	neutral
l-reisen	reisen	to travel	verb	1181	1921				travel	neutral
l-termin	Termin	appointment	noun	1182	1922	m	Termine		time,work	neutral
l-gang	Gang	corridor / gear	noun	1183	1923	m	Gänge		home	neutral
l-recht-adv	recht	right / quite	adv	1184	1925				function	neutral
l-rache	Rache	revenge	noun	1185	1926	f			feelings	neutral
l-bemerken	bemerken	to notice	verb	1186	1927				function	neutral
l-radio	Radio	radio	noun	1187	1930	n	Radios		communication	neutral
l-vertrag	Vertrag	contract	noun	1188	1933	m	Verträge		work,money	neutral
l-dienst	Dienst	service / duty	noun	1189	1935	m	Dienste		work	neutral
l-zaehlen	zählen	to count	verb	1190	1936				numbers	neutral
l-wesen	Wesen	being / creature	noun	1191	1938	n	Wesen		nature	neutral
l-buergermeister	Bürgermeister	mayor	noun	1192	1939	m	Bürgermeister		people,city	neutral
l-fluss	Fluss	river	noun	1193	1941	m	Flüsse		nature	neutral
l-woran	woran	of what / on what	adv	1194	1942				question	neutral
l-durcheinander	durcheinander	confused / mixed up	adv	1195	1944				feelings	neutral
l-test	Test	test	noun	1196	1948	m	Tests		school	neutral
l-dadurch	dadurch	thereby / through it	adv	1197	1950				function	neutral
l-direktor	Direktor	director / principal	noun	1198	1951	m	Direktoren		work,school	neutral
l-karriere	Karriere	career	noun	1199	1955	f	Karrieren		work	neutral
l-akte	Akte	file / record	noun	1200	1956	f	Akten		work	neutral
l-erinnerung	Erinnerung	memory	noun	1201	1957	f	Erinnerungen		feelings	neutral
l-grossmutter	Großmutter	grandmother	noun	1202	1958	f	Großmütter		family	neutral
l-loesen	lösen	to solve	verb	1203	1960				function	neutral
l-griff	Griff	grip / handle	noun	1204	1962	m	Griffe		function	neutral
l-zweifel	Zweifel	doubt	noun	1205	1964	m	Zweifel		feelings	neutral
l-sprache	Sprache	language	noun	1206	1966	f	Sprachen		communication	neutral
l-nerv	Nerv	nerve	noun	1207	1967	m	Nerven		body	neutral
l-entlassen	entlassen	to dismiss / release	verb	1208	1972			entlässt, entließ, hat entlassen	work	neutral
l-zweimal	zweimal	twice	adv	1209	1973				numbers	neutral
l-abholen	abholen	to pick up	verb	1210	1974			holt ab, holte ab, hat abgeholt	travel	neutral
l-kollege	Kollege	colleague	noun	1211	1976	m	Kollegen		work,people	neutral
l-fass	Fass	barrel / cask	noun	1212	1978	n	Fässer		drink	neutral
l-szene	Szene	scene	noun	1213	1979	f	Szenen		communication	neutral
l-pflicht	Pflicht	duty	noun	1214	1984	f	Pflichten		work	neutral
l-wache	Wache	guard / watch	noun	1215	1985	f	Wachen		work	neutral
l-neulich	neulich	recently	adv	1216	1986				time	neutral
l-knie	Knie	knee	noun	1217	1988	n	Knie		body	neutral
l-spannend	spannend	exciting	adj	1218	1991				feelings	neutral
l-unschuldig	unschuldig	innocent	adj	1219	1992				feelings	neutral
l-schutz	Schutz	protection	noun	1220	1994	m			function	neutral
l-weshalb	weshalb	why	adv	1221	1995				question	neutral
l-woanders	woanders	elsewhere	adv	1222	1997				function	neutral
l-kuss	Kuss	kiss	noun	1223	1999	m	Küsse		feelings,body	neutral
l-verhindern	verhindern	to prevent	verb	1224	2000				function	neutral
l-erklaerung	Erklärung	explanation	noun	1225	2001	f	Erklärungen		communication	neutral
l-video	Video	video	noun	1226	2002	n	Videos		communication	neutral
l-klug	klug	clever / smart	adj	1227	2004				feelings	neutral
l-ausserhalb	außerhalb	outside / beyond	prep	1228	2007				function	neutral
l-opa	Opa	grandpa	noun	1229	2008	m	Opas		family	colloquial
l-selbstverstaendlich	selbstverständlich	of course	adv	1230	2009				function	neutral
l-aufstehen	aufstehen	to get up	verb	1231	2010			steht auf, stand auf, ist aufgestanden	body	neutral
l-gebrauchen	gebrauchen	to use	verb	1232	2013				function	neutral
l-milch	Milch	milk	noun	1233	2015	f			drink,food	neutral
l-feuern	feuern	to fire / sack	verb	1234	2017				work	colloquial
l-kochen	kochen	to cook	verb	1235	2022				food	neutral
l-schwach	schwach	weak	adj	1236	2023				health	neutral
l-hinein	hinein	into / inside	adv	1237	2026				function	neutral
l-grenze	Grenze	border / limit	noun	1238	2028	f	Grenzen		travel	neutral
l-braut	Braut	bride	noun	1239	2029	f	Bräute		family,people	neutral
l-peinlich	peinlich	embarrassing	adj	1240	2031				feelings	neutral
l-klappen	klappen	to work out	verb	1241	2032				function	colloquial
l-aufmerksamkeit	Aufmerksamkeit	attention	noun	1242	2035	f	Aufmerksamkeiten		feelings	neutral
l-form	Form	form / shape	noun	1243	2036	f	Formen		function	neutral
l-umsonst	umsonst	for free / in vain	adv	1244	2037				money	neutral
l-kennenlernen	kennenlernen	to get to know	verb	1245	2038			lernt kennen, lernte kennen, hat kennengelernt	people	neutral
l-nirgendwo	nirgendwo	nowhere	adv	1246	2040				function	neutral
l-meile	Meile	mile	noun	1247	2041	f	Meilen		travel,numbers	neutral
l-einfach	einfach	simple / easy	adj	1248	2042				function	neutral
l-mond	Mond	moon	noun	1249	2044	m	Monde		nature	neutral
l-ergeben	ergeben	to result in / yield	verb	1250	2045			ergibt, ergab, hat ergeben	function	neutral
l-datum	Datum	date / data	noun	1251	2046	n	Daten		time	neutral
l-merken	merken	to notice / remember	verb	1252	2047				feelings	neutral
l-schande	Schande	shame / disgrace	noun	1253	2048	f			feelings	neutral
l-sieg	Sieg	victory	noun	1254	2052	m	Siege		function	neutral
l-satt	satt	full / fed up	adj	1255	2053				food,feelings	neutral
l-bloedsinn	Blödsinn	nonsense	noun	1256	2054	m			communication	colloquial
l-pfund	Pfund	pound	noun	1257	2057	n	Pfund		money,numbers	neutral
l-handeln	handeln	to act / trade	verb	1258	2058				work	neutral
l-enden	enden	to end	verb	1259	2060				time	neutral
l-warm	warm	warm	adj	1260	2061				nature	neutral
l-raten	raten	to guess / advise	verb	1261	2062			rät, riet, hat geraten	communication	neutral
l-uebersetzung	Übersetzung	translation	noun	1262	2063	f	Übersetzungen		communication	neutral
l-kunst	Kunst	art	noun	1263	2064	f	Künste		school	neutral
l-kapitaen	Kapitän	captain	noun	1264	2065	m	Kapitäne		people,work	neutral
l-desto	desto	the (more)	conj	1265	2066				function	neutral
l-einsatz	Einsatz	deployment / stake	noun	1266	2067	m	Einsätze		work	neutral
l-schweigen	schweigen	to be silent	verb	1267	2068			schweigt, schwieg, hat geschwiegen	communication	neutral
l-krankheit	Krankheit	illness / disease	noun	1268	2069	f	Krankheiten		health	neutral
l-schatten	Schatten	shadow / shade	noun	1269	2071	m	Schatten		nature	neutral
l-tatsache	Tatsache	fact	noun	1270	2073	f	Tatsachen		function	neutral
l-stock	Stock	stick / floor	noun	1271	2075	m	Stöcke		home	neutral
l-hingehen	hingehen	to go there	verb	1272	2077			geht hin, ging hin, ist hingegangen	travel	neutral
l-verbieten	verbieten	to forbid	verb	1273	2078			verbietet, verbot, hat verboten	function	neutral
l-anzug	Anzug	suit	noun	1274	2080	m	Anzüge		clothing	neutral
l-freitag	Freitag	Friday	noun	1275	2084	m	Freitage		time	neutral
l-verflucht	verflucht	damned / cursed	adj	1276	2086				feelings	colloquial
l-dunkel	dunkel	dark	adj	1277	2087				colors,nature	neutral
l-enttaeuschen	enttäuschen	to disappoint	verb	1278	2089				feelings	neutral
l-klopfen	klopfen	to knock	verb	1279	2090				home	neutral
l-dreck	Dreck	dirt / filth	noun	1280	2092	m			home	colloquial
l-muehe	Mühe	effort / trouble	noun	1281	2094	f	Mühen		work	neutral
l-kontrollieren	kontrollieren	to control / check	verb	1282	2097				function	neutral
l-knochen	Knochen	bone	noun	1283	2098	m	Knochen		body	neutral
l-trennen	trennen	to separate	verb	1284	2100				function	neutral
l-programm	Programm	program	noun	1285	2101	n	Programme		communication	neutral
l-grab	Grab	grave	noun	1286	2102	n	Gräber			neutral
l-ebenso	ebenso	likewise / just as	adv	1287	2103					neutral
l-nachbar	Nachbar	neighbor	noun	1288	2105	m	Nachbarn		people,home	neutral
l-bieten	bieten	offer	verb	1289	2106			bietet, bot, hat geboten		neutral
l-best	best	best	adj	1290	2107					neutral
l-freundlich	freundlich	friendly / kind	adj	1291	2111				feelings	neutral
l-dennoch	dennoch	nevertheless	adv	1292	2112					neutral
l-rauchen	rauchen	smoke	verb	1293	2113				health	neutral
l-dick	dick	fat / thick	adj	1294	2114				body	neutral
l-stuhl	Stuhl	chair	noun	1295	2115	m	Stühle		home	neutral
l-vergeben	vergeben	forgive / award	verb	1296	2119			vergibt, vergab, hat vergeben		neutral
l-ausgehen	ausgehen	go out	verb	1297	2120			geht aus, ging aus, ist ausgegangen		neutral
l-trotz	trotz	despite	prep	1298	2122					neutral
l-toilette	Toilette	toilet	noun	1299	2126	f	Toiletten		home,body	neutral
l-annehmen	annehmen	accept / assume	verb	1300	2127			nimmt an, nahm an, hat angenommen		neutral
l-herzlich	herzlich	warm / cordial	adj	1301	2128				feelings	neutral
l-hexe	Hexe	witch	noun	1302	2129	f	Hexen		people	neutral
l-erwachsen	erwachsen	grown-up / adult	adj	1303	2130				people	neutral
l-pistole	Pistole	pistol / gun	noun	1304	2132	f	Pistolen			neutral
l-aussage	Aussage	statement	noun	1305	2135	f	Aussagen		communication	neutral
l-geniessen	genießen	enjoy	verb	1306	2138			genießt, genoss, hat genossen	feelings	neutral
l-eifersuechtig	eifersüchtig	jealous	adj	1307	2139				feelings	neutral
l-derjenige	derjenige	the one	pron	1308	2140					neutral
l-teuer	teuer	expensive	adj	1309	2141				money,shopping	neutral
l-zahn	Zahn	tooth	noun	1310	2143	m	Zähne		body	neutral
l-beobachten	beobachten	observe / watch	verb	1311	2144					neutral
l-waehlen	wählen	choose / vote / dial	verb	1312	2146					neutral
l-theater	Theater	theater	noun	1313	2149	n	Theater		city	neutral
l-regen	Regen	rain	noun	1314	2150	m			nature	neutral
l-zulassen	zulassen	allow / permit	verb	1315	2154			lässt zu, ließ zu, hat zugelassen		neutral
l-schnappen	schnappen	grab / snatch	verb	1316	2155					colloquial
l-komplett	komplett	complete / totally	adj	1317	2156					neutral
l-panik	Panik	panic	noun	1318	2157	f			feelings	neutral
l-flughafen	Flughafen	airport	noun	1319	2158	m	Flughäfen		travel,city	neutral
l-bewusst	bewusst	aware / conscious	adj	1320	2159					neutral
l-voraus	voraus	ahead / in advance	adv	1321	2161					neutral
l-begleiten	begleiten	accompany	verb	1322	2164					neutral
l-einander	einander	one another	pron	1323	2165					neutral
l-erleben	erleben	experience	verb	1324	2167					neutral
l-weiterhin	weiterhin	still / furthermore	adv	1325	2168					neutral
l-fahrer	Fahrer	driver	noun	1326	2170	m	Fahrer		people,travel	neutral
l-konzentrieren	konzentrieren	concentrate	verb	1327	2171					neutral
l-streiten	streiten	argue / quarrel	verb	1328	2172			streitet, stritt, hat gestritten	communication	neutral
l-angehen	angehen	concern / tackle	verb	1329	2173			geht an, ging an, hat angegangen		neutral
l-selb	selb	same	pron	1330	2174					neutral
l-alkohol	Alkohol	alcohol	noun	1331	2177	m			drink	neutral
l-uebersetzen	übersetzen	translate	verb	1332	2178				communication	neutral
l-weitermachen	weitermachen	continue / carry on	verb	1333	2184			macht weiter, machte weiter, hat weitergemacht		neutral
l-post	Post	mail / post office	noun	1334	2187	f			communication,city	neutral
l-botschaft	Botschaft	message / embassy	noun	1335	2189	f	Botschaften		communication	neutral
l-aufgeregt	aufgeregt	excited / nervous	adj	1336	2192				feelings	neutral
l-selbstmord	Selbstmord	suicide	noun	1337	2193	m	Selbstmorde		health	neutral
l-zurueckkommen	zurückkommen	come back	verb	1338	2195			kommt zurück, kam zurück, ist zurückgekommen		neutral
l-irgendein	irgendein	some / any	pron	1339	2196					neutral
l-magie	Magie	magic	noun	1340	2197	f				neutral
l-untersuchen	untersuchen	examine / investigate	verb	1341	2202				health	neutral
l-flucht	Flucht	escape / flight	noun	1342	2203	f				neutral
l-gegenteil	Gegenteil	opposite	noun	1343	2206	n	Gegenteile			neutral
l-betreffen	betreffen	concern / affect	verb	1344	2207			betrifft, betraf, hat betroffen		neutral
l-scharf	scharf	sharp / spicy	adj	1345	2208				food	neutral
l-projekt	Projekt	project	noun	1346	2212	n	Projekte		work	neutral
l-trottel	Trottel	idiot / fool	noun	1347	2213	m	Trottel		people	colloquial
l-immerhin	immerhin	at least / after all	adv	1348	2214					neutral
l-mehrere	mehrere	several	pron	1349	2215					neutral
l-schwimmen	schwimmen	swim	verb	1350	2218			schwimmt, schwamm, ist geschwommen	body	neutral
l-innerhalb	innerhalb	within / inside	prep	1351	2220					neutral
l-blind	blind	blind	adj	1352	2222				body,health	neutral
l-schlau	schlau	clever / smart	adj	1353	2226					neutral
l-absicht	Absicht	intention	noun	1354	2227	f	Absichten			neutral
l-zuletzt	zuletzt	last / lastly	adv	1355	2230				time	neutral
l-englisch	Englisch	English	noun	1356	2232	n			communication	neutral
l-schueler	Schüler	pupil / student	noun	1357	2236	m	Schüler		school,people	neutral
l-merkwuerdig	merkwürdig	strange / odd	adj	1358	2240					neutral
l-groesse	Größe	size / height	noun	1359	2243	f	Größen		body	neutral
l-trauen	trauen	trust / dare	verb	1360	2245				feelings	neutral
l-trick	Trick	trick	noun	1361	2247	m	Tricks			neutral
l-sonntag	Sonntag	Sunday	noun	1362	2253	m	Sonntage		time	neutral
l-zwoelf	zwölf	twelve	num	1363	2254				numbers	neutral
l-vorstellung	Vorstellung	performance / idea	noun	1364	2255	f	Vorstellungen			neutral
l-reinkommen	reinkommen	come in	verb	1365	2257			kommt rein, kam rein, ist reingekommen		colloquial
l-killer	Killer	killer	noun	1366	2258	m	Killer		people	neutral
l-unterstuetzung	Unterstützung	support	noun	1367	2259	f	Unterstützungen			neutral
l-rechnung	Rechnung	bill / invoice	noun	1368	2261	f	Rechnungen		money,shopping	neutral
l-dieselbe	dieselbe	the same	pron	1369	2262					neutral
l-moeglicherweise	möglicherweise	possibly	adv	1370	2264					neutral
l-definitiv	definitiv	definitely	adv	1371	2265					neutral
l-locker	locker	loose / relaxed	adj	1372	2266					colloquial
l-ums	ums	around the	prep	1373	2269				function	neutral
l-abends	abends	in the evening	adv	1374	2270				time	neutral
l-frisch	frisch	fresh	adj	1375	2271				food	neutral
l-kohle	Kohle	coal / cash	noun	1376	2272	f	Kohlen		money	colloquial
l-hure	Hure	whore	noun	1377	2274	f	Huren		people	colloquial
l-cousin	Cousin	cousin	noun	1378	2275	m	Cousins		family	neutral
l-einsam	einsam	lonely	adj	1379	2277				feelings	neutral
l-lebendig	lebendig	alive / lively	adj	1380	2278					neutral
l-knapp	knapp	scarce / barely	adj	1381	2280					neutral
l-ebenfalls	ebenfalls	also / likewise	adv	1382	2281					neutral
l-artikel	Artikel	article	noun	1383	2283	m	Artikel		communication,shopping	neutral
l-jederzeit	jederzeit	anytime	adv	1384	2285				time	neutral
l-kompliziert	kompliziert	complicated	adj	1385	2286					neutral
l-spueren	spüren	feel / sense	verb	1386	2287				feelings	neutral
l-signal	Signal	signal	noun	1387	2288	n	Signale		communication	neutral
l-stich	Stich	stab / sting	noun	1388	2290	m	Stiche			neutral
l-kino	Kino	cinema / movies	noun	1389	2291	n	Kinos		city	neutral
l-probieren	probieren	try / taste	verb	1390	2292				food	neutral
l-wundervoll	wundervoll	wonderful	adj	1391	2294				feelings	neutral
l-tanz	Tanz	dance	noun	1392	2295	m	Tänze			neutral
l-begraben	begraben	bury	verb	1393	2298			begräbt, begrub, hat begraben		neutral
l-prozent	Prozent	percent	noun	1394	2299	n	Prozent		numbers	neutral
l-stoppen	stoppen	stop	verb	1395	2300					neutral
l-hoheit	Hoheit	highness	noun	1396	2301	f	Hoheiten		people	formal
l-riese	Riese	giant	noun	1397	2302	m	Riesen		people	neutral
l-zugang	Zugang	access	noun	1398	2304	m	Zugänge			neutral
l-vorn	vorn	in front / ahead	adv	1399	2306					neutral
l-aufmachen	aufmachen	open up	verb	1400	2308			macht auf, machte auf, hat aufgemacht		colloquial
l-sexy	sexy	sexy	adj	1401	2310				feelings	colloquial
l-erlaubnis	Erlaubnis	permission	noun	1402	2311	f	Erlaubnisse			neutral
l-story	Story	story	noun	1403	2314	f	Storys		communication	colloquial
l-madame	Madame	madam	noun	1404	2315	f			people	formal
l-madam	Madam	madam	noun	1405	2315	f			people	formal
l-priester	Priester	priest	noun	1406	2319	m	Priester		people	neutral
l-packen	packen	pack / grab	verb	1407	2321				travel	neutral
l-dritte	dritte	third	num	1408	2322				numbers	neutral
l-inzwischen	inzwischen	meanwhile / by now	adv	1409	2323				time	neutral
l-presse	Presse	press	noun	1410	2325	f			communication	neutral
l-klauen	klauen	steal / swipe	verb	1411	2328					colloquial
l-geduld	Geduld	patience	noun	1412	2331	f			feelings	neutral
l-buehne	Bühne	stage	noun	1413	2332	f	Bühnen			neutral
l-reparieren	reparieren	repair / fix	verb	1414	2333					neutral
l-hae	hä	huh?	interj	1415	2334					colloquial
l-gerechtigkeit	Gerechtigkeit	justice	noun	1416	2336	f				neutral
l-selten	selten	rare / rarely	adj	1417	2338					neutral
l-unterschreiben	unterschreiben	sign	verb	1418	2340			unterschreibt, unterschrieb, hat unterschrieben		neutral
l-druecken	drücken	press / push	verb	1419	2342					neutral
l-luegner	Lügner	liar	noun	1420	2344	m	Lügner		people	neutral
l-medizin	Medizin	medicine	noun	1421	2347	f			health	neutral
l-prozess	Prozess	process / trial	noun	1422	2350	m	Prozesse			neutral
l-samstag	Samstag	Saturday	noun	1423	2351	m	Samstage		time	neutral
l-amen	amen	amen	interj	1424	2352					neutral
l-motor	Motor	engine / motor	noun	1425	2353	m	Motoren		travel	neutral
l-abhauen	abhauen	clear off / split	verb	1426	2355			haut ab, haute ab, ist abgehauen		colloquial
l-chaos	Chaos	chaos	noun	1427	2356	n				neutral
l-schoenheit	Schönheit	beauty	noun	1428	2357	f	Schönheiten			neutral
l-beinahe	beinahe	almost / nearly	adv	1429	2358					neutral
l-anhalten	anhalten	stop / halt	verb	1430	2361			hält an, hielt an, hat angehalten		neutral
l-fremd	fremd	foreign / strange	adj	1431	2362					neutral
l-hof	Hof	yard / courtyard	noun	1432	2363	m	Höfe		home	neutral
l-akzeptieren	akzeptieren	accept	verb	1433	2364					neutral
l-norden	Norden	north	noun	1434	2365	m			travel	neutral
l-anziehen	anziehen	put on / get dressed	verb	1435	2367			zieht an, zog an, hat angezogen	clothing	neutral
l-umgehen	umgehen	deal with / handle	verb	1436	2369			geht um, ging um, ist umgegangen		neutral
l-bauch	Bauch	belly / stomach	noun	1437	2370	m	Bäuche		body	neutral
l-gesamt	gesamt	entire / whole	adj	1438	2371					neutral
l-ertragen	ertragen	endure / bear	verb	1439	2373			erträgt, ertrug, hat ertragen	feelings	neutral
l-kiste	Kiste	box / crate	noun	1440	2374	f	Kisten			neutral
l-brennen	brennen	burn	verb	1441	2375			brennt, brannte, hat gebrannt		neutral
l-deckung	Deckung	cover	noun	1442	2377	f	Deckungen			neutral
l-landen	landen	land	verb	1443	2378				travel	neutral
l-berg	Berg	mountain	noun	1444	2379	m	Berge		nature	neutral
l-aufnehmen	aufnehmen	record / take up	verb	1445	2381			nimmt auf, nahm auf, hat aufgenommen		neutral
l-untersuchung	Untersuchung	examination / investigation	noun	1446	2383	f	Untersuchungen		health	neutral
l-alarm	Alarm	alarm	noun	1447	2384	m	Alarme			neutral
l-extra	extra	extra / on purpose	adv	1448	2387					colloquial
l-entspannen	entspannen	relax	verb	1449	2388				feelings	neutral
l-eindruck	Eindruck	impression	noun	1450	2390	m	Eindrücke		feelings	neutral
l-tschues	tschüs	bye	interj	1451	2391				communication	colloquial
l-wehtun	wehtun	hurt	verb	1452	2393			tut weh, tat weh, hat wehgetan	health,body	neutral
l-herrgott	Herrgott	good Lord	interj	1453	2396					colloquial
l-springen	springen	jump	verb	1454	2398			springt, sprang, ist gesprungen	body	neutral
l-nackt	nackt	naked	adj	1455	2399				body	neutral
l-existieren	existieren	exist	verb	1456	2400					neutral
l-befreien	befreien	free / liberate	verb	1457	2401					neutral
l-geraet	Gerät	device / appliance	noun	1458	2402	n	Geräte		home	neutral
l-montag	Montag	Monday	noun	1459	2403	m	Montage		time	neutral
l-zwingen	zwingen	force	verb	1460	2404			zwingt, zwang, hat gezwungen		neutral
l-bastard	Bastard	bastard	noun	1461	2407	m	Bastarde		people	colloquial
l-fliehen	fliehen	flee	verb	1462	2415			flieht, floh, ist geflohen		neutral
l-freundschaft	Freundschaft	friendship	noun	1463	2417	f	Freundschaften		feelings,people	neutral
l-papier	Papier	paper	noun	1464	2419	n	Papiere		work	neutral
l-abschliessen	abschließen	complete / lock	verb	1465	2420			schließt ab, schloss ab, hat abgeschlossen		neutral
l-schnauze	Schnauze	snout / trap	noun	1466	2421	f	Schnauzen		body	colloquial
l-beruf	Beruf	profession / job	noun	1467	2422	m	Berufe		work	neutral
l-gebiet	Gebiet	area / region	noun	1468	2423	n	Gebiete			neutral
l-jedoch	jedoch	however	conj	1469	2425					neutral
l-beten	beten	pray	verb	1470	2426					neutral
l-verbinden	verbinden	connect / bandage	verb	1471	2427			verbindet, verband, hat verbunden		neutral
l-verraeter	Verräter	traitor	noun	1472	2429	m	Verräter		people	neutral
l-prost	prost	cheers	interj	1473	2431				drink	colloquial
l-brust	Brust	chest / breast	noun	1474	2432	f	Brüste		body	neutral
l-jacke	Jacke	jacket	noun	1475	2435	f	Jacken		clothing	neutral
l-bestellen	bestellen	order	verb	1476	2436				food,shopping	neutral
l-herkommen	herkommen	come here	verb	1477	2437			kommt her, kam her, ist hergekommen		neutral
l-wild	wild	wild	adj	1478	2438				nature,animals	neutral
l-zuhoeren	zuhören	listen	verb	1479	2441			hört zu, hörte zu, hat zugehört	communication	neutral
l-schlafzimmer	Schlafzimmer	bedroom	noun	1480	2443	n	Schlafzimmer		home	neutral
l-vorschlag	Vorschlag	suggestion / proposal	noun	1481	2444	m	Vorschläge		communication	neutral
l-meins	meins	mine	pron	1482	2445					colloquial
l-gift	Gift	poison	noun	1483	2446	n	Gifte		health	neutral
l-ton	Ton	sound / tone / clay	noun	1484	2447	m	Töne		communication	neutral
l-beantworten	beantworten	answer	verb	1485	2450				communication,question	neutral
l-deutlich	deutlich	clear / clearly	adj	1486	2451				communication	neutral
l-traeumen	träumen	to dream	verb	1487	2452				feelings	neutral
l-verwirrt	verwirrt	confused	adj	1488	2453				feelings	neutral
l-riskieren	riskieren	to risk	verb	1489	2455				function	neutral
l-beerdigung	Beerdigung	funeral	noun	1490	2459	f	Beerdigungen		feelings	neutral
l-muell	Müll	trash / garbage	noun	1491	2460	m			home	neutral
l-mitte	Mitte	middle / center	noun	1492	2464	f			function	neutral
l-geburt	Geburt	birth	noun	1493	2466	f	Geburten		family,body	neutral
l-decke	Decke	blanket / ceiling	noun	1494	2467	f	Decken		home	neutral
l-weg-noun	Weg	way / path	noun	1495	2468	m	Wege		travel	neutral
l-mittagessen	Mittagessen	lunch	noun	1496	2473	n	Mittagessen		food	neutral
l-vernichten	vernichten	to destroy / annihilate	verb	1497	2475				function	neutral
l-rock	Rock	skirt	noun	1498	2476	m	Röcke		clothing	neutral
l-crew	Crew	crew	noun	1499	2479	f	Crews		work	neutral
l-gewehr	Gewehr	rifle / gun	noun	1500	2482	n	Gewehre		function	neutral
l-spiegel	Spiegel	mirror	noun	1501	2485	m	Spiegel		home	neutral
l-geraten	geraten	to end up / get into	verb	1502	2487			gerät, geriet, ist geraten	function	neutral
l-wetter	Wetter	weather	noun	1503	2491	n			nature	neutral
l-schwul	schwul	gay	adj	1504	2492				people	neutral
l-befinden	befinden	to be located	verb	1505	2494			befindet, befand, hat befunden	function	neutral
l-einheit	Einheit	unit	noun	1506	2495	f	Einheiten		function	neutral
l-anstatt	anstatt	instead of	prep	1507	2499				function	neutral
l-champagner	Champagner	champagne	noun	1508	2500	m			drink	neutral
l-strafe	Strafe	punishment / penalty	noun	1509	2502	f	Strafen		function	neutral
l-oefter	öfter	more often	adv	1510	2504				time	neutral
l-zelle	Zelle	cell	noun	1511	2506	f	Zellen		function	neutral
l-ruinieren	ruinieren	to ruin	verb	1512	2509				function	neutral
l-kleidung	Kleidung	clothing	noun	1513	2511	f			clothing	neutral
l-gras	Gras	grass	noun	1514	2512	n	Gräser		nature	neutral
l-brot	Brot	bread	noun	1515	2518	n	Brote		food	neutral
l-erfreut	erfreut	pleased / delighted	adj	1516	2520				feelings	neutral
l-staat	Staat	state	noun	1517	2524	m	Staaten		city	neutral
l-station	Station	station	noun	1518	2525	f	Stationen		travel	neutral
l-hinterher	hinterher	afterwards / behind	adv	1519	2527				time	neutral
l-hemd	Hemd	shirt	noun	1520	2531	n	Hemden		clothing	neutral
l-klaeren	klären	to clarify / resolve	verb	1521	2533				communication	neutral
l-praktisch	praktisch	practical / practically	adj	1522	2534				function	neutral
l-theorie	Theorie	theory	noun	1523	2535	f	Theorien		school	neutral
l-zunge	Zunge	tongue	noun	1524	2536	f	Zungen		body	neutral
l-notfall	Notfall	emergency	noun	1525	2537	m	Notfälle		health	neutral
l-winter	Winter	winter	noun	1526	2539	m	Winter		time,nature	neutral
l-dahinter	dahinter	behind it	adv	1527	2541				function	neutral
l-anfuehrer	Anführer	leader	noun	1528	2546	m	Anführer		people	neutral
l-schief	schief	crooked / askew	adj	1529	2547				function	neutral
l-blau	blau	blue	adj	1530	2548				colors	neutral
l-bestens	bestens	excellently / very well	adv	1531	2549				function	neutral
l-unrecht	Unrecht	injustice / wrong	noun	1532	2553	n			function	neutral
l-lecken	lecken	to lick / leak	verb	1533	2554				body	neutral
l-wonach	wonach	after what / for what	adv	1534	2555				question	neutral
l-entwickeln	entwickeln	to develop	verb	1535	2556				function	neutral
l-bedeutung	Bedeutung	meaning / significance	noun	1536	2557	f	Bedeutungen		communication	neutral
l-strom	Strom	electricity / current	noun	1537	2558	m	Ströme		home,nature	neutral
l-krebs	Krebs	cancer / crab	noun	1538	2559	m	Krebse		health	neutral
l-gemein	gemein	mean / nasty	adj	1539	2560				feelings	neutral
l-wessen	wessen	whose	pron	1540	2561				question	neutral
l-minister	Minister	minister	noun	1541	2562	m	Minister		work	neutral
l-quelle	Quelle	source / spring	noun	1542	2564	f	Quellen		nature	neutral
l-zahl	Zahl	number	noun	1543	2565	f	Zahlen		numbers	neutral
l-talent	Talent	talent	noun	1544	2569	n	Talente		work	neutral
l-spitze	Spitze	tip / point / top	noun	1545	2570	f	Spitzen		function	neutral
l-fernseher	Fernseher	television set	noun	1546	2571	m	Fernseher		home	neutral
l-treiben	treiben	to drive / drift	verb	1547	2572			treibt, trieb, hat getrieben	function	neutral
l-ausgezeichnet	ausgezeichnet	excellent	adj	1548	2573				function	neutral
l-detail	Detail	detail	noun	1549	2579	n	Details		function	neutral
l-taeter	Täter	perpetrator / culprit	noun	1550	2580	m	Täter		people	neutral
l-dieb	Dieb	thief	noun	1551	2582	m	Diebe		people	neutral
l-offiziell	offiziell	official / officially	adj	1552	2583				work	neutral
l-dienen	dienen	to serve	verb	1553	2584				work	neutral
l-westen	Westen	west	noun	1554	2585	m			travel	neutral
l-dauernd	dauernd	constantly	adv	1555	2587				time	neutral
l-geschmack	Geschmack	taste / flavor	noun	1556	2588	m	Geschmäcker		food	neutral
l-gegenseitig	gegenseitig	mutual / each other	adj	1557	2589				function	neutral
l-pech	Pech	bad luck	noun	1558	2592	n			feelings	neutral
l-verteidigen	verteidigen	to defend	verb	1559	2593				function	neutral
l-schauspieler	Schauspieler	actor	noun	1560	2594	m	Schauspieler		work	neutral
l-ueberlassen	überlassen	to leave to / hand over	verb	1561	2596			überlässt, überließ, hat überlassen	function	neutral
l-publikum	Publikum	audience	noun	1562	2597	n			people	neutral
l-wechseln	wechseln	to change / switch	verb	1563	2599				function	neutral
l-begegnen	begegnen	to encounter / meet	verb	1564	2600				people	neutral
l-betruegen	betrügen	to cheat / deceive	verb	1565	2601			betrügt, betrog, hat betrogen	feelings	neutral
l-loswerden	loswerden	to get rid of	verb	1566	2609			wird los, wurde los, ist losgeworden	function	neutral
l-bestaetigen	bestätigen	to confirm	verb	1567	2612				communication	neutral
l-gas	Gas	gas	noun	1568	2613	n	Gase		home,travel	neutral
l-sturm	Sturm	storm	noun	1569	2614	m	Stürme		nature	neutral
l-null	null	zero	num	1570	2617				numbers	neutral
l-starten	starten	to start	verb	1571	2622				function	neutral
l-festhalten	festhalten	to hold on / hold tight	verb	1572	2624			hält fest, hielt fest, hat festgehalten	function	neutral
l-geheim	geheim	secret	adj	1573	2625				function	neutral
l-uebergeben	übergeben	to hand over	verb	1574	2626			übergibt, übergab, hat übergeben	function	neutral
l-abteilung	Abteilung	department	noun	1575	2628	f	Abteilungen		work	neutral
l-wetten	wetten	to bet	verb	1576	2630				money	neutral
l-verschieden	verschieden	various / different	adj	1577	2632				function	neutral
l-gleichzeitig	gleichzeitig	simultaneously	adv	1578	2633				time	neutral
l-genie	Genie	genius	noun	1579	2634	n	Genies		people	neutral
l-hungrig	hungrig	hungry	adj	1580	2635				food,body	neutral
l-inspektor	Inspektor	inspector	noun	1581	2636	m	Inspektoren		work	neutral
l-kuh	Kuh	cow	noun	1582	2639	f	Kühe		animals	neutral
l-unterstuetzen	unterstützen	to support	verb	1583	2640				function	neutral
l-sueden	Süden	south	noun	1584	2643	m			travel	neutral
l-pater	Pater	father (priest)	noun	1585	2644	m	Patres		people	neutral
l-menschheit	Menschheit	humanity / mankind	noun	1586	2645	f			people	neutral
l-versteck	Versteck	hiding place	noun	1587	2646	n	Verstecke		function	neutral
l-faehigkeit	Fähigkeit	ability / skill	noun	1588	2648	f	Fähigkeiten		work	neutral
l-rechtzeitig	rechtzeitig	in time / on time	adj	1589	2650				time	neutral
l-streng	streng	strict / severe	adj	1590	2651				feelings	neutral
l-sendung	Sendung	broadcast / show	noun	1591	2652	f	Sendungen		communication	neutral
l-treppe	Treppe	stairs	noun	1592	2654	f	Treppen		home	neutral
l-wolf	Wolf	wolf	noun	1593	2658	m	Wölfe		animals	neutral
l-daemon	Dämon	demon	noun	1594	2661	m	Dämonen		feelings	neutral
l-wut	Wut	anger / rage	noun	1595	2662	f			feelings	neutral
l-schlange	Schlange	snake / queue	noun	1596	2663	f	Schlangen		animals	neutral
l-medikament	Medikament	medicine / drug	noun	1597	2664	n	Medikamente		health	neutral
l-schenken	schenken	to give (as gift)	verb	1598	2665				feelings	neutral
l-anfassen	anfassen	to touch	verb	1599	2668				body	neutral
l-pizza	Pizza	pizza	noun	1600	2669	f	Pizzen		food	neutral
l-huette	Hütte	hut / cabin	noun	1601	2671	f	Hütten		home	neutral
l-mantel	Mantel	coat	noun	1602	2672	m	Mäntel		clothing	neutral
l-behaupten	behaupten	to claim / assert	verb	1603	2673				communication	neutral
l-kilometer	Kilometer	kilometer	noun	1604	2674	m	Kilometer		numbers,travel	neutral
l-beeilung	Beeilung	hurry up	noun	1605	2675	f			time	colloquial
l-angeblich	angeblich	allegedly / supposedly	adv	1606	2676				communication	neutral
l-reiten	reiten	to ride	verb	1607	2677			reitet, ritt, ist geritten	animals,travel	neutral
l-mittag	Mittag	noon / midday	noun	1608	2679	m	Mittage		time	neutral
l-warnen	warnen	to warn	verb	1609	2680				communication	neutral
l-dunkelheit	Dunkelheit	darkness	noun	1610	2683	f			nature	neutral
l-spazieren	spazieren	to stroll / walk	verb	1611	2684				travel	neutral
l-angel	Angel	fishing rod	noun	1612	2685	f	Angeln		nature	neutral
l-hiermit	hiermit	hereby / with this	adv	1613	2686				function	formal
l-vieles	vieles	much / many things	pron	1614	2689				function	neutral
l-erfuellen	erfüllen	to fulfill	verb	1615	2690				function	neutral
l-tausend	tausend	thousand	num	1616	2691				numbers	neutral
l-sack	Sack	sack / bag	noun	1617	2692	m	Säcke		function	neutral
l-eindeutig	eindeutig	clear / unambiguous	adj	1618	2693				communication	neutral
l-unterhaltung	Unterhaltung	conversation / entertainment	noun	1619	2694	f	Unterhaltungen		communication	neutral
l-gruenden	gründen	to found / establish	verb	1620	2695				work	neutral
l-zugeben	zugeben	to admit	verb	1621	2697			gibt zu, gab zu, hat zugegeben	communication	neutral
l-mittel	Mittel	means / remedy	noun	1622	2698	n	Mittel		function	neutral
l-explosion	Explosion	explosion	noun	1623	2699	f	Explosionen		function	neutral
l-gefangener	Gefangener	prisoner	noun	1624	2700	m	Gefangene		people	neutral
l-verdaechtiger	Verdächtiger	suspect	noun	1625	2703	m	Verdächtige		people	neutral
l-neugierig	neugierig	curious	adj	1626	2704				feelings	neutral
l-leitung	Leitung	line / management	noun	1627	2705	f	Leitungen		work,communication	neutral
l-fliege	Fliege	fly / bow tie	noun	1628	2707	f	Fliegen		animals	neutral
l-menschlich	menschlich	human	adj	1629	2709				people	neutral
l-anderem	anderem	other / among other things	pron	1630	2710				function	neutral
l-auseinander	auseinander	apart	adv	1631	2711				function	neutral
l-fressen	fressen	to eat (of animals)	verb	1632	2712			frisst, fraß, hat gefressen	animals,food	neutral
l-beides	beides	both	pron	1633	2713				function	neutral
l-stoff	Stoff	fabric / material	noun	1634	2715	m	Stoffe		clothing	neutral
l-eilig	eilig	urgent / hurried	adj	1635	2717				time	neutral
l-stammen	stammen	to originate / come from	verb	1636	2718				function	neutral
l-mhm	mhm	mhm / uh-huh	interj	1637	2725				communication	colloquial
l-schrank	Schrank	cupboard / closet	noun	1638	2728	m	Schränke		home	neutral
l-gnade	Gnade	mercy / grace	noun	1639	2730	f			feelings	neutral
l-virus	Virus	virus	noun	1640	2734	n	Viren		health	neutral
l-einladung	Einladung	invitation	noun	1641	2736	f	Einladungen		communication	neutral
l-krieger	Krieger	warrior	noun	1642	2737	m	Krieger		people	neutral
l-vernuenftig	vernünftig	sensible / reasonable	adj	1643	2738				feelings	neutral
l-fein	fein	fine / delicate	adj	1644	2739				function	neutral
l-greifen	greifen	to grab / reach	verb	1645	2740			greift, griff, hat gegriffen	body	neutral
l-whoa	whoa	whoa	interj	1646	2741				communication	colloquial
l-per	per	per / by	prep	1647	2744				function	neutral
l-mitglied	Mitglied	member	noun	1648	2745	n	Mitglieder		people	neutral
l-zurueckkehren	zurückkehren	to return	verb	1649	2748				travel	neutral
l-feld	Feld	field	noun	1650	2749	n	Felder		nature	neutral
l-erschaffen	erschaffen	to create	verb	1651	2751			erschafft, erschuf, hat erschaffen	function	neutral
l-staerke	Stärke	strength	noun	1652	2755	f	Stärken		body	neutral
l-vermoegen	Vermögen	fortune / assets	noun	1653	2756	n	Vermögen		money	neutral
l-gewiss	gewiss	certain	adj	1654	2758				function	neutral
l-waschen	waschen	to wash	verb	1655	2759			wäscht, wusch, hat gewaschen	home,body	neutral
l-schrei	Schrei	scream / cry	noun	1656	2764	m	Schreie		feelings	neutral
l-mitternacht	Mitternacht	midnight	noun	1657	2773	f			time	neutral
l-lecker	lecker	delicious / tasty	adj	1658	2776				food	neutral
l-klinik	Klinik	clinic	noun	1659	2777	f	Kliniken		health	neutral
l-dicht	dicht	dense / tight / close	adj	1660	2778				function	neutral
l-buerger	Bürger	citizen	noun	1661	2781	m	Bürger		people,city	neutral
l-verursachen	verursachen	to cause	verb	1662	2782				function	neutral
l-hammer	Hammer	hammer	noun	1663	2783	m	Hämmer		work,home	neutral
l-klang	Klang	sound	noun	1664	2784	m	Klänge		communication	neutral
l-internet	Internet	internet	noun	1665	2785	n			communication	neutral
l-aufregend	aufregend	exciting	adj	1666	2786				feelings	neutral
l-politik	Politik	politics	noun	1667	2788	f			work	neutral
l-zurecht	zurecht	rightly / properly	adv	1668	2790				function	neutral
l-besitz	Besitz	possession / property	noun	1669	2791	m			money	neutral
l-einsperren	einsperren	to lock up / imprison	verb	1670	2793				function	neutral
l-irren	irren	to be mistaken / err	verb	1671	2794				function	neutral
l-kommando	Kommando	command	noun	1672	2795	n	Kommandos		communication	neutral
l-krankenwagen	Krankenwagen	ambulance	noun	1673	2797	m	Krankenwagen		health	neutral
l-richten	richten	direct / judge	verb	1674	2801				communication	neutral
l-erfinden	erfinden	invent / make up	verb	1675	2803			erfindet, erfand, hat erfunden	communication	neutral
l-schnee	Schnee	snow	noun	1676	2804	m			nature	neutral
l-entfernen	entfernen	remove	verb	1677	2809				function	neutral
l-traene	Träne	tear	noun	1678	2814	f	Tränen		body,feelings	neutral
l-erfolgreich	erfolgreich	successful	adj	1679	2815				work	neutral
l-brille	Brille	glasses	noun	1680	2821	f	Brillen		clothing,body	neutral
l-heimat	Heimat	homeland	noun	1681	2823	f			home	neutral
l-liebste	Liebste	dearest / sweetheart	noun	1682	2825	f			feelings,people	neutral
l-bye	bye	bye	interj	1683	2826				communication	colloquial
l-leiter	Leiter	ladder	noun	1684	2827	f	Leitern		home,work	neutral
l-spinnen	spinnen	be crazy / spin	verb	1685	2830			spinnt, spann, hat gesponnen	feelings	colloquial
l-werk	Werk	work / factory	noun	1686	2831	n	Werke		work	neutral
l-cent	Cent	cent	noun	1687	2832	m	Cent		money	neutral
l-schlacht	Schlacht	battle	noun	1688	2833	f	Schlachten		function	neutral
l-abmachen	abmachen	agree / arrange	verb	1689	2835				communication	colloquial
l-hmm	hmm	hmm	interj	1690	2837				communication	colloquial
l-erschrecken	erschrecken	frighten / be startled	verb	1691	2839			erschrickt, erschrak, ist erschrocken	feelings	neutral
l-offizier	Offizier	officer	noun	1692	2840	m	Offiziere		work	neutral
l-affaere	Affäre	affair	noun	1693	2843	f	Affären		feelings,people	neutral
l-empfangen	empfangen	receive / welcome	verb	1694	2844			empfängt, empfing, hat empfangen	communication	neutral
l-zweck	Zweck	purpose	noun	1695	2845	m	Zwecke		function	neutral
l-heutzutage	heutzutage	nowadays	adv	1696	2854				time	neutral
l-schnitt	Schnitt	cut / average	noun	1697	2856	m	Schnitte		function	neutral
l-lebend	lebend	alive / living	adj	1698	2859				health	neutral
l-holz	Holz	wood	noun	1699	2861	n	Hölzer		nature	neutral
l-kaiser	Kaiser	emperor	noun	1700	2862	m	Kaiser		people	neutral
l-scheidung	Scheidung	divorce	noun	1701	2867	f	Scheidungen		family	neutral
l-beschliessen	beschließen	decide	verb	1702	2869			beschließt, beschloss, hat beschlossen	communication	neutral
l-klo	Klo	loo / toilet	noun	1703	2870	n	Klos		home	colloquial
l-begeistert	begeistert	enthusiastic / excited	adj	1704	2873				feelings	neutral
l-geil	geil	awesome / horny	adj	1705	2876				feelings	colloquial
l-nieder	nieder	down / low	adv	1706	2877				function	neutral
l-beeindruckt	beeindruckt	impressed	adj	1707	2880				feelings	neutral
l-aufgrund	aufgrund	due to	prep	1708	2883				function	formal
l-momentan	momentan	currently	adv	1709	2884				time	neutral
l-meistens	meistens	mostly	adv	1710	2886				time	neutral
l-stress	Stress	stress	noun	1711	2887	m			feelings,health	neutral
l-stern	Stern	star	noun	1712	2888	m	Sterne		nature	neutral
l-heilen	heilen	heal / cure	verb	1713	2889				health	neutral
l-soviel	soviel	so much	adv	1714	2890				function	neutral
l-stattdessen	stattdessen	instead	adv	1715	2892				function	neutral
l-stimmung	Stimmung	mood / atmosphere	noun	1716	2895	f	Stimmungen		feelings	neutral
l-auffallen	auffallen	stand out / notice	verb	1717	2897			fällt auf, fiel auf, ist aufgefallen	function	neutral
l-geraeusch	Geräusch	noise / sound	noun	1718	2899	n	Geräusche		communication	neutral
l-kuenstler	Künstler	artist	noun	1719	2900	m	Künstler		work,people	neutral
l-wachsen	wachsen	grow	verb	1720	2901			wächst, wuchs, ist gewachsen	nature	neutral
l-verurteilen	verurteilen	convict / condemn	verb	1721	2902				function	neutral
l-urteil	Urteil	judgment / verdict	noun	1722	2905	n	Urteile		function	neutral
l-verlust	Verlust	loss	noun	1723	2909	m	Verluste		feelings,money	neutral
l-wenig	wenig	few / little	adj	1724	2912				numbers,function	neutral
l-schulter	Schulter	shoulder	noun	1725	2914	f	Schultern		body	neutral
l-beibringen	beibringen	teach	verb	1726	2917			bringt bei, brachte bei, hat beigebracht	school	neutral
l-anbieten	anbieten	offer	verb	1727	2919			bietet an, bot an, hat angeboten	communication	neutral
l-verwenden	verwenden	use	verb	1728	2920				function	neutral
l-gratulieren	gratulieren	congratulate	verb	1729	2921				communication	neutral
l-fluch	Fluch	curse	noun	1730	2922	m	Flüche		communication	neutral
l-gruen	grün	green	adj	1731	2925				colors	neutral
l-unterricht	Unterricht	lesson / class	noun	1732	2926	m			school	neutral
l-verarschen	verarschen	mess with / fool	verb	1733	2928				communication	colloquial
l-gewoehnen	gewöhnen	get used to	verb	1734	2929				feelings	neutral
l-anklage	Anklage	charge / accusation	noun	1735	2930	f	Anklagen		function	neutral
l-lippe	Lippe	lip	noun	1736	2932	f	Lippen		body	neutral
l-fett	fett	fat / greasy	adj	1737	2933				body,food	neutral
l-feigling	Feigling	coward	noun	1738	2935	m	Feiglinge		people,feelings	neutral
l-achten	achten	pay attention / respect	verb	1739	2936				function	neutral
l-kaese	Käse	cheese	noun	1740	2943	m			food	neutral
l-aufwachen	aufwachen	wake up	verb	1741	2944			wacht auf, wachte auf, ist aufgewacht	home	neutral
l-verfuegung	Verfügung	disposal / decree	noun	1742	2945	f	Verfügungen		function	formal
l-uniform	Uniform	uniform	noun	1743	2946	f	Uniformen		clothing,work	neutral
l-zusehen	zusehen	watch / look on	verb	1744	2947			sieht zu, sah zu, hat zugesehen	function	neutral
l-gesundheit	Gesundheit	health	noun	1745	2948	f			health	neutral
l-abenteuer	Abenteuer	adventure	noun	1746	2949	n	Abenteuer		travel	neutral
l-scheck	Scheck	cheque	noun	1747	2952	m	Schecks		money	neutral
l-taeglich	täglich	daily	adj	1748	2953				time	neutral
l-fresse	Fresse	gob / mug	noun	1749	2954	f	Fressen		body	colloquial
l-wiederholen	wiederholen	repeat	verb	1750	2956				communication	neutral
l-freiwillig	freiwillig	voluntary	adj	1751	2958				function	neutral
l-universum	Universum	universe	noun	1752	2960	n	Universen		nature	neutral
l-faehig	fähig	capable	adj	1753	2964				function	neutral
l-revier	Revier	precinct / district	noun	1754	2965	n	Reviere		work,city	neutral
l-reifen	Reifen	tyre	noun	1755	2966	m	Reifen		travel	neutral
l-mum	Mum	mum	noun	1756	2967	f			family	colloquial
l-durchmachen	durchmachen	go through / endure	verb	1757	2969				feelings	neutral
l-schaedel	Schädel	skull	noun	1758	2973	m	Schädel		body	neutral
l-realitaet	Realität	reality	noun	1759	2974	f	Realitäten		function	neutral
l-april	April	April	noun	1760	2975	m			time	neutral
l-albern	albern	silly	adj	1761	2976				feelings	neutral
l-brav	brav	well-behaved / good	adj	1762	2977				feelings	neutral
l-jagd	Jagd	hunt	noun	1763	2979	f	Jagden		nature	neutral
l-versagen	versagen	fail	verb	1764	2980				function	neutral
l-truck	Truck	truck	noun	1765	2981	m	Trucks		travel	colloquial
l-sicherlich	sicherlich	surely / certainly	adv	1766	2984				function	neutral
l-oeffentlichkeit	Öffentlichkeit	public	noun	1767	2985	f			communication	neutral
l-verbrecher	Verbrecher	criminal	noun	1768	2987	m	Verbrecher		people	neutral
l-maske	Maske	mask	noun	1769	2988	f	Masken		clothing	neutral
l-verstaerkung	Verstärkung	reinforcement	noun	1770	2989	f	Verstärkungen		function	neutral
l-liefern	liefern	deliver	verb	1771	2990				shopping,work	neutral
l-schulden	schulden	owe	verb	1772	2997				money	neutral
l-russe	Russe	Russian	noun	1773	2998	m	Russen		people	neutral
l-fuehrer	Führer	leader / guide	noun	1774	2999	m	Führer		people,travel	neutral
l-ciao	ciao	ciao / bye	interj	1775	3001				communication	colloquial
l-loslassen	loslassen	let go	verb	1776	3002			lässt los, ließ los, hat losgelassen	function	neutral
l-berichten	berichten	report	verb	1777	3003				communication	neutral
l-verabschieden	verabschieden	say goodbye	verb	1778	3004				communication	neutral
l-antrag	Antrag	application / proposal	noun	1779	3005	m	Anträge		work,communication	neutral
l-benehmen	benehmen	behave	verb	1780	3008			benimmt, benahm, hat benommen	feelings	neutral
l-verdacht	Verdacht	suspicion	noun	1781	3009	m			feelings	neutral
l-schreibtisch	Schreibtisch	desk	noun	1782	3011	m	Schreibtische		work,home	neutral
l-vampir	Vampir	vampire	noun	1783	3012	m	Vampire		nature	neutral
l-probe	Probe	rehearsal / sample	noun	1784	3014	f	Proben		work	neutral
l-ertoenen	ertönen	sound / ring out	verb	1785	3019				communication	neutral
l-verbrennen	verbrennen	burn	verb	1786	3023			verbrennt, verbrannte, hat verbrannt	function	neutral
l-informieren	informieren	inform	verb	1787	3026				communication	neutral
l-zucker	Zucker	sugar	noun	1788	3028	m			food	neutral
l-stinken	stinken	stink	verb	1789	3029			stinkt, stank, hat gestunken	body	neutral
l-klamotten	Klamotten	clothes / gear	noun	1790	3033	f	Klamotten		clothing	colloquial
l-heil	heil	unharmed / intact	adj	1791	3034				health	neutral
l-besitzer	Besitzer	owner	noun	1792	3035	m	Besitzer		people	neutral
l-drum	drum	around / therefore	adv	1793	3038				function	colloquial
l-tasse	Tasse	cup	noun	1794	3039	f	Tassen		drink,home	neutral
l-hinweis	Hinweis	hint / clue	noun	1795	3040	m	Hinweise		communication	neutral
l-verteidigung	Verteidigung	defense	noun	1796	3041	f	Verteidigungen		function	neutral
l-magen	Magen	stomach	noun	1797	3044	m	Mägen		body	neutral
l-tunnel	Tunnel	tunnel	noun	1798	3048	m	Tunnel		travel,city	neutral
l-einst	einst	once / formerly	adv	1799	3049				time	formal
l-behandlung	Behandlung	treatment	noun	1800	3050	f	Behandlungen		health	neutral
l-serie	Serie	series	noun	1801	3051	f	Serien		communication	neutral
l-applaus	Applaus	applause	noun	1802	3052	m			communication	neutral
l-markt	Markt	market	noun	1803	3053	m	Märkte		shopping,city	neutral
l-korrekt	korrekt	correct	adj	1804	3054				function	neutral
l-besessen	besessen	obsessed / possessed	adj	1805	3055				feelings	neutral
l-bewahren	bewahren	preserve / keep	verb	1806	3056				function	neutral
l-huh	huh	huh	interj	1807	3062				communication	colloquial
l-truppe	Truppe	troop	noun	1808	3063	f	Truppen		people,work	neutral
l-kommandant	Kommandant	commander	noun	1809	3064	m	Kommandanten		work,people	neutral
l-osten	Osten	east	noun	1810	3065	m			travel	neutral
l-elf	elf	eleven	num	1811	3066				numbers	neutral
l-beeindruckend	beeindruckend	impressive	adj	1812	3067				feelings	neutral
l-besitzen	besitzen	own / possess	verb	1813	3068			besitzt, besaß, hat besessen	money	neutral
l-heut	heut	today	adv	1814	3070				time	colloquial
l-clever	clever	clever	adj	1815	3071				function	neutral
l-hass	Hass	hatred	noun	1816	3074	m			feelings	neutral
l-posten	Posten	post / position	noun	1817	3076	m	Posten		work	neutral
l-schneiden	schneiden	cut	verb	1818	3077			schneidet, schnitt, hat geschnitten	function	neutral
l-sammeln	sammeln	collect	verb	1819	3078				function	neutral
l-wissenschaft	Wissenschaft	science	noun	1820	3080	f	Wissenschaften		school	neutral
l-ursache	Ursache	cause	noun	1821	3081	f	Ursachen		function	neutral
l-bereich	Bereich	area / field	noun	1822	3083	m	Bereiche		function	neutral
l-meinetwegen	meinetwegen	for all I care	adv	1823	3085				function	colloquial
l-senator	Senator	senator	noun	1824	3086	m	Senatoren		work,people	neutral
l-ausziehen	ausziehen	undress / move out	verb	1825	3087			zieht aus, zog aus, hat ausgezogen	clothing,home	neutral
l-verzweifelt	verzweifelt	desperate	adj	1826	3088				feelings	neutral
l-anteil	Anteil	share / portion	noun	1827	3090	m	Anteile		money	neutral
l-stets	stets	always	adv	1828	3091				time	formal
l-ritter	Ritter	knight	noun	1829	3092	m	Ritter		people	neutral
l-viertel	Viertel	quarter / district	noun	1830	3093	n	Viertel		city,numbers	neutral
l-roman	Roman	novel	noun	1831	3094	m	Romane		communication	neutral
l-puenktlich	pünktlich	punctual / on time	adj	1832	3095				time	neutral
l-basis	Basis	base / basis	noun	1833	3099	f	Basen		function	neutral
l-schock	Schock	shock	noun	1834	3101	m	Schocks		feelings,health	neutral
l-empfang	Empfang	reception	noun	1835	3102	m	Empfänge		communication	neutral
l-titel	Titel	title	noun	1836	3106	m	Titel		communication	neutral
l-stil	Stil	style	noun	1837	3107	m	Stile		function	neutral
l-fingerabdruck	Fingerabdruck	fingerprint	noun	1838	3108	m	Fingerabdrücke		body	neutral
l-einfluss	Einfluss	influence	noun	1839	3109	m	Einflüsse		function	neutral
l-anweisung	Anweisung	instruction	noun	1840	3110	f	Anweisungen		communication,work	neutral
l-opfern	opfern	sacrifice	verb	1841	3113				feelings	neutral
l-sparen	sparen	save	verb	1842	3115				money	neutral
l-farm	Farm	farm	noun	1843	3118	f	Farmen		home,nature	neutral
l-erstaunlich	erstaunlich	astonishing	adj	1844	3119				feelings	neutral
l-schwachsinn	Schwachsinn	nonsense	noun	1845	3120	m			communication	colloquial
l-miete	Miete	rent	noun	1846	3121	f	Mieten		money,home	neutral
l-verwandeln	verwandeln	transform	verb	1847	3122				function	neutral
l-daneben	daneben	next to it / beside	adv	1848	3123				function	neutral
l-bereiten	bereiten	prepare / cause	verb	1849	3125				function	neutral
l-wueste	Wüste	desert	noun	1850	3126	f	Wüsten		nature,travel	neutral
l-pruefen	prüfen	check / examine	verb	1851	3127				function	neutral
l-gabe	Gabe	gift / talent	noun	1852	3128	f	Gaben		function	neutral
l-hundert	hundert	hundred	num	1853	3129				numbers	neutral
l-erscheinen	erscheinen	appear	verb	1854	3130			erscheint, erschien, ist erschienen	function	neutral
l-besiegen	besiegen	defeat	verb	1855	3132				function	neutral
l-verpissen	verpissen	piss off	verb	1856	3133				communication	colloquial
l-umstand	Umstand	circumstance	noun	1857	3134	m	Umstände		function	neutral
l-angelegenheit	Angelegenheit	matter / affair	noun	1858	3135	f	Angelegenheiten		function	neutral
l-dienstag	Dienstag	Tuesday	noun	1859	3137	m	Dienstage		time	neutral
l-folgendes	Folgendes	the following	noun	1860	3138	n			function	neutral
l-anstellen	anstellen	hire / do	verb	1861	3142				work	neutral
l-training	Training	training	noun	1862	3143	n	Trainings		work,school	neutral
l-auftauchen	auftauchen	show up / appear	verb	1863	3144			taucht auf, tauchte auf, ist aufgetaucht	function	neutral
l-rausfinden	rausfinden	find out	verb	1864	3145			findet raus, fand raus, hat rausgefunden	communication	colloquial
l-rauskommen	rauskommen	come out / get out	verb	1865	3147			kommt raus, kam raus, ist rausgekommen	function	colloquial
l-suppe	Suppe	soup	noun	1866	3149	f	Suppen		food	neutral
l-sitz	Sitz	seat	noun	1867	3151	m	Sitze		travel,home	neutral
l-vorteil	Vorteil	advantage	noun	1868	3153	m	Vorteile		function	neutral
l-rosa	rosa	pink	adj	1869	3155				colors	neutral
l-tour	Tour	tour, trip	noun	1870	3156	f	Touren		travel	neutral
l-amerikanisch	amerikanisch	American	adj	1871	3157				function	neutral
l-beruehren	berühren	to touch	verb	1872	3160				body	neutral
l-franzoesisch	französisch	French	adj	1873	3161				function	neutral
l-gouverneur	Gouverneur	governor	noun	1874	3162	m	Gouverneure		work	neutral
l-gedaechtnis	Gedächtnis	memory	noun	1875	3166	n	Gedächtnisse		feelings	neutral
l-wirklichkeit	Wirklichkeit	reality	noun	1876	3167	f	Wirklichkeiten		function	neutral
l-bestrafen	bestrafen	to punish	verb	1877	3168				function	neutral
l-kreis	Kreis	circle	noun	1878	3169	m	Kreise		function	neutral
l-rein-adj	rein	pure, clean	adj	1879	3170				function	neutral
l-staatsanwalt	Staatsanwalt	prosecutor	noun	1880	3176	m	Staatsanwälte		work	neutral
l-ewigkeit	Ewigkeit	eternity	noun	1881	3177	f	Ewigkeiten		time	neutral
l-stoerung	Störung	disturbance, disorder	noun	1882	3178	f	Störungen		health	neutral
l-haesslich	hässlich	ugly	adj	1883	3179				feelings	neutral
l-tiger	Tiger	tiger	noun	1884	3185	m	Tiger		animals	neutral
l-zigarette	Zigarette	cigarette	noun	1885	3186	f	Zigaretten		health	neutral
l-mutig	mutig	brave	adj	1886	3187				feelings	neutral
l-ausruhen	ausruhen	to rest	verb	1887	3188				health	neutral
l-link	link	left	adj	1888	3190				function	neutral
l-hauptmann	Hauptmann	captain	noun	1889	3191	m	Hauptleute		work	neutral
l-not	Not	need, distress	noun	1890	3193	f	Nöte		feelings	neutral
l-unglueck	Unglück	misfortune, accident	noun	1891	3194	n	Unglücke		feelings	neutral
l-eng	eng	narrow, tight	adj	1892	3195				function	neutral
l-ueben	üben	to practice	verb	1893	3198				school	neutral
l-wissenschaftler	Wissenschaftler	scientist	noun	1894	3199	m	Wissenschaftler		work,school	neutral
l-reaktion	Reaktion	reaction	noun	1895	3201	f	Reaktionen		feelings	neutral
l-dusche	Dusche	shower	noun	1896	3203	f	Duschen		home,body	neutral
l-mitarbeiter	Mitarbeiter	employee, colleague	noun	1897	3204	m	Mitarbeiter		work	neutral
l-bedrohen	bedrohen	to threaten	verb	1898	3206				feelings	neutral
l-reagieren	reagieren	to react	verb	1899	3210				feelings	neutral
l-identitaet	Identität	identity	noun	1900	3211	f	Identitäten		function	neutral
l-rund	rund	round	adj	1901	3212				function	neutral
l-fieber	Fieber	fever	noun	1902	3214	n	Fieber		health,body	neutral
l-hirn	Hirn	brain	noun	1903	3215	n	Hirne		body	neutral
l-leiten	leiten	to lead, direct	verb	1904	3216				work	neutral
l-donnerstag	Donnerstag	Thursday	noun	1905	3217	m	Donnerstage		time	neutral
l-unheimlich	unheimlich	eerie, creepy	adj	1906	3219				feelings	neutral
l-jahrhundert	Jahrhundert	century	noun	1907	3221	n	Jahrhunderte		time	neutral
l-irgend	irgend	any, some	particle	1908	3222				function	neutral
l-diener	Diener	servant	noun	1909	3223	m	Diener		work	neutral
l-extrem	extrem	extreme	adj	1910	3225				function	neutral
l-ausweis	Ausweis	ID card	noun	1911	3226	m	Ausweise		function	neutral
l-sicht	Sicht	view, sight	noun	1912	3227	f	Sichten		function	neutral
l-sport	Sport	sport	noun	1913	3228	m			body	neutral
l-jude	Jude	Jew	noun	1914	3229	m	Juden		people	neutral
l-studieren	studieren	to study	verb	1915	3230				school	neutral
l-anluegen	anlügen	to lie to	verb	1916	3231			lügt an, log an, hat angelogen	communication	neutral
l-text	Text	text	noun	1917	3235	m	Texte		communication	neutral
l-nebenan	nebenan	next door	adv	1918	3237				home	neutral
l-lektion	Lektion	lesson	noun	1919	3239	f	Lektionen		school	neutral
l-maus	Maus	mouse	noun	1920	3240	f	Mäuse		animals	neutral
l-staub	Staub	dust	noun	1921	3241	m	Stäube		home	neutral
l-dutzend	Dutzend	dozen	noun	1922	3244	n	Dutzende		numbers	neutral
l-ratte	Ratte	rat	noun	1923	3245	f	Ratten		animals	neutral
l-mitleid	Mitleid	pity, compassion	noun	1924	3246	n			feelings	neutral
l-testen	testen	to test	verb	1925	3247				function	neutral
l-auftritt	Auftritt	appearance, performance	noun	1926	3248	m	Auftritte		work	neutral
l-gegner	Gegner	opponent	noun	1927	3249	m	Gegner		people	neutral
l-verdienst	Verdienst	earnings / income	noun	1928	3251	m	Verdienste		money,work	neutral
l-wunde	Wunde	wound	noun	1929	3253	f	Wunden		health,body	neutral
l-linie	Linie	line	noun	1930	3254	f	Linien		function	neutral
l-bedrohung	Bedrohung	threat	noun	1931	3255	f	Bedrohungen		feelings	neutral
l-bauer	Bauer	farmer	noun	1932	3256	m	Bauern		work	neutral
l-einkaufen	einkaufen	to shop	verb	1933	3259				shopping	neutral
l-kreuz	Kreuz	cross	noun	1934	3260	n	Kreuze		function	neutral
l-begehen	begehen	to commit	verb	1935	3262			begeht, beging, hat begangen	function	neutral
l-nachsehen	nachsehen	to check, look up	verb	1936	3264			sieht nach, sah nach, hat nachgesehen	function	neutral
l-leidenschaft	Leidenschaft	passion	noun	1937	3267	f	Leidenschaften		feelings	neutral
l-geliebte	Geliebte	lover	noun	1938	3268	f	Geliebten		people,feelings	neutral
l-bereuen	bereuen	to regret	verb	1939	3269				feelings	neutral
l-spieler	Spieler	player	noun	1940	3270	m	Spieler		people	neutral
l-steuer	Steuer	tax	noun	1941	3273	f	Steuern		money	neutral
l-voran	voran	forward, ahead	adv	1942	3275				function	neutral
l-wieviel	wieviel	how much	adv	1943	3276				question,numbers	neutral
l-graf	Graf	count, earl	noun	1944	3278	m	Grafen		people	neutral
l-verabredung	Verabredung	appointment, date	noun	1945	3279	f	Verabredungen		time	neutral
l-ueberfallen	überfallen	to attack, mug	verb	1946	3281			überfällt, überfiel, hat überfallen	function	neutral
l-umdrehen	umdrehen	to turn around	verb	1947	3283				function	neutral
l-kilo	Kilo	kilo	noun	1948	3285	n	Kilo		numbers	neutral
l-negativ	negativ	negative	adj	1949	3287				function	neutral
l-schild	Schild	sign	noun	1950	3288	n	Schilder		function	neutral
l-penner	Penner	bum, tramp	noun	1951	3292	m	Penner		people	colloquial
l-kuehlschrank	Kühlschrank	refrigerator	noun	1952	3297	m	Kühlschränke		home,food	neutral
l-identifizieren	identifizieren	to identify	verb	1953	3298				function	neutral
l-lehrerin	Lehrerin	teacher (female)	noun	1954	3299	f	Lehrerinnen		work,school	neutral
l-zentrale	Zentrale	headquarters	noun	1955	3302	f	Zentralen		work	neutral
l-jaeger	Jäger	hunter	noun	1956	3303	m	Jäger		work	neutral
l-wenden	wenden	to turn	verb	1957	3306				function	neutral
l-ungluecklich	unglücklich	unhappy	adj	1958	3312				feelings	neutral
l-sand	Sand	sand	noun	1959	3314	m	Sande		nature	neutral
l-pfarrer	Pfarrer	priest, pastor	noun	1960	3315	m	Pfarrer		work	neutral
l-plus	plus	plus	conj	1961	3316				numbers	neutral
l-zauber	Zauber	magic, spell	noun	1962	3319	m	Zauber		function	neutral
l-rueckkehr	Rückkehr	return	noun	1963	3321	f			travel	neutral
l-hafen	Hafen	harbor, port	noun	1964	3322	m	Häfen		travel,city	neutral
l-indianer	Indianer	Native American	noun	1965	3323	m	Indianer		people	neutral
l-verschwenden	verschwenden	to waste	verb	1966	3325				money	neutral
l-stahl	Stahl	steel	noun	1967	3330	m	Stähle		function	neutral
l-affe	Affe	monkey, ape	noun	1968	3332	m	Affen		animals	neutral
l-kindheit	Kindheit	childhood	noun	1969	3334	f	Kindheiten		time,family	neutral
l-vermeiden	vermeiden	to avoid	verb	1970	3337			vermeidet, vermied, hat vermieden	function	neutral
l-fabrik	Fabrik	factory	noun	1971	3338	f	Fabriken		work	neutral
l-aussagen	aussagen	to testify, state	verb	1972	3339				communication	neutral
l-miststueck	Miststück	bitch, bastard	noun	1973	3342	n	Miststücke		feelings	colloquial
l-verrueckter	Verrückter	madman	noun	1974	3343	m	Verrückte		people	colloquial
l-jungfrau	Jungfrau	virgin	noun	1975	3345	f	Jungfrauen		people	neutral
l-lauf	Lauf	course, run	noun	1976	3348	m	Läufe		time	neutral
l-reinlegen	reinlegen	to trick, con	verb	1977	3349				function	colloquial
l-angenehm	angenehm	pleasant	adj	1978	3352				feelings	neutral
l-daheim	daheim	at home	adv	1979	3353				home	neutral
l-geruch	Geruch	smell, odor	noun	1980	3356	m	Gerüche		body	neutral
l-ungern	ungern	reluctantly	adv	1981	3364				feelings	neutral
l-ablehnen	ablehnen	to reject, refuse	verb	1982	3365				communication	neutral
l-erstens	erstens	firstly	adv	1983	3366				numbers	neutral
l-abmachung	Abmachung	agreement, deal	noun	1984	3367	f	Abmachungen		communication	neutral
l-appetit	Appetit	appetite	noun	1985	3368	m			food,body	neutral
l-fan	Fan	fan	noun	1986	3371	m	Fans		people	neutral
l-lady	Lady	lady	noun	1987	3374	f	Ladys		people	neutral
l-sms	SMS	text message	noun	1988	3375	f	SMS		communication	neutral
l-verkauf	Verkauf	sale	noun	1989	3376	m	Verkäufe		shopping,money	neutral
l-verbergen	verbergen	to hide, conceal	verb	1990	3378			verbirgt, verbarg, hat verborgen	function	neutral
l-sorgen	sorgen	to care, ensure	verb	1991	3379				feelings	neutral
l-beruehmt	berühmt	famous	adj	1992	3382				function	neutral
l-aussteigen	aussteigen	to get out, exit	verb	1993	3383			steigt aus, stieg aus, ist ausgestiegen	travel	neutral
l-reingehen	reingehen	to go in, enter	verb	1994	3386			geht rein, ging rein, ist reingegangen	function	colloquial
l-korrektur	Korrektur	correction	noun	1995	3388	f	Korrekturen		function	neutral
l-titte	Titte	tit, boob	noun	1996	3390	f	Titten		body	colloquial
l-betreten	betreten	to enter, step on	verb	1997	3391			betritt, betrat, hat betreten	function	neutral
l-rausholen	rausholen	to get out, pull out	verb	1998	3397				function	colloquial
l-aufnahme	Aufnahme	recording, admission	noun	1999	3399	f	Aufnahmen		communication	neutral
l-manager	Manager	manager	noun	2000	3404	m	Manager		work	neutral`;

export const LEMMAS: Lemma[] = DATA.split('\n').map((line) => {
  const [id, de, en, pos, order, rank, gender, plural, forms, tags, register] = line.split('\t');
  const w: Lemma = { id, de, en, pos: pos as Pos, order: Number(order), rank: Number(rank) };
  if (gender) w.gender = gender as Gender;
  if (plural) w.plural = plural;
  if (forms) w.forms = forms;
  if (tags) w.tags = tags.split(',');
  if (register) w.register = register as Register;
  return w;
});
