import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_JAERNBLOD_PORTRAITS } from './house-jaernblod-portraits.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';

const JAERNBLOD_HOUSE_ID = 'house-jaernblod';

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

function person(id, name, sex, birth = '????', death = '????', options = {}) {
  const houseId = options.houseId === undefined ? JAERNBLOD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || 'dead',
    houseId,
    portrait: HOUSE_JAERNBLOD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === JAERNBLOD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, options = {}) {
  return person(id, name, sex, '????', '????', {
    ...options,
    houseId: options.houseId || '',
    familyRole: options.familyRole || 'married'
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-alfgeir-modrun-jaernblod': ['alfgeir-jaernblod', 'modrun'],
  'marriage-geri-orhild-jaernblod': ['geri-jaernblod', 'orhild'],
  'marriage-skjoldur-gunnhild-jaernblod': ['skjoldur-jaernblod', 'gunnhild-varangr'],
  'marriage-floki-imhild-jaernblod': ['floki-jaernblod', 'imhild'],
  'affair-floki-njaldis-jaernblod': ['floki-jaernblod', 'njaldis'],
  'marriage-fenrir-skalli-jaernblod': ['fenrir', 'skalli-jaernblod'],
  'marriage-freki-skadi-jaernblod': ['freki-jaernblod', 'skadi']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignPartnerOverChildren(record, partnerPersonId) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'jaernblod-parentage',
    ...options
  });
}

function claimedChildrenAfterGap(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
  });
}

function sourceGap(id, parentPartnershipId, childIds, sharedParentPartnershipIds = []) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    sharedParentPartnershipIds,
    years: 0,
    fromYear: '????',
    toYear: '????',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; kein zweiter Zeitsprung und keine Person wird parallel auf seiner Ebene angeordnet.',
    extensions: {
      registryManagedFields: [
        'parentPartnershipId',
        'parentPersonId',
        'childIds',
        'sharedParentPartnershipIds',
        'years',
        'fromYear',
        'toYear',
        'label',
        'notes'
      ]
    }
  };
}

function cadetBranch({ id, name, parentPartnershipId, houseId, targetFamilyId, emblem, subtitle }) {
  return createCadetHouseBranch({
    id,
    name,
    parentPartnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle,
    notes: `${name} wird als direkter gemeinsamer Spross des Gründerpaares geführt.`,
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

const FIRST_GAP_ID = 'gap-alfgeir-to-geri-skjoldur-jaernblod';
const SECOND_GAP_ID = 'gap-geri-to-floki-jaernblod';

export const HOUSE_JAERNBLOD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-jaernblod',
    title: 'Clan Järnblod',
    motto: '',
    description: 'Ausgestorbener Norrnaigh-Thanenclan von Krähenmoor. Aus den Järnblod gingen die Linien Schwarzblut, Blutstahl und Silberblut hervor.',
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.jaernblod
  },
  houses: [
    house(JAERNBLOD_HOUSE_ID, 'Clan Järnblod', KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod, 'extinct'),
    house('house-varangr', 'Clan Varangr', ALDRIMAR_HOUSE_EMBLEMS.varangr),
    house('house-schwarzblut', 'Clan Schwarzblut', KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut),
    house('house-blutstahl', 'Clan Blutstahl', KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl),
    house('house-silberblut', 'Clan Silberblut', KRAEHENMOOR_HOUSE_EMBLEMS.silberblut)
  ],
  persons: [
    person('alfgeir-jaernblod', 'Alfgeir Järnblod', 'male', '????', '????', {
      title: 'Gründer und erstes Oberhaupt des Clans Järnblod',
      lineageRole: 'head',
      tags: ['Gründer']
    }),
    spouse('modrun', 'Modrun', 'female', {
      title: 'Mitbegründerin des Clans Järnblod',
      tags: ['Gründerin']
    }),

    person('geri-jaernblod', 'Geri Järnblod', 'male', '????', '????', {
      title: 'Oberhaupt des Clans Järnblod',
      lineageRole: 'head'
    }),
    spouse('orhild', 'Orhild', 'female'),
    person('skjoldur-jaernblod', 'Skjoldur Järnblod', 'male', '????', '????', {
      title: 'Järnblod-Spross · Begründer des Clans Schwarzblut',
      tags: ['Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('gunnhild-varangr', 'Gunnhild', 'female', {
      houseId: 'house-varangr',
      title: 'Varangr-Frau · Mitbegründerin des Clans Schwarzblut',
      tags: ['Kadettenhausgründerin']
    }),

    person('floki-jaernblod', 'Floki Järnblod', 'male', '????', '????', {
      title: 'Letztes Oberhaupt des ungeteilten Clans Järnblod',
      lineageRole: 'head',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['imhild', 'njaldis'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('imhild', 'Imhild', 'female', {
      title: 'Ehefrau Flokis · Mutter Skallis'
    }),
    person('njaldis', 'Njaldis', 'female', '????', '????', {
      houseId: '',
      familyRole: 'affair',
      title: 'Affäre Flokis · Mutter Frekis',
      tags: ['Affäre']
    }),
    person('skalli-jaernblod', 'Skalli Järnblod', 'female', '????', '????', {
      title: 'Einzige legitime Tochter Flokis · Mitbegründerin des Clans Blutstahl',
      tags: ['Kadettenhausgründerin'],
      lineageRole: 'mainline'
    }),
    spouse('fenrir', 'Fenrir', 'male', {
      title: 'Mitbegründer des Clans Blutstahl',
      tags: ['Kadettenhausgründer']
    }),
    person('freki-jaernblod', 'Freki Järnblod', 'male', '????', '????', {
      familyRole: 'bastard',
      title: 'Legitimierter Bastardsohn Flokis · Mitbegründer des Clans Silberblut',
      tags: ['Bastard', 'Legitimiert', 'Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('skadi', 'Skadi', 'female', {
      title: 'Mitbegründerin des Clans Silberblut',
      tags: ['Kadettenhausgründerin']
    })
  ],
  partnerships: [
    partnership('marriage-alfgeir-modrun-jaernblod', { status: 'ended' }),
    partnership('marriage-geri-orhild-jaernblod', { status: 'ended' }),
    partnership('marriage-skjoldur-gunnhild-jaernblod', { status: 'ended' }),
    alignPartnerOverChildren(
      partnership('marriage-floki-imhild-jaernblod', { status: 'ended' }),
      'imhild'
    ),
    alignPartnerOverChildren(
      partnership('affair-floki-njaldis-jaernblod', {
        type: 'affair',
        status: 'ended',
        visibility: 'private',
        notes: 'Freki entstammt Flokis Affäre mit Njaldis und wurde später legitimiert.'
      }),
      'njaldis'
    ),
    partnership('marriage-fenrir-skalli-jaernblod', { status: 'ended' }),
    partnership('marriage-freki-skadi-jaernblod', { status: 'ended' })
  ],
  parentages: [
    ...claimedChildrenAfterGap(
      ['geri-jaernblod', 'skjoldur-jaernblod'],
      'marriage-alfgeir-modrun-jaernblod',
      FIRST_GAP_ID
    ),
    ...claimedChildrenAfterGap(
      ['floki-jaernblod'],
      'marriage-geri-orhild-jaernblod',
      SECOND_GAP_ID
    ),
    ...childrenOf(['skalli-jaernblod'], 'marriage-floki-imhild-jaernblod'),
    ...childrenOf(['freki-jaernblod'], 'affair-floki-njaldis-jaernblod', {
      legitimacy: 'legitimized',
      visibility: 'private',
      notes: 'Freki wurde als Bastard aus der Affäre Flokis mit Njaldis geboren und später legitimiert.'
    })
  ],
  cadetBranches: [
    cadetBranch({
      id: 'cadet-schwarzblut-skjoldur-gunnhild',
      name: 'Clan Schwarzblut',
      parentPartnershipId: 'marriage-skjoldur-gunnhild-jaernblod',
      houseId: 'house-schwarzblut',
      targetFamilyId: 'haus-schwarzblut',
      emblem: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
      subtitle: 'Von Skjoldur Järnblod und Gunnhild begründete Linie'
    }),
    cadetBranch({
      id: 'cadet-blutstahl-fenrir-skalli',
      name: 'Clan Blutstahl',
      parentPartnershipId: 'marriage-fenrir-skalli-jaernblod',
      houseId: 'house-blutstahl',
      targetFamilyId: 'haus-blutstahl',
      emblem: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
      subtitle: 'Von Fenrir und Skalli Järnblod begründete Linie'
    }),
    cadetBranch({
      id: 'cadet-silberblut-freki-skadi',
      name: 'Clan Silberblut',
      parentPartnershipId: 'marriage-freki-skadi-jaernblod',
      houseId: 'house-silberblut',
      targetFamilyId: 'haus-silberblut',
      emblem: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
      subtitle: 'Von Freki Järnblod und Skadi begründete Linie'
    })
  ],
  timeJumps: [
    sourceGap(
      FIRST_GAP_ID,
      'marriage-alfgeir-modrun-jaernblod',
      ['geri-jaernblod', 'skjoldur-jaernblod']
    ),
    sourceGap(
      SECOND_GAP_ID,
      'marriage-geri-orhild-jaernblod',
      ['floki-jaernblod']
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-alfgeir-modrun-jaernblod',
    houseId: JAERNBLOD_HOUSE_ID,
    crestSubtitle: 'Ausgestorbener Norrnaigh-Thanenclan von Krähenmoor',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: false,
      id: 'lineage-origin-house',
      houseId: '',
      name: 'Ursprungshaus',
      subtitle: '',
      emblem: '',
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: [],
      targetFamilyId: '',
      notes: '',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'alfgeir-jaernblod',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    extinctHouse: true,
    extinctCulture: 'Norrnaigh',
    sourceRevision: 3,
    sourceModule: 'Clan Järnblod (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Järnblod-Stammbaum wird ohne Personenfokus von Alfgeir und Modrun bis zur Dreiteilung des erloschenen Clans gezeigt. Skjoldur Järnblod und Gunnhild begründen Schwarzblut, Fenrir und Skalli Järnblod begründen Blutstahl, Freki Järnblod und Skadi begründen Silberblut. Die Schwarzblut-Linie endet an ihrem Kadettenhausknoten; ausschließlich Geri und Orhild führen in den zweiten seriellen Zeitsprung zu Floki. Freki ist Flokis Bastardsohn aus der Affäre mit Njaldis und wird gemäß Quelle legitimiert. Die Bezeichnung Eisenblut bleibt ein Beiname; die kanonische Akte heißt Järnblod.',
    successorFamilyIds: ['haus-schwarzblut', 'haus-blutstahl', 'haus-silberblut'],
    registryTombstones: {
      persons: ['haus-jaernblod-gruender', 'haus-jaernblod-gruenderin'],
      partnerships: ['marriage-haus-jaernblod-founders'],
      cadetBranches: ['extinct-haus-jaernblod']
    },
    registryManagedExtensionFields: [
      'blankFamily',
      'extinctHouse',
      'extinctCulture',
      'sourceNote',
      'successorFamilyIds'
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
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
