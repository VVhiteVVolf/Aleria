import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const TEYRNGARCH_HOUSE_ID = 'house-teyrngarch';
const TEYRNGARCH_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId: options.houseId === undefined ? TEYRNGARCH_HOUSE_ID : options.houseId,
    portrait: HOUSE_TEYRNGARCH_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['taredd-teyrngarch', 'sulwen-teyrngarch'],
  ercwiff: ['morgaine-illewod', 'ercwiff-teyrngarch'],
  lanette: ['lanette-teyrngarch', 'quinlan-luga'],
  saselia: ['saselia-teyrngarch', 'glendower-canwyll'],
  seithved: ['seithved-teyrngarch', 'siriol-llwynog'],
  yvaine: ['yvaine-teyrngarch', 'garselid-gwarchod'],
  gwastad: ['eilonwy-penderyn', 'gwastad-teyrngarch'],
  mairwen: ['gareth-penderyn', 'mairwen-teyrngarch'],
  lugh: ['cariad-wylan', 'lugh-teyrngrach'],
  edlym: ['edlym-teyrngarch', 'tegin-blach'],
  marwine: ['marwine-teyrngarch', 'donnagh-heaghra'],
  gaenor: ['elen-illewod', 'gaenor-teyrngarch'],
  siona: ['siona-teyrngarch', 'fotor-tir-addawol'],
  arfon: ['arfon-teyrngarch', 'annegret-schwarzdorn'],
  brannoc: ['brannoc-teyrngarch', 'eimear-marcaigh'],
  shylene: ['shylene-teyrngarch', 'gwifredd-illwath'],
  elinor: ['dwnn-penderyn', 'elinor-teyrngarch']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-taredd-sulwen-teyrngarch': COUPLES.founders,
  'marriage-morgaine-ercwiff': COUPLES.ercwiff,
  'marriage-seithved-siriol-teyrngarch': COUPLES.seithved,
  'marriage-eilonwy-gwastad-teyrngarch': COUPLES.gwastad,
  'marriage-cariad-lugh': COUPLES.lugh,
  'marriage-edlym-tegin-teyrngarch': COUPLES.edlym,
  'marriage-elen-gaenor': COUPLES.gaenor,
  'marriage-arfon-annegret-teyrngarch': COUPLES.arfon,
  'marriage-brannoc-eimear-teyrngarch': COUPLES.brannoc
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'teyrngarch-parentage', ...options }
  );
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_TEYRNGARCH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-teyrngarch',
    title: "Haus Teyrngarch O'Aberon",
    motto: '',
    description: 'Ritterfürstliches Brauerhaus aus Aberon. Taredd der Braumeister begründete den Wohlstand des Hauses; seine Nachkommen verbanden Brauhandwerk, Handel und ritterlichen Dienst.',
    emblem: TEYRNGARCH_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.teyrngarch
  },
  houses: [
    house(TEYRNGARCH_HOUSE_ID, "Haus Teyrngarch O'Aberon", TEYRNGARCH_EMBLEM),
    house('house-illewod', "Haus Illewod O'Aberon", SONNENKUESTE_HOUSE_EMBLEMS.illewod),
    house('house-luga', 'Haus Luga'),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-llwynog', 'Haus Llwynog', SONNENKUESTE_HOUSE_EMBLEMS.llwynog),
    house('house-gwarchod', 'Haus Gwarchod'),
    house('house-penderyn', 'Haus Penderyn', VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn),
    house('house-wylan', 'Haus Wylan', 'assets/images/houses/Weidebucht/haus-wylan.png'),
    house('house-blach', 'Haus Blach', SONNENKUESTE_HOUSE_EMBLEMS.blach),
    house('house-heaghra', 'Haus Heaghra'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-schwarzdorn', 'Haus Schwarzdorn'),
    house('house-marcaigh', 'Haus Marcaigh'),
    house('house-illwath', 'Haus Illwath', SONNENKUESTE_HOUSE_EMBLEMS.illwath)
  ],
  persons: [
    person('taredd-teyrngarch', 'Taredd der Braumeister', 'male', '????', '????', {
      title: 'Braumeister · Gründer des Hauses Teyrngarch',
      lineageRole: 'head',
      notes: 'Begründete mit seinem weithin bekannten Bier, seinen Brauereien und Handelsbeziehungen den Aufstieg des Hauses.'
    }),
    spouse('sulwen-teyrngarch', 'Sulwen', 'female', '????', '????', {
      houseId: TEYRNGARCH_HOUSE_ID,
      title: 'Mitgründerin des Hauses Teyrngarch'
    }),

    person('ercwiff-teyrngarch', 'Ercwiff Teyrngarch', 'male', '1590', '1641', {
      title: 'Ritterfürst des Hauses Teyrngarch bis 1641',
      lineageRole: 'head'
    }),
    person('lanette-teyrngarch', 'Lanette Teyrngarch', 'female', '1605', '1697', {
      title: 'Wegverheiratet an Haus Luga',
      tags: ['Wegverheiratet']
    }),
    spouse('morgaine-illewod', 'Morgaine Illewod', 'female', '1594', '1649', {
      houseId: 'house-illewod'
    }),
    spouse('quinlan-luga', 'Quinlan Luga', 'male', '1600', '1684', {
      houseId: 'house-luga'
    }),

    person('saselia-teyrngarch', 'Saselia Teyrngarch', 'female', '1634', '1701', {
      title: 'Wegverheiratet an Haus Canwyll',
      tags: ['Wegverheiratet']
    }),
    person('seithved-teyrngarch', 'Seithved Teyrngarch', 'male', '1630', '1691', {
      title: 'Ritterfürst des Hauses Teyrngarch von 1641 bis 1691',
      lineageRole: 'head'
    }),
    person('yvaine-teyrngarch', 'Yvaine Teyrngarch', 'female', '1630', '1700', {
      title: 'Wegverheiratet an Haus Gwarchod',
      tags: ['Wegverheiratet']
    }),
    spouse('glendower-canwyll', 'Glendower Canwyll', 'male', '1629', '1698', {
      houseId: 'house-canwyll'
    }),
    spouse('siriol-llwynog', 'Siriol Llwynog', 'female', '1633', '1711', {
      houseId: 'house-llwynog'
    }),
    spouse('garselid-gwarchod', 'Garselid Gwarchod', 'male', '1628', '1699', {
      houseId: 'house-gwarchod'
    }),

    person('gwastad-teyrngarch', 'Gwastad Teyrngarch', 'male', '1651', '1725', {
      title: 'Ritterfürst des Hauses Teyrngarch von 1691 bis 1725',
      lineageRole: 'head'
    }),
    person('mairwen-teyrngarch', 'Mairwen Teyrngarch', 'female', '1655', '1710', {
      title: 'Wegverheiratet an Haus Penderyn',
      tags: ['Wegverheiratet']
    }),
    spouse('eilonwy-penderyn', 'Eilonwyn Penderyn', 'female', '1652', '1700', {
      houseId: 'house-penderyn',
      notes: 'Die Teyrngarch-Quelle schreibt Eilonwyn und lässt ihre Daten offen; die Penderyn-Gegenakte belegt 1652–1700 und verwendet die Variante Eilonwy.'
    }),
    spouse('gareth-penderyn', 'Gareth Penderyn', 'male', '1650', '1724', {
      houseId: 'house-penderyn'
    }),

    person('lugh-teyrngrach', 'Lugh Teyrngarch', 'male', '1669', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Teyrngarch seit 1725',
      lineageRole: 'head',
      notes: 'Die historische technische ID aus der Wylan-Gegenakte bleibt erhalten; die sichtbare Schreibweise folgt der Hausquelle Teyrngarch.'
    }),
    person('edlym-teyrngarch', 'Edlym Teyrngarch', 'male', '1675', ''),
    person('marwine-teyrngarch', 'Marwine Teyrngarch', 'female', '1677', '', {
      title: 'Wegverheiratet an Haus Heaghra',
      tags: ['Wegverheiratet']
    }),
    person('heledd-teyrngarch', 'Heledd Teyrngarch', 'female', '1680', ''),
    spouse('cariad-wylan', 'Cariad Wylan', 'female', '1676', '', {
      houseId: 'house-wylan'
    }),
    spouse('tegin-blach', 'Tegin Blach', 'female', '1674', '', {
      houseId: 'house-blach'
    }),
    spouse('donnagh-heaghra', 'Donnagh Heaghra', 'male', '1672', '', {
      houseId: 'house-heaghra'
    }),

    person('gaenor-teyrngarch', 'Gaenor Teyrngarch', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Teyrngarch',
      lineageRole: 'mainline'
    }),
    person('siona-teyrngarch', 'Siona Teyrngarch', 'female', '1700', '', {
      title: 'Wegverheiratet an Haus Tir Addawol',
      tags: ['Wegverheiratet']
    }),
    person('arfon-teyrngarch', 'Arfon Teyrngarch', 'male', '1697', ''),
    person('brannoc-teyrngarch', 'Brannoc Teyrngarch', 'male', '1695', ''),
    person('shylene-teyrngarch', 'Shylene Teyrngarch', 'female', '1700', '', {
      title: 'Wegverheiratet an Haus Illwath',
      tags: ['Wegverheiratet']
    }),
    spouse('elen-illewod', 'Elen Illewod', 'female', '1698', '', {
      houseId: 'house-illewod'
    }),
    spouse('fotor-tir-addawol', 'Fotor Tir Addawol', 'male', '1696', '', {
      houseId: 'house-tir-addawol'
    }),
    spouse('annegret-schwarzdorn', 'Annegret Schwarzdorn', 'female', '1696', '', {
      houseId: 'house-schwarzdorn'
    }),
    spouse('eimear-marcaigh', 'Eimear Marcaigh', 'female', '1697', '', {
      houseId: 'house-marcaigh'
    }),
    spouse('gwifredd-illwath', 'Gwifredd Illwath', 'male', '1697', '', {
      houseId: 'house-illwath'
    }),

    person('elinor-teyrngarch', 'Elinor Teyrngarch', 'female', '1718', '', {
      title: 'Wegverlobt an Haus Penderyn',
      tags: ['Wegverlobt']
    }),
    person('gandwy-teyrngarch', 'Gandwy Teyrngarch', 'male', '1720', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('olwen-teyrngarch', 'Olwen Teyrngarch', 'female', '1722', ''),
    person('iona-teyrngarch', 'Iona Teyrngarch', 'female', '1724', ''),
    person('evrel-teyrngarch', 'Evrel Teyrngarch', 'female', '1725', ''),
    person('dafi-teyrngarch', 'Dafi Teyrngarch', 'male', '1718', ''),
    person('wendy-teyrngarch', 'Wendy Teyrngarch', 'female', '1720', ''),
    person('cadfan-teyrngarch', 'Cadfan Teyrngarch', 'male', '1717', ''),
    person('elen-1721-teyrngarch', 'Elen Teyrngarch', 'female', '1721', ''),
    person('grippuid-teyrngarch', 'Grippuid Teyrngarch', 'male', '1723', ''),
    spouse('dwnn-penderyn', 'Dwnn Penderyn', 'male', '1720', '', {
      houseId: 'house-penderyn'
    })
  ],
  partnerships: [
    createMarriage('marriage-taredd-sulwen-teyrngarch', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-morgaine-ercwiff', ...COUPLES.ercwiff, { status: 'ended', end: '1641' }),
    createMarriage('marriage-lanette-quinlan-teyrngarch', ...COUPLES.lanette, { status: 'ended', end: '1684' }),
    createMarriage('marriage-saselia-glendower-teyrngarch', ...COUPLES.saselia, { status: 'ended', end: '1698' }),
    createMarriage('marriage-seithved-siriol-teyrngarch', ...COUPLES.seithved, { status: 'ended', end: '1691' }),
    createMarriage('marriage-yvaine-garselid-teyrngarch', ...COUPLES.yvaine, { status: 'ended', end: '1699' }),
    createMarriage('marriage-eilonwy-gwastad-teyrngarch', ...COUPLES.gwastad, { status: 'ended', end: '1700' }),
    createMarriage('marriage-gareth-mairwen-penderyn', ...COUPLES.mairwen, { status: 'ended', end: '1710' }),
    createMarriage('marriage-cariad-lugh', ...COUPLES.lugh),
    createMarriage('marriage-edlym-tegin-teyrngarch', ...COUPLES.edlym),
    createMarriage('marriage-marwine-donnagh-teyrngarch', ...COUPLES.marwine),
    createMarriage('marriage-elen-gaenor', ...COUPLES.gaenor),
    createMarriage('marriage-siona-fotor-teyrngarch', ...COUPLES.siona),
    createMarriage('marriage-arfon-annegret-teyrngarch', ...COUPLES.arfon),
    createMarriage('marriage-brannoc-eimear-teyrngarch', ...COUPLES.brannoc),
    createMarriage('marriage-shylene-gwifredd-teyrngarch', ...COUPLES.shylene),
    createMarriage('engagement-dwnn-elinor-teyrngarch', ...COUPLES.elinor, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['ercwiff-teyrngarch', 'lanette-teyrngarch'], 'marriage-taredd-sulwen-teyrngarch', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Taredd und der ab 1590 datierten Generation sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-taredd-to-ercwiff-lanette-teyrngarch' }
    }),
    ...childrenOf(
      ['saselia-teyrngarch', 'seithved-teyrngarch', 'yvaine-teyrngarch'],
      'marriage-morgaine-ercwiff'
    ),
    ...childrenOf(['gwastad-teyrngarch', 'mairwen-teyrngarch'], 'marriage-seithved-siriol-teyrngarch'),
    ...childrenOf(
      ['lugh-teyrngrach', 'edlym-teyrngarch', 'marwine-teyrngarch', 'heledd-teyrngarch'],
      'marriage-eilonwy-gwastad-teyrngarch'
    ),
    ...childrenOf(['gaenor-teyrngarch', 'siona-teyrngarch'], 'marriage-cariad-lugh'),
    ...childrenOf(
      ['arfon-teyrngarch', 'brannoc-teyrngarch', 'shylene-teyrngarch'],
      'marriage-edlym-tegin-teyrngarch'
    ),
    ...childrenOf(
      ['elinor-teyrngarch', 'gandwy-teyrngarch', 'olwen-teyrngarch', 'iona-teyrngarch', 'evrel-teyrngarch'],
      'marriage-elen-gaenor'
    ),
    ...childrenOf(['dafi-teyrngarch', 'wendy-teyrngarch'], 'marriage-arfon-annegret-teyrngarch'),
    ...childrenOf(
      ['cadfan-teyrngarch', 'elen-1721-teyrngarch', 'grippuid-teyrngarch'],
      'marriage-brannoc-eimear-teyrngarch'
    )
  ],
  cadetBranches: [
    marriedAway('married-away-lanette-teyrngarch-luga', 'Haus Luga', 'marriage-lanette-quinlan-teyrngarch', 'house-luga'),
    marriedAway('married-away-saselia-teyrngarch-canwyll', 'Haus Canwyll', 'marriage-saselia-glendower-teyrngarch', 'house-canwyll'),
    marriedAway('married-away-yvaine-teyrngarch-gwarchod', 'Haus Gwarchod', 'marriage-yvaine-garselid-teyrngarch', 'house-gwarchod'),
    marriedAway('married-away-mairwen-teyrngarch-penderyn', 'Haus Penderyn', 'marriage-gareth-mairwen-penderyn', 'house-penderyn', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn
    }),
    marriedAway('married-away-marwine-teyrngarch-heaghra', 'Haus Heaghra', 'marriage-marwine-donnagh-teyrngarch', 'house-heaghra'),
    marriedAway('married-away-siona-teyrngarch-tir-addawol', 'Haus Tir Addawol', 'marriage-siona-fotor-teyrngarch', 'house-tir-addawol'),
    marriedAway('married-away-shylene-teyrngarch-illwath', 'Haus Illwath', 'marriage-shylene-gwifredd-teyrngarch', 'house-illwath', {
      emblem: SONNENKUESTE_HOUSE_EMBLEMS.illwath
    }),
    marriedAway('married-away-elinor-teyrngarch-penderyn', 'Haus Penderyn', 'engagement-dwnn-elinor-teyrngarch', 'house-penderyn', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
      subtitle: 'Wegverlobt an Haus Penderyn',
      notes: 'Elinor bleibt bis zur Eheschließung ein legitimes Kernmitglied des Hauses Teyrngarch; der Zielknoten dokumentiert ihre Verlobung mit Dwnn Penderyn.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-taredd-to-ercwiff-lanette-teyrngarch',
      parentPartnershipId: 'marriage-taredd-sulwen-teyrngarch',
      parentPersonId: '',
      childIds: ['ercwiff-teyrngarch', 'lanette-teyrngarch'],
      years: 0,
      fromYear: '????',
      toYear: '1590',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen. Ercwiff und Lanette beginnen ausschließlich unter diesem Zeitsprung; der Sprung steht zu keinem Personen- oder Hausknoten parallel.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-taredd-sulwen-teyrngarch',
    houseId: TEYRNGARCH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Brauerhaus aus Aberon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'taredd-teyrngarch',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Teyrngarch O'Aberon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Elternschaften, Amtsfolge und Porträts folgen der bereitgestellten Teyrngarch-Tabelle. Der dort mit Punkten markierte Überlieferungssprung wird als einziger serieller Zeitsprung unmittelbar nach Taredd, Sulwen und dem Hauswappen geführt. Lanette, Saselia, Yvaine, Mairwen, Marwine, Siona und Shylene besitzen direkte Wegverheiratet-Knoten; Elinor entsprechend einen Wegverlobt-Knoten zu Haus Penderyn. Geteilte Weltpersonen und Partnerschaften mit Illewod, Penderyn und Wylan verwenden dieselben technischen IDs. Nachkommen werden nur in der jeweils fortgesetzten Herkunftsakte geführt: Lugh/Cariad und Gwastad/Eilonwyn ausschließlich hier, Mairwen/Gareth ausschließlich bei Penderyn. Die technische Lugh-ID lugh-teyrngrach bleibt wegen der vorhandenen Wylan-Gegenakte stabil, während der sichtbare Name korrigiert ist. Wiederholte generische Silhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    chartViewport: { initialPosition: 'focus', initialScale: 0.5 }
  }
});
