import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createWorldPersonId } from '../domain/family-schema.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_EISBRAND_PORTRAITS } from './house-eisbrand-portraits.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const EISBRAND_HOUSE_ID = 'house-eisbrand';

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
  'audun-todbrand',
  'jorvik-eisbrand',
  'skjorn-eisbrand'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return ['skorr-eisbrand', 'drakvyr-eisbrand'].includes(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? EISBRAND_HOUSE_ID : options.houseId;
  const isEisbrand = houseId === EISBRAND_HOUSE_ID;
  const tags = isEisbrand
    ? [...new Set([...(options.tags || []), 'Bastard'])]
    : [...(options.tags || [])];

  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_EISBRAND_PORTRAITS[id] || '',
    familyRole: options.familyRole || (isEisbrand ? 'bastard' : 'affair'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags,
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function affairPartner(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    worldPersonId: options.worldPersonId || createWorldPersonId('haus-eisbrand', id),
    houseId: '',
    familyRole: options.familyRole || 'affair',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['audun-todbrand', 'yrsael-eisbrand'],
  jorvikVigdis: ['jorvik-eisbrand', 'vigdis-eisbrand'],
  jorvikBrynja: ['jorvik-eisbrand', 'brynja-eisbrand'],
  skorvir: ['skorvir-eisbrand', 'drakena-eisbrand'],
  skaldir: ['skaldir-eisbrand', 'eydis-eisbrand'],
  skjorn: ['skjorn-eisbrand', 'aeslynn-eisbrand'],
  galdrin: ['galdrin-eisbrand', 'skjolda-eisbrand'],
  haldrik: ['haldrik-eisbrand', 'eyvana-eisbrand']
});

const PARTNERS_BY_ID = Object.freeze({
  'affair-audun-yrsael-eisbrand': COUPLES.founders,
  'affair-jorvik-vigdis-eisbrand': COUPLES.jorvikVigdis,
  'affair-jorvik-brynja-eisbrand': COUPLES.jorvikBrynja,
  'affair-skorvir-drakena-eisbrand': COUPLES.skorvir,
  'affair-skaldir-eydis-eisbrand': COUPLES.skaldir,
  'affair-skjorn-aeslynn-eisbrand': COUPLES.skjorn,
  'affair-galdrin-skjolda-eisbrand': COUPLES.galdrin,
  'affair-haldrik-eyvana-eisbrand': COUPLES.haldrik
});

function affair(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], {
    ...options,
    type: 'affair'
  });
}

function alignPartnerOverChildren(partnership, partnerPersonId) {
  return {
    ...partnership,
    extensions: {
      ...partnership.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
    }
  };
}

function childrenOf(childIds, partnershipId, notes = '') {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'eisbrand-parentage',
    legitimacy: 'illegitimate',
    notes: notes || 'Das Kind entstammt einer nicht ehelichen Verbindung des Banditenhauses Eisbrand.'
  });
}

export const HOUSE_EISBRAND_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eisbrand',
    title: 'Haus Eisbrand',
    motto: '',
    description: 'Nicht anerkanntes Bastard- und Banditenhaus in Hallsvalr, begründet durch Audun Todbrand.',
    emblem: SCHWARZFENN_HOUSE_EMBLEMS.eisbrand,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.eisbrand
  },
  houses: [
    house(EISBRAND_HOUSE_ID, 'Haus Eisbrand', SCHWARZFENN_HOUSE_EMBLEMS.eisbrand),
    house('house-todbrand', 'Clan Todbrand', SCHWARZFENN_HOUSE_EMBLEMS.todbrand)
  ],
  persons: [
    person('audun-todbrand', 'Audun Todbrand', 'male', '1650', '1715', {
      worldPersonId: createWorldPersonId('haus-todbrand', 'audun-todbrand'),
      houseId: 'house-todbrand',
      familyRole: 'bastard',
      title: 'Audun der Bastard · Gründer des nicht anerkannten Hauses Eisbrand',
      tags: ['Bastard', 'Hausgründer', 'Bandit'],
      notes: 'Audun war Kveldulf Todbrands unehelicher Sohn. Er begründete aus Rache das nicht anerkannte Banditenhaus Eisbrand und die Silberzähne.'
    }),
    affairPartner('yrsael-eisbrand', 'Yrsael', 'female', '1655', '1733', {
      title: 'Affäre Auduns · Mutter seiner vier Söhne'
    }),

    person('jorvik-eisbrand', 'Jorvik Eisbrand', 'male', '1669', '1737', {
      extensions: { chartCenterBetweenSpousePersonIds: ['vigdis-eisbrand', 'brynja-eisbrand'] }
    }),
    person('fenbjorn-eisbrand', 'Fenbjorn Eisbrand', 'male', '1671', '1692'),
    person('skorvir-eisbrand', 'Skorvir Eisbrand', 'male', '1673', '1739'),
    person('skaldir-eisbrand', 'Skaldir Eisbrand', 'male', '1675', ''),
    affairPartner('vigdis-eisbrand', 'Vigdis', 'female', '1669', '1739', { title: 'Affäre Jorviks' }),
    affairPartner('brynja-eisbrand', 'Brynja', 'female', '1674', '1734', { title: 'Affäre Jorviks' }),
    affairPartner('drakena-eisbrand', 'Drakena', 'female', '1675', '1736', { title: 'Affäre Skorvirs' }),
    affairPartner('eydis-eisbrand', 'Eydis', 'female', '1679', '1740', {
      familyRole: 'forced',
      title: 'Opfer Skaldirs',
      tags: ['Opfer'],
      notes: 'Die Quelle bezeichnet Eydis ausdrücklich als Skaldirs Opfer; die daraus hervorgegangene Abstammung bleibt unehelich.'
    }),

    person('skjorn-eisbrand', 'Skjorn Eisbrand', 'male', '1693', ''),
    person('brynjolf-eisbrand', 'Brynjolf Eisbrand', 'male', '1697', ''),
    person('galdrin-eisbrand', 'Galdrin Eisbrand', 'male', '1694', ''),
    person('haldrik-eisbrand', 'Haldrik Eisbrand', 'male', '1700', ''),
    affairPartner('aeslynn-eisbrand', 'Aeslynn', 'female', '1695', '', { title: 'Affäre Skjorns' }),
    affairPartner('skjolda-eisbrand', 'Skjolda', 'female', '1699', '', {
      familyRole: 'forced',
      title: 'Opfer Galdrins',
      tags: ['Opfer'],
      notes: 'Die Quelle bezeichnet Skjolda ausdrücklich als Galdrins Opfer; ihre Kinder werden als uneheliche Nachkommen erfasst.'
    }),
    affairPartner('eyvana-eisbrand', 'Eyvana', 'female', '1719', '', { title: 'Affäre Haldriks' }),

    person('skorr-eisbrand', 'Skorr Eisbrand', 'male', '1717', ''),
    person('drakvyr-eisbrand', 'Drakvyr Eisbrand', 'male', '1719', ''),
    person('kjeldis-eisbrand', 'Kjeldis Eisbrand', 'female', '1720', ''),
    person('astrid-eisbrand', 'Astrid Eisbrand', 'female', '1722', ''),
    person('vormir-eisbrand', 'Vormir Eisbrand', 'male', '1726', '')
  ],
  partnerships: [
    alignPartnerOverChildren(affair('affair-audun-yrsael-eisbrand', {
      status: 'ended',
      end: '1715',
      notes: 'Die Altdaten nannten Yrsael Ehefrau; nach der verbindlichen Hausregel der Eisbrand wird die Verbindung ausschließlich als Affäre geführt.'
    }), 'yrsael-eisbrand'),
    alignPartnerOverChildren(affair('affair-jorvik-vigdis-eisbrand', { status: 'ended', end: '1737' }), 'vigdis-eisbrand'),
    alignPartnerOverChildren(affair('affair-jorvik-brynja-eisbrand', { status: 'ended', end: '1734' }), 'brynja-eisbrand'),
    alignPartnerOverChildren(affair('affair-skorvir-drakena-eisbrand', { status: 'ended', end: '1736' }), 'drakena-eisbrand'),
    alignPartnerOverChildren(affair('affair-skaldir-eydis-eisbrand', {
      status: 'ended',
      end: '1740',
      notes: 'Eydis wird in der Quelle als Opfer Skaldirs bezeichnet.'
    }), 'eydis-eisbrand'),
    alignPartnerOverChildren(affair('affair-skjorn-aeslynn-eisbrand'), 'aeslynn-eisbrand'),
    alignPartnerOverChildren(affair('affair-galdrin-skjolda-eisbrand', {
      notes: 'Skjolda wird in der Quelle als Opfer Galdrins bezeichnet.'
    }), 'skjolda-eisbrand'),
    affair('affair-haldrik-eyvana-eisbrand')
  ],
  parentages: [
    ...childrenOf(
      ['jorvik-eisbrand', 'fenbjorn-eisbrand', 'skorvir-eisbrand', 'skaldir-eisbrand'],
      'affair-audun-yrsael-eisbrand',
      'Auduns vier Söhne entstammen seiner nicht ehelichen Verbindung mit Yrsael.'
    ),
    ...childrenOf(['skjorn-eisbrand'], 'affair-jorvik-vigdis-eisbrand'),
    ...childrenOf(['brynjolf-eisbrand'], 'affair-jorvik-brynja-eisbrand'),
    ...childrenOf(['galdrin-eisbrand'], 'affair-skorvir-drakena-eisbrand'),
    ...childrenOf(['haldrik-eisbrand'], 'affair-skaldir-eydis-eisbrand'),
    ...childrenOf(['skorr-eisbrand', 'drakvyr-eisbrand'], 'affair-skjorn-aeslynn-eisbrand'),
    ...childrenOf(['kjeldis-eisbrand', 'astrid-eisbrand', 'vormir-eisbrand'], 'affair-galdrin-skjolda-eisbrand')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'affair-audun-yrsael-eisbrand',
    houseId: EISBRAND_HOUSE_ID,
    crestSubtitle: 'Nicht anerkanntes Bastard- und Banditenhaus von Hallsvalr',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'audun-todbrand',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 2,
    sourceFamilyId: 'haus-todbrand',
    sourcePersonId: 'audun-todbrand',
    sourceModule: 'Die Eisbrand (bereitgestellte Altdaten)',
    sourceNote: 'Die Altdaten wurden gemäß der ausdrücklichen Hausregel bereinigt: Haus Eisbrand beginnt bei Audun Todbrand und besitzt keinerlei reguläre Ehen oder Verlobungen. Jede Bindung bleibt eine nicht eheliche Affärenverbindung; die ausdrücklich als Opfer bezeichneten Eydis und Skjolda tragen jedoch den dafür vorgesehenen Opferrahmen. Sämtliche dreizehn Abstammungen sind unehelich und alle Eisbrand-Nachkommen tragen den Bastardrahmen. Die fünf unbenannten Verlobten-Platzhalter der jüngsten Generation wurden nicht erfunden. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
