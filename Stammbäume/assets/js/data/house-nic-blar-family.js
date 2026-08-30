import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_NIC_BLAR_LOCAL_PORTRAIT_IDS,
  HOUSE_NIC_BLAR_PORTRAITS,
  HOUSE_NIC_BLAR_REUSED_PORTRAIT_IDS
} from './house-nic-blar-portraits.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import {
  CEITHEACH_HOUSE_EMBLEMS,
  CEITHEACH_HOUSE_PROFILES,
  CEITHEACH_MANAGED_PROFILE_FIELDS
} from './ceitheach-house-profiles.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';

const BLAR_HOUSE_ID = 'house-nic-blar';
const BLAR_EMBLEM = CEITHEACH_HOUSE_EMBLEMS['nic-blar'];
const CEITHEACH_FAMILY_ID = 'haus-nic-blar';
const LEITHEACH_FAMILY_ID = 'haus-nic-blar-leitheach';

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole',
  'tags', 'notes'
]);

const CEITHEACH_HEAD_TITLES = Object.freeze({
  'tuathlaith-blar': 'Legendäre Gründerin und erste Mor Tiarna der Nic’Blar',
  'gormfhlaith-blar': 'Mor Tiarna der Nic’Blar · bis 1681',
  'aodnait-blar': 'Mor Tiarna der Nic’Blar · 1681–1703',
  'torlaith-blar': 'Mor Tiarna der Nic’Blar · 1703–1738'
});

const LEITHEACH_TITLES = Object.freeze({
  'torlaith-blar': 'Begründerin der Leitheacher Nic’Blar-Linie · Mor Tiarna von Tir na Scian',
  'pallaith-blar': 'Mitbegründerin der Leitheacher Nic’Blar-Linie',
  'zearlach-blar': 'Interimserbe der Nic’Blar bis zur Geburt seiner ältesten Tochter 1695',
  'sceolaith-blar': 'Laird der Nic’Blar in Sruthlann · seit 1738',
  'gobaith-blar': 'Erste in der Erbfolge der Laird',
  'sluagh-blar': 'Zweite in der Erbfolge der Laird'
});

const TARGETS = Object.freeze({
  rochraide: Object.freeze({
    name: 'Clan Ui’Rochraide',
    houseId: 'house-rochraide',
    targetFamilyId: 'haus-ui-rochraide',
    emblem: CEITHEACH_HOUSE_EMBLEMS['ui-rochraide']
  }),
  holloran: Object.freeze({
    name: 'Clan Nic Holloran',
    houseId: 'house-nic-holloran',
    targetFamilyId: 'haus-nic-holloran',
    emblem: CEITHEACH_HOUSE_EMBLEMS['nic-holloran']
  }),
  grawn: Object.freeze({
    name: 'Haus Grawn',
    houseId: 'house-grawn',
    targetFamilyId: 'haus-grawn',
    emblem: AEHRENTAL_HOUSE_EMBLEMS.grawn
  }),
  somhairle: Object.freeze({
    name: 'Sidhe Somhairle',
    houseId: 'house-somhairle',
    targetFamilyId: 'haus-somhairle',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS.somhairle
  }),
  deaghaide: Object.freeze({
    name: 'Haus Deaghaide',
    houseId: 'house-deaghaide',
    targetFamilyId: 'haus-deaghaide',
    emblem: ''
  }),
  tsaoir: Object.freeze({
    name: 'Dal T’Saor',
    houseId: 'house-dal-t-saor',
    targetFamilyId: 'haus-dal-t-saor',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']
  }),
  ceinselaig: Object.freeze({
    name: 'Clan Ua Nic Ceinselaig',
    houseId: 'house-ua-nic-ceinselaig',
    targetFamilyId: 'haus-ua-nic-ceinselaig',
    emblem: CEITHEACH_HOUSE_EMBLEMS['ua-nic-ceinselaig']
  }),
  craobhan: Object.freeze({
    name: 'Haus Craobhan',
    houseId: 'house-craobhan',
    targetFamilyId: 'haus-craobhan',
    emblem: ''
  }),
  gealach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  tordarroch: Object.freeze({
    name: 'Haus Tordarroch',
    houseId: 'house-tordarroch',
    targetFamilyId: 'haus-tordarroch',
    emblem: ''
  }),
  choinnich: Object.freeze({
    name: 'Ua’Choinnich',
    houseId: 'house-choinnich',
    targetFamilyId: 'haus-choinnich',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich
  }),
  caoimhe: Object.freeze({
    name: 'Nic Caoimhe',
    houseId: 'house-caoimhe',
    targetFamilyId: 'haus-nic-caoimhe',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']
  }),
  leite: Object.freeze({
    name: 'Clan Dal’Leite',
    houseId: 'house-dal-leite',
    targetFamilyId: 'haus-dal-leite',
    emblem: CEITHEACH_HOUSE_EMBLEMS['dal-leite']
  }),
  nachtjaeger: Object.freeze({
    name: 'Clan Nachtjäger',
    houseId: 'house-nachtjaeger',
    targetFamilyId: 'haus-nachtjaeger',
    emblem: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger
  }),
  tairise: Object.freeze({
    name: 'Haus Tairise',
    houseId: 'house-tairise',
    targetFamilyId: 'haus-tairise',
    emblem: ''
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-mac-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['mac-airt']
  }),
  laidir: Object.freeze({
    name: 'Ruin’Laidir',
    houseId: 'house-laidir',
    targetFamilyId: 'haus-laidir',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir
  })
});

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

function person(id, name, sex, birth = '????', death = '', houseId = BLAR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_NIC_BLAR_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === BLAR_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function blarPerson(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, BLAR_HOUSE_ID, options);
}

function awayBlarPerson(id, name, sex, birth, death, targetKey, options = {}) {
  const target = TARGETS[targetKey];
  return blarPerson(id, name, sex, birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...new Set([...(options.tags || []), 'Wegverheiratet'])]
  });
}

function childrenOf(childIds, parentIds, partnershipId, idPrefix, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix,
    ...options
  });
}

function marriage(id, participantIds, end = '', options = {}) {
  return createMarriage(id, ...participantIds, {
    status: end ? 'ended' : 'active',
    end,
    ...options
  });
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
        'name', 'parentPartnershipId', 'childIds', 'houseId',
        'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function ceitheachToLeitheachBranch(id, partnershipId, founderName) {
  return createCadetHouseBranch({
    id,
    name: 'Nic’Blar in Leitheach',
    parentPartnershipId: partnershipId,
    houseId: BLAR_HOUSE_ID,
    targetFamilyId: LEITHEACH_FAMILY_ID,
    emblem: BLAR_EMBLEM,
    subtitle: `Leitheacher Hauslinie aus den Nachkommen ${founderName}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'childIds', 'houseId',
        'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function continuationBranch(id, partnershipId, childIds, founderName) {
  return createLinkedLineBranch({
    id,
    name: 'Nic’Blar in Leitheach',
    parentPartnershipId: partnershipId,
    childIds,
    houseId: BLAR_HOUSE_ID,
    targetFamilyId: LEITHEACH_FAMILY_ID,
    emblem: BLAR_EMBLEM,
    subtitle: `Leitheacher Blar-Linie ${founderName}s`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'childIds', 'houseId',
        'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

const CEITHEACH_HOUSES = [
  house(BLAR_HOUSE_ID, 'Clan Nic Blar', BLAR_EMBLEM),
  ...Object.values(TARGETS).map(target => house(target.houseId, target.name, target.emblem))
];

const TUATHLAITH_IDS = ['tuathlaith-blar', 'nechtan-spouse-blar'];
const GORMFHLAITH_IDS = ['gormfhlaith-blar', 'lachtna-halloran'];
const PEATHARLACH_IDS = ['peatharlach-blar', 'dallan-rochraide'];
const SEAMUS_IDS = ['seamus-blar', 'tatumn-grawn'];
const BLATHNAID_IDS = ['blathnaid-blar', 'searlas-somhairle'];
const AODNAIT_IDS = ['aodnait-blar', 'ruadhan-deaghaide'];
const CIORSTAIDH_IDS = ['donnacha-tsaoir', 'ciorstaidh-blar'];
const SCEOLAIGH_IDS = ['sceolaigh-blar', 'gearoid-ceinselaig'];
const TORLAITH_IDS = ['gormgal-gealach', 'torlaith-blar'];
const HURRALAITH_IDS = ['hurralaith-blar', 'ronan-craobhan'];
const PALLAITH_IDS = ['pallaith-blar', 'mairtin-tordarroch'];
const ZARMHNAIT_IDS = ['murchadh-1649-choinnich', 'zarmhnait-blar'];

export const HOUSE_NIC_BLAR_CEITHEACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: CEITHEACH_FAMILY_ID,
    title: 'Clan Nic Blar',
    motto: '',
    description: 'Matriarchales Mor-Tiarna-Haus von Tir na Scian mit Sitz in Lochcoille; diese Akte führt die Herkunftslinie bis zu Tórlaith und Pallaith.',
    emblem: BLAR_EMBLEM,
    houseProfile: CEITHEACH_HOUSE_PROFILES['nic-blar']
  },
  houses: CEITHEACH_HOUSES,
  persons: [
    blarPerson('tuathlaith-blar', 'Tuathlaith Blár', 'female', '????', '????', {
      title: CEITHEACH_HEAD_TITLES['tuathlaith-blar'],
      lineageRole: 'head',
      tags: ['Gründerin', 'Fianna']
    }),
    spouse('nechtan-spouse-blar', 'Nechtan', 'male', '????', '????'),

    blarPerson('gormfhlaith-blar', 'Gormfhlaith Blár', 'female', '1602', '1681', {
      title: CEITHEACH_HEAD_TITLES['gormfhlaith-blar'], lineageRole: 'head'
    }),
    spouse('lachtna-halloran', 'Lachtna Halloran', 'male', '1608', '1700', 'house-nic-holloran'),
    awayBlarPerson('peatharlach-blar', 'Peatharlach Blár', 'female', '1604', '1691', 'rochraide'),
    spouse('dallan-rochraide', 'Dallan Rochraide', 'male', '1610', '1681', 'house-rochraide'),
    blarPerson('seamus-blar', 'Seamus Blár', 'male', '1605', '1680'),
    spouse('tatumn-grawn', 'Tatumn Grawn', 'female', '1611', '1685', 'house-grawn'),

    awayBlarPerson('blathnaid-blar', 'Blathnaid Blár', 'female', '1625', '1701', 'somhairle', {
      notes: 'Als ältere Tochter Gormfhlaiths zunächst erbberechtigt; die Wegheirat aus der Nic’Blar-Linie ließ Aodnait nachrücken.'
    }),
    spouse('searlas-somhairle', 'Searlas Somhairle', 'male', '1629', '1714', 'house-somhairle'),
    blarPerson('aodnait-blar', 'Aodnait Blár', 'female', '1628', '1703', {
      title: CEITHEACH_HEAD_TITLES['aodnait-blar'], lineageRole: 'head'
    }),
    spouse('ruadhan-deaghaide', 'Ruadhán Deaghaide', 'male', '????', '????', 'house-deaghaide'),
    awayBlarPerson('ciorstaidh-blar', 'Ciorstaidh Blár', 'female', '1630', '1711', 'tsaoir'),
    spouse('donnacha-tsaoir', 'Donnacha T’Saoir', 'male', '1628', '1707', 'house-dal-t-saor'),
    blarPerson('sceolaigh-blar', 'Sceolaigh Blár', 'female', '1632', '1720'),
    spouse('gearoid-ceinselaig', 'Gearoid Ceinselaig', 'male', '1634', '1729', 'house-ua-nic-ceinselaig'),

    blarPerson('torlaith-blar', 'Tórlaith Blár', 'female', '1652', '1738', {
      title: CEITHEACH_HEAD_TITLES['torlaith-blar'],
      lineageRole: 'head',
      tags: ['Begründerin der Leitheacher Linie']
    }),
    spouse('gormgal-gealach', 'Gormgal Gealach', 'male', '1653', '1720', 'house-gealach'),
    awayBlarPerson('hurralaith-blar', 'Hurralaith Blár', 'female', '1653', '1720', 'craobhan'),
    spouse('ronan-craobhan', 'Rónan Craobhan', 'male', '1656', '1720', 'house-craobhan'),
    blarPerson('pallaith-blar', 'Pallaith Blár', 'female', '1654', '1731', {
      title: 'Mitbegründerin der Leitheacher Nic’Blar-Linie',
      lineageRole: 'mainline',
      tags: ['Begründerin der Leitheacher Linie']
    }),
    spouse('mairtin-tordarroch', 'Máirtín Tordarroch', 'male', '1655', '1730', 'house-tordarroch'),
    awayBlarPerson('zarmhnait-blar', 'Zarmhnait Blár', 'female', '1654', '1724', 'choinnich'),
    spouse('murchadh-1649-choinnich', 'Murchadh Choinnich', 'male', '1649', '1720', 'house-choinnich')
  ],
  partnerships: [
    marriage('marriage-tuathlaith-nechtan-blar', TUATHLAITH_IDS, '????'),
    marriage('marriage-gormfhlaith-lachtna-blar', GORMFHLAITH_IDS, '1681'),
    marriage('marriage-peatharlach-dallan-blar', PEATHARLACH_IDS, '1681'),
    marriage('marriage-seamus-tatumn-blar', SEAMUS_IDS, '1680'),
    marriage('marriage-searlas-blathnaid', BLATHNAID_IDS, '1701'),
    marriage('marriage-aodnait-ruadhan-blar', AODNAIT_IDS, '1703'),
    marriage('marriage-donnacha-ciorstaidh-tsaoir', CIORSTAIDH_IDS, '1707'),
    marriage('marriage-sceolaigh-gearoid-blar', SCEOLAIGH_IDS, '1720'),
    marriage('marriage-gormgal-torlaith', TORLAITH_IDS, '1720'),
    marriage('marriage-hurralaith-ronan-blar', HURRALAITH_IDS, '1720'),
    marriage('marriage-pallaith-mairtin-blar', PALLAITH_IDS, '1730'),
    marriage('marriage-murchadh-zarmhnait-choinnich', ZARMHNAIT_IDS, '1720')
  ],
  parentages: [
    ...childrenOf(
      ['gormfhlaith-blar', 'peatharlach-blar', 'seamus-blar'],
      TUATHLAITH_IDS,
      'marriage-tuathlaith-nechtan-blar',
      'nic-blar-ceitheach-parentage',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Quelle setzt zwischen dem legendären Gründerpaar und der ab 1602 datierten Linie mehrere nicht einzeln überlieferte Generationen.',
        extensions: { timeJumpId: 'gap-tuathlaith-gormfhlaith-blar' }
      }
    ),
    ...childrenOf(
      ['blathnaid-blar', 'aodnait-blar'],
      GORMFHLAITH_IDS,
      'marriage-gormfhlaith-lachtna-blar',
      'nic-blar-ceitheach-parentage'
    ),
    ...childrenOf(
      ['ciorstaidh-blar', 'sceolaigh-blar'],
      SEAMUS_IDS,
      'marriage-seamus-tatumn-blar',
      'nic-blar-ceitheach-parentage'
    ),
    ...childrenOf(
      ['torlaith-blar', 'hurralaith-blar', 'pallaith-blar'],
      AODNAIT_IDS,
      'marriage-aodnait-ruadhan-blar',
      'nic-blar-ceitheach-parentage'
    ),
    ...childrenOf(
      ['zarmhnait-blar'],
      SCEOLAIGH_IDS,
      'marriage-sceolaigh-gearoid-blar',
      'nic-blar-ceitheach-parentage'
    )
  ],
  cadetBranches: [
    marriedAway('married-away-rochraide-peatharlach-blar', 'marriage-peatharlach-dallan-blar', 'rochraide'),
    marriedAway('married-away-somhairle-blathnaid-blar', 'marriage-searlas-blathnaid', 'somhairle'),
    marriedAway('married-away-tsaoir-ciorstaidh-blar', 'marriage-donnacha-ciorstaidh-tsaoir', 'tsaoir'),
    marriedAway('married-away-craobhan-hurralaith-blar', 'marriage-hurralaith-ronan-blar', 'craobhan'),
    marriedAway('married-away-choinnich-zarmhnait-blar', 'marriage-murchadh-zarmhnait-choinnich', 'choinnich'),
    ceitheachToLeitheachBranch('branch-leitheach-torlaith-blar', 'marriage-gormgal-torlaith', 'Tórlaiths'),
    ceitheachToLeitheachBranch('branch-leitheach-pallaith-blar', 'marriage-pallaith-mairtin-blar', 'Pallaiths')
  ],
  timeJumps: [{
    id: 'gap-tuathlaith-gormfhlaith-blar',
    parentPartnershipId: 'marriage-tuathlaith-nechtan-blar',
    childIds: ['gormfhlaith-blar', 'peatharlach-blar', 'seamus-blar'],
    years: 0,
    fromYear: '????',
    toYear: '1602',
    label: 'Nicht einzeln überlieferte Generationen bis zur ab 1602 datierten Linie',
    notes: 'Die historische Nic’Blar-Tafel markiert hier ausdrücklich eine Überlieferungslücke.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-tuathlaith-nechtan-blar',
    houseId: BLAR_HOUSE_ID,
    crestSubtitle: 'Matriarchales Mor Tiarnatum · Tir na Scian · Lochcoille · Fürstentum Ceitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tuathlaith-blar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Nic Blar (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Diese Akte führt das matriarchale Stammhaus in Ceitheach von der legendären Fianna Tuathlaith bis zu den Schwestern Tórlaith und Pallaith. Partnergebundene Seitenlinien ohne innerhalb der Nic’Blar fortgeführte Kinder enden als Wegverheiratet-Verknüpfung. Tórlaith und Pallaith erhalten jeweils einen eigenen Zielknoten zur anschließend separat geführten Leitheacher Hausakte. Die Blar-Porträts der Quelle sind ausdrücklich freigegeben; wiederholte Standardsilhouetten werden nicht als Individualbilder importiert.',
    sourceRevision: 4,
    blankFamily: false,
    preparedMainLine: false,
    matriarchal: true,
    inheritance: Object.freeze({
      title: 'Mor Tiarna der Nic’Blar',
      system: 'matriarchal-eldest-daughter',
      rule: 'Erbberechtigt ist ausschließlich die älteste Tochter. Fehlt sie, verwaltet der älteste Sohn nur interimistisch, bis wieder eine erstgeborene Tochter vorhanden ist.',
      headOrder: Object.freeze([
        'tuathlaith-blar',
        'gormfhlaith-blar',
        'aodnait-blar',
        'torlaith-blar'
      ]),
      continuationFamilyId: LEITHEACH_FAMILY_ID
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_NIC_BLAR_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_NIC_BLAR_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Ceitheach',
    territory: 'Tir na Scian',
    territoryGloss: 'Land der Heldinnen',
    historicalStatus: 'active',
    albicRank: 'mor-tiarna',
    administrativeRole: 'Mor Tiarna von Tir na Scian',
    immediateLiegeHouseId: 'haus-ui-rochraide',
    immediateLiegeHouseName: 'Clan Ui’Rochraide',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'matriarchal', 'sourceNote',
      'inheritance', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: CEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-nic-blar-gruender', 'haus-nic-blar-gruenderin'],
      partnerships: ['marriage-haus-nic-blar-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});

const ZEARLACH_IDS = ['zearlach-blar', 'jonaire-somhairle'];
const JAIMHIN_IDS = ['jaimhin-blar', 'ciannait-caoimhe'];
const DAMHNAIT_1672_IDS = ['damhnait-1672-blar', 'gilleasbuig-leite'];
const STIOFAN_IDS = ['stiofan-blar', 'inghild-nachtjaeger'];
const SCEOLAITH_IDS = ['sceolaith-blar', 'harailt-tairise'];
const ROISIN_IDS = ['kevyn-airt', 'roisin-blar'];
const MAONAIT_IDS = ['joriath-choinnich', 'maonait-blar'];
const NALAINN_IDS = ['lughaidh-1698-laidir', 'nalainn-blar'];

export const HOUSE_NIC_BLAR_LEITHEACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: LEITHEACH_FAMILY_ID,
    title: 'Nic’Blar · Leitheach',
    motto: '',
    description: 'Parallele Leitheacher Hauslinie der Schwestern Tórlaith und Pallaith; Laird in Sruthlann unter dem Clan Mac Airt.',
    emblem: BLAR_EMBLEM,
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES['nic-blar']
  },
  houses: CEITHEACH_HOUSES,
  persons: [
    blarPerson('torlaith-blar', 'Tórlaith Blár', 'female', '1652', '1738', {
      title: LEITHEACH_TITLES['torlaith-blar'], lineageRole: 'head'
    }),
    spouse('gormgal-gealach', 'Gormgal Gealach', 'male', '1653', '1720', 'house-gealach'),
    blarPerson('pallaith-blar', 'Pallaith Blár', 'female', '1654', '1731', {
      title: LEITHEACH_TITLES['pallaith-blar'], lineageRole: 'mainline'
    }),
    spouse('mairtin-tordarroch', 'Máirtín Tordarroch', 'male', '1655', '1730', 'house-tordarroch'),

    blarPerson('zearlach-blar', 'Zearlach Blár', 'male', '1671', '', {
      title: LEITHEACH_TITLES['zearlach-blar'], lineageRole: 'mainline', tags: ['Interimserbe']
    }),
    spouse('jonaire-somhairle', 'Jonaire Somhairle', 'female', '1676', '', 'house-somhairle'),
    awayBlarPerson('jaimhin-blar', 'Jaimhín Blár', 'male', '1672', '', 'caoimhe'),
    spouse('ciannait-caoimhe', 'Ciannait Caoimhe', 'female', '1669', '', 'house-caoimhe'),
    awayBlarPerson('damhnait-1672-blar', 'Damhnait Blár', 'female', '1672', '', 'leite'),
    spouse('gilleasbuig-leite', 'Gilleasbuig Leite', 'male', '1670', '', 'house-dal-leite'),
    blarPerson('stiofan-blar', 'Stiofán Blár', 'male', '1672', '1720'),
    spouse('inghild-nachtjaeger', 'Inghild Nachtjäger', 'female', '1675', '1720', 'house-nachtjaeger'),

    blarPerson('sceolaith-blar', 'Sceolaith Blár', 'female', '1695', '', {
      title: LEITHEACH_TITLES['sceolaith-blar'], lineageRole: 'head'
    }),
    spouse('harailt-tairise', 'Harailt Tairise', 'male', '1698', '', 'house-tairise'),
    blarPerson('moirin-blar', 'Móirin Blár', 'female', '1697', ''),
    blarPerson('roisin-blar', 'Róisín Blár', 'female', '1700', ''),
    spouse('kevyn-airt', 'Kevyn Airt', 'male', '1703', '', 'house-mac-airt'),
    blarPerson('maonait-blar', 'Maonait Blár', 'female', '1700', ''),
    spouse('joriath-choinnich', 'Joriath Choinnich', 'male', '1703', '', 'house-choinnich'),
    awayBlarPerson('nalainn-blar', 'Nálainn Blár', 'female', '1701', '', 'laidir'),
    spouse('lughaidh-1698-laidir', 'Lughaidh Laidir', 'male', '1698', '', 'house-laidir'),

    blarPerson('gobaith-blar', 'Gobaith Blár', 'female', '1717', '', {
      title: LEITHEACH_TITLES['gobaith-blar'], lineageRole: 'mainline'
    }),
    blarPerson('sluagh-blar', 'Sluagh Blár', 'female', '1720', '', {
      title: LEITHEACH_TITLES['sluagh-blar'], lineageRole: 'mainline'
    }),
    blarPerson('hascan-blar', 'Háscan Blár', 'male', '1721', ''),
    blarPerson('wunbhna-blar', 'Wunbhna Blár', 'female', '1723', ''),
    blarPerson('nuala-blar', 'Nuala Blár', 'female', '1726', ''),
    blarPerson('reathnaigh-blar', 'Reathnaigh Blár', 'female', '1722', ''),
    blarPerson('zephen-blar', 'Zephen Blár', 'male', '1725', ''),
    blarPerson('damhnait-1727-blar', 'Damhnait Blár', 'female', '1727', ''),
    blarPerson('vardon-blar', 'Vardon Blár', 'male', '1730', '')
  ],
  partnerships: [
    marriage('marriage-gormgal-torlaith', TORLAITH_IDS, '1720'),
    marriage('marriage-pallaith-mairtin-blar', PALLAITH_IDS, '1730'),
    marriage('marriage-zearlach-jonaire', ZEARLACH_IDS),
    marriage('marriage-jaimhin-ciannait', JAIMHIN_IDS),
    marriage('marriage-damhnait-gilleasbuig-blar', DAMHNAIT_1672_IDS),
    marriage('marriage-inghild-stiofan-nachtjaeger', STIOFAN_IDS, '1720'),
    marriage('marriage-sceolaith-harailt-blar', SCEOLAITH_IDS),
    marriage('marriage-kevyn-roisin-airt', ROISIN_IDS),
    marriage('marriage-joriath-maonait-choinnich', MAONAIT_IDS),
    marriage('marriage-lughaidh-nalainn-blar', NALAINN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['zearlach-blar', 'jaimhin-blar'],
      TORLAITH_IDS,
      'marriage-gormgal-torlaith',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['damhnait-1672-blar', 'stiofan-blar'],
      PALLAITH_IDS,
      'marriage-pallaith-mairtin-blar',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['sceolaith-blar', 'moirin-blar', 'roisin-blar'],
      ZEARLACH_IDS,
      'marriage-zearlach-jonaire',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['maonait-blar', 'nalainn-blar'],
      STIOFAN_IDS,
      'marriage-inghild-stiofan-nachtjaeger',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['gobaith-blar', 'sluagh-blar', 'hascan-blar'],
      SCEOLAITH_IDS,
      'marriage-sceolaith-harailt-blar',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['wunbhna-blar', 'nuala-blar'],
      ROISIN_IDS,
      'marriage-kevyn-roisin-airt',
      'nic-blar-leitheach-parentage'
    ),
    ...childrenOf(
      ['reathnaigh-blar', 'zephen-blar', 'damhnait-1727-blar', 'vardon-blar'],
      MAONAIT_IDS,
      'marriage-joriath-maonait-choinnich',
      'nic-blar-leitheach-parentage'
    )
  ],
  cadetBranches: [
    continuationBranch(
      'continuation-torlaith-blar-leitheach',
      'marriage-gormgal-torlaith',
      ['zearlach-blar', 'jaimhin-blar'],
      'Tórlaith'
    ),
    continuationBranch(
      'continuation-pallaith-blar-leitheach',
      'marriage-pallaith-mairtin-blar',
      ['damhnait-1672-blar', 'stiofan-blar'],
      'Pallaith'
    ),
    marriedAway('married-away-caoimhe-jaimhin-blar', 'marriage-jaimhin-ciannait', 'caoimhe'),
    marriedAway('married-away-leite-damhnait-blar', 'marriage-damhnait-gilleasbuig-blar', 'leite'),
    marriedAway('married-away-laidir-nalainn-blar', 'marriage-lughaidh-nalainn-blar', 'laidir')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: '',
    houseId: BLAR_HOUSE_ID,
    crestSubtitle: 'Matriarchaler Laird-Clan · Sruthlann · Tir an Comhchuibhis · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    originHouse: {
      enabled: true,
      id: 'origin-ceitheach-nic-blar',
      houseId: BLAR_HOUSE_ID,
      name: 'Clan Nic Blar in Ceitheach',
      subtitle: 'Stammhaus in Tir na Scian · Lochcoille',
      emblem: BLAR_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['torlaith-blar', 'pallaith-blar'],
      targetFamilyId: CEITHEACH_FAMILY_ID,
      notes: 'Tórlaith und Pallaith stehen als Schwestern parallel unter ihrem Ceitheacher Ursprungshaus.',
      timeGap: { enabled: false }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'torlaith-blar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Nic Blar (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Die Leitheacher Akte beginnt ausschließlich mit den parallelen Schwestern Tórlaith und Pallaith unter ihrem Ceitheacher Ursprungshaus. Nach jeder Schwester und ihrem Partner folgt ein eigener Nic’Blar-Hausknoten, erst darunter stehen die jeweiligen Kinder. Kinderlose, partnergebundene Nebenmitglieder werden an ihr Zielhaus wegverheiratet; Móirin bleibt ohne erfundenen Partner. Für die jüngste Generation werden die namenlosen Verlobten der alten Tabelle ausdrücklich nicht übernommen. Die Erbfolge folgt ausschließlich der ältesten Tochter; ein ältester Sohn kann nur bis zur Geburt einer erstgeborenen Tochter interimistisch eintreten.',
    sourceRevision: 2,
    blankFamily: false,
    preparedMainLine: false,
    matriarchal: true,
    inheritance: Object.freeze({
      title: 'Laird der Nic’Blar in Sruthlann',
      system: 'matriarchal-eldest-daughter',
      rule: 'Erbberechtigt ist ausschließlich die älteste Tochter. Fehlt sie, verwaltet der älteste Sohn nur interimistisch, bis wieder eine erstgeborene Tochter vorhanden ist.',
      headOrder: Object.freeze(['torlaith-blar', 'sceolaith-blar']),
      interimOrder: Object.freeze(['zearlach-blar']),
      publishedOrder: Object.freeze(['gobaith-blar', 'sluagh-blar'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_NIC_BLAR_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_NIC_BLAR_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    originPrincipality: 'Ceitheach',
    originTerritory: 'Tir na Scian',
    historicalStatus: 'active',
    albicRank: 'laird',
    administrativeRole: 'Laird in Sruthlann',
    immediateLiegeHouseId: 'haus-mac-airt',
    immediateLiegeHouseName: 'Clan Mac Airt',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily', 'preparedMainLine', 'matriarchal', 'sourceNote',
      'inheritance', 'portraitPolicy', 'originPrincipality', 'originTerritory'
    ],
    registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedLineageFields: ['houseId', 'originHouse'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: [],
      partnerships: [],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
