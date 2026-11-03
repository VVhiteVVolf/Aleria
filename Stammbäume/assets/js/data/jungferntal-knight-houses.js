// Zwei am 3. November 2026 ausdrücklich beauftragte neue Jungferntal-Häuser.
// Vorhandene Rhelian-/Aelryn-Gründer und sämtliche anderen Familien bleiben unberührt.
import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { SONNENKUESTE_HOUSE_EMBLEMS, SONNENKUESTE_HOUSE_PROFILES } from './sonnenkueste-house-profiles.js?v=20261103-sonnenkueste-v1';

function person(slug, id, name, sex, birth, options = {}) {
  return createFamilyPerson({
    id, name, sex, birth, death: options.death || '',
    houseId: options.married ? '' : `house-${slug}`,
    worldPersonId: `person--haus-${slug}--${id}`,
    familyRole: options.married ? 'married' : 'core',
    lineageRole: options.lineageRole || 'branch', title: options.title || '', notes: options.notes || '',
    portrait: '', portraitPlaceholder: 'auto'
  });
}

function family(slug, title, motto, founding, founderPartnershipId, headId, persons, partnerships, childGroups) {
  return Object.freeze({
    schema: 'aleria.family-tree', schemaVersion: 1,
    document: {
      id: `haus-${slug}`, title, motto,
      description: `${title} ist ein Ritterherrenhaus aus Carngol im Jungferntal und dient Haus Morforwyn. Gegründet ${founding}.`,
      emblem: SONNENKUESTE_HOUSE_EMBLEMS[slug], houseProfile: SONNENKUESTE_HOUSE_PROFILES[slug]
    },
    houses: [{ id: `house-${slug}`, name: title, motto, emblem: SONNENKUESTE_HOUSE_EMBLEMS[slug], status: 'active' }],
    persons, partnerships,
    parentages: childGroups.flatMap(([partnershipId, childIds]) => createParentages(
      childIds, partnerships.find(partnership => partnership.id === partnershipId).participantIds, partnershipId, { idPrefix: `${slug}-parentage` }
    )),
    cadetBranches: [], timeJumps: [],
    lineage: {
      founderPartnershipId, houseId: `house-${slug}`,
      crestSubtitle: `Ritterherrenhaus von Carngol · Jungferntal · im Dienst der Morforwyn · seit ${founding}`,
      crestEmblemScale: 0.86, crestFrame: 'silver', crestFrameScale: 1,
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
    view: { focusPersonId: headId, orientation: 'vertical', ancestorDepth: 8, descendantDepth: 8, limitGenerations: false, showSiblings: true },
    extensions: {
      blankFamily: false, sourceRevision: 1,
      sourceModule: 'Autorenfestlegung Jungferntal vom 3. November 2026',
      sourceNote: 'Ausdrücklich neu beauftragtes Ritterherrenhaus, keine Rekonstruktion aus Altdaten. Drei vollständig benannte Generationen; keine Ergänzung oder Umbenennung bestehender Personen. Ort Carngol/Jungferntal und unmittelbarer Dienst unter Morforwyn. Es werden keine zusätzlichen Häuser für unbenannte Herkunftsfamilien eingeheirateter Partner erfunden. Keine Militärstatistiken oder mechanischen Ausrüstungsdaten.'
    }
  });
}

const caerwenPersons = [
  person('caerwen', 'geraint-caerwen', 'Geraint Caerwen', 'male', '1648', { death: '1716', lineageRole: 'mainline', title: 'Gründer und erster Ritterherr des Hauses Caerwen seit 1698', notes: 'Erhielt das kleine Lehen für seinen langjährigen Dienst an Wegen und Holzstegen des Jungferntals.' }),
  person('caerwen', 'hedwen-caerwen-spouse', 'Hedwen', 'female', '1652', { death: '1725', married: true, title: 'Mitgründerin des Hauses Caerwen', notes: 'Führte die Vorräte und die Abrechnungen des jungen Haushalts.' }),
  person('caerwen', 'rhydian-caerwen', 'Rhydian Caerwen', 'male', '1680', { lineageRole: 'head', title: 'Ritterherr und Oberhaupt des Hauses Caerwen seit 1716', notes: 'Verantwortet den Ritterdienst und die Instandhaltung der dem Haus anvertrauten Wege.' }),
  person('caerwen', 'mair-caerwen-spouse', 'Mair', 'female', '1684', { married: true, title: 'Herrin des Caerwen-Haushalts', notes: 'Verwaltet Vorräte und führt die Haushaltsbücher.' }),
  person('caerwen', 'eluned-caerwen', 'Eluned Caerwen', 'female', '1686', { title: 'Schwester Rhydians', notes: 'Betreut Lieferabsprachen und die Versorgung der zum Haus gehörenden Arbeitsleute.' }),
  person('caerwen', 'cormac-caerwen-spouse', 'Cormac', 'male', '1683', { married: true, notes: 'Lebt mit Eluned im Caerwen-Haushalt; seine Herkunftsfamilie ist nicht ausgearbeitet.' }),
  person('caerwen', 'celyn-caerwen', 'Celyn Caerwen', 'male', '1704', { lineageRole: 'mainline', title: 'Erster Erbe des Hauses Caerwen', notes: 'Übernimmt Weggänge und die Abstimmung mit den örtlichen Fuhrleuten.' }),
  person('caerwen', 'meriel-caerwen', 'Meriel Caerwen', 'female', '1708', { notes: 'Unterstützt Mair bei Schriftverkehr und Vorratslisten.' }),
  person('caerwen', 'gwern-caerwen', 'Gwern Caerwen', 'male', '1715', { lineageRole: 'mainline', title: 'Zweiter Erbe des Hauses Caerwen', notes: 'Begleitet die örtlichen Sicherungs- und Versorgungsdienste.' }),
  person('caerwen', 'catrin-caerwen', 'Catrin Caerwen', 'female', '1711', { notes: 'Tochter Eluneds und Cormacs; lebt im gemeinsamen Familienhaushalt.' })
];
const caerwenPartnerships = [
  createMarriage('marriage-geraint-hedwen-caerwen', 'geraint-caerwen', 'hedwen-caerwen-spouse', { start: '1678', status: 'ended', end: '1716' }),
  createMarriage('marriage-rhydian-mair-caerwen', 'rhydian-caerwen', 'mair-caerwen-spouse', { start: '1702' }),
  createMarriage('marriage-eluned-cormac-caerwen', 'eluned-caerwen', 'cormac-caerwen-spouse', { start: '1709' })
];

export const HOUSE_CAERWEN_FAMILY = family(
  'caerwen', "Haus Caerwen O'Carngol", 'Fest verwurzelt, wach am Wasser.', '1698',
  'marriage-geraint-hedwen-caerwen', 'rhydian-caerwen', caerwenPersons, caerwenPartnerships,
  [
    ['marriage-geraint-hedwen-caerwen', ['rhydian-caerwen', 'eluned-caerwen']],
    ['marriage-rhydian-mair-caerwen', ['celyn-caerwen', 'meriel-caerwen', 'gwern-caerwen']],
    ['marriage-eluned-cormac-caerwen', ['catrin-caerwen']]
  ]
);

const nerwynnPersons = [
  person('nerwynn', 'aneurin-nerwynn', 'Aneurin Nerwynn', 'male', '1655', { death: '1727', lineageRole: 'mainline', title: 'Gründer und erster Ritterherr des Hauses Nerwynn seit 1706', notes: 'Begründete den Ritterhaushalt aus dem Dienst an den kleinen Wasserübergängen im Umfeld Carngols.' }),
  person('nerwynn', 'efa-nerwynn-spouse', 'Efa', 'female', '1658', { death: '1728', married: true, title: 'Mitgründerin des Hauses Nerwynn', notes: 'Ordnete die Versorgung der Reisenden und die Haushaltsvorräte.' }),
  person('nerwynn', 'cadell-nerwynn', 'Cadell Nerwynn', 'male', '1687', { lineageRole: 'head', title: 'Ritterherr und Oberhaupt des Hauses Nerwynn seit 1727', notes: 'Verbindet den Ritterdienst mit der Aufsicht über die dem Haus anvertrauten Übergänge.' }),
  person('nerwynn', 'rhoswen-nerwynn-spouse', 'Rhoswen', 'female', '1691', { married: true, title: 'Herrin des Nerwynn-Haushalts', notes: 'Führt Lieferabsprachen und Vorratshaltung.' }),
  person('nerwynn', 'gweneth-nerwynn', 'Gweneth Nerwynn', 'female', '1690', { title: 'Schwester Cadells', notes: 'Betreut den Schriftverkehr des Hauses und hilft bei der Unterbringung von Reisenden.' }),
  person('nerwynn', 'owein-nerwynn', 'Owein Nerwynn', 'male', '1712', { lineageRole: 'mainline', title: 'Erster Erbe des Hauses Nerwynn', notes: 'Begleitet seinen Vater im Dienst und lernt die örtlichen Wege und Wasserstände kennen.' }),
  person('nerwynn', 'iorwen-nerwynn', 'Iorwen Nerwynn', 'female', '1715', { notes: 'Unterstützt Gweneth bei Briefen und Lieferlisten.' }),
  person('nerwynn', 'bleddyn-nerwynn', 'Bleddyn Nerwynn', 'male', '1722', { lineageRole: 'mainline', title: 'Zweiter Erbe des Hauses Nerwynn', notes: 'Jüngster Sohn Cadells und Rhoswens; steht noch am Anfang seines Hausdienstes.' })
];
const nerwynnPartnerships = [
  createMarriage('marriage-aneurin-efa-nerwynn', 'aneurin-nerwynn', 'efa-nerwynn-spouse', { start: '1684', status: 'ended', end: '1727' }),
  createMarriage('marriage-cadell-rhoswen-nerwynn', 'cadell-nerwynn', 'rhoswen-nerwynn-spouse', { start: '1710' })
];

export const HOUSE_NERWYNN_FAMILY = family(
  'nerwynn', "Haus Nerwynn O'Carngol", 'Wir halten den Übergang.', '1706',
  'marriage-aneurin-efa-nerwynn', 'cadell-nerwynn', nerwynnPersons, nerwynnPartnerships,
  [
    ['marriage-aneurin-efa-nerwynn', ['cadell-nerwynn', 'gweneth-nerwynn']],
    ['marriage-cadell-rhoswen-nerwynn', ['owein-nerwynn', 'iorwen-nerwynn', 'bleddyn-nerwynn']]
  ]
);

export const JUNGFERNTAL_KNIGHT_HOUSE_FAMILIES = Object.freeze([HOUSE_CAERWEN_FAMILY, HOUSE_NERWYNN_FAMILY]);
