import { HOUSE_CHAMOIS_FAMILY } from '../../../../../../Stammbäume/assets/js/data/house-chamois-family.js';
import {
  CHAMOIS_EMBLEM, CHAMOIS_ESTATE, CHAMOIS_FAMILY_ID, CHAMOIS_FIEF, CHAMOIS_HERALDRY, CHAMOIS_NAME,
  CHAMOIS_OVERVIEW, CHAMOIS_SERVICE, CHAMOIS_WARRIOR
} from '../../../../../../shared/chamois/chamois-house.mjs';

const territoryHref = '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Herrschaft der Gafyr/Herrschaft der Gafyr.html';
const gafyrEmblem = '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-gafyr.png';
const houseImage = path => `..${path}`;
const family = HOUSE_CHAMOIS_FAMILY;
const members = family.persons.filter(person => person.portrait);
const namedHead = members.find(person => person.lineageRole === 'head');
const heirs = members.filter(person => person.title.startsWith('Erbe'));
const card = person => {
  const detail = person.death ? `${person.birth}–${person.death}` : `Geboren ${person.birth}`;
  return {
    id: person.id, familyId: CHAMOIS_FAMILY_ID, name: person.name, role: person.title,
    detail, image: `../Stammbäume/${person.portrait}`,
    description: person.notes ? `${detail}. ${person.notes}` : detail
  };
};

const history = [
  `Thalric ist der gemeinsame Vorfahr der vier Hauptzweige. Zu seiner Generation gehören auch seine ältere Schwester Firena und sein jüngerer Bruder Ellan. Zu Thalrics Lebzeiten waren die Chamois noch Bürgerliche. ${CHAMOIS_SERVICE}`,
  'Im Großen Krieg von 1720 fielen Abaelors Söhne Helric und Dyreth sowie Thalyr, der Sohn Uwchyrs. Ihre Rüstungsporträts zeigen sie im jeweiligen Alter. Die Erhebung der Chamois zur Ritterfamilie liegt erst kurze Zeit zurück.'
].join('\n\n');
const succession = [
  'Abaelor steht dem Haus vor. Sein Sohn Lleuen ist der erste Erbe. Auf Lleuen folgt dessen Sohn Neddor. Lleuens ältestes Kind Avelwen ist Ritterin und gilt in der Familie als das Juwel der Chamois.',
  'Perwyns Töchter Brenae und die Zwillinge Rhewella und Jannwen sind Hofdamen und in andere Häuser verheiratet. Ihr jüngerer Bruder Saithan hat drei Kinder. Cyrban ist der Älteste, auf ihn folgen Nerella und Peran.',
  'Gwaedrics ältester Sohn Kyrban führt seinen Zweig mit Sairwen und Iwrwyn fort. Kyrbans Geschwister Rhydeth und Lleirys gehören der Kirche und dem Hofleben an. Uwchyrs Zweig endet im Stammbaum mit den Heiraten seiner Töchter Uffyrena und Helygys.',
  'Firena heiratete in ein anderes Haus. Der verstorbene Ellan war der Vater des fahrenden Ritters Firen. Dessen Sohn Dyror dient den Gafyr als Waffenknecht.'
];
const relations = 'Haus Gafyr ist der Lehnsherr der Chamois. Es nimmt jüngere Chamois zur Ausbildung auf und empfängt das bewaffnete Aufgebot der Familie. Am Hof der Gafyr tritt Lleirys als Bardin auf. Ihr Bruder Rhydeth ist Geistlicher der Alerischen Kirche.';

export const HOUSE_CONTENT = {
  id: CHAMOIS_FAMILY_ID, name: CHAMOIS_NAME, type: 'Ritterhaus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Gafyr', parentHouseId: 'haus-gafyr',
  territoryId: 'herrschaft-gafyr', territoryName: 'Herrschaft der Gafyr', territoryHref,
  showMotto: false, registerPage: true, prepared: false, contentVersion: '20261122-chamois-v8',
  biographySourceRevision: 8, omitMilitaryProfile: true, familyTreeCompact: true,
  biographyIntroTitle: 'Eine junge Ritterfamilie', biographyHistoryTitle: 'Vom Waffendienst zum Ritterstand',
  biographySummary: {
    overview: CHAMOIS_OVERVIEW, history, character: relations,
    holdings: `${CHAMOIS_ESTATE.description} ${CHAMOIS_FIEF}`, customs: CHAMOIS_HERALDRY
  },
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
    { type: 'Baronie', name: 'Llamreis Ankunft', slug: 'llamreis-ankunft' },
    { type: 'Ort', name: 'Gwynthor', slug: 'gwynthor' },
    { type: 'Haus', name: CHAMOIS_NAME, slug: CHAMOIS_FAMILY_ID }
  ],
  profile: {
    highestTitle: 'Einfache Ritterfamilie', rank: 'Einfache Ritterfamilie', houseType: 'Ritterhaus',
    seat: 'Castell Chamois · Gwynthor-Stadt', affiliation: 'Haus Gafyr', liege: 'Haus Gafyr',
    people: 'Cenyri', origin: 'Ehemals bürgerlich, kürzlich in den Ritterstand erhoben'
  },
  sectionTitles: { holdings: 'Castell Chamois', traditions: 'Wappen und Hausfarben', succession: 'Erbfolge und Familienzweige', historicalFigures: 'Angehörige' },
  sections: {
    overview: CHAMOIS_OVERVIEW, history, traditions: CHAMOIS_HERALDRY,
    holdings: [CHAMOIS_ESTATE.description, CHAMOIS_FIEF], conflictsAlliances: relations, succession,
    familyTree: 'Nach dem unbekannten Gründerpaar setzt der Stammbaum mit Firena, Thalric und Ellan wieder ein. Von Thalric gehen die vier Hauptzweige aus. Ellans Linie führt bis zu seinem Enkel Dyror.'
  },
  images: {
    crest: houseImage(CHAMOIS_EMBLEM), scene: houseImage(CHAMOIS_ESTATE.picture), sceneHref: CHAMOIS_ESTATE.mapHref,
    sceneAlt: CHAMOIS_ESTATE.pictureAlt,
    banner: '../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gafyr/assets/herrschaftsbanner.png'
  },
  relatedRecords: [
    { title: 'Castell Chamois auf der Karte', icon: houseImage(CHAMOIS_EMBLEM), text: CHAMOIS_ESTATE.location, link: CHAMOIS_ESTATE.mapHref }
  ],
  warriorGallery: { title: 'Hausrüstung der Chamois', entries: [
    { name: 'Hausrüstung der Chamois', image: houseImage(CHAMOIS_WARRIOR), description: 'Gebogene Hörner am Helm und ein waldgrüner Wappenrock mit goldener Gämse.' }
  ] },
  founder: null,
  headsTitle: 'Oberhaupt', heads: [card(namedHead)], currentHead: namedHead.name,
  heirs: heirs.map(card), figuresTitle: 'Familienangehörige', figures: members.map(card),
  allies: [{ name: 'Haus Gafyr', detail: 'Lehnsherr der Chamois', image: gafyrEmblem, imageFormat: 'square' }],
  cadets: [], offices: []
};
