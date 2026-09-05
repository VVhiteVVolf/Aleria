import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { BRADRHITH_EMBLEM, BRADRHITH_HOUSE_BIOGRAPHY } from './house-bradrhith-biography.js';
import { HOUSE_BRADRHITH_PORTRAITS } from './house-bradrhith-portraits.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';

const HOUSE_ID = 'house-bradrhith';
const ARIANWEN_MARRIAGE = 'marriage-arianwen-gruffudd';
const MAIRWEN_MARRIAGE = 'marriage-mairwen-llyr';
const ARIANWEN_CHILD_IDS = ['arianwen-sohn-1', 'arianwen-sohn-2', 'arianwen-tochter'];
const MAIRWEN_CHILD_IDS = ['mairwen-sohn-1', 'mairwen-sohn-2', 'mairwen-tochter'];
const CHILD_SOURCE_NOTE = 'Name und Lebensdaten wurden auf Wunsch des Autors ergänzt. Das Transkript belegt mehrere Söhne und eine Tochter; ausgearbeitet sind hier zwei Söhne und eine Tochter.';
const ARIANWEN_CHILDREN = [
  { name: 'Eiludd Gwregysdu', birth: '1721' },
  { name: 'Gwrfyw Gwregysdu', birth: '1724' },
  { name: 'Creirwy Gwregysdu', birth: '1726' }
];
const MAIRWEN_CHILDREN = [
  { name: 'Gwyddien Dewrdd', birth: '1727' },
  { name: 'Clydog Dewrdd', birth: '1730' },
  { name: 'Goleuddydd Dewrdd', birth: '1733' }
];
const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-bradrhith', title: 'Haus Bradrhith', emblem: BRADRHITH_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.bradrhith,
  toYear: '1672', timeJumpLabel: 'Unbekannte Generationen · bis Ceredig'
});

function person(id, name, sex, options = {}) {
  return createFamilyPerson({
    id, name, sex,
    houseId: HOUSE_ID,
    status: 'unknown',
    portrait: HOUSE_BRADRHITH_PORTRAITS[id] || '',
    ...options,
    extensions: {
      ...options.extensions,
      registryManagedFields: ['name', 'birth', 'death', 'status', 'portrait', 'portraitPlaceholder', 'notes']
    }
  });
}

// Der Zeitsprung bildet eine Herkunftslücke ab, keine direkte biologische Elternschaft.
export const HOUSE_BRADRHITH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-bradrhith',
    title: 'Haus Bradrhith',
    motto: '',
    description: 'Bürgerliche Pferdezüchterfamilie auf dem Bradrhith Hof im nördlichen Bannkreis Gwynthors. Familienstand nach der Anhörung in Celtigerns Wacht.',
    emblem: BRADRHITH_EMBLEM,
    houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.bradrhith
  },
  houses: [
    { id: HOUSE_ID, name: 'Haus Bradrhith', motto: '', emblem: BRADRHITH_EMBLEM, status: 'active' },
    { id: 'house-gwregysdu', name: 'Familie Gwregysdu', motto: '', emblem: '', status: 'active' },
    { id: 'house-dewrdd', name: 'Familie Dewrdd', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    ...base.persons,
    person('ceredig-bradrhith', 'Ceredig Bradrhith', 'male', {
      birth: '1672', death: '1739',
      status: 'dead', lineageRole: 'head', title: 'Verstorbener Hofherr',
      notes: 'Nachfahre des unbenannten Stallmeisters, der den Hof vor über einem Jahrhundert begründete. Starb nach längerer Krankheit vor dem Überfall. Vater von drei verstorbenen Söhnen, Arianwen und Mairwen. Das Gericht erkennt Hinweise auf ein Testament zugunsten Mairwens und Llyrs an; die Urkunde wird in der Anhörung nicht vorgelegt.'
    }),
    person('ceredig-sohn-krieg-1', 'Cynddelig Bradrhith', 'male', {
      birth: '1695', death: '1719',
      status: 'dead', title: 'Im Krieg gefallen',
      notes: 'Ältester Sohn Ceredigs; im Krieg mit 24 Jahren gefallen. Name und Lebensdaten auf Wunsch des Autors ergänzt.'
    }),
    person('ceredig-sohn-krieg-2', 'Cynddelw Bradrhith', 'male', {
      birth: '1697', death: '1720',
      status: 'dead', title: 'Im Krieg gefallen',
      notes: 'Zweiter Sohn Ceredigs; im letzten Kriegsjahr mit 23 Jahren gefallen. Name und Lebensdaten auf Wunsch des Autors ergänzt.'
    }),
    person('ceredig-sohn-soeldner', 'Rhufon Bradrhith', 'male', {
      birth: '1702', death: '1734',
      status: 'dead', title: 'Als Söldner gefallen',
      notes: 'Jüngster Sohn Ceredigs. Schloss sich laut Odyars Bericht Söldnern an und fiel später ebenfalls. Name und Lebensdaten auf Wunsch des Autors ergänzt; Tod mit 32 Jahren.'
    }),
    person('arianwen-bradrhith', 'Arianwen Bradrhith', 'female', {
      birth: '1700',
      worldPersonId: 'person--almanach--nliylooqslgwjusa1fpi',
      status: 'alive', lineageRole: 'mainline', title: 'Ältere Tochter · in kirchlicher Buße',
      tags: ['Almanach-Charakter', 'Orden der Geläuterten'],
      notes: 'Ältere Tochter Ceredigs und Ehefrau Gruffudd Gwregysdus. Überlebte den Überfall mit ihrem Gemahl und ihren Kindern. Billigte die Einschüchterung Mairwens und Llyrs; das Gericht unterschied ihre Schuld von Gruffudds vorsätzlichem Mordkomplott. Büßt als Schweigende unter persönlicher Aufsicht Gwalchgwyn Saethwyrs. Nach Llyrs Erbverzicht erhalten ihre Kinder den Hof.',
      extensions: { sourceCharacterId: 'nLIylooQSlgWjUsA1fpI' }
    }),
    person('gruffudd-gwregysdu', 'Gruffudd Gwregysdu', 'male', {
      birth: '1697',
      worldPersonId: 'person--almanach--go0d7ciwevxwk1cqvgzz',
      houseId: 'house-gwregysdu', familyRole: 'married', status: 'alive', title: 'Arianwens Gemahl · in Haft',
      tags: ['Almanach-Charakter'],
      notes: 'Kaufmann aus der Familie Gwregysdu und Ehemann Arianwens. Veranlasste über einen Mittelsmann das Komplott gegen Mairwen, Llyr und deren Kinder. Sein Todesurteil ist für Ermittlungen ausgesetzt; er befindet sich isoliert im Gewahrsam der Draig. Eine vollzogene Hinrichtung oder Auflösung seiner Ehe ist nicht überliefert.',
      extensions: { sourceCharacterId: 'go0D7CiweVxWK1CqVgZz' }
    }),
    person('mairwen-bradrhith', 'Mairwen Dewrdd (geb. Bradrhith)', 'female', {
      birth: '1705', death: '1740',
      status: 'dead', title: 'Jüngere Tochter · beim Überfall getötet',
      notes: 'Jüngere Tochter Ceredigs und Ehefrau Llyr Dewrdds; im Schlusswort auch Mairwen Dewrdd genannt. Führte mit Llyr während der Krankheit ihres Vaters den Hof. Wurde beim Überfall zusammen mit ihren Kindern getötet. Das Gericht erkennt die Nachfolge über sie zugunsten Llyrs an.'
    }),
    person('llyr-dewrdd', 'Llyr Dewrdd', 'male', {
      birth: '1701',
      worldPersonId: 'person--almanach--wjnuopliifgduhjqkjhu',
      houseId: 'house-dewrdd', familyRole: 'married', status: 'alive', title: 'Pferdemeister · Mairwens Witwer',
      tags: ['Almanach-Charakter'],
      notes: 'Arbeitete sein Leben lang auf dem Bradrhith Hof. Heiratete Mairwen mit Ceredigs Segen und führte mit ihr den Betrieb in dessen letzten Jahren. Überlebte den Überfall, bei dem seine Frau und Kinder starben. Lehnt das ihm zugesprochene Erbe ausdrücklich ab und bleibt zunächst als Gast der Draig zur Erholung in Gwynthor. Ein Gespräch mit Owain Draig ist vorgesehen; eine neue Anstellung, ein neuer Hof oder eine Vormundschaft über Arianwens Kinder sind noch nicht beschlossen.',
      extensions: { sourceCharacterId: 'WjNUoPlIiFgdUHJQkJhU' }
    }),
    ...ARIANWEN_CHILD_IDS.map((id, index) => person(id, ARIANWEN_CHILDREN[index].name, index < 2 ? 'male' : 'female', {
      birth: ARIANWEN_CHILDREN[index].birth,
      houseId: 'house-gwregysdu', status: 'alive', lineageRole: 'mainline', portraitPlaceholder: index === 0 ? 'auto' : 'child',
      title: 'Kind Arianwens · erbt den Hof',
      notes: `Kind Arianwens und Gruffudds; überlebte mit den Eltern den Überfall. Trägt nach Aussage Gwendolyns den Namen des Vaters. Erhält mit den Geschwistern den Hof nach Llyrs Verzicht, unter Aufsicht der Awenydd. ${CHILD_SOURCE_NOTE}`,
      extensions: { sourceCountIsMinimum: index < 2 }
    })),
    ...MAIRWEN_CHILD_IDS.map((id, index) => person(id, MAIRWEN_CHILDREN[index].name, index < 2 ? 'male' : 'female', {
      birth: MAIRWEN_CHILDREN[index].birth, death: '1740',
      houseId: 'house-dewrdd', status: 'dead', portraitPlaceholder: 'child',
      title: 'Kind Mairwens · beim Überfall getötet',
      notes: `Kind Mairwens und Llyrs; beim Überfall auf den Hof mit den Geschwistern getötet. ${CHILD_SOURCE_NOTE}`,
      extensions: { sourceCountIsMinimum: index < 2 }
    }))
  ],
  partnerships: [
    ...base.partnerships.map(partnership => ({ ...partnership, status: 'ended' })),
    createMarriage(ARIANWEN_MARRIAGE, 'arianwen-bradrhith', 'gruffudd-gwregysdu', {
      start: '1720',
      extensions: { chartAlignChildGroupBelowParentPair: true, registryManagedFields: ['start'] }
    }),
    createMarriage(MAIRWEN_MARRIAGE, 'mairwen-bradrhith', 'llyr-dewrdd', {
      start: '1725', end: '1740',
      status: 'widowed', notes: 'Die Ehe endet durch Mairwens Tod beim Überfall; Llyr überlebt.',
      extensions: { chartAlignChildGroupBelowParentPair: true, registryManagedFields: ['start', 'end'] }
    })
  ],
  parentages: [
    ...createParentages(['ceredig-bradrhith'], base.persons.map(founder => founder.id), base.lineage.founderPartnershipId, {
      type: 'claimed', certainty: 'probable',
      notes: 'Nachfahre über mehrere unbekannte Generationen; ausdrücklich kein direkter Sohn des Gründerpaares.',
      extensions: { timeJumpId: base.timeJumps[0].id }
    }),
    ...createParentages([
      'ceredig-sohn-krieg-1', 'ceredig-sohn-krieg-2', 'ceredig-sohn-soeldner',
      'arianwen-bradrhith', 'mairwen-bradrhith'
    ], ['ceredig-bradrhith'], '', {
      legitimacy: 'unknown', notes: 'Ceredig ist als Vater belegt. Die Mutter beziehungsweise Mütter bleiben ungenannt.'
    }),
    ...createParentages(ARIANWEN_CHILD_IDS, ['arianwen-bradrhith', 'gruffudd-gwregysdu'], ARIANWEN_MARRIAGE),
    ...createParentages(MAIRWEN_CHILD_IDS, ['mairwen-bradrhith', 'llyr-dewrdd'], MAIRWEN_MARRIAGE)
  ],
  cadetBranches: [],
  timeJumps: base.timeJumps.map(jump => ({
    ...jump, childIds: ['ceredig-bradrhith'],
    notes: 'Vom unbekannten Stallmeister der Draig und seiner unbekannten Partnerin über nicht überlieferte Generationen zu Ceredig Bradrhith.',
    extensions: { preparedPlaceholder: false }
  })),
  lineage: {
    founderPartnershipId: base.lineage.founderPartnershipId, houseId: HOUSE_ID,
    crestSubtitle: 'Bürgerliches Gestüt · Bradrhith Hof',
    crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: base.view.focusPersonId, orientation: 'vertical',
    ancestorDepth: 12, descendantDepth: 12, limitGenerations: false, showSiblings: true
  },
  extensions: {
    blankFamily: false, sourceRevision: 2, chartLayoutPolicy: 'strict-v1',
    houseBiographyModule: BRADRHITH_HOUSE_BIOGRAPHY,
    sourceModule: 'Die Anhörung — Celtigerns Wacht · Sitzung 3',
    sourceNote: 'Kommentarthread vom 05.09.2026, celtigerns-wacht-anhoerung::session:3. Verwandtschaft: Beiträge 8, 10, 12, 14, 80, 232, 239; Ergebnis: 231–237, 244, 249. Revision 2 auf ausdrücklichen Autorenwunsch: unbekanntes Gründerpaar, Hausknoten und serieller Zeitsprung zu Ceredig; neun ergänzte Namen und Lebensdaten um Arianwen (40) und ihre Kinder (19, 16, 14) im Weltjahr 1740. Je zwei Söhne und eine Tochter pro Schwester sind ausgearbeitet; die Quelle nennt nur eine Mindestzahl. Ceredigs Kinder erhalten weiterhin nur den belegten Vater. Neue Namen stammen aus dem Welsh Classical Dictionary nach Ausschluss der ersten 400 verschiedenen Listophile-Namen, keine statistische Seltenheitsrangliste. Almanach-Weltidentitäten bleiben erhalten. Llyrs Porträt folgt der ausdrücklichen Korrektur p4ivSxG.png. Einzelheiten im Quellenprotokoll.',
    registryManagedExtensionFields: ['sourceNote', 'houseBiographyModule', 'chartLayoutPolicy'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'crestSubtitle', 'crestFrame', 'timeGap'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
