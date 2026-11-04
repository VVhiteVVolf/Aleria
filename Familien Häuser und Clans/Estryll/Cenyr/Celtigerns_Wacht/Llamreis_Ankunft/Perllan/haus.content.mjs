// Gemeinsame redaktionelle Quelle für Hausseite und Stammbaum-Hausbio.
// Belege und offene Angaben: source-manifest.json; Identitäten im Familienmodul.
import { HOUSE_PERLLAN_FAMILY } from '../../../../../../Stammbäume/assets/js/data/house-perllan-family.js';

const family = HOUSE_PERLLAN_FAMILY;
const houseImage = 'Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/assets/perllan-buerger.png';
const companionDescriptions = {
  'person-b758cea4': 'Onns Portrait zeigt sie mit einem Eichhörnchen und einem Rotkehlchen. Namen, Ausbildung und die genaue Tierbindung sind nicht überliefert.',
  'person-f3cccc1a': 'Lilis Portrait zeigt sie mit einem Kaninchen und einer Blaumeise. Namen, Ausbildung und die genaue Tierbindung sind nicht überliefert.',
};
const localTreeImage = source => source && !/^(?:[a-z]+:|\/|\.\.\/)/i.test(source) ? `../Stammbäume/${source}` : source;
const personCard = person => ({
  id: person.id,
  familyId: 'perllan',
  name: person.name,
  role: person.title || 'Familienmitglied',
  detail: [person.birth ? `Geboren ${person.birth}` : '', person.status === 'dead' ? `Verstorben${person.death && person.death !== '????' ? ` ${person.death}` : ' · Jahr unbekannt'}` : ''].filter(Boolean).join(' · '),
  image: localTreeImage(person.portrait),
  silhouette: person.sex === 'female' ? 'female' : 'male',
  description: companionDescriptions[person.id] || (person.title ? `${person.name} wird als ${person.title} geführt.` : 'Angehörige Person der Familie Perllan; weitere Lebensumstände sind bislang nicht überliefert.'),
});
const namedPersons = family.persons.filter(person => !/^(?:\?+|Unbekannt)/i.test(person.name));
const ywen = family.persons.find(person => person.id === 'person-adca1980');

const overview = 'Die Perllan sind eine bürgerliche Familie aus Gwynthor in Llamreis Ankunft, einem Teil von Celtigerns Wacht im Königreich Cenyr. Ihre Überlieferung führt den Familienursprung auf ungefähr 1240 zurück. Die Familie gehört zur Kultur der Cenyri, bekennt sich zur Alerischen Kirche und führt Waldgrün als Hausfarbe. Als Oberhaupt ist Ywen, geboren 1648, verzeichnet.';
const history = 'Die Anfänge der Perllan werden um 1240 angesetzt. Die Namen der Gründergeneration sind nicht überliefert. Zwischen diesen Anfängen und der namentlich wieder belegten Linie liegt ein Zeitsprung; die fehlenden Generationen sind im Stammbaum ausdrücklich als Überlieferungslücke gekennzeichnet.\n\nMit Ywen und seiner namentlich unbekannten Ehefrau, geboren 1650 und gestorben 1727, beginnt die zusammenhängend erfasste jüngere Familie. Ihre vier Söhne heißen Collen (1668), Onnen (1671), Derw (1675) und Helyg (1679). Onnen ist verstorben; sein Todesjahr ist unbekannt. Die nachfolgenden Generationen sind mit ihren Ehen und Kindern in der Familienakte erfasst.';
const character = 'Waldgrün ist die überlieferte Farbe der Perllan. Die Familie ist bürgerlichen Standes und besitzt keine eigene Herrschaftsverwaltung. Weitere Hausbräuche, ein Familienmotto oder besondere Privilegien sind bislang nicht überliefert.';
const holdings = 'Gwynthor ist als Herkunftsort der Familie belegt. Ein bestimmtes Wohnhaus, ein Hof oder sonstige Besitzungen werden in den überlieferten Angaben nicht benannt. Auch der Beruf und die wirtschaftliche Grundlage der Gesamtfamilie sind offen.';
const relations = 'Die Familienakte bewahrt die Nachkommen der vier Söhne Ywens und ihre jeweiligen Partnerschaften. Helygs Familie umfasst Ysgaw, Draen und Blodwen. Bei Ysgaws Mutter ist eine Herkunft aus Aldrimar vermerkt; ihr Name ist unbekannt. Eine darüber hinausgehende Bindung an ein bestimmtes aldrimarisches Haus ist nicht überliefert. Helygen wird als Knappe geführt, Brwyn als Page. Diese persönlichen Ausbildungsstände begründen keinen Adelsrang der Familie.';
const companions = 'Die überlieferten Portraits zeigen Onn mit einem Eichhörnchen und einem Rotkehlchen sowie Lili mit einem Kaninchen und einer Blaumeise. Diese Tiere sind als sichtbare Begleiter der beiden Angehörigen erfasst. Ihre Namen, Ausbildung und die genaue Tierbindung sind nicht überliefert.';

export const HOUSE_CONTENT = {
  id: 'perllan', name: 'Familie Perllan', type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: '', parentHouseId: '',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  extinct: false, showMotto: false, registerPage: true, prepared: false,
  contentVersion: '20261104-perllan-v1', biographyManagedExternally: false,
  biographySourceRevision: 1, biographyPreviousDefaultFingerprints: [],
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Herkunft und überlieferte Generationen',
  biographySummary: { overview, history, character, holdings, relations, customs: companions, culture: 'Die Perllan sind Cenyri aus Gwynthor und gehören der Alerischen Kirche an. Besondere Hauspatrone oder eigene religiöse Bräuche sind bislang nicht überliefert.' },
  placeholders: { male: '../Stammbäume/assets/images/placeholders/male.png', female: '../Stammbäume/assets/images/placeholders/female.png' },
  allies: [], cadets: [], founder: null, heirs: [], offices: [],
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
    { type: 'Baronie', name: 'Llamreis Ankunft', slug: 'llamreis-ankunft' },
    { type: 'Ort', name: 'Gwynthor', slug: 'gwynthor' },
    { type: 'Familie', name: 'Familie Perllan', slug: 'perllan' },
  ],
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus', motto: '', quoteAuthor: '',
    seat: 'Gwynthor', affiliation: 'Celtigerns Wacht · Llamreis Ankunft', liege: '',
    troopStrength: '', tiarna: '', kerns: '', fleet: '', founding: 'ca. 1240', milestoneOne: '', milestoneTwo: '',
    patron: '', knightingPatron: '', people: 'Cenyri', wealth: '', religion: 'Alerische Kirche', patronDeities: '',
    origin: 'Gwynthor', cadetBranches: '', allies: '', enemies: '',
  },
  omitMilitaryProfile: true,
  sectionTitles: { succession: 'Familienlinien', court: 'Familie und Aufgaben', historicalFigures: 'Belegte Angehörige' },
  sections: {
    overview, history,
    traditions: `Als Hausfarbe ist Waldgrün überliefert. Weitere Familientraditionen sind bislang nicht näher beschrieben.\n\n${companions}`,
    knighthood: 'Helygen, geboren 1724, wird als Knappe geführt; Brwyn, geboren 1729, als Page. Die übrigen Angehörigen besitzen in der vorliegenden Überlieferung keine benannten Berufe oder Ausbildungsämter.',
    holdings, cultureReligion: 'Die Familie gehört zur Kultur der Cenyri und bekennt sich zur Alerischen Kirche. Eigene Schutzpatrone oder besondere religiöse Bräuche sind bislang nicht näher überliefert.',
    conflictsAlliances: relations, values: character,
    succession: 'Ywen ist als Familienoberhaupt bezeichnet. Seine vier Söhne Collen, Onnen, Derw und Helyg bilden die namentlich erfassten jüngeren Familienlinien. Collens Linie führt über Aeron, Derwyn und Briallen; Onnens über Bedw und Celyn; Derws über Bedwen und Eirlys; Helygs über Ysgaw, Draen und Blodwen. Eine förmliche Nachfolgeordnung ist nicht überliefert.',
    court: 'Die Perllan besitzen keine eigene Herrschaftsverwaltung. Ywen ist Familienoberhaupt. Helygens und Brwyns persönliche Ausbildung ist überliefert; weitere Familienämter sind nicht benannt.',
    familyTree: 'Der eingebettete Stammbaum führt sämtliche erfassten Personen, Ehen und Abstammungen. Unbekannte Namen bleiben offen; die älteren, nicht einzeln überlieferten Generationen sind durch einen Zeitsprung verbunden.',
    historicalFigures: 'Die folgenden Portraits zeigen die namentlich überlieferten Angehörigen mit direktem Verweis auf ihre jeweilige Personenkarte im Stammbaum.',
  },
  images: {
    crest: localTreeImage(family.document.emblem), scene: houseImage,
    sceneAlt: 'Bürgerliche Hausdarstellung der Familie Perllan in Waldgrün',
    banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png',
  },
  illustrationCategory: 'Bürgerliche Hausdarstellung',
  headsTitle: 'Familienoberhaupt', headsNote: 'Bezeichnung aus der überlieferten Familienakte; ein Amtsbeginn ist nicht benannt.',
  heads: [{ ...personCard(ywen), role: 'Familienoberhaupt', detail: 'Geboren 1648 · Amtsbeginn unbekannt' }],
  figuresTitle: 'Belegte Angehörige', figures: namedPersons.map(personCard),
  trivia: [], currentHead: ywen.name, firstHeir: '',
};
