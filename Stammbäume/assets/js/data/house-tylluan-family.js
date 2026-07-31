import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const TYLLUAN_HOUSE_ID = 'house-tylluan';
const TYLLUAN_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan;
const FOUNDER_TIME_JUMP_ID = 'gap-tylluan-gwynham-to-niadhnair';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  tylluan: TYLLUAN_EMBLEM
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
  'gwynham-aderyn': 'Gründer und erster Ritterfürst des Hauses Tylluan',
  'niadhnair-tylluan': 'Ritterfürst des Hauses Tylluan bis 1653',
  'blegwywyrd-tylluan': 'Ritterfürst des Hauses Tylluan 1653–1674',
  'gwynham-1630-tylluan': 'Ritterfürst des Hauses Tylluan 1674–1685',
  'shan-tylluan': 'Ritterfürst des Hauses Tylluan 1685–1723',
  'bowen-tylluan': 'Ritterfürst des Hauses Tylluan seit 1723',
  'lucan-tylluan': 'Erster Erbe des Hauses Tylluan',
  'arian-tylluan': 'Zweiter Erbe des Hauses Tylluan',
  'madoc-tylluan': 'Dritter Erbe des Hauses Tylluan'
});

const HOUSE_HEAD_IDS = new Set([
  'gwynham-aderyn',
  'niadhnair-tylluan',
  'blegwywyrd-tylluan',
  'gwynham-1630-tylluan',
  'shan-tylluan',
  'bowen-tylluan'
]);

const HEIR_IDS = new Set(['lucan-tylluan', 'arian-tylluan', 'madoc-tylluan']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? TYLLUAN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_TYLLUAN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TYLLUAN_HOUSE_ID ? 'core' : 'married'),
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

function affair(id, name) {
  return spouse(id, name, 'female', '????', '????', '', {
    familyRole: 'affair',
    title: 'Affäre Niadhnairs · Mutter Arawns',
    tags: ['Affäre'],
    notes: 'Aus dieser Affäre stammt ausschließlich Arawn Tylluan.'
  });
}

function bastard(id, name, birth, death, options = {}) {
  return person(id, name, 'male', birth, death, {
    ...options,
    familyRole: 'bastard',
    title: options.title || 'Bastardsohn Niadhnairs & Arwens',
    tags: [...(options.tags || []), 'Bastard'],
    notes: options.notes || 'Die Quelle ordnet Arawn ausdrücklich Niadhnairs Affäre mit Arwen zu.'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function endedMarriage(id, firstId, secondId, end) {
  return createMarriage(id, firstId, secondId, {
    status: 'ended',
    end,
    extensions: { registryManagedFields: ['status', 'end'] }
  });
}

function familyAffair(id, firstId, secondId) {
  return createMarriage(id, firstId, secondId, {
    type: 'affair',
    status: 'ended',
    visibility: 'private',
    extensions: { chartAlignPartnerOverChildrenPersonId: secondId }
  });
}

const COUPLES = Object.freeze({
  founders: ['gwynham-aderyn', 'rhianu-1130-spouse'],
  niadhnair: ['niadhnair-tylluan', 'clodagh-laga'],
  arwen: ['niadhnair-tylluan', 'arwen-tylluan-affair'],
  siors: ['siors-aderyn', 'gwladus-tylluan'],
  blegwywyrd: ['tudorwen-creyr', 'blegwywyrd-tylluan'],
  arawn: ['arawn-tylluan', 'lleu-tylluan-spouse'],
  gwynham: ['gwynham-1630-tylluan', 'gwendolen-gaeth'],
  manon: ['cynfelyn-eryr', 'manon-tylluan-eryr'],
  shan: ['evaine-illewod', 'shan-tylluan'],
  siana: ['efnisien-aderyn', 'siana-tylluan'],
  bowen: ['bowen-tylluan', 'venora-eryr'],
  wynthonya: ['wynthonya-tylluan', 'ingvar-feuerhaar'],
  wyett: ['tegan-gwarchod', 'wyett-tylluan'],
  lucan: ['lucan-tylluan', 'thalena-hebog'],
  jenara: ['jenara-tylluan', 'wynoc-wivern'],
  gwendal: ['gwendal-tylluan', 'tatumn-mwyalchen'],
  talaith: ['talaith-tylluan', 'cyrelas-loganne'],
  madoc: ['madoc-tylluan', 'tesni-ilyuncu']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-gwynham-rhianu': COUPLES.founders,
  'marriage-niadhnair-clodagh-tylluan': COUPLES.niadhnair,
  'affair-niadhnair-arwen-tylluan': COUPLES.arwen,
  'marriage-siors-gwladus': COUPLES.siors,
  'marriage-tudorwen-blegwywyrd-creyr': COUPLES.blegwywyrd,
  'marriage-arawn-lleu-tylluan': COUPLES.arawn,
  'marriage-gwynham-gwendolen-tylluan': COUPLES.gwynham,
  'marriage-cynfelyn-manon-eryr': COUPLES.manon,
  'marriage-evaine-shan': COUPLES.shan,
  'marriage-efnisien-siana': COUPLES.siana,
  'marriage-bowen-venora-eryr': COUPLES.bowen,
  'marriage-wynthonya-ingvar-tylluan': COUPLES.wynthonya,
  'marriage-tegan-wyett-gwarchod': COUPLES.wyett,
  'marriage-lucan-thalena-tylluan': COUPLES.lucan,
  'marriage-jenara-wynoc-tylluan': COUPLES.jenara,
  'marriage-gwendal-tatumn-tylluan': COUPLES.gwendal,
  'marriage-talaith-cyrelas-tylluan': COUPLES.talaith,
  'marriage-madoc-tesni-tylluan': COUPLES.madoc
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'tylluan-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_TYLLUAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tylluan',
    title: "Haus Tylluan O'Penbryn",
    motto: '',
    description: 'Ritterfürstlicher Tylluan-Kadettenzweig der Aderyn, der Penbryn und das Tal der Milane aus dem Schatten heraus schützt.',
    emblem: TYLLUAN_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.tylluan
  },
  houses: [
    house(TYLLUAN_HOUSE_ID, "Haus Tylluan O'Penbryn", TYLLUAN_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-laga', 'Haus Laga'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-gaeth', 'Haus Gaeth', HOUSE_EMBLEMS.gaeth),
    house('house-illewod', "Haus Illewod O'Aberon", HOUSE_EMBLEMS.illewod),
    house('house-feuerhaar', 'Haus Feuerhaar'),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod),
    house('house-hebog', 'Haus Hebog', HOUSE_EMBLEMS.hebog),
    house('house-wivern', 'Haus Wivern'),
    house('house-mwyalchen', 'Haus Mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    house('house-loganne', 'Haus Loganne'),
    house('house-ilyuncu', 'Haus Ilyuncu', HOUSE_EMBLEMS.ilyuncu)
  ],
  persons: [
    person('gwynham-aderyn', 'Gwynham Aderyn', 'male', '1126', '1199', {
      houseId: 'house-aderyn',
      familyRole: 'core',
      lineageRole: 'head',
      notes: 'Die Tylluan-Hofliste nennt abweichend 1150 als Geburt; die kanonische Aderyn-Akte und die detaillierte Hierarchie belegen 1126.'
    }),
    spouse('rhianu-1130-spouse', 'Rhianu', 'female', '1130', '1215', '', {
      title: 'Mitgründerin des Hauses Tylluan'
    }),

    person('niadhnair-tylluan', 'Niadhnair Tylluan', 'male', '1590', '1653'),
    awayWoman('gwladus-tylluan', 'Gwladus Tylluan', '1592', '1671', 'Haus Aderyn'),
    spouse('clodagh-laga', 'Clodagh Laga', 'female', '1591', '1647', 'house-laga'),
    affair('arwen-tylluan-affair', 'Arwen'),
    spouse('siors-aderyn', 'Siors Aderyn', 'male', '1588', '1661', 'house-aderyn'),

    person('blegwywyrd-tylluan', 'Blegwywyrd Tylluan', 'male', '1609', '1674', {
      notes: 'Die Tylluan-Quelle schreibt verkürzt Blegwyrd; die bereits kanonische Créyr-Gegenakte führt dieselbe Weltperson als Blegwywyrd.'
    }),
    bastard('arawn-tylluan', 'Arawn Tylluan', '1621', '1664'),
    spouse('tudorwen-creyr', 'Tudorwen Créyr', 'female', '1612', '1677', 'house-creyr'),
    spouse('lleu-tylluan-spouse', 'Lleu', 'female', '1637', '1674'),

    person('gwynham-1630-tylluan', 'Gwynham Tylluan', 'male', '1630', '1685'),
    awayWoman('manon-tylluan-eryr', 'Manon Tylluan', '1633', '1691', 'Haus Eryr'),
    bastard('gwion-tylluan', 'Gwion Tylluan', '1655', '1702', {
      title: 'Bastardsohn Arawns & Lleus',
      notes: 'Gwion führt als Sohn des Bastards Arawn den Bastardstatus in dieser Linie fort.'
    }),
    spouse('gwendolen-gaeth', 'Gwendolen Gaeth', 'female', '1632', '1687', 'house-gaeth'),
    spouse('cynfelyn-eryr', 'Cynfelyn Eryr', 'male', '1632', '1690', 'house-eryr', {
      title: 'Ritterfürst des Hauses Eryr 1663–1690'
    }),

    person('shan-tylluan', 'Shan Tylluan', 'male', '1649', '1723'),
    awayWoman('siana-tylluan', 'Siana Tylluan', '1651', '1703', 'Haus Aderyn'),
    spouse('evaine-illewod', 'Evaine Illewod', 'female', '1650', '1715', 'house-illewod'),
    spouse('efnisien-aderyn', 'Efnisien Aderyn', 'male', '1651', '1672', 'house-aderyn'),

    person('bowen-tylluan', 'Bowen Tylluan', 'male', '1668', ''),
    awayWoman('wynthonya-tylluan', 'Wynthonya Tylluan', '1674', '', 'Haus Feuerhaar'),
    person('wyett-tylluan', 'Wyett Tylluan', 'male', '1676', '', {
      title: 'Kommandant der Schattengarde'
    }),
    spouse('venora-eryr', 'Venora Eryr', 'female', '1675', '', 'house-eryr'),
    spouse('ingvar-feuerhaar', 'Ingvar Feuerhaar', 'male', '1673', '', 'house-feuerhaar'),
    spouse('tegan-gwarchod', 'Tegan Gwarchod', 'female', '1678', '', 'house-gwarchod'),

    person('lucan-tylluan', 'Lucan Tylluan', 'male', '1693', ''),
    awayWoman('jenara-tylluan', 'Jenara Tylluan', '1700', '', 'Haus Wivern'),
    person('gwendal-tylluan', 'Gwendal Tylluan', 'male', '1696', ''),
    awayWoman('talaith-tylluan', 'Talaith Tylluan', '1701', '', 'Haus Loganne'),
    spouse('thalena-hebog', 'Thalena Hebog', 'female', '1697', '', 'house-hebog'),
    spouse('wynoc-wivern', 'Wynoc Wivern', 'male', '1695', '', 'house-wivern'),
    spouse('tatumn-mwyalchen', 'Tatumn Mwyalchen', 'female', '1696', '', 'house-mwyalchen'),
    spouse('cyrelas-loganne', 'Cyrelas Loganne', 'male', '1700', '', 'house-loganne', {
      notes: 'Die Altquelle schreibt den Hausnamen Logane; die bestehende Aderyn-Akte verwendet die kanonische Form Loganne.'
    }),

    person('arian-tylluan', 'Arian Tylluan', 'male', '1721', ''),
    person('madoc-tylluan', 'Madoc Tylluan', 'male', '1723', ''),
    person('thivya-tylluan', 'Thivya Tylluan', 'female', '1725', ''),
    person('deri-tylluan', 'Deri Tylluan', 'male', '1722', ''),
    person('skywyn-tylluan', 'Skywyn Tylluan', 'female', '1724', ''),
    spouse('tesni-ilyuncu', 'Tesni Ilyuncu', 'female', '1720', '', 'house-ilyuncu')
  ],
  partnerships: [
    endedMarriage('marriage-gwynham-rhianu', ...COUPLES.founders, '1199'),
    endedMarriage('marriage-niadhnair-clodagh-tylluan', ...COUPLES.niadhnair, '1647'),
    familyAffair('affair-niadhnair-arwen-tylluan', ...COUPLES.arwen),
    endedMarriage('marriage-siors-gwladus', ...COUPLES.siors, '1661'),
    endedMarriage('marriage-tudorwen-blegwywyrd-creyr', ...COUPLES.blegwywyrd, '1674'),
    endedMarriage('marriage-arawn-lleu-tylluan', ...COUPLES.arawn, '1664'),
    endedMarriage('marriage-gwynham-gwendolen-tylluan', ...COUPLES.gwynham, '1685'),
    endedMarriage('marriage-cynfelyn-manon-eryr', ...COUPLES.manon, '1690'),
    endedMarriage('marriage-evaine-shan', ...COUPLES.shan, '1715'),
    endedMarriage('marriage-efnisien-siana', ...COUPLES.siana, '1672'),
    createMarriage('marriage-bowen-venora-eryr', ...COUPLES.bowen),
    createMarriage('marriage-wynthonya-ingvar-tylluan', ...COUPLES.wynthonya),
    createMarriage('marriage-tegan-wyett-gwarchod', ...COUPLES.wyett),
    createMarriage('marriage-lucan-thalena-tylluan', ...COUPLES.lucan),
    createMarriage('marriage-jenara-wynoc-tylluan', ...COUPLES.jenara),
    createMarriage('marriage-gwendal-tatumn-tylluan', ...COUPLES.gwendal),
    createMarriage('marriage-talaith-cyrelas-tylluan', ...COUPLES.talaith),
    createMarriage('marriage-madoc-tesni-tylluan', ...COUPLES.madoc)
  ],
  parentages: [
    ...childrenOf(['niadhnair-tylluan', 'gwladus-tylluan'], 'marriage-gwynham-rhianu', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Niadhnair und Gwladus.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['blegwywyrd-tylluan'], 'marriage-niadhnair-clodagh-tylluan'),
    ...childrenOf(['arawn-tylluan'], 'affair-niadhnair-arwen-tylluan', {
      legitimacy: 'illegitimate',
      notes: 'Arawn ist ausschließlich das Bastardkind aus Niadhnairs Affäre mit Arwen.'
    }),
    ...childrenOf(['gwynham-1630-tylluan', 'manon-tylluan-eryr'], 'marriage-tudorwen-blegwywyrd-creyr'),
    ...childrenOf(['gwion-tylluan'], 'marriage-arawn-lleu-tylluan', {
      legitimacy: 'illegitimate',
      notes: 'Gwion führt den Bastardstatus seines Vaters Arawn in dieser Linie fort.',
      extensions: { registryManagedFields: ['legitimacy', 'notes'] }
    }),
    ...childrenOf(['shan-tylluan', 'siana-tylluan'], 'marriage-gwynham-gwendolen-tylluan'),
    ...childrenOf(['bowen-tylluan', 'wynthonya-tylluan', 'wyett-tylluan'], 'marriage-evaine-shan'),
    ...childrenOf(['lucan-tylluan', 'jenara-tylluan'], 'marriage-bowen-venora-eryr'),
    ...childrenOf(['gwendal-tylluan', 'talaith-tylluan'], 'marriage-tegan-wyett-gwarchod'),
    ...childrenOf(['arian-tylluan', 'madoc-tylluan', 'thivya-tylluan'], 'marriage-lucan-thalena-tylluan'),
    ...childrenOf(['deri-tylluan', 'skywyn-tylluan'], 'marriage-gwendal-tatumn-tylluan')
  ],
  cadetBranches: [
    marriedAway('married-away-gwladus-tylluan-aderyn', 'Haus Aderyn', 'marriage-siors-gwladus', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-manon-tylluan-eryr', 'Haus Eryr', 'marriage-cynfelyn-manon-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-siana-tylluan-aderyn', 'Haus Aderyn', 'marriage-efnisien-siana', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-wynthonya-tylluan-feuerhaar', 'Haus Feuerhaar', 'marriage-wynthonya-ingvar-tylluan', 'house-feuerhaar'),
    marriedAway('married-away-jenara-tylluan-wivern', 'Haus Wivern', 'marriage-jenara-wynoc-tylluan', 'house-wivern'),
    marriedAway('married-away-talaith-tylluan-loganne', 'Haus Loganne', 'marriage-talaith-cyrelas-tylluan', 'house-loganne')
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-gwynham-rhianu',
      parentPersonId: '',
      childIds: ['niadhnair-tylluan', 'gwladus-tylluan'],
      years: 0,
      fromYear: '1199',
      toYear: '1590',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Der Zeitsprung steht ausschließlich nach dem Hausknoten des Gründerpaares und vor Niadhnair und Gwladus.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwynham-rhianu',
    houseId: TYLLUAN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Penbryn · Kadettenzweig der Aderyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gwynham-aderyn',
    orientation: 'vertical',
    ancestorDepth: 16,
    descendantDepth: 16,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Tylluan O'Penbryn (bereitgestellte Altdaten)",
    sourceNote: 'Gwynham Aderyn und Rhianu begründen den Tylluan-Kadettenzweig. Der Hausknoten und der einzige Zeitsprung stehen strikt seriell vor Niadhnair und Gwladus. Niadhnairs ehelicher Sohn Blegwywyrd und sein Bastard Arawn werden ihren jeweiligen Müttern eindeutig zugeordnet; Gwion führt als Arawns Sohn den Bastardstatus in dieser Linie fort. Gwladus, Manon, Siana, Wynthonya, Jenara und Talaith erhalten direkte Wegverheiratet-Knoten; ihre Kinder werden nur in der jeweils fortführenden Hausakte gezeigt. Umgekehrt werden die Tylluan-Kinder von Tudorwen Créyr, Gwendolen Gaeth, Evaine Illewod, Venora Eryr, Tegan Gwarchod, Thalena Hebog und Tatumn Mwyalchen ausschließlich hier fortgeführt. Die Quellenvarianten Blegwyrd und Logane wurden an die bereits kanonischen Formen Blegwywyrd und Loganne angeglichen. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
