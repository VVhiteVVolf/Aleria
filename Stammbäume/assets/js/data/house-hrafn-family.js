import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_HRAFN_PORTRAITS } from './house-hrafn-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';

const HRAFN_HOUSE_ID = 'house-hrafn';

const HOUSE_EMBLEMS = Object.freeze({
  hrafn: SCHWARZFENN_HOUSE_EMBLEMS.hrafn,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  skogg: IVARSHEIM_HOUSE_EMBLEMS.skogg
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
  'raleif-hrafn',
  'hakon-hrafn',
  'osvald-hrafn',
  'rognstein-hrafn'
]);

const HEIR_IDS = new Set([
  'haraldur-hrafn',
  'roald-hrafn'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? HRAFN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_HRAFN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === HRAFN_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-hrafn--${id}`),
    houseId,
    familyRole: 'married',
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
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['raleif-hrafn', 'hallveig'],
  ornthrud: ['morkur', 'ornthrud-hrafn'],
  hakon: ['hakon-hrafn', 'gudrid-1630-ragnulf'],
  osvald: ['osvald-hrafn', 'leikny-helgr'],
  reginleif: ['skirnir-skogg', 'reginleif-hrafn'],
  rognstein: ['rognstein-hrafn', 'hervor-ragnulf'],
  freyglod: ['freyglod-hrafn', 'unndis-graumahne'],
  haraldur: ['haraldur-hrafn', 'sigveig'],
  reyka: ['toste', 'reyka-hrafn'],
  ketilbjorn: ['ketilbjorn-hrafn', 'tindra']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-raleif-hallveig-hrafn': COUPLES.founders,
  'marriage-ornthrud-morkur-hrafn': COUPLES.ornthrud,
  'marriage-gudrid-hakon-ragnulf': COUPLES.hakon,
  'marriage-leikny-osvald-hrafn': COUPLES.osvald,
  'marriage-skirnir-reginleif-skogg': COUPLES.reginleif,
  'marriage-hervor-rognstein-ragnulf': COUPLES.rognstein,
  'marriage-unndis-freyglod-graumahne': COUPLES.freyglod,
  'marriage-haraldur-sigveig-hrafn': COUPLES.haraldur,
  'marriage-reyka-toste-hrafn': COUPLES.reyka,
  'marriage-ketilbjorn-tindra-hrafn': COUPLES.ketilbjorn
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'hrafn-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      registryManagedFields: [
        'name',
        'parentPartnershipId',
        'houseId',
        'targetFamilyId',
        'emblem',
        'subtitle'
      ]
    }
  });
}

export const HOUSE_HRAFN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-hrafn',
    title: 'Clan Hrafn',
    motto: '',
    description: 'Junger Hesirenclan von Flusswall. Raleif Hrafn begründete die Linie nach dem Bürgerkrieg als Vasall der Ragnulf und führte das handwerkliche Erbe der ausgelöschten Arnvild fort.',
    emblem: HOUSE_EMBLEMS.hrafn,
    houseProfile: SCHWARZFENN_HOUSE_PROFILES.hrafn
  },
  houses: [
    house(HRAFN_HOUSE_ID, 'Clan Hrafn', HOUSE_EMBLEMS.hrafn),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-skogg', 'Clan Skogg', HOUSE_EMBLEMS.skogg),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-unknown-ornthrud-hrafn', 'Unbekanntes Haus'),
    house('house-unknown-reyka-hrafn', 'Unbekanntes Haus')
  ],
  persons: [
    person('raleif-hrafn', 'Raleif Hrafn', 'male', '1600', '1676', {
      title: 'Gründer des Clans Hrafn · Meisterschmied und erster Hesir'
    }),
    spouse('hallveig', 'Hallveig', 'female', '1605', '1660'),

    awayWoman('ornthrud-hrafn', 'Ornthrud Hrafn', '1628', '1677', 'unbekanntes Haus'),
    person('hakon-hrafn', 'Hakon Hrafn', 'male', '1630', '1704', {
      title: 'Hesir des Clans Hrafn von 1676 bis 1704'
    }),
    spouse('morkur', 'Morkur', 'male', '1627', '1659'),
    spouse('gudrid-1630-ragnulf', 'Gudrid Ragnulf', 'female', '1630', '1712', 'house-ragnulf'),

    person('osvald-hrafn', 'Osvald Hrafn', 'male', '1650', '1717', {
      title: 'Hesir des Clans Hrafn von 1704 bis 1717'
    }),
    awayWoman('reginleif-hrafn', 'Reginleif Hrafn', '1652', '1711', 'Clan Skogg'),
    spouse('leikny-helgr', 'Leikny Helgr', 'female', '1655', '', 'house-helgr'),
    spouse('skirnir-skogg', 'Skirnir Skogg', 'male', '1653', '1720', 'house-skogg'),

    person('rognstein-hrafn', 'Rognstein Hrafn', 'male', '1673', '', {
      title: 'Hesir des Clans Hrafn seit 1717'
    }),
    person('eirunn-hrafn', 'Eirunn Hrafn', 'female', '1673', ''),
    person('freyglod-hrafn', 'Freyglod Hrafn', 'male', '1675', ''),
    spouse('hervor-ragnulf', 'Hervor Ragnulf', 'female', '1677', '', 'house-ragnulf'),
    spouse('unndis-graumahne', 'Unndís Graumähne', 'female', '1676', '', 'house-graumahne'),

    person('haraldur-hrafn', 'Haraldur Hrafn', 'male', '1696', '', {
      title: 'Erster Erbe des Clans Hrafn'
    }),
    awayWoman('reyka-hrafn', 'Reyka Hrafn', '1701', '', 'unbekanntes Haus'),
    person('ketilbjorn-hrafn', 'Ketilbjorn Hrafn', 'male', '1697', ''),
    spouse('sigveig', 'Sigveig', 'female', '1701', ''),
    spouse('toste', 'Toste', 'male', '1699', ''),
    spouse('tindra', 'Tindra', 'female', '1703', ''),

    person('roald-hrafn', 'Róald Hrafn', 'male', '1724', '', {
      title: 'Zweiter Erbe des Clans Hrafn'
    }),
    person('geira-hrafn', 'Geira Hrafn', 'female', '1728', ''),
    person('nokkvi-hrafn', 'Nokkvi Hrafn', 'male', '1725', ''),
    person('asta-hrafn', 'Asta Hrafn', 'female', '1729', '')
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map((partnershipId) => partnership(partnershipId)),
  parentages: [
    ...childrenOf(['ornthrud-hrafn', 'hakon-hrafn'], 'marriage-raleif-hallveig-hrafn'),
    ...childrenOf(['osvald-hrafn', 'reginleif-hrafn'], 'marriage-gudrid-hakon-ragnulf'),
    ...childrenOf(['rognstein-hrafn', 'eirunn-hrafn', 'freyglod-hrafn'], 'marriage-leikny-osvald-hrafn'),
    ...childrenOf(['haraldur-hrafn', 'reyka-hrafn'], 'marriage-hervor-rognstein-ragnulf'),
    ...childrenOf(['ketilbjorn-hrafn'], 'marriage-unndis-freyglod-graumahne'),
    ...childrenOf(['roald-hrafn', 'geira-hrafn'], 'marriage-haraldur-sigveig-hrafn'),
    ...childrenOf(['nokkvi-hrafn', 'asta-hrafn'], 'marriage-ketilbjorn-tindra-hrafn')
  ],
  cadetBranches: [
    marriedAway('married-away-ornthrud-hrafn-unknown', 'Unbekanntes Haus', 'marriage-ornthrud-morkur-hrafn', 'house-unknown-ornthrud-hrafn', 'haus-unbekannt'),
    marriedAway('married-away-reginleif-hrafn-skogg', 'Clan Skogg', 'marriage-skirnir-reginleif-skogg', 'house-skogg', 'haus-skogg', HOUSE_EMBLEMS.skogg),
    marriedAway('married-away-reyka-hrafn-unknown', 'Unbekanntes Haus', 'marriage-reyka-toste-hrafn', 'house-unknown-reyka-hrafn', 'haus-unbekannt')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-raleif-hallveig-hrafn',
    houseId: HRAFN_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Flusswall · Vasallen der Ragnulf',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'raleif-hrafn',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    sourceRevision: 2,
    sourceModule: 'Clan Hrafn (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Hrafn-Stammbaum wird ohne Personenfokus von Raleif und Hallveig bis zu den 1740 lebenden jüngsten Sprösslingen gezeigt. Der erste Hausknoten folgt direkt auf das Gründerpaar; ein Zeitsprung ist in der Quelle nicht belegt. Die Oberhauptfolge lautet Raleif, Hakon, Osvald und Rognstein; Haraldur und Róald bilden die ausgewiesene Erbfolge. Ornthrud und Reyka erhalten wegen ihrer belegten Ehen mit Partnern ohne Hauszuordnung direkte Wegverheiratet-Knoten zu unbekannten Häusern. Reginleif wird mit direkter Verknüpfung an Clan Skogg wegverheiratet; ihre dort fortgeführte Nachkommenschaft wird nicht gedoppelt. Gudrid Ragnulf, Leikny Helgr, Hervor Ragnulf und Unndís Graumähne bleiben als eingeheiratete Frauen mit ihren bereits registrierten Weltpersonen und Partnerschaften synchron. Die Hrafn-Quelle bezeichnet Leiknir Silberzunge abweichend als Haraldurs Mündel. Die bereits ausgearbeiteten und gegenseitig konsistenten Silberzunge- und Skogg-Akten führen Leiknir dagegen ausdrücklich als an Clan Skogg vermitteltes Mündel; dieser Widerspruch wird nicht still überschrieben, weshalb Leiknir bis zur Klärung nicht zusätzlich im Hrafn-Baum erscheint. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryTombstones: {
      persons: ['haus-hrafn-gruender', 'haus-hrafn-gruenderin'],
      partnerships: ['marriage-haus-hrafn-founders']
    },
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
    registryManagedRecordFields: ['folderPath']
  }
});
