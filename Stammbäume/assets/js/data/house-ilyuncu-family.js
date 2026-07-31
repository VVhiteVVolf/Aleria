import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ILYUNCU_PORTRAITS } from './house-ilyuncu-portraits.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const ILYUNCU_HOUSE_ID = 'house-ilyuncu';
const ILYUNCU_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu;

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  ilyuncu: ILYUNCU_EMBLEM,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan
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

const SUCCESSION_TITLES = Object.freeze({
  'merfyn-aderyn': 'Gründer und Ritterfürst des Hauses Ilyuncu seit 1720',
  'gildas-ilyuncu': 'Erster Erbe des Hauses Ilyuncu',
  'brynthan-ilyuncu': 'Zweiter Erbe des Hauses Ilyuncu',
  'bevan-ilyuncu': 'Dritter Erbe des Hauses Ilyuncu',
  'marvin-ilyuncu': 'Vierter Erbe des Hauses Ilyuncu'
});

const MAIN_LINE_IDS = new Set([
  'gildas-ilyuncu',
  'brynthan-ilyuncu',
  'bevan-ilyuncu',
  'marvin-ilyuncu'
]);

function lineageRoleFor(personId) {
  if (personId === 'merfyn-aderyn') return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? ILYUNCU_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ILYUNCU_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ILYUNCU_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
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

function house(id, name, emblem = '', options = {}) {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    ...(options.registryManagedFields
      ? { extensions: { registryManagedFields: options.registryManagedFields } }
      : {})
  };
}

const COUPLES = Object.freeze({
  founders: ['merfyn-aderyn', 'meriel-gaeth'],
  gildas: ['saeth-hebog', 'gildas-ilyuncu'],
  bogus: ['bogus-ilyuncu', 'ciara-sliabh'],
  ywen: ['gaven-dinefwr', 'ywen-ilyuncu'],
  bynthan: ['brynthan-ilyuncu', 'sian-eryr'],
  tesni: ['madoc-tylluan', 'tesni-ilyuncu'],
  bevan: ['tirion-mwyalchen', 'bevan-ilyuncu'],
  marvin: ['wula-aderyn', 'marvin-ilyuncu']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-merfyn-meriel': COUPLES.founders,
  'marriage-saeth-gildas-ilyuncu': COUPLES.gildas,
  'engagement-bogus-ciara-sliabh': COUPLES.bogus,
  'marriage-gaven-ywen-dinefwr': COUPLES.ywen,
  'marriage-brynthan-sian-eryr': COUPLES.bynthan,
  'marriage-madoc-tesni-tylluan': COUPLES.tesni,
  'engagement-tirion-bevan-mwyalchen': COUPLES.bevan,
  'engagement-wula-marvin': COUPLES.marvin
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'ilyuncu-parentage'
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_ILYUNCU_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ilyuncu',
    title: "Haus Ilyuncu O'Caer Gwennol",
    motto: '',
    description: 'Junges Ritterfürstenhaus von Caer Gwennol und Kadettenzweig der Aderyn, gegründet von Merfyn Aderyn und Meriel Gaeth.',
    emblem: ILYUNCU_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.ilyuncu
  },
  houses: [
    house(ILYUNCU_HOUSE_ID, "Haus Ilyuncu O'Caer Gwennol", ILYUNCU_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-gaeth', "Haus Gaeth O'Penllyn", HOUSE_EMBLEMS.gaeth),
    house('house-hebog', "Haus Hebog O'Talwyn", HOUSE_EMBLEMS.hebog),
    house(
      'house-sliabh',
      "Haus Sliabh O'Caer Gwennol",
      TAL_DER_MILANE_HOUSE_EMBLEMS.sliabh,
      { registryManagedFields: ['name', 'emblem'] }
    ),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-tylluan', "Haus Tylluan O'Penbryn", HOUSE_EMBLEMS.tylluan),
    house('house-mwyalchen', "Haus Mwyalchen O'Penbryn", HOUSE_EMBLEMS.mwyalchen)
  ],
  persons: [
    person('merfyn-aderyn', 'Merfyn Aderyn', 'male', '1664', '', {
      houseId: 'house-aderyn',
      familyRole: 'core',
      notes: 'Merfyn bleibt dieselbe Weltperson wie in Haus Aderyn und begründet 1720 den Ilyuncu-Kadettenzweig.'
    }),
    spouse('meriel-gaeth', 'Meriel Gaeth', 'female', '1670', '', 'house-gaeth', {
      title: 'Mitgründerin des Hauses Ilyuncu'
    }),

    person('gildas-ilyuncu', 'Gildas Ilyuncu', 'male', '1695', ''),
    person('bogus-ilyuncu', 'Bogus Ilyuncu', 'male', '1700', ''),
    awayWoman('ywen-ilyuncu', 'Ywen Ilyuncu', '1702', '', 'Haus Dinefwr'),
    spouse('saeth-hebog', 'Saeth Hebog', 'female', '1699', '', 'house-hebog'),
    spouse('ciara-sliabh', 'Ciara Sliabh', 'female', '1702', '', 'house-sliabh', {
      title: 'Verlobte Bogus Ilyuncus',
      tags: ['Verlobt']
    }),
    spouse('gaven-dinefwr', 'Gaven Dinefwr', 'male', '1704', '', 'house-dinefwr'),

    person('brynthan-ilyuncu', 'Bynthan Ilyuncu', 'male', '1718', '', {
      notes: 'Die bereitgestellte Ilyuncu-Quelle schreibt Bynthan; die technische ID bleibt wegen der bereits bestehenden Eryr-Gegenakte stabil.'
    }),
    awayWoman('tesni-ilyuncu', 'Tesni Ilyuncu', '1720', '', 'Haus Tylluan'),
    person('bevan-ilyuncu', 'Bevan Ilyuncu', 'male', '1721', ''),
    person('marvin-ilyuncu', 'Marvin Ilyuncu', 'male', '1723', ''),
    spouse('sian-eryr', 'Sian Eryr', 'female', '1721', '', 'house-eryr'),
    spouse('madoc-tylluan', 'Madoc Tylluan', 'male', '1723', '', 'house-tylluan'),
    spouse('tirion-mwyalchen', 'Tirion Mwyalchen', 'female', '1720', '', 'house-mwyalchen', {
      title: 'Verlobte Bevan Ilyuncus',
      tags: ['Verlobt']
    }),
    spouse('wula-aderyn', 'Wula Aderyn', 'female', '1725', '', 'house-aderyn', {
      title: 'Verlobte Marvin Ilyuncus',
      tags: ['Verlobt']
    })
  ],
  partnerships: [
    createMarriage('marriage-merfyn-meriel', ...COUPLES.founders),
    createMarriage('marriage-saeth-gildas-ilyuncu', ...COUPLES.gildas),
    createMarriage('engagement-bogus-ciara-sliabh', ...COUPLES.bogus, { type: 'engagement' }),
    createMarriage('marriage-gaven-ywen-dinefwr', ...COUPLES.ywen),
    createMarriage('marriage-brynthan-sian-eryr', ...COUPLES.bynthan),
    createMarriage('marriage-madoc-tesni-tylluan', ...COUPLES.tesni),
    createMarriage('engagement-tirion-bevan-mwyalchen', ...COUPLES.bevan, { type: 'engagement' }),
    createMarriage('engagement-wula-marvin', ...COUPLES.marvin, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['gildas-ilyuncu', 'bogus-ilyuncu', 'ywen-ilyuncu'], 'marriage-merfyn-meriel'),
    ...childrenOf(
      ['brynthan-ilyuncu', 'tesni-ilyuncu', 'bevan-ilyuncu', 'marvin-ilyuncu'],
      'marriage-saeth-gildas-ilyuncu'
    )
  ],
  cadetBranches: [
    marriedAway(
      'married-away-ywen-ilyuncu-dinefwr',
      'Haus Dinefwr',
      'marriage-gaven-ywen-dinefwr',
      'house-dinefwr',
      HOUSE_EMBLEMS.dinefwr
    ),
    marriedAway(
      'married-away-tesni-ilyuncu-tylluan',
      'Haus Tylluan',
      'marriage-madoc-tesni-tylluan',
      'house-tylluan',
      HOUSE_EMBLEMS.tylluan
    )
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-merfyn-meriel',
    houseId: ILYUNCU_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Caer Gwennol · Kadettenzweig der Aderyn · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'merfyn-aderyn',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Ilyuncu O'Caer Gwennol (bereitgestellte Altdaten)",
    sourceNote: 'Merfyn Aderyn und Meriel Gaeth begründen 1720 den Ilyuncu-Kadettenzweig. Die Quellzeile, die Merfyn fälschlich Catel und Mifawi zuordnet, wird nicht als neue Abstammung übernommen; seine kanonische Herkunft bleibt in der Aderyn-Akte erhalten. Gildas, Bogus und Ywen sind Kinder des Gründerpaars; Bynthan, Tesni, Bevan und Marvin stammen ausschließlich aus Gildas\' Ehe mit Saeth Hebog. Ywens Kinder mit Gaven werden nur in Dinefwr fortgeführt. Tesni und Ywen erhalten hier direkte Wegverheiratet-Knoten; Sian und Saeth besitzen diese Gegenknoten bereits in Eryr beziehungsweise Hebog. Bevan/Tirion und Marvin/Wula bleiben entsprechend den Gegenakten verlobt. Die Schreibweise Bynthan folgt der Ilyuncu-Quelle bei stabiler technischer Gegenakten-ID. Ciara Sliabhs Individualporträt und das Sliabh-Wappen werden aus der ausgearbeiteten Vasallenakte wiederverwendet.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
