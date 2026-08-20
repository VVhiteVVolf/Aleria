import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_VRAGI_PORTRAITS } from './house-vragi-portraits.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const VRAGI_HOUSE_ID = 'house-vragi';
const FOUNDER_GAP_ID = 'gap-knar-odinhild-to-munin-modgud-vragi';
const MAGNUS_GAP_ID = 'gap-modgud-torgun-to-magnus-vragi';
const INTERNAL_MARRIAGE_ID = 'marriage-stenvar-monhild-vragi';

const HOUSE_EMBLEMS = Object.freeze({
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr || ''
});

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

const HEAD_IDS = new Set([
  'knar-vragi',
  'modgud-vragi',
  'magnus-vragi',
  'hrafnkell-vragi',
  'araldr-vragi',
  'egil-vragi',
  'stenvar-vragi',
  'tjodmar-vragi'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? VRAGI_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_VRAGI_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === VRAGI_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-knar-odinhild-vragi': ['knar-vragi', 'odinhild'],
  'marriage-modgud-torgun-vragi': ['modgud-vragi', 'torgun'],
  'marriage-magnus-jutha-vragi': ['magnus-vragi', 'jutha'],
  'marriage-valdis-hrafnkell-nachtjaeger': ['hrafnkell-vragi', 'valdis-nachtjaeger'],
  'marriage-fannar-islaug-varangr': ['fannar-varangr', 'islaug-vragi'],
  'marriage-thurid-araldr-ragnulf': ['araldr-vragi', 'thurid-ragnulf'],
  'marriage-herleif-branhildr-schwarzblut': ['herleif-schwarzblut', 'branhildr-vragi'],
  'marriage-alrek-gislaug-vragi': ['alrek-vragi', 'gislaug'],
  'marriage-vidkun-grimny-vragi': ['vidkun-goldglanz', 'grimny-vragi'],
  'marriage-udveig-egil-silberblut': ['egil-vragi', 'udveig-silberblut'],
  'marriage-gyda-morskar-blutstahl': ['morskar-vragi', 'gyda-blutstahl'],
  'marriage-solmund-gudrun-schmetterschild': ['solmund-schmetterschild', 'gudrun-vragi'],
  'marriage-bhaltair-mjoldhild-vragi': ['bhaltair-allella', 'mjoldhild-vragi'],
  [INTERNAL_MARRIAGE_ID]: ['stenvar-vragi', 'monhild-vragi'],
  'marriage-idmar-drifa-vragi': ['idmar-sturmgeborener', 'drifa-vragi'],
  'marriage-iseld-tjodmar-varangr': ['tjodmar-vragi', 'iseld-varangr'],
  'marriage-burin-astridur-helgr': ['burin-helgr', 'astridur-vragi']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignChildGroupBelowParentPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: ['chartAlignChildGroupBelowParentPair']
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'vragi-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'vragi-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '', subtitle = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: subtitle || `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_VRAGI_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-vragi',
    title: 'Clan Vragi',
    motto: '',
    description: 'Hesirenclan aus Rabenhain im Rabenforst. Die vollständige Vragi-Linie reicht von Knar und Odinhild über zwei überlieferungsbedingte Generationensprünge bis zu den Kindern Tjodmars im Jahr 1740.',
    emblem: HOUSE_EMBLEMS.vragi,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.vragi
  },
  houses: [
    house(VRAGI_HOUSE_ID, 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-allella', 'Clan Allella'),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-luga', 'Clan Luga')
  ],
  persons: [
    person('knar-vragi', 'Knar Vragi', 'male', '????', '????', {
      title: 'Gründer des Clans Vragi', tags: ['Gründer']
    }),
    spouse('odinhild', 'Odinhild', 'female', '????', '????', '', {
      title: 'Mitgründerin des Clans Vragi', tags: ['Gründerin']
    }),

    person('munin-vragi', 'Munin Vragi', 'male', '????', '1621'),
    person('modgud-vragi', 'Modgud Vragi', 'male', '????', '????'),
    spouse('torgun', 'Torgun', 'female', '????', '????'),

    person('magnus-vragi', 'Magnus Vragi', 'male', '1582', '1660'),
    spouse('jutha', 'Jutha', 'female', '????', '????'),

    person('hrafnkell-vragi', 'Hrafnkell Vragi', 'male', '1610', '1677'),
    awayWoman('islaug-vragi', 'Islaug Vragi', '1615', '1722', 'Clan Varangr'),
    person('hugin-vragi', 'Hugin Vragi', 'male', '1621', ''),
    spouse('valdis-nachtjaeger', 'Valdís Nachtjäger', 'female', '1614', '1701', 'house-nachtjaeger'),
    spouse('fannar-varangr', 'Fannar Varangr', 'male', '1615', '1641', 'house-varangr'),

    person('araldr-vragi', 'Araldr Vragi', 'male', '1629', '1681'),
    awayWoman('branhildr-vragi', 'Branhildr Vragi', '1631', '1698', 'Clan Schwarzblut'),
    person('alrek-vragi', 'Alrek Vragi', 'male', '1634', '1671'),
    spouse('thurid-ragnulf', 'Thurid Ragnulf', 'female', '1634', '????', 'house-ragnulf'),
    spouse('herleif-schwarzblut', 'Herleif Schwarzblut', 'male', '1630', '1694', 'house-schwarzblut'),
    spouse('gislaug', 'Gislaug', 'female', '????', '????'),

    awayWoman('grimny-vragi', 'Grimny Vragi', '1652', '1739', 'Clan Goldglanz'),
    person('egil-vragi', 'Egil Vragi', 'male', '1654', '1728'),
    person('morskar-vragi', 'Morskar Vragi', 'male', '1651', '1699', {
      notes: 'Die Kinderüberschrift der Quelle nennt an einer Stelle abweichend „Mirhild“; Personenzeile und Stammbaumgrafik bestätigen Morskar.'
    }),
    awayWoman('gudrun-vragi', 'Gudrun Vragi', '1651', '1735', 'Clan Schmetterschild'),
    spouse('vidkun-goldglanz', 'Vidkun Goldglanz', 'male', '1653', '1720', 'house-goldglanz', {
      notes: 'Die Goldglanz-Stammhausquelle führt 1720; die ältere Vragi-Quelle nannte 1716.'
    }),
    spouse('udveig-silberblut', 'Udveig Silberblut', 'female', '1652', '1709', 'house-silberblut'),
    spouse('gyda-blutstahl', 'Gyda Blutstahl', 'female', '1653', '1694', 'house-blutstahl'),
    spouse('solmund-schmetterschild', 'Solmund Schmetterschild', 'male', '1649', '1725', 'house-schmetterschild'),

    awayWoman('mjoldhild-vragi', 'Mjoldhild Vragi', '1673', '1735', 'Clan Allella'),
    person('stenvar-vragi', 'Stenvar Vragi', 'male', '1675', '', {
      extensions: {
        chartPartnerMirrorForPartnershipIds: [INTERNAL_MARRIAGE_ID],
        registryManagedExtensionFields: ['chartPartnerMirrorForPartnershipIds']
      }
    }),
    awayWoman('monhild-vragi', 'Monhild Vragi', '1676', '', 'Clan Vragi', {
      title: 'Wegverheiratet innerhalb des Clans Vragi',
      extensions: {
        chartRepeatForPartnershipIds: [INTERNAL_MARRIAGE_ID],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    awayWoman('drifa-vragi', 'Drifa Vragi', '1677', '', 'Clan Sturmgeborene'),
    spouse('bhaltair-allella', 'Bhaltair Allella', 'male', '????', '????', 'house-allella'),
    spouse('idmar-sturmgeborener', 'Idmar Sturmgeborener', 'male', '1673', '', 'house-sturmgeborene'),

    person('tjodmar-vragi', 'Tjodmar Vragi', 'male', '1696', ''),
    awayWoman('astridur-vragi', 'Astridur Vragi', '1703', '', 'Clan Helgr'),
    person('wjolf-vragi', 'Wjolf Vragi', 'male', '1700', ''),
    spouse('iseld-varangr', 'Iseld Varangr', 'female', '1699', '', 'house-varangr', {
      notes: 'Die ältere Stammbaumgrafik nennt sie „Tirsla“; die aktuelle Tabelle und die kanonische Varangr-Gegenakte führen Iseld Varangr.'
    }),
    spouse('burin-helgr', 'Burin Helgr', 'male', '1700', '', 'house-helgr'),

    person('pjalki-vragi', 'Pjalki Vragi', 'male', '1720', ''),
    person('konall-vragi', 'Konall Vragi', 'male', '1722', ''),
    person('snorra-vragi', 'Snorra Vragi', 'female', '1726', ''),
    person('odlis-vragi', 'Odlis Vragi', 'female', '1729', ''),
    person('artair-luga', 'Artair Luga', 'male', '????', '', {
      houseId: 'house-luga',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Tjodmar Vragis',
      tags: ['Mündel'],
      notes: 'Artair ist Tjodmars Mündel und kein leiblicher Vragi-Spross.'
    })
  ],
  partnerships: [
    alignChildGroupBelowParentPair(partnership('marriage-knar-odinhild-vragi', { status: 'ended' })),
    alignChildGroupBelowParentPair(partnership('marriage-modgud-torgun-vragi', { status: 'ended' })),
    alignChildGroupBelowParentPair(partnership('marriage-magnus-jutha-vragi', { status: 'ended', end: '1660' })),
    alignChildGroupBelowParentPair(partnership('marriage-valdis-hrafnkell-nachtjaeger', { status: 'ended', end: '1677' })),
    partnership('marriage-fannar-islaug-varangr', { status: 'ended', end: '1641' }),
    alignChildGroupBelowParentPair(partnership('marriage-thurid-araldr-ragnulf', { status: 'ended', end: '1681' })),
    partnership('marriage-herleif-branhildr-schwarzblut', { status: 'ended', end: '1694' }),
    alignChildGroupBelowParentPair(partnership('marriage-alrek-gislaug-vragi', { status: 'ended', end: '1671' })),
    partnership('marriage-vidkun-grimny-vragi', { status: 'ended', end: '1720' }),
    alignChildGroupBelowParentPair(partnership('marriage-udveig-egil-silberblut', { status: 'ended', end: '1709' })),
    alignChildGroupBelowParentPair(partnership('marriage-gyda-morskar-blutstahl', { status: 'ended', end: '1694' })),
    partnership('marriage-solmund-gudrun-schmetterschild', { status: 'ended', end: '1725' }),
    partnership('marriage-bhaltair-mjoldhild-vragi', { status: 'ended', end: '1735' }),
    alignChildGroupBelowParentPair(partnership(INTERNAL_MARRIAGE_ID)),
    partnership('marriage-idmar-drifa-vragi'),
    alignChildGroupBelowParentPair(partnership('marriage-iseld-tjodmar-varangr')),
    partnership('marriage-burin-astridur-helgr')
  ],
  parentages: [
    ...childrenOf(['munin-vragi', 'modgud-vragi'], 'marriage-knar-odinhild-vragi', {
      type: 'claimed', legitimacy: 'unknown', certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_GAP_ID }
    }),
    ...childrenOf(['magnus-vragi'], 'marriage-modgud-torgun-vragi', {
      type: 'claimed', legitimacy: 'unknown', certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: MAGNUS_GAP_ID }
    }),
    ...childrenOf(['hrafnkell-vragi', 'islaug-vragi', 'hugin-vragi'], 'marriage-magnus-jutha-vragi'),
    ...childrenOf(['araldr-vragi', 'branhildr-vragi', 'alrek-vragi'], 'marriage-valdis-hrafnkell-nachtjaeger'),
    ...childrenOf(['grimny-vragi', 'egil-vragi'], 'marriage-thurid-araldr-ragnulf'),
    ...childrenOf(['morskar-vragi', 'gudrun-vragi'], 'marriage-alrek-gislaug-vragi'),
    ...childrenOf(['mjoldhild-vragi', 'stenvar-vragi'], 'marriage-udveig-egil-silberblut'),
    ...childrenOf(['monhild-vragi', 'drifa-vragi'], 'marriage-gyda-morskar-blutstahl'),
    ...childrenOf(['tjodmar-vragi', 'astridur-vragi', 'wjolf-vragi'], INTERNAL_MARRIAGE_ID),
    ...childrenOf(['pjalki-vragi', 'konall-vragi', 'snorra-vragi', 'odlis-vragi'], 'marriage-iseld-tjodmar-varangr'),
    ...fosterChildren(['artair-luga'], 'tjodmar-vragi', 'Artair Luga ist als persönliches Mündel Tjodmars aufgenommen; es besteht keine biologische Elternschaft.')
  ],
  cadetBranches: [
    marriedAway('married-away-islaug-vragi-varangr', 'Clan Varangr', 'marriage-fannar-islaug-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-branhildr-vragi-schwarzblut', 'Clan Schwarzblut', 'marriage-herleif-branhildr-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-grimny-vragi-goldglanz', 'Clan Goldglanz', 'marriage-vidkun-grimny-vragi', 'house-goldglanz', 'haus-goldglanz', HOUSE_EMBLEMS.goldglanz),
    marriedAway('married-away-gudrun-vragi-schmetterschild', 'Clan Schmetterschild', 'marriage-solmund-gudrun-schmetterschild', 'house-schmetterschild', 'haus-schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    marriedAway('married-away-mjoldhild-vragi-allella', 'Clan Allella', 'marriage-bhaltair-mjoldhild-vragi', 'house-allella', 'haus-allella'),
    marriedAway('internal-marriage-monhild-vragi', 'Clan Vragi', INTERNAL_MARRIAGE_ID, VRAGI_HOUSE_ID, 'haus-vragi', HOUSE_EMBLEMS.vragi, 'Wegverheiratet innerhalb des Clans Vragi'),
    marriedAway('married-away-drifa-vragi-sturmgeborene', 'Clan Sturmgeborene', 'marriage-idmar-drifa-vragi', 'house-sturmgeborene', 'haus-sturmgeborene'),
    marriedAway('married-away-astridur-vragi-helgr', 'Clan Helgr', 'marriage-burin-astridur-helgr', 'house-helgr', 'haus-helgr', HOUSE_EMBLEMS.helgr)
  ],
  timeJumps: [{
    id: FOUNDER_GAP_ID,
    parentPartnershipId: 'marriage-knar-odinhild-vragi',
    parentPersonId: '',
    childIds: ['munin-vragi', 'modgud-vragi'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '????',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Vragi-Hausknoten; kein anderer Knoten steht parallel.',
    extensions: {}
  }, {
    id: MAGNUS_GAP_ID,
    parentPartnershipId: 'marriage-modgud-torgun-vragi',
    parentPersonId: '',
    childIds: ['magnus-vragi'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1582',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Zweiter absolut serieller Generationentrenner unter Modgud und Torgun.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-knar-odinhild-vragi',
    houseId: VRAGI_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Rabenhain im Rabenforst',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'knar-vragi',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 3,
    sourceModule: 'Clan Vragi (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Vragi-Stammbaum wird ohne Personenfokus von Knar und Odinhild bis zur jüngsten Generation des Jahres 1740 gezeigt. Zwei Quellenlücken sind strikt serielle absolute Generationentrenner. Auswärtig fortgeführte Kinder verbleiben in ihren Gegenakten. Stenvar und Monhild sind dieselben Weltpersonen sowohl als Angehörige ihrer Herkunftszweige als auch als Ehepaar; Monhild wird deshalb am fortgeführten Stenvar-Zweig kontrolliert wiederholt und die drei Kinder werden nur einmal geführt. Artair Luga ist ausschließlich Tjodmars aufgenommenes Mündel. Sechs namenlose Verlobten-Platzhalter der jüngsten Generation werden nicht importiert. Wiederholte Standardsilhouetten werden nicht als Individualporträts gespeichert. Vidkuns Todesjahr wurde nach seiner Goldglanz-Stammhausakte von 1716 auf 1720 vereinheitlicht.',
    sourceConflicts: [{
      field: 'persons.morskar-vragi.name',
      values: ['Morskar Vragi', 'Mirhild Vragi'],
      resolvedValue: 'Morskar Vragi',
      reason: 'Personenzeile und Stammbaumgrafik stimmen für Morskar überein; nur eine Kinderüberschrift nennt abweichend Mirhild.'
    }, {
      field: 'persons.iseld-varangr.name',
      values: ['Iseld Varangr', 'Tirsla'],
      resolvedValue: 'Iseld Varangr',
      reason: 'Aktuelle Tabelle und kanonische Varangr-Gegenakte stimmen für Iseld überein.'
    }, {
      field: 'parentages.pjalki-konall-snorra-odlis.parentIds',
      values: ['Tjodmar Vragi + ???', 'Tjodmar Vragi + Iseld Varangr'],
      resolvedValue: 'Tjodmar Vragi + Iseld Varangr',
      reason: 'Die grafische Elternlinie und die bestehende Eheakte verbinden die vier Kinder mit Tjodmar und Iseld.'
    }, {
      field: 'persons.mjoldhild-vragi.name',
      values: ['Mjoldhild Vragi', 'Mjolhild Vragi'],
      resolvedValue: 'Mjoldhild Vragi',
      reason: 'Die Personenzeile führt die vollständigere Form Mjoldhild.'
    }, {
      field: 'persons.vidkun-goldglanz.death',
      values: ['1716', '1720'],
      resolvedValue: '1720',
      reason: 'Die Goldglanz-Stammhausquelle ist für Vidkun als gebürtigen Goldglanz maßgeblich.'
    }],
    registryTombstones: {
      persons: ['haus-vragi-gruender', 'haus-vragi-gruenderin'],
      partnerships: ['marriage-haus-vragi-founders']
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceModule',
      'sourceNote',
      'sourceConflicts'
    ],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'liegeHouses',
      'folderIcons',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
