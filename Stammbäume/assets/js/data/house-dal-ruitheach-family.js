import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_IDS,
  HOUSE_DAL_RUITHEACH_PORTRAITS,
  HOUSE_DAL_RUITHEACH_REUSED_PORTRAIT_IDS
} from './house-dal-ruitheach-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_TONN_HOUSE_EMBLEMS,
  TIR_NA_TONN_HOUSE_PROFILES,
  TIR_NA_TONN_MANAGED_PROFILE_FIELDS
} from './tir-na-tonn-house-profiles.js';

const RUITHEACH_HOUSE_ID = 'house-ruitheach';
const RUITHEACH_EMBLEM = TIR_NA_TONN_HOUSE_EMBLEMS.ruitheach;

const HOUSE_HEAD_IDS = new Set([
  'ruaidhri-founder-ruitheach',
  'wiochan-ruitheach',
  'ruaidhri-1648-ruitheach',
  'muirinn-ruitheach'
]);

const SUCCESSION_IDS = new Set([
  'troscan-ruitheach',
  'nibhn-ruitheach'
]);

const HEAD_TITLES = Object.freeze({
  'ruaidhri-founder-ruitheach': 'Gründer des Dál’Ruitheach-Clans · „der Biber“',
  'wiochan-ruitheach': 'Laird von Broch an Iar · bis 1699',
  'ruaidhri-1648-ruitheach': 'Laird von Broch an Iar · 1699–1724',
  'muirinn-ruitheach': 'Laird von Broch an Iar · seit 1724',
  'troscan-ruitheach': 'Erster der Erbfolge des Laird',
  'nibhn-ruitheach': 'Zweiter der Erbfolge des Laird'
});

const TARGETS = Object.freeze({
  tarvo: Object.freeze({
    name: 'Clan Fir An’Tarvo',
    houseId: 'house-tarvo',
    targetFamilyId: 'haus-fir-an-tarvo',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']
  }),
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = RUITHEACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_DAL_RUITHEACH_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === RUITHEACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return person(id, name, 'female', birth, death, RUITHEACH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
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

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'dal-ruitheach-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
}

function alignChildGroupBelowParentPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
        'chartAlignChildGroupBelowParentPair',
        'chartAlignPartnerOverChildrenPersonId'
      ])]
    }
  };
}

function alignChildrenUnderPartner(record, partnerPersonId) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignPartnerOverChildrenPersonId: partnerPersonId,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
        'chartAlignPartnerOverChildrenPersonId',
        'chartAlignChildGroupBelowParentPair'
      ])]
    }
  };
}

function marriedAway(id, partnershipId, targetKey) {
  const target = TARGETS[targetKey];
  return createMarriedAwayBranch({
    id,
    name: target.name,
    parentPartnershipId: partnershipId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Wegverheiratet an ${target.name}`,
    extensions: { chartAlignBelowPartnership: true }
  });
}

const FOUNDERS = ['ruaidhri-founder-ruitheach', 'fionnghuala-founder-ruitheach'];
const WIOCHAN = ['wiochan-ruitheach', 'geileis-gealan'];
const JANAR = ['wunaire-ceardaiocht', 'janar-ruitheach'];
const JANAR_AFFAIR = ['janar-ruitheach', 'feidlim-ruitheach-affair'];
const RUAIDHRI = ['ruaidhri-1648-ruitheach', 'laoise-luchdon'];
const DRAIGHEAN = ['draighean-ruitheach', 'kadhghan-laidir'];
const MUIRINN = ['muirinn-ruitheach', 'quiseog-gortach'];
const CONAIREAN = ['laimreac-tarvo', 'conairean-ruitheach'];
const GORMAN = ['gorman-ruitheach', 'yluach-fastaigh'];
const TROSCAN = ['aoibhrigh-gealach', 'troscan-ruitheach'];
const MEABH = ['taerlach-ghaiscioch', 'meabh-ruitheach'];
const JAIMHIN = ['jaimhin-ruitheach', 'ealasaid-ruitheach'];

export const HOUSE_DAL_RUITHEACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ruitheach',
    title: 'Dál’Ruitheach',
    motto: '',
    description: 'Laird-Clan der westlichen Herrschaft von Tir na Tonn mit Sitz in Broch an Iar.',
    emblem: RUITHEACH_EMBLEM,
    houseProfile: TIR_NA_TONN_HOUSE_PROFILES.ruitheach
  },
  houses: [
    house(RUITHEACH_HOUSE_ID, 'Dál’Ruitheach', RUITHEACH_EMBLEM),
    house('house-gealan', 'Haus Gealán'),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    house('house-luchdon', 'Haus Luchdon'),
    house('house-laidir', 'Haus Laidir'),
    house('house-gortach', 'Ru’Gortach', TIR_NA_TONN_HOUSE_EMBLEMS.gortach),
    house('house-tarvo', 'Clan Fir An’Tarvo', TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo']),
    house('house-fastaigh', 'Haus Fastaigh'),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch)
  ],
  persons: [
    person('ruaidhri-founder-ruitheach', 'Ruaidhrígh Ruitheach', 'male', '????', '????', RUITHEACH_HOUSE_ID, {
      tags: ['Gründer'],
      notes: 'Beiname „der Biber“. Die Clanüberlieferung führt ihn auf Mogh Ruith zurück; diese Abstammung ist in der Fianna-Genealogie nicht belegt.'
    }),
    spouse('fionnghuala-founder-ruitheach', 'Fionnghuala', 'female', '????', '????'),

    person('wiochan-ruitheach', 'Wiochán Ruitheach', 'male', '1625', '1699'),
    person('janar-ruitheach', 'Jánar Ruitheach', 'male', '1628', '1671', RUITHEACH_HOUSE_ID, {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['wunaire-ceardaiocht', 'feidlim-ruitheach-affair'],
        chartKeepPartnerGroupTogether: true,
        chartPartnerGroupPersonOrder: [
          'wunaire-ceardaiocht',
          'janar-ruitheach',
          'feidlim-ruitheach-affair'
        ],
        registryManagedExtensionFields: [
          'chartCenterBetweenPartnerPersonIds',
          'chartKeepPartnerGroupTogether',
          'chartPartnerGroupPersonOrder'
        ]
      }
    }),
    spouse('geileis-gealan', 'Geiléis Gealán', 'female', '1628', '', 'house-gealan', {
      tags: ['Magierin'],
      notes: 'Geborene Gealán; in der Quellakte als Magierin beschrieben.'
    }),
    spouse('wunaire-ceardaiocht', 'Wúnaire Ceardaíocht', 'female', '1632', '1704', 'house-dal-ceardaiocht'),
    spouse('feidlim-ruitheach-affair', 'Feidlim', 'female', '1639', '1681', '', {
      familyRole: 'affair',
      title: 'Affäre Jánars · Mutter Júdans',
      tags: ['Affäre']
    }),

    person('ruaidhri-1648-ruitheach', 'Ruaidhrígh Ruitheach', 'male', '1648', '1724'),
    person('hodhblath-ruitheach', 'Hódhbláth Ruitheach', 'male', '1650', ''),
    person('draighean-ruitheach', 'Draighean Ruitheach', 'male', '1652', '1709'),
    person('judan-ruitheach', 'Júdán Ruitheach', 'male', '1660', '1731', RUITHEACH_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardsohn Jánars und Feidlims',
      tags: ['Bastard']
    }),
    spouse('laoise-luchdon', 'Laoise Luchdon', 'female', '1654', '1728', 'house-luchdon'),
    spouse('kadhghan-laidir', 'Kadhghán Laidir', 'female', '1649', '1705', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('muirinn-ruitheach', 'Muirinn Ruitheach', 'male', '1672', ''),
    awayWoman('conairean-ruitheach', 'Conairean Ruitheach', '1679', '', 'tarvo'),
    person('gorman-ruitheach', 'Gormán Ruitheach', 'male', '1681', ''),
    spouse('quiseog-gortach', 'Quiseog Gortach', 'female', '1675', '', 'house-gortach'),
    spouse('laimreac-tarvo', 'Laimreac Tarvo', 'male', '1675', '', 'house-tarvo'),
    spouse('yluach-fastaigh', 'Yluach Fastaigh', 'female', '1682', '', 'house-fastaigh'),

    person('troscan-ruitheach', 'Troscán Ruitheach', 'male', '1696', ''),
    awayWoman('meabh-ruitheach', 'Méabh Ruitheach', '1702', '', 'ghaiscioch'),
    person('tormodh-ruitheach', 'Tormodh Ruitheach', 'male', '1700', ''),
    person('jaimhin-ruitheach', 'Jaimhín Ruitheach', 'male', '1702', ''),
    spouse('aoibhrigh-gealach', 'Aoibhrígh Gealach', 'female', '1700', '', 'house-gealach'),
    spouse('taerlach-ghaiscioch', 'Taerlach Ghaiscíoch', 'male', '1697', '', 'house-ghaiscioch'),
    spouse('ealasaid-ruitheach', 'Ealasaid', 'female', '1704', ''),

    person('nibhn-ruitheach', 'Níbhn Ruitheach', 'male', '1721', ''),
    person('cailin-ruitheach', 'Cailín Ruitheach', 'male', '1724', ''),
    person('blaine-ruitheach', 'Blaine Ruitheach', 'female', '1724', ''),
    person('donal-ruitheach', 'Dónal Ruitheach', 'male', '1726', '')
  ],
  partnerships: [
    endedMarriage('marriage-ruaidhri-fionnghuala-ruitheach', FOUNDERS),
    alignChildGroupBelowParentPair(endedMarriage('marriage-wiochan-geileis-ruitheach', WIOCHAN, '1699')),
    alignChildGroupBelowParentPair(endedMarriage('marriage-wunaire-janar', JANAR, '1671')),
    alignChildrenUnderPartner(createMarriage('affair-janar-feidlim-ruitheach', ...JANAR_AFFAIR, {
      type: 'affair',
      status: 'ended',
      end: '1671',
      visibility: 'private'
    }), 'feidlim-ruitheach-affair'),
    alignChildGroupBelowParentPair(endedMarriage('marriage-ruaidhri-laoise-ruitheach', RUAIDHRI, '1724')),
    endedMarriage('marriage-draighean-kadhghan-ruitheach', DRAIGHEAN, '1705'),
    alignChildGroupBelowParentPair(createMarriage('marriage-muirinn-quiseog-gortach', ...MUIRINN)),
    createMarriage('marriage-laimreac-conairean', ...CONAIREAN),
    alignChildGroupBelowParentPair(createMarriage('marriage-gorman-yluach-ruitheach', ...GORMAN)),
    alignChildGroupBelowParentPair(createMarriage('marriage-aoibhrigh-troscan', ...TROSCAN)),
    createMarriage('marriage-taerlach-meabh', ...MEABH),
    alignChildGroupBelowParentPair(createMarriage('marriage-jaimhin-ealasaid-ruitheach', ...JAIMHIN))
  ],
  parentages: [
    ...childrenOf(['wiochan-ruitheach', 'janar-ruitheach'], FOUNDERS, 'marriage-ruaidhri-fionnghuala-ruitheach', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die Quellakte setzt zwischen dem Gründerpaar und der ab 1625 datierten Linie eine ausdrückliche, nicht einzeln überlieferte Generationenfolge.',
      extensions: { timeJumpId: 'gap-ruaidhri-wiochan-janar-ruitheach' }
    }),
    ...childrenOf(['ruaidhri-1648-ruitheach', 'hodhblath-ruitheach'], WIOCHAN, 'marriage-wiochan-geileis-ruitheach'),
    ...childrenOf(['draighean-ruitheach'], JANAR, 'marriage-wunaire-janar'),
    ...childrenOf(['judan-ruitheach'], JANAR_AFFAIR, 'affair-janar-feidlim-ruitheach', {
      legitimacy: 'illegitimate'
    }),
    ...childrenOf(['muirinn-ruitheach', 'conairean-ruitheach', 'gorman-ruitheach'], RUAIDHRI, 'marriage-ruaidhri-laoise-ruitheach'),
    ...childrenOf(['troscan-ruitheach', 'meabh-ruitheach'], MUIRINN, 'marriage-muirinn-quiseog-gortach'),
    ...childrenOf(['tormodh-ruitheach', 'jaimhin-ruitheach'], GORMAN, 'marriage-gorman-yluach-ruitheach'),
    ...childrenOf(['nibhn-ruitheach', 'cailin-ruitheach'], TROSCAN, 'marriage-aoibhrigh-troscan'),
    ...childrenOf(['blaine-ruitheach', 'donal-ruitheach'], JAIMHIN, 'marriage-jaimhin-ealasaid-ruitheach')
  ],
  cadetBranches: [
    marriedAway('married-away-tarvo-conairean', 'marriage-laimreac-conairean', 'tarvo'),
    marriedAway('married-away-ghaiscioch-meabh', 'marriage-taerlach-meabh', 'ghaiscioch')
  ],
  timeJumps: [
    {
      id: 'gap-ruaidhri-wiochan-janar-ruitheach',
      parentPartnershipId: 'marriage-ruaidhri-fionnghuala-ruitheach',
      childIds: ['wiochan-ruitheach', 'janar-ruitheach'],
      years: 0,
      fromYear: '????',
      toYear: '1625',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1625 datierten Linie',
      notes: 'Die Punktreihe der Quellakte wird als serieller Zeitsprung erhalten.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ruaidhri-fionnghuala-ruitheach',
    houseId: RUITHEACH_HOUSE_ID,
    crestSubtitle: 'Laird · Herrschaft Dál’Ruitheach · Broch an Iar · Tir na Tonn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ruaidhri-founder-ruitheach',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Dál’Ruitheach (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten und die agnatische Erbfolge folgen der bereitgestellten Dál’Ruitheach-Akte. Die behauptete Abstammung von Mogh Ruith bleibt als unbelegte Clanüberlieferung vermerkt; die gesicherte Fianna-Linie beginnt bei Ruaidhrígh „dem Biber“. Júdán ist Jánars Bastardsohn mit Feidlim und steht direkt unter seiner Mutter. Alle ehelichen Kindergruppen entspringen normal der Mitte ihrer Elternpaare. Bestehende Weltpersonen und Ehe-IDs werden mit den Gegenakten geteilt. Wiederholte Standardsilhouetten werden nicht als individuelle Porträts übernommen.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird von Broch an Iar',
      system: 'agnatische Primogenitur',
      headOrder: Object.freeze([
        'ruaidhri-founder-ruitheach',
        'wiochan-ruitheach',
        'ruaidhri-1648-ruitheach',
        'muirinn-ruitheach'
      ]),
      publishedOrder: Object.freeze([
        'troscan-ruitheach',
        'nibhn-ruitheach'
      ])
    }),
    sourceDiscrepancies: Object.freeze({
      wiochanBirth: Object.freeze({ headTable: '????', genealogy: '1625', canonical: '1625' }),
      moghRuithDescent: Object.freeze({ claim: 'Mogh Ruith', status: 'nicht durch die Fianna-Genealogie belegt' })
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_DAL_RUITHEACH_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Tonn',
    territoryGloss: 'Land der Wellen',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird der Herrschaft Dál’Ruitheach',
    immediateLiegeHouseId: 'haus-fir-an-tarvo',
    immediateLiegeHouseName: 'Clan Fir An’Tarvo',
    legacyTitles: Object.freeze(['Haus Ruitheach', "Dal'Ruitheach"]),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'inheritance',
      'sourceDiscrepancies',
      'portraitPolicy',
      'principality',
      'territory',
      'territoryGloss',
      'historicalStatus',
      'albicRank',
      'administrativeRole',
      'immediateLiegeHouseId',
      'immediateLiegeHouseName',
      'legacyTitles'
    ],
    registryManagedHouseProfileFields: TIR_NA_TONN_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-ruitheach-gruender', 'haus-ruitheach-gruenderin'],
      partnerships: ['marriage-haus-ruitheach-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
