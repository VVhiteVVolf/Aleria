import { HOUSE_GLYNMOR_FAMILY } from '../../../../../../Stammbäume/assets/js/data/house-glynmor-family.js';
import { buildFamilyPersonDisplayName } from '../../../../../../js/world-identity/family-person-names.js';
import {
  GLYNMOR_EMBLEM, GLYNMOR_FAMILY_ID, GLYNMOR_FAMILY_NAME, GLYNMOR_MODULE_URL, GLYNMOR_TUDUR, isNamedGlynmorPerson
} from '../../../../../../shared/glynmor/glynmor-identity.mjs';

const family = HOUSE_GLYNMOR_FAMILY;
const head = family.persons.find(person => person.id === GLYNMOR_TUDUR.personId);
const treeImage = path => path ? `../Stammbäume/${path}` : '';
const figure = person => ({
  id: person.id, familyId: GLYNMOR_FAMILY_ID,
  name: buildFamilyPersonDisplayName(family, person), role: person.title || 'Familienangehörige',
  detail: [person.birth && `Geboren ${person.birth}`, person.death && `Gestorben ${person.death}`].filter(Boolean).join(' · '),
  image: treeImage(person.portrait), silhouette: person.sex === 'female' ? 'female' : 'male'
});

const overview = 'Die Glynmors sind eine Bürgerfamilie aus Gwynthor. Ihre Werkstatt zieht Kerzen für den täglichen Gebrauch und fertigt Zier- und Festkerzen für Bürger, Ritter- und Adelshäuser an. Tudur führt den Betrieb und steht der Familie vor.';
const history = 'Die geschäftliche Verbindung zum Haus Wyrm entstand noch unter Ritterfürst Rhydderch Wyrm, dessen Amtszeit 1665 endete. Aus den Lieferungen entwickelte sich ein Vertrauensverhältnis. Später traten Mitglieder der Familie in den Haushalt und die Verwaltung des Ritterhauses ein. Emlyn ist der erste Glynmor, der dort als Vogt die Verwaltung führt.';
const holdings = 'Die Kerzenzieherei in Gwynthor-Stadt bildet seit Generationen die wirtschaftliche Grundlage der Familie. Zum Betrieb gehören ein Laden, die Ziehwerkstatt, eine Zierkammer und das rückwärtige Wachs- und Auftragslager.';
const relations = 'Die Hausüberlieferung nennt Haus Draig als Lehnsherrn. Die Glynmors beliefern Haus Wyrm, in dessen Dienst Emlyn als Vogt, Eleri als Küchenmeisterin und Meera als Zofe von Lady Rianna stehen. Ilar gehört der Stadtwache an.';
const customs = 'Eine brennende Kerze auf dunkelgrünem Grund ist das Familienwappen. Das goldene Flechtband rahmt das Zeichen der Handwerkskunst, auf der Ansehen und Wohlstand der Familie beruhen.';
const culture = 'Die Glynmors gehören zu den Cenyri und zur Alerischen Kirche.';
const character = 'Im Handwerk wie im Dienst bei Haus Wyrm schätzen die Glynmors saubere Arbeit, eingehaltene Zusagen und Verlässlichkeit.';

export const HOUSE_CONTENT = {
  id: GLYNMOR_FAMILY_ID, name: GLYNMOR_FAMILY_NAME, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
  county: 'Celtigerns Wacht', liege: 'Haus Draig', parentHouseId: 'haus-draig',
  territoryId: 'grafschaft-celtigerns-wacht', territoryName: 'Celtigerns Wacht',
  territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
  showMotto: false, registerPage: true, prepared: false, contentVersion: '20261122-glynmor-v1',
  biographySourceRevision: 2, omitMilitaryProfile: true,
  biographyIntroTitle: 'Über die Familie', biographyHistoryTitle: 'Von der Kerzenzieherei zum Dienst bei Haus Wyrm',
  biographySummary: { overview, history, character, holdings, relations, customs, culture },
  placeholders: {
    male: '../Stammbäume/assets/images/placeholders/male.png',
    female: '../Stammbäume/assets/images/placeholders/female.png'
  },
  hierarchy: [
    { type: 'Sammlung', name: 'Familien Häuser und Clans', slug: 'familien-hauser-und-clans' },
    { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
    { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
    { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
    { type: 'Baronie', name: 'Llamreis Ankunft', slug: 'llamreis-ankunft' },
    { type: 'Ort', name: 'Gwynthor', slug: 'gwynthor' },
    { type: 'Familie', name: GLYNMOR_FAMILY_NAME, slug: GLYNMOR_FAMILY_ID }
  ],
  profile: {
    highestTitle: 'Bürgerlich', rank: 'Bürgerlich', houseType: 'Bürgerliches Haus',
    seat: 'Gwynthor', affiliation: 'Haus Draig', liege: 'Haus Draig',
    people: 'Cenyri', wealth: 'Beschaulich', religion: 'Alerische Kirche', origin: 'Gwynthor'
  },
  sectionTitles: { succession: 'Familienlinien', court: 'Handwerk und Dienst', historicalFigures: 'Belegte Angehörige' },
  sections: {
    overview, history, traditions: customs, holdings, cultureReligion: culture, conflictsAlliances: relations, values: character,
    succession: 'Iestyns Zweig schließt in der Überlieferung unmittelbar an das Gründerpaar an. Tudurs Linie wird erst nach einer Überlieferungslücke wieder greifbar. Seine Kinder Iorwerth, Emlyn und Llinos sind namentlich verzeichnet.',
    court: 'Tudur leitet die Familienwerkstatt. Meera arbeitet dort gelegentlich an Kerzenarrangements, wenn sie von ihrem Dienst bei Lady Rianna frei hat.',
    familyTree: 'Der Stammbaum verbindet die belegten Ehen, Abstammungen und Familienzweige. Die Überlieferungslücke vor Tudur ist im Baum markiert.'
  },
  images: {
    crest: treeImage(GLYNMOR_EMBLEM), scene: treeImage(head.portrait), sceneHref: GLYNMOR_MODULE_URL,
    sceneAlt: 'Tudur Glynmor prüft eine Kerze in seiner Werkstatt.',
    banner: '../Stammbäume/assets/images/regions/celtigerns-wacht.png'
  },
  illustrationCategory: 'Kerzenzieherei · Gwynthor-Stadt',
  headsTitle: 'Familienoberhaupt', heads: [figure(head)], currentHead: head.name,
  figuresTitle: 'Belegte Angehörige',
  figures: family.persons.filter(person => isNamedGlynmorPerson(person.name)).map(figure),
  allies: [], cadets: [], heirs: [], offices: []
};
