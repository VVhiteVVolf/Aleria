import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriedAwayBranch,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_HJERTE_PORTRAITS } from './house-hjerte-portraits.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const HJERTE_HOUSE_ID = 'house-hjerte';

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
  const houseId = options.houseId === undefined ? HJERTE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || 'dead',
    houseId,
    portrait: HOUSE_HJERTE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === HJERTE_HOUSE_ID ? 'core' : 'married'),
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
    familyRole: 'married'
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

const COUPLES = Object.freeze({
  unknownFounders: ['unknown-father-hjerte', 'unknown-mother-hjerte'],
  fafnir: ['fafnir-hjerte', 'aenva'],
  urdar: ['urdar-hjerte', 'islaug'],
  brynjar: ['brynjar-hjerte', 'hallveig-hjerte'],
  kolskegg: ['kolskegg-hjerte', 'othrun'],
  zarnik: ['zarnik-hjerte', 'gluthilda'],
  woldrim: ['woldrim-hjerte', 'gislaug'],
  wodrun: ['wodrun-hjerte', 'rafnar-vaeren'],
  fjalmar: ['fjalmar-hjerte', 'volga'],
  kjalmar: ['kjalmar-hjerte', 'rorda']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-unknown-hjerte-founders': COUPLES.unknownFounders,
  'marriage-fafnir-aenva-hjerte': COUPLES.fafnir,
  'marriage-urdar-islaug-hjerte': COUPLES.urdar,
  'marriage-brynjar-hallveig-hjerte': COUPLES.brynjar,
  'marriage-kolskegg-othrun-hjerte': COUPLES.kolskegg,
  'marriage-zarnik-gluthilda-hjerte': COUPLES.zarnik,
  'marriage-woldrim-gislaug-hjerte': COUPLES.woldrim,
  'marriage-wodrun-rafnar-hjerte': COUPLES.wodrun,
  'marriage-fjalmar-volga-hjerte': COUPLES.fjalmar,
  'marriage-kjalmar-rorda-hjerte': COUPLES.kjalmar
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'hjerte-parentage',
    ...options
  });
}

const SOURCE_GAP_IDS = Object.freeze({
  fafnir: 'gap-fafnir-to-urdar-brynjar-hjerte',
  urdar: 'gap-urdar-to-kolskegg-zarnik-hjerte',
  kolskegg: 'gap-kolskegg-to-woldrim-wodrun-hjerte',
  woldrim: 'gap-woldrim-to-fjalmar-kjalmar-hjerte'
});

function claimedChildrenAfterGap(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
  });
}

function sourceGap(id, parentPartnershipId, childIds) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '????',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner; kein anderer Zeitsprung steht parallel auf dieser Ebene.',
    extensions: {}
  };
}

export const HOUSE_HJERTE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-hjerte',
    title: 'Clan Hjerte',
    motto: 'Behaupte dich, bis es wahr wird',
    description: 'Einst mächtiger Norrnaigh-Clan aus dem Gebiet des späteren Krähenmoors. Der erloschene Stammclan zerfiel in die Kadettenlinien Kummerherz, Schattenherz, Feuerherz und Kaltherz.',
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS.hjerte,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.hjerte
  },
  houses: [
    house(HJERTE_HOUSE_ID, 'Clan Hjerte', KRAEHENMOOR_HOUSE_EMBLEMS.hjerte, 'extinct'),
    house('house-kummerherz', 'Clan Kummerherz', SCHWARZFENN_HOUSE_EMBLEMS.kummerherz),
    house('house-schattenherz', 'Clan Schattenherz'),
    house('house-feuerherz', 'Clan Feuerherz'),
    house('house-kaltherz', 'Clan Kaltherz'),
    house('house-vaeren', 'Clan Vaeren', ALDRIMAR_HOUSE_EMBLEMS.vaeren)
  ],
  persons: [
    person('unknown-father-hjerte', '???', 'male', '????', '????', {
      title: 'Unbekannter Vater Fafnirs',
      lineageRole: 'head'
    }),
    person('unknown-mother-hjerte', '???', 'female', '????', '????', {
      title: 'Unbekannte Mutter Fafnirs'
    }),
    person('fafnir-hjerte', 'Fafnir Hjerte', 'male', '????', '????', {
      title: 'Erster namentlich überlieferter Hjerte',
      lineageRole: 'head'
    }),
    spouse('aenva', 'Aenva', 'female'),
    person('urdar-hjerte', 'Urdar Hjerte', 'male', '????', '????', {
      title: 'Oberhaupt des Clans Hjerte',
      lineageRole: 'head'
    }),
    spouse('islaug', 'Islaug', 'female'),
    person('brynjar-hjerte', 'Brynjar Hjerte', 'male', '????', '????', {
      title: 'Hjerte-Spross · Begründer der Kummerherz-Linie',
      tags: ['Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('hallveig-hjerte', 'Hallveig', 'female', {
      title: 'Ehefrau Brynjars · Mitbegründerin der Kummerherz-Linie',
      tags: ['Kadettenhausgründerin']
    }),
    person('kolskegg-hjerte', 'Kolskegg Hjerte', 'male', '????', '????', {
      title: 'Oberhaupt des Clans Hjerte',
      lineageRole: 'head'
    }),
    spouse('othrun', 'Othrun', 'female'),
    person('zarnik-hjerte', 'Zarnik Hjerte', 'male', '????', '????', {
      title: 'Hjerte-Spross · Begründer der Schattenherz-Linie',
      tags: ['Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('gluthilda', 'Gluthilda', 'female', {
      title: 'Mitbegründerin der Schattenherz-Linie',
      tags: ['Kadettenhausgründerin']
    }),
    person('woldrim-hjerte', 'Woldrim Hjerte', 'male', '????', '????', {
      title: 'Letztes ungeteiltes Oberhaupt des Clans Hjerte',
      lineageRole: 'head'
    }),
    spouse('gislaug', 'Gislaug', 'female'),
    person('wodrun-hjerte', 'Wodrun Hjerte', 'female', '????', '????', {
      title: 'Wegverheiratet an Clan Vaeren',
      tags: ['Wegverheiratet']
    }),
    spouse('rafnar-vaeren', 'Rafnar Vaeren', 'male', {
      houseId: 'house-vaeren'
    }),
    person('fjalmar-hjerte', 'Fjalmar Hjerte', 'male', '????', '????', {
      title: 'Zwillingsbruder Kjalmars · Begründer der Feuerherz-Linie',
      tags: ['Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('volga', 'Volga', 'female', {
      title: 'Mitbegründerin der Feuerherz-Linie',
      tags: ['Kadettenhausgründerin']
    }),
    person('kjalmar-hjerte', 'Kjalmar Hjerte', 'male', '????', '????', {
      title: 'Zwillingsbruder Fjalmars · Begründer der Kaltherz-Linie',
      tags: ['Kadettenhausgründer'],
      lineageRole: 'mainline'
    }),
    spouse('rorda', 'Rorda', 'female', {
      title: 'Mitbegründerin der Kaltherz-Linie',
      tags: ['Kadettenhausgründerin']
    })
  ],
  partnerships: Object.keys(PARTNERS_BY_ID).map(partnershipId => partnership(partnershipId, {
    status: 'ended'
  })),
  parentages: [
    ...childrenOf(['fafnir-hjerte'], 'marriage-unknown-hjerte-founders'),
    ...claimedChildrenAfterGap(
      ['urdar-hjerte', 'brynjar-hjerte'],
      'marriage-fafnir-aenva-hjerte',
      SOURCE_GAP_IDS.fafnir
    ),
    ...claimedChildrenAfterGap(
      ['kolskegg-hjerte', 'zarnik-hjerte'],
      'marriage-urdar-islaug-hjerte',
      SOURCE_GAP_IDS.urdar
    ),
    ...claimedChildrenAfterGap(
      ['woldrim-hjerte', 'wodrun-hjerte'],
      'marriage-kolskegg-othrun-hjerte',
      SOURCE_GAP_IDS.kolskegg
    ),
    ...claimedChildrenAfterGap(
      ['fjalmar-hjerte', 'kjalmar-hjerte'],
      'marriage-woldrim-gislaug-hjerte',
      SOURCE_GAP_IDS.woldrim
    )
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-kummerherz-brynjar',
      name: 'Clan Kummerherz',
      parentPartnershipId: 'marriage-brynjar-hallveig-hjerte',
      houseId: 'house-kummerherz',
      targetFamilyId: 'haus-kummerherz',
      emblem: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
      subtitle: 'Von Brynjar Hjerte und Hallveig begründetes Kadettenhaus',
      notes: 'Der Kummerherz-Knoten hängt direkt und geradlinig unter Brynjar und Hallveig.'
    }),
    createCadetHouseBranch({
      id: 'cadet-schattenherz-zarnik',
      name: 'Clan Schattenherz',
      parentPartnershipId: 'marriage-zarnik-gluthilda-hjerte',
      houseId: 'house-schattenherz',
      targetFamilyId: 'haus-schattenherz',
      subtitle: 'Von Zarnik Hjerte und Gluthilda begründete Kadettenlinie',
      notes: 'Vorbereitende Verknüpfung der von Zarnik Hjerte und Gluthilda begründeten Schattenherz-Linie.'
    }),
    createCadetHouseBranch({
      id: 'cadet-feuerherz-fjalmar',
      name: 'Clan Feuerherz',
      parentPartnershipId: 'marriage-fjalmar-volga-hjerte',
      houseId: 'house-feuerherz',
      targetFamilyId: 'haus-feuerherz',
      subtitle: 'Von Fjalmar Hjerte und Volga begründete Kadettenlinie',
      notes: 'Vorbereitende Verknüpfung der aus der Hjerte-Spaltung hervorgegangenen Feuerherz-Linie.'
    }),
    createCadetHouseBranch({
      id: 'cadet-kaltherz-kjalmar',
      name: 'Clan Kaltherz',
      parentPartnershipId: 'marriage-kjalmar-rorda-hjerte',
      houseId: 'house-kaltherz',
      targetFamilyId: 'haus-kaltherz',
      subtitle: 'Von Kjalmar Hjerte und Rorda begründete Kadettenlinie',
      notes: 'Vorbereitende Verknüpfung der aus der Hjerte-Spaltung hervorgegangenen Kaltherz-Linie.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-wodrun-hjerte-vaeren',
      name: 'Clan Vaeren',
      parentPartnershipId: 'marriage-wodrun-rafnar-hjerte',
      houseId: 'house-vaeren',
      targetFamilyId: 'haus-vaeren',
      emblem: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
      subtitle: 'Wegverheiratet an Clan Vaeren',
      notes: 'Wodruns Zweig endet im Hjerte-Stammbaum an der direkten Wegverheiratet-Verknüpfung zum Clan Vaeren.'
    })
  ],
  timeJumps: [
    sourceGap(SOURCE_GAP_IDS.fafnir, 'marriage-fafnir-aenva-hjerte', ['urdar-hjerte', 'brynjar-hjerte']),
    sourceGap(SOURCE_GAP_IDS.urdar, 'marriage-urdar-islaug-hjerte', ['kolskegg-hjerte', 'zarnik-hjerte']),
    sourceGap(SOURCE_GAP_IDS.kolskegg, 'marriage-kolskegg-othrun-hjerte', ['woldrim-hjerte', 'wodrun-hjerte']),
    sourceGap(SOURCE_GAP_IDS.woldrim, 'marriage-woldrim-gislaug-hjerte', ['fjalmar-hjerte', 'kjalmar-hjerte'])
  ],
  lineage: {
    founderPartnershipId: 'marriage-unknown-hjerte-founders',
    houseId: HJERTE_HOUSE_ID,
    crestSubtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan von Krähenmoor',
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
    focusPersonId: 'unknown-father-hjerte',
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
    sourceModule: 'Clan Hjerte (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Hjerte-Stammbaum wird ohne Personenfokus von den unbekannten Eltern Fafnirs bis zu den Zwillingsbrüdern Fjalmar und Kjalmar gezeigt. Vier Punktreihen der Quelle werden als vier strikt serielle Generationentrenner modelliert. Urdar führt die alte Hauptlinie über Kolskegg und Woldrim fort; Brynjar und Hallveig begründen direkt die Kummerherzen. Zarnik und Gluthilda begründen nach ausdrücklicher Korrektur die Schattenherzen, Fjalmar und Volga die Feuerherzen sowie Kjalmar und Rorda die Kaltherzen. Wodrun gründet kein Kadettenhaus, sondern ist ausschließlich an Rafnar Vaeren und damit an Clan Vaeren wegverheiratet. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    successorFamilyIds: ['haus-kummerherz', 'haus-schattenherz', 'haus-feuerherz', 'haus-kaltherz'],
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryTombstones: {
      cadetBranches: ['cadet-schattenherz-wodrun']
    },
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
