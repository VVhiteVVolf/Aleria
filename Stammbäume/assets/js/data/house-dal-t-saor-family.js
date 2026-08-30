import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import {
  createExtinctBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_DAL_T_SAOR_PORTRAITS,
  HOUSE_DAL_T_SAOR_REUSED_PORTRAIT_IDS
} from './house-dal-t-saor-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';

const DAL_T_SAOR_HOUSE_ID = 'house-dal-t-saor';
const DAL_T_SAOR_EMBLEM = TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor'];

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const HOUSE_HEAD_IDS = new Set([
  'lorcan-founder-tsaoir',
  'wighnach-tsaoir',
  'donnacha-tsaoir',
  'luan-tsaoir',
  'naomhan-tsaoir'
]);

const HEAD_TITLES = Object.freeze({
  'lorcan-founder-tsaoir': 'Gründer und erster überlieferter Laird des Dal T’Saoir',
  'wighnach-tsaoir': 'Laird des Dal T’Saoir · bis 1671',
  'donnacha-tsaoir': 'Laird des Dal T’Saoir · 1671–1707',
  'luan-tsaoir': 'Laird des Dal T’Saoir · 1707–1719',
  'naomhan-tsaoir': 'Letzter Laird des Dal T’Saoir · 1719–1735'
});

const MASSACRE_IDS = new Set([
  'naomhan-tsaoir',
  'peadhra-airgid',
  'kadhghan-tsaoir',
  'saoirse-spouse-tsaoir',
  'noghan-tsaoir',
  'lannraig-gaisgh',
  'finghin-tsaoir',
  'finn-tsaoir'
]);

const TARGETS = Object.freeze({
  grawn: Object.freeze({
    name: 'Haus Grawn',
    houseId: 'house-grawn',
    targetFamilyId: 'haus-grawn',
    emblem: AEHRENTAL_HOUSE_EMBLEMS.grawn
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-mac-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  ceardaiocht: Object.freeze({
    name: 'Clan Dál’Ceardaíocht',
    houseId: 'house-dal-ceardaiocht',
    targetFamilyId: 'haus-dal-ceardaiocht',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']
  }),
  choinnich: Object.freeze({
    name: 'Clan Ua’Choinnich',
    houseId: 'house-choinnich',
    targetFamilyId: 'haus-choinnich',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich
  }),
  laidir: Object.freeze({
    name: 'Ruin’Laidir',
    houseId: 'house-laidir',
    targetFamilyId: 'haus-laidir',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir
  })
});

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = DAL_T_SAOR_HOUSE_ID, options = {}) {
  const massacreNote = MASSACRE_IDS.has(id)
    ? 'Starb 1735 beim finsteren Untergang der T’Saoir-Burg am Dunkelhain.'
    : '';
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_DAL_T_SAOR_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === DAL_T_SAOR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: [...new Set([
      ...(options.tags || []),
      ...(MASSACRE_IDS.has(id) ? ['Untergang der T’Saoir-Burg'] : [])
    ])],
    notes: [options.notes || '', massacreNote].filter(Boolean).join(' '),
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
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
  return person(id, name, 'female', birth, death, DAL_T_SAOR_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
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

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'dal-t-saor-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
}

function alignChildrenBelowPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: [...new Set([
        ...(record.extensions?.registryManagedExtensionFields || []),
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
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const LORCAN_IDS = ['lorcan-founder-tsaoir', 'junaid-founder-tsaoir'];
const WIGHNACH_IDS = ['haileigh-choinnich', 'wighnach-tsaoir'];
const MAOLIOSA_IDS = ['bedwyr-grawn', 'maoliosa-tsaoir'];
const DONNACHA_IDS = ['donnacha-tsaoir', 'ciorstaidh-blar'];
const SAOIRSE_IDS = ['turlough-airt', 'saoirse-t-saor'];
const BHALTAIR_IDS = ['bhaltair-tsaoir', 'wunbhna-spouse-tsaoir'];
const LUAN_IDS = ['ygraine-saith', 'luan-tsaoir'];
const HURRACAN_IDS = ['hurracan-tsaoir', 'cianaodh-spouse-tsaoir'];
const LORNA_IDS = ['bardan-ceardaiocht', 'lorna-tsaoir'];
const NAOMHAN_IDS = ['naomhan-tsaoir', 'peadhra-airgid'];
const KADHGHAN_IDS = ['kadhghan-tsaoir', 'saoirse-spouse-tsaoir'];
const NOGHAN_IDS = ['noghan-tsaoir', 'lannraig-gaisgh'];
const QUONA_IDS = ['vailintin-choinnich', 'quona-tsaoir'];
const JUNAID_IDS = ['padraigin-laidir', 'junaid-tsaoir'];

export const HOUSE_DAL_T_SAOR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dal-t-saor',
    title: 'Dal T’Saor',
    motto: '',
    description: 'Erloschener Laird-Clan aus Sruthlann. Die in der Stammburg verbliebene Hauslinie wurde 1735 durch ein finsteres Unheil aus dem Dunkelhain ausgelöscht.',
    emblem: DAL_T_SAOR_EMBLEM,
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES['dal-t-saor']
  },
  houses: [
    house(DAL_T_SAOR_HOUSE_ID, 'Dal T’Saor', DAL_T_SAOR_EMBLEM, 'extinct'),
    house('house-choinnich', 'Clan Ua’Choinnich', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich),
    house('house-grawn', 'Haus Grawn', AEHRENTAL_HOUSE_EMBLEMS.grawn),
    house('house-nic-blar', 'Clan Nic Blar', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['nic-blar']),
    house('house-mac-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-saith', 'Haus Saith', SILBERINSEL_HOUSE_EMBLEMS.saith),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht']),
    house('house-airgid', 'Haus Airgid'),
    house('house-gaisgh', 'Haus Gaisgh'),
    house('house-laidir', 'Ruin’Laidir', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir)
  ],
  persons: [
    person('lorcan-founder-tsaoir', 'Lorcan T’Saoir', 'male', '????', '????', DAL_T_SAOR_HOUSE_ID, {
      tags: ['Gründer', 'Bastard der Airt'],
      notes: 'Einzig überlieferter Bastard der Airt und Gründer des Hauses T’Saoir.'
    }),
    spouse('junaid-founder-tsaoir', 'Junaid', 'female', '????', '????'),

    person('wighnach-tsaoir', 'Wighnach T’Saoir', 'male', '1601', '1671'),
    awayWoman('maoliosa-tsaoir', 'Maoliosa T’Saoir', '1606', '1681', 'grawn'),
    spouse('haileigh-choinnich', 'Haileigh Choinnich', 'female', '1607', '1671', 'house-choinnich'),
    spouse('bedwyr-grawn', 'Bedwyr Grawn', 'male', '1604', '1675', 'house-grawn'),

    person('donnacha-tsaoir', 'Donnacha T’Saoir', 'male', '1628', '1707'),
    awayWoman('saoirse-t-saor', 'Saoirse T’Saor', '1632', '1694', 'airt'),
    person('bhaltair-tsaoir', 'Bhaltair T’Saoir', 'male', '1634', '????'),
    spouse('ciorstaidh-blar', 'Ciorstaidh Blár', 'female', '1630', '1711', 'house-nic-blar'),
    spouse('turlough-airt', 'Turlough Airt', 'male', '1630', '1691', 'house-mac-airt'),
    spouse('wunbhna-spouse-tsaoir', 'Wunbhna', 'female', '????', '????'),

    person('luan-tsaoir', 'Luan T’Saoir', 'male', '1649', '1719'),
    person('hurracan-tsaoir', 'Hurracan T’Saoir', 'male', '1651', '1720'),
    spouse('ygraine-saith', 'Ygraine Saith', 'female', '1650', '1731', 'house-saith'),
    spouse('cianaodh-spouse-tsaoir', 'Cianaodh', 'female', '1653', '1711'),

    awayWoman('lorna-tsaoir', 'Lorna T’Saoir', '1677', '1733', 'ceardaiocht'),
    person('naomhan-tsaoir', 'Naomhan T’Saoir', 'male', '1671', '1735'),
    person('kadhghan-tsaoir', 'Kadhghán T’Saoir', 'male', '1674', '1735'),
    spouse('bardan-ceardaiocht', 'Bardán Ceardaíocht', 'male', '1677', '', 'house-dal-ceardaiocht'),
    spouse('peadhra-airgid', 'Peadhra Airgid', 'female', '1676', '1735', 'house-airgid'),
    spouse('saoirse-spouse-tsaoir', 'Saoirse', 'female', '1676', '1735'),

    person('noghan-tsaoir', 'Noghán T’Saoir', 'male', '1696', '1735'),
    awayWoman('quona-tsaoir', 'Quona T’Saoir', '1702', '', 'choinnich'),
    awayWoman('junaid-tsaoir', 'Junaid T’Saoir', '1700', '', 'laidir'),
    spouse('lannraig-gaisgh', 'Lannraig Gaisgh', 'female', '1700', '1735', 'house-gaisgh'),
    spouse('vailintin-choinnich', 'Vailintín Choinnich', 'male', '1700', '', 'house-choinnich'),
    spouse('padraigin-laidir', 'Pádraigin Laidir', 'male', '1694', '', 'house-laidir'),

    person('finghin-tsaoir', 'Fínghin T’Saoir', 'male', '1719', '1735'),
    person('finn-tsaoir', 'Finn T’Saoir', 'male', '1722', '1735')
  ],
  partnerships: [
    endedMarriage('marriage-lorcan-junaid-tsaoir', LORCAN_IDS),
    alignChildrenBelowPair(endedMarriage('marriage-haileigh-wighnach-choinnich', WIGHNACH_IDS, '1671')),
    endedMarriage('marriage-bedwyr-maoliosa', MAOLIOSA_IDS, '1675'),
    alignChildrenBelowPair(endedMarriage('marriage-donnacha-ciorstaidh-tsaoir', DONNACHA_IDS, '1707')),
    endedMarriage('marriage-turlough-saoirse-airt', SAOIRSE_IDS, '1691'),
    alignChildrenBelowPair(endedMarriage('marriage-bhaltair-wunbhna-tsaoir', BHALTAIR_IDS)),
    alignChildrenBelowPair(endedMarriage('marriage-ygraine-luan-saith', LUAN_IDS, '1719')),
    alignChildrenBelowPair(endedMarriage('marriage-hurracan-cianaodh-tsaoir', HURRACAN_IDS, '1711')),
    endedMarriage('marriage-bardan-lorna', LORNA_IDS, '1733'),
    alignChildrenBelowPair(endedMarriage('marriage-naomhan-peadhra-tsaoir', NAOMHAN_IDS, '1735')),
    alignChildrenBelowPair(endedMarriage('marriage-kadhghan-saoirse-tsaoir', KADHGHAN_IDS, '1735')),
    alignChildrenBelowPair(endedMarriage('marriage-noghan-lannraig-tsaoir', NOGHAN_IDS, '1735')),
    createMarriage('marriage-vailintin-quona-choinnich', ...QUONA_IDS),
    createMarriage('marriage-padraigin-junaid-tsaoir', ...JUNAID_IDS)
  ],
  parentages: [
    ...childrenOf(['wighnach-tsaoir', 'maoliosa-tsaoir'], LORCAN_IDS, 'marriage-lorcan-junaid-tsaoir', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die Quellakte setzt zwischen dem Gründerpaar und der ab 1601 datierten Linie eine ausdrückliche, nicht einzeln überlieferte Generationenfolge.',
      extensions: { timeJumpId: 'gap-lorcan-wighnach-maoliosa-tsaoir' }
    }),
    ...childrenOf(
      ['donnacha-tsaoir', 'saoirse-t-saor', 'bhaltair-tsaoir'],
      WIGHNACH_IDS,
      'marriage-haileigh-wighnach-choinnich'
    ),
    ...childrenOf(['luan-tsaoir'], DONNACHA_IDS, 'marriage-donnacha-ciorstaidh-tsaoir'),
    ...childrenOf(['hurracan-tsaoir'], BHALTAIR_IDS, 'marriage-bhaltair-wunbhna-tsaoir'),
    ...childrenOf(['lorna-tsaoir', 'naomhan-tsaoir'], LUAN_IDS, 'marriage-ygraine-luan-saith'),
    ...childrenOf(['kadhghan-tsaoir'], HURRACAN_IDS, 'marriage-hurracan-cianaodh-tsaoir'),
    ...childrenOf(['noghan-tsaoir', 'quona-tsaoir'], NAOMHAN_IDS, 'marriage-naomhan-peadhra-tsaoir'),
    ...childrenOf(['junaid-tsaoir'], KADHGHAN_IDS, 'marriage-kadhghan-saoirse-tsaoir'),
    ...childrenOf(['finghin-tsaoir', 'finn-tsaoir'], NOGHAN_IDS, 'marriage-noghan-lannraig-tsaoir')
  ],
  cadetBranches: [
    marriedAway('married-away-grawn-maoliosa-tsaoir', 'marriage-bedwyr-maoliosa', 'grawn'),
    marriedAway('married-away-airt-saoirse-tsaoir', 'marriage-turlough-saoirse-airt', 'airt'),
    marriedAway('married-away-ceardaiocht-lorna-tsaoir', 'marriage-bardan-lorna', 'ceardaiocht'),
    marriedAway('married-away-choinnich-quona-tsaoir', 'marriage-vailintin-quona-choinnich', 'choinnich'),
    marriedAway('married-away-laidir-junaid-tsaoir', 'marriage-padraigin-junaid-tsaoir', 'laidir'),
    createExtinctBranch({
      id: 'extinct-house-dal-t-saor',
      parentPersonId: 'finghin-tsaoir',
      houseId: DAL_T_SAOR_HOUSE_ID,
      emblem: DAL_T_SAOR_EMBLEM,
      subtitle: '1735 durch das Unheil aus dem Dunkelhain ausgelöscht',
      notes: 'Noghán, Lannraig und ihre Söhne Fínghin und Finn starben 1735 in der T’Saoir-Burg. Quona und Junaid waren bereits in andere Häuser verheiratet und führten die T’Saoir-Hauslinie nicht fort.',
      extensions: {
        registryManagedFields: [
          'name', 'parentPartnershipId', 'parentPersonId', 'houseId', 'emblem', 'subtitle', 'notes'
        ]
      }
    })
  ],
  timeJumps: [
    {
      id: 'gap-lorcan-wighnach-maoliosa-tsaoir',
      parentPartnershipId: 'marriage-lorcan-junaid-tsaoir',
      childIds: ['wighnach-tsaoir', 'maoliosa-tsaoir'],
      years: 0,
      fromYear: '????',
      toYear: '1601',
      label: 'Nicht einzeln überlieferte Generationen bis Wighnach und Maoliosa',
      notes: 'Die Punktreihe der Quellakte bleibt als serieller Zeitsprung sichtbar.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-lorcan-junaid-tsaoir',
    houseId: DAL_T_SAOR_HOUSE_ID,
    crestSubtitle: 'Ausgestorben · ehemaliger Laird · Sruthlann · Tir an Comhchuibhis',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'lorcan-founder-tsaoir',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Dal T’Saoir (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten und Oberhauptfolge folgen der bereitgestellten Dal-T’Saoir-Akte. Lorcan ist als einziger überlieferter Bastard der Airt und Gründer des Hauses belegt; die Punktreihe nach seinem Gründerpaar bleibt als serielle Überlieferungslücke sichtbar. Die Hauslinie in der T’Saoir-Burg erlosch 1735 durch ein finsteres Unheil aus dem Dunkelhain. Quona und Junaid überlebten außerhalb der Burg in ihren angeheirateten Häusern; deren Nachkommen werden ausschließlich in den fortführenden Gegenakten gezeigt. Sämtliche Bilder der neuen Quelle wurden als veraltet verworfen. Ausschließlich bereits kanonische Porträts eindeutig identischer Weltpersonen aus bestehenden Stammbäumen werden gespiegelt.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Laird des Dal T’Saoir',
      headOrder: Object.freeze([
        'lorcan-founder-tsaoir',
        'wighnach-tsaoir',
        'donnacha-tsaoir',
        'luan-tsaoir',
        'naomhan-tsaoir'
      ]),
      publishedOrder: Object.freeze([])
    }),
    extinctionEvent: Object.freeze({
      year: '1735',
      cause: 'Finsteres Unheil aus dem Dunkelhain in der T’Saoir-Burg',
      administrativeExtinction: true,
      survivorIds: Object.freeze(['quona-tsaoir', 'junaid-tsaoir'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: Object.freeze([]),
      reusedPersonIds: HOUSE_DAL_T_SAOR_REUSED_PORTRAIT_IDS,
      sourceImagesIgnored: true,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    historicalStatus: 'extinct',
    albicRank: 'laird',
    administrativeRole: 'Erloschener ehemaliger Laird aus Sruthlann',
    immediateLiegeHouseId: 'haus-mac-airt',
    immediateLiegeHouseName: 'Clan Mac Airt',
    legacyTitles: Object.freeze(["Dal T'Saor", "Dál T'Saoir", "Haus T'Saoir"]),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'inheritance',
      'extinctionEvent',
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
    registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-dal-t-saor-gruender', 'haus-dal-t-saor-gruenderin'],
      partnerships: ['marriage-haus-dal-t-saor-founders'],
      parentages: [],
      cadetBranches: ['extinct-haus-dal-t-saor'],
      timeJumps: []
    }
  }
});
