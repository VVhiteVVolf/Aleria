import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FROSTZORN_PORTRAITS } from './house-frostzorn-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';

const FROSTZORN_HOUSE_ID = 'house-frostzorn';

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
  'vorn-frostauge',
  'hakon-frostzorn',
  'styrkar-frostzorn',
  'vorn-1697-frostzorn',
  'arvid-frostzorn'
]);

function lineageRoleFor(personId) {
  return HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FROSTZORN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FROSTZORN_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    familyRole: options.familyRole || (houseId === FROSTZORN_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId === undefined ? '' : options.houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || 'Wegverheiratet an ein unbekanntes Haus',
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
  'marriage-vorn-pidra-frostzorn-founders': ['vorn-frostauge', 'pidra-vorn-frostauge'],
  'marriage-hakon-sigrid-frostzorn': ['hakon-frostzorn', 'sigrid-hakon-frostzorn'],
  'marriage-eirik-runa-frostzorn': ['eirik-frostzorn', 'runa-eirik-frostzorn'],
  'marriage-torsten-ylva-frostzorn': ['torsten-ylva-frostzorn', 'ylva-frostzorn'],
  'marriage-styrkar-brynhild-frostzorn': ['styrkar-frostzorn', 'brynhild-styrkar-frostzorn'],
  'marriage-arne-astrid-frostzorn': ['arne-astrid-frostzorn', 'astrid-frostzorn'],
  'marriage-leifric-svala-frostzorn': ['leifric-frostzorn', 'svala-leifric-frostzorn'],
  'marriage-einar-skadi-frostzorn': ['einar-skadi-frostzorn', 'skadi-frostzorn'],
  'marriage-vorn-ragna-frostzorn': ['vorn-1697-frostzorn', 'ragna-vorn-frostzorn'],
  'marriage-benjen-liv-frostzorn': ['benjen-1702-frostzorn', 'liv-benjen-frostzorn'],
  'marriage-hrolfr-yrsa-frostzorn': ['hrolfr-1704-frostzorn', 'yrsa-hrolfr-frostzorn']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayoutExtension(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ])]
    }
  };
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function directlyAbovePrimaryChildWithPackedSiblingBranches(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    directlyAboveOnlyChild(partnershipId, childPersonId, options),
    'chartPackSiblingBranchesBesideAlignedChild',
    true
  );
}

function alignLeafChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'frostzorn-parentage'
  });
}

function unknownHouseBranch(personSlug, partnershipId) {
  return createMarriedAwayBranch({
    id: `married-away-${personSlug}-unknown`,
    name: 'Unbekanntes Haus',
    parentPartnershipId: partnershipId,
    houseId: 'house-unknown',
    targetFamilyId: 'haus-unbekannt',
    subtitle: 'Wegverheiratet an ein unbekanntes Haus',
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_FROSTZORN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-frostzorn',
    title: 'Clan Frostzorn',
    motto: '',
    description: 'Abtrünniger Kadettenzweig der Frostaugen auf den Sirenen-Zahn-Riff-Inseln. Die Frostzorn betrachten sich als die wahren Erben des Frostaugen-Namens.',
    emblem: KRONENTAL_HOUSE_EMBLEMS.frostzorn,
    houseProfile: KRONENTAL_HOUSE_PROFILES.frostzorn
  },
  houses: [
    house(FROSTZORN_HOUSE_ID, 'Clan Frostzorn', KRONENTAL_HOUSE_EMBLEMS.frostzorn),
    house('house-frostauge', 'Clan Frostauge', KRONENTAL_HOUSE_EMBLEMS.frostauge),
    house('house-unknown', 'Unbekanntes Haus')
  ],
  persons: [
    person('vorn-frostauge', 'Vorn Frostauge', 'male', '1620', '1673', {
      houseId: 'house-frostauge',
      familyRole: 'core',
      title: 'Stammvater des Clan Frostzorn · zweiter Sohn Benjens',
      notes: 'Unterlag Leifric im Holmgang und gründete nach dem Exil den Frostzorn-Zweig.',
      worldPersonId: 'person--haus-frostauge--vorn-frostauge'
    }),
    spouse('pidra-vorn-frostauge', 'Pidra', 'female', '1622', '1672', {
      worldPersonId: 'person--family-tree--pidra-vorn-frostauge'
    }),

    person('hakon-frostzorn', 'Hakon Frostzorn', 'male', '1643', '1708'),
    person('eirik-frostzorn', 'Eirik Frostzorn', 'male', '1648', '1717'),
    awayWoman('ylva-frostzorn', 'Ylva Frostzorn', '1652', '1710'),
    spouse('sigrid-hakon-frostzorn', 'Sigrid', 'female', '1646', '1714'),
    spouse('runa-eirik-frostzorn', 'Runa', 'female', '1651', '1724'),
    spouse('torsten-ylva-frostzorn', 'Torsten', 'male', '1649', '1712'),

    person('styrkar-frostzorn', 'Styrkar Frostzorn', 'male', '1668', '1729'),
    awayWoman('astrid-frostzorn', 'Astrid Frostzorn', '1671', '1730'),
    person('leifric-frostzorn', 'Leifric Frostzorn', 'male', '1675', ''),
    awayWoman('skadi-frostzorn', 'Skadi Frostzorn', '1679', '1732'),
    spouse('brynhild-styrkar-frostzorn', 'Brynhild', 'female', '1672', '1736'),
    spouse('arne-astrid-frostzorn', 'Arne', 'male', '1667', '1728'),
    spouse('svala-leifric-frostzorn', 'Svala', 'female', '1680', ''),
    spouse('einar-skadi-frostzorn', 'Einar', 'male', '1676', '1731'),

    person('vorn-1697-frostzorn', 'Vorn Frostzorn', 'male', '1697', '', {
      title: 'Oberhaupt des Clan Frostzorn'
    }),
    person('benjen-1702-frostzorn', 'Benjen Frostzorn', 'male', '1702', ''),
    person('hrolfr-1704-frostzorn', 'Hrolfr Frostzorn', 'male', '1704', ''),
    person('sigrid-1718-frostzorn', 'Sigrid Frostzorn', 'female', '1718', ''),
    spouse('ragna-vorn-frostzorn', 'Ragna', 'female', '1701', ''),
    spouse('liv-benjen-frostzorn', 'Liv', 'female', '1705', ''),
    spouse('yrsa-hrolfr-frostzorn', 'Yrsa', 'female', '1707', ''),

    person('arvid-frostzorn', 'Arvid Frostzorn', 'male', '1721', ''),
    person('pidra-frostzorn', 'Pidra Frostzorn', 'female', '1724', ''),
    person('leif-frostzorn', 'Leif Frostzorn', 'male', '1728', ''),
    person('eydis-frostzorn', 'Eydis Frostzorn', 'female', '1727', ''),
    person('hakon-1730-frostzorn', 'Hakon Frostzorn', 'male', '1730', ''),
    person('runa-1731-frostzorn', 'Runa Frostzorn', 'female', '1731', ''),
    person('styr-1734-frostzorn', 'Styr Frostzorn', 'male', '1734', '')
  ],
  partnerships: [
    partnership('marriage-vorn-pidra-frostzorn-founders', { status: 'ended', end: '1672' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-hakon-sigrid-frostzorn', 'styrkar-frostzorn', { status: 'ended', end: '1708' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-eirik-runa-frostzorn', 'leifric-frostzorn', { status: 'ended', end: '1717' }),
    partnership('marriage-torsten-ylva-frostzorn', { status: 'ended', end: '1710' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-styrkar-brynhild-frostzorn', 'vorn-1697-frostzorn', { status: 'ended', end: '1729' }),
    partnership('marriage-arne-astrid-frostzorn', { status: 'ended', end: '1728' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches('marriage-leifric-svala-frostzorn', 'hrolfr-1704-frostzorn'),
    partnership('marriage-einar-skadi-frostzorn', { status: 'ended', end: '1731' }),
    alignLeafChildrenBelowPair('marriage-vorn-ragna-frostzorn'),
    alignLeafChildrenBelowPair('marriage-benjen-liv-frostzorn'),
    alignLeafChildrenBelowPair('marriage-hrolfr-yrsa-frostzorn')
  ],
  parentages: [
    ...childrenOf(['hakon-frostzorn', 'eirik-frostzorn', 'ylva-frostzorn'], 'marriage-vorn-pidra-frostzorn-founders'),
    ...childrenOf(['styrkar-frostzorn', 'astrid-frostzorn'], 'marriage-hakon-sigrid-frostzorn'),
    ...childrenOf(['leifric-frostzorn', 'skadi-frostzorn'], 'marriage-eirik-runa-frostzorn'),
    ...childrenOf(['vorn-1697-frostzorn', 'benjen-1702-frostzorn'], 'marriage-styrkar-brynhild-frostzorn'),
    ...childrenOf(['hrolfr-1704-frostzorn', 'sigrid-1718-frostzorn'], 'marriage-leifric-svala-frostzorn'),
    ...childrenOf(['arvid-frostzorn', 'pidra-frostzorn', 'leif-frostzorn'], 'marriage-vorn-ragna-frostzorn'),
    ...childrenOf(['eydis-frostzorn', 'hakon-1730-frostzorn'], 'marriage-benjen-liv-frostzorn'),
    ...childrenOf(['runa-1731-frostzorn', 'styr-1734-frostzorn'], 'marriage-hrolfr-yrsa-frostzorn')
  ],
  cadetBranches: [
    unknownHouseBranch('ylva-frostzorn', 'marriage-torsten-ylva-frostzorn'),
    unknownHouseBranch('astrid-frostzorn', 'marriage-arne-astrid-frostzorn'),
    unknownHouseBranch('skadi-frostzorn', 'marriage-einar-skadi-frostzorn')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-vorn-pidra-frostzorn-founders',
    houseId: FROSTZORN_HOUSE_ID,
    crestSubtitle: 'Abtrünniger Kadettenzweig der Frostaugen · Sirenen-Zahn-Riff-Inseln',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'vorn-frostauge',
    orientation: 'vertical',
    ancestorDepth: 16,
    descendantDepth: 16,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    outlawHouse: true,
    chartLayoutPolicy: 'strict-v1',
    chartAlignLineageOriginOverTree: true,
    chartLineageCrestParentPersonId: 'vorn-frostauge',
    sourceRevision: 3,
    sourceModule: 'Frostzorn-Ergänzung zur Frostaugen-Quelle',
    sourceNote: 'Vorn Frostauge und Pidra erscheinen als tatsächliches Gründerpaar des abtrünnigen Kadettenzweigs. Direkt unter ihnen folgt das Frostzorn-Wappen; ein Zeitsprung wird ausdrücklich nicht verwendet. Vorn bleibt über dieselbe Weltpersonen-ID zugleich als Benjens zweiter Sohn in der Frostaugen-Akte registriert, ohne dass die beiden Stammbäume ihre Nachkommen miteinander vermischen. Die Namen der Nachkommen nach Vorn sind eine behutsame Ergänzung auf Nutzerwunsch, da die Frostaugen-Quelle diesen Exilzweig nicht weiter ausführt. Alle im Jahr 1740 unter 25 Jahre alten Sprösslinge bleiben unverheiratet und ohne Verlobungsplatzhalter.',
    registryManagedExtensionFields: [
      'blankFamily',
      'sourceNote',
      'chartLayoutPolicy',
      'chartAlignLineageOriginOverTree',
      'chartLineageCrestParentPersonId'
    ],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-frostzorn-gruender', 'haus-frostzorn-gruenderin'],
      partnerships: ['marriage-haus-frostzorn-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.frostzorn.folderPath
});
