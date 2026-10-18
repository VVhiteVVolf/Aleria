import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { HOUSE_BRADRHITH_FAMILY } from './house-bradrhith-family.js';
import { GWREGYSDU_HOUSEHOLD, GWREGYSDU_MOTTO } from '../../../../AleriaAlmanach/modules/gwregysdu-harbor/harbor-people.mjs';
import { buildGwregysduHouseBiography } from '../../../../AleriaAlmanach/modules/gwregysdu-harbor/harbor-biography.mjs';

const houseId = 'house-gwregysdu';
const emblem = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gwregysdu.png';
const founderMarriage = 'marriage-madog-gwen-gwregysdu';
const currentIds = Object.fromEntries(GWREGYSDU_HOUSEHOLD.map(p => [p.key, p.id]));
const former = (id, name, sex, birth, death, notes, options = {}) => createFamilyPerson({ id, name, sex, birth, death, notes, houseId, ...options });
const spouse = (id, name, birth, death, notes) => former(id, name, 'female', birth, death, notes, { houseId: '', familyRole: 'married' });
const marriage = (id, a, b, start, end = '') => createMarriage(id, a, b, { start, end, status: end ? 'ended' : 'active' });
const householdMarriage = (id, a, b, start) => marriage(id, currentIds[a], currentIds[b], start);
const gruffudd = HOUSE_BRADRHITH_FAMILY.persons.find(p => p.id === 'gruffudd-gwregysdu');
const arianwen = HOUSE_BRADRHITH_FAMILY.persons.find(p => p.id === 'arianwen-bradrhith');

const partnerships = [
  marriage(founderMarriage, 'madog-schwarzgurt', 'gwen-doeth', '1596', '1647'),
  marriage('marriage-dafydd-nest-gwregysdu', 'dafydd-gwregysdu', 'nest-gwregysdu', '1626', '1658'),
  marriage('marriage-cynwal-delyth-gwregysdu', 'cynwal-gwregysdu', 'delyth-gwregysdu', '1630', '1667'),
  marriage('marriage-dyfnwal-enfys-gwregysdu', 'dyfnwal-gwregysdu', 'enfys-gwregysdu', '1665', '1710'),
  householdMarriage('marriage-bleddyn-bethan-gwregysdu', 'bleddyn', 'bethan', '1692'),
  marriage('marriage-idris-eluned-gwregysdu', 'idris-gwregysdu', 'eluned-gwregysdu', '1689', '1733'),
  householdMarriage('marriage-cynan-rhosyn-gwregysdu', 'cynan', 'rhosyn', '1716'),
  householdMarriage('marriage-tudur-heulwen-gwregysdu', 'tudur', 'heulwen', '1723'),
  HOUSE_BRADRHITH_FAMILY.partnerships.find(p => p.id === 'marriage-arianwen-gruffudd')
];

export const HOUSE_GWREGYSDU_FAMILY = Object.freeze({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: 'haus-gwregysdu', title: 'Haus Gwregysdu', motto: GWREGYSDU_MOTTO, emblem,
    description: 'Bürgerliches Lager- und Handelshaus im Hafen Gwynthors. Madog Schwarzgurt begründete den Betrieb mit Godwyn Doeths Tochter Gwen. Heute führt Gruffudds Onkel Bleddyn vier Lagerhäuser der Familie im großen Handelsposten der Klingenden Münze.',
    houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' }) },
  houses: [
    { id: houseId, name: 'Haus Gwregysdu', motto: GWREGYSDU_MOTTO, emblem, status: 'active' },
    { id: 'house-doeth', name: 'Familie Doeth', motto: '', emblem: '', status: 'unknown' },
    { id: 'house-bradrhith', name: 'Haus Bradrhith', emblem: HOUSE_BRADRHITH_FAMILY.document.emblem, status: 'active' }
  ],
  persons: [
    former('madog-schwarzgurt', 'Madog Schwarzgurt', 'male', '1568', '1647', 'Gründer des Hauses. Unehelich geborener Cenyri mit aldrimarischen Wurzeln; wuchs im Waisenheim Gwynthors auf. Leibliche Eltern und ein möglicher Clananschluss bleiben unbekannt. Arbeitete sich vom Laufburschen zum Facharbeiter, Vorarbeiter, Lagerverwalter und Stellvertreter Godwyn Doeths hoch. Erbte mit dessen Tochter Gwen die Lagerverwaltung und erweiterte sie über die Ehen seiner Söhne.', { title: 'Gründer · vom Waisenkind zum Lagerherrn', lineageRole: 'founder', tags: ['Unehelich geboren', 'Cenyri', 'Aldrimarische Wurzeln'] }),
    former('gwen-doeth', 'Gwen Doeth', 'female', '1573', '1656', 'Tochter des Lagerherrn Godwyn Doeth. Heiratete Madog 1596; beide erbten die auf Holzteile ausgerichtete Lagerverwaltung und bauten sie gemeinsam aus. Godwyns Lebensdaten sind nicht überliefert.', { houseId: 'house-doeth', familyRole: 'married', title: 'Mitbegründerin · Tochter Godwyn Doeths' }),
    former('dafydd-gwregysdu', 'Dafydd Gwregysdu', 'male', '1598', '1671', 'Älterer Sohn Madogs und Gwens. Seine Ehe mit Nest verband das Lagerhaus mit einer Jägerfamilie. Fell- und Pelzlieferungen ergänzten das Holzgeschäft.', { title: 'Älterer Gründer-Sohn · Jagdverbindungen' }),
    spouse('nest-gwregysdu', 'Nest', '1601', '1658', 'Cenyri aus einer Jägerfamilie; ihr Herkunftshaus bleibt offen. Heiratete Dafydd 1626.'),
    former('cynwal-gwregysdu', 'Cynwal Gwregysdu', 'male', '1601', '1679', 'Jüngerer Sohn Madogs und Gwens. Die Ehe mit Delyth eröffnete Verbindungen zu Erz und Metall. Weitere Nachkommen dieses frühen Zweigs sind noch nicht ausgearbeitet.', { title: 'Jüngerer Gründer-Sohn · Bergbauverbindungen' }),
    spouse('delyth-gwregysdu', 'Delyth', '1605', '1667', 'Cenyri aus einer Bergbaufamilie; ihr Herkunftshaus bleibt offen. Heiratete Cynwal 1630.'),
    former('dyfnwal-gwregysdu', 'Dyfnwal Gwregysdu', 'male', '1635', '1710', 'Dafydds und Nests Sohn; führte die Lagerverbindungen in die nächste Generation. Vater Bleddyns und Idris’.', { title: 'Früheres Oberhaupt · Großvater Gruffudds' }),
    spouse('enfys-gwregysdu', 'Enfys', '1640', '1716', 'Gemahlin Dyfnwals seit 1665. Cenyri; ihr Herkunftshaus bleibt offen.'),
    ...GWREGYSDU_HOUSEHOLD.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex, birth: p.birth,
      houseId: p.spouse ? '' : houseId, familyRole: p.spouse ? 'married' : 'core', lineageRole: p.key === 'bleddyn' ? 'head' : 'branch',
      title: p.role, notes: p.bio, portrait: p.portrait.replace('./assets/', '../AleriaAlmanach/assets/'),
      extensions: { registryManagedFields: ['title', 'notes', 'portrait'] } })),
    former('idris-gwregysdu', 'Idris Gwregysdu', 'male', '1671', '1733', 'Jüngerer Bruder Bleddyns und Vater von fünf Kindern. Gruffudd ist sein viertes Kind. Die Nebenlinie führt heute keinen eigenen Posten in der Hafenführung.', { title: 'Gruffudds Vater · Nebenlinie' }),
    spouse('eluned-gwregysdu', 'Eluned', '1671', '1739', 'Cenyri und Gemahlin Idris’ seit 1689; Mutter seiner fünf Kinder. Ihr Herkunftshaus bleibt offen.'),
    former('heddwyn-gwregysdu', 'Heddwyn Gwregysdu', 'male', '1690', '', 'Ältestes der fünf Kinder Idris’ und Eluneds. Eigener Lebensweg und Familienstand sind noch nicht ausgearbeitet.', { title: 'Nebenlinie · ältestes Geschwister Gruffudds' }),
    former('gwenllian-gwregysdu', 'Gwenllian Gwregysdu', 'female', '1693', '', 'Zweites Kind Idris’ und Eluneds. Eigener Lebensweg und Familienstand sind noch nicht ausgearbeitet.', { title: 'Nebenlinie · ältere Schwester Gruffudds' }),
    former('rhodri-gwregysdu', 'Rhodri Gwregysdu', 'male', '1695', '', 'Drittes Kind Idris’ und Eluneds. Eigener Lebensweg und Familienstand sind noch nicht ausgearbeitet. Nicht identisch mit dem gefangenen Zitteraal Rhodri.', { title: 'Nebenlinie · älterer Bruder Gruffudds' }),
    { ...gruffudd, familyRole: 'core', lineageRole: 'branch', title: 'Nach Bradrhith verheiratet · in Haft', tags: [...gruffudd.tags, 'Wegverheiratet'],
      notes: `${gruffudd.notes} Viertes von fünf Kindern Idris’ und Eluneds; Neffe Bleddyns. Seine Ehe und Kinder werden mit unveränderten Personen-IDs ausschließlich in der Bradrhith-Akte fortgeführt. Keine Führungsaufgabe im Hafenbetrieb.` },
    former('esyllt-gwregysdu', 'Esyllt Gwregysdu', 'female', '1700', '', 'Jüngstes der fünf Kinder Idris’ und Eluneds. Eigener Lebensweg und Familienstand sind noch nicht ausgearbeitet.', { title: 'Nebenlinie · jüngere Schwester Gruffudds' }),
    { ...arianwen, familyRole: 'married' }
  ],
  partnerships: partnerships.map(p => ({ ...p, extensions: ({
    'marriage-dafydd-nest-gwregysdu': { chartAlignParentPairOverChildPersonId: 'dyfnwal-gwregysdu' },
    'marriage-idris-eluned-gwregysdu': { chartAlignChildGroupBelowParentPair: true },
    'marriage-cynan-rhosyn-gwregysdu': { chartAlignChildGroupBelowParentPair: true },
    'marriage-tudur-heulwen-gwregysdu': { chartAlignChildGroupBelowParentPair: true }
  })[p.id] || {} })),
  parentages: [
    ...createParentages(['dafydd-gwregysdu', 'cynwal-gwregysdu'], ['madog-schwarzgurt', 'gwen-doeth'], founderMarriage),
    ...createParentages(['dyfnwal-gwregysdu'], ['dafydd-gwregysdu', 'nest-gwregysdu'], 'marriage-dafydd-nest-gwregysdu'),
    ...createParentages([currentIds.bleddyn, 'idris-gwregysdu'], ['dyfnwal-gwregysdu', 'enfys-gwregysdu'], 'marriage-dyfnwal-enfys-gwregysdu'),
    ...createParentages([currentIds.cynan, currentIds.tudur], [currentIds.bleddyn, currentIds.bethan], 'marriage-bleddyn-bethan-gwregysdu'),
    ...createParentages([currentIds.gethin, currentIds.elenwen], [currentIds.cynan, currentIds.rhosyn], 'marriage-cynan-rhosyn-gwregysdu'),
    ...createParentages([currentIds.iorath, currentIds.mared], [currentIds.tudur, currentIds.heulwen], 'marriage-tudur-heulwen-gwregysdu'),
    ...createParentages(['heddwyn-gwregysdu', 'gwenllian-gwregysdu', 'rhodri-gwregysdu', 'gruffudd-gwregysdu', 'esyllt-gwregysdu'], ['idris-gwregysdu', 'eluned-gwregysdu'], 'marriage-idris-eluned-gwregysdu')
  ],
  cadetBranches: [createMarriedAwayBranch({ id: 'gruffudd-nach-bradrhith', name: 'Haus Bradrhith', parentPartnershipId: 'marriage-arianwen-gruffudd',
    houseId: 'house-bradrhith', targetFamilyId: 'haus-bradrhith', emblem: HOUSE_BRADRHITH_FAMILY.document.emblem, crestFrame: 'iron',
    subtitle: 'Gruffudds Ehe und Kinder · Bradrhith', notes: 'Ehe mit Arianwen seit 1720; Eiludd, Gwrfyw und Creirwy werden in der bestehenden Bradrhith-Akte fortgeführt.', extensions: { chartAlignBelowPartnership: true } })],
  timeJumps: [],
  lineage: { founderPartnershipId: founderMarriage, houseId, crestSubtitle: 'Vier Lagerhäuser · Klingende Münze', crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' } },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: 'bleddyn-gwregysdu', orientation: 'vertical', ancestorDepth: 12, descendantDepth: 12, limitGenerations: false, showSiblings: true },
  extensions: { blankFamily: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1', houseBiographyModule: buildGwregysduHouseBiography(),
    sourceNote: 'Autorenauftrag vom 18.10.2026: Madog Schwarzgurt und Godwyn Doeth, beruflicher Aufstieg, eheliche Ressourcenverbindungen, vier Lagerhäuser der Klingenden Münze, ein leitender Onkel mit zwei Söhnen, Gruffudd als wegverheiratete Nebenlinie. Namen und Lebensdaten der neuen Generationen sind ergänzende Ausarbeitung; sie stammen nicht aus der Anhörung. Gruffudds bestehende Weltpersonen-ID, Haft, Ehe und Kinder bleiben erhalten. Drei ältere und ein jüngeres Geschwister bewahren seinen bestehenden Rang als viertes von fünf Kindern. Angeheiratete Frauen sind Cenyri mit zunächst offenem Herkunftshaus. Keine behauptete Übernahme des Bradrhith-Hofs.' }
});
