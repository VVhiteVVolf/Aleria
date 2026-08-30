import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_IDS,
  HOUSE_RUIN_LAIDIR_PORTRAITS,
  HOUSE_RUIN_LAIDIR_REUSED_PORTRAIT_IDS
} from './house-ruin-laidir-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS
} from './leitheach-house-profiles.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import { TIR_NA_TONN_HOUSE_EMBLEMS } from './tir-na-tonn-house-profiles.js';

const LAIDIR_HOUSE_ID = 'house-laidir';
const LAIDIR_EMBLEM = TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir;

const HOUSE_HEAD_IDS = new Set([
  'lughaidh-founder-laidir',
  'valtair-laidir',
  'aonghus-laidir',
  'rioghnan-laidir'
]);

const HEAD_TITLES = Object.freeze({
  'lughaidh-founder-laidir': 'Gründer und erstes überliefertes Oberhaupt der Ruin’Laidir',
  'valtair-laidir': 'Dún Tiarna der Ruin’Laidir · bis 1689',
  'aonghus-laidir': 'Dún Tiarna der Ruin’Laidir · 1689–1709',
  'rioghnan-laidir': 'Dún Tiarna der Ruin’Laidir · Herr von Claisean · seit 1709'
});

const TARGETS = Object.freeze({
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-mac-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  mhuir: Object.freeze({
    name: 'Clan Na’Mhuir',
    houseId: 'house-na-mhuir',
    targetFamilyId: 'haus-na-mhuir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']
  }),
  eirce: Object.freeze({
    name: 'Clan Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: LEITHEACH_CADET_HOUSE_EMBLEMS['ua-eirce']
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  })
});

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = LAIDIR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_RUIN_LAIDIR_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === LAIDIR_HOUSE_ID ? 'core' : 'married'),
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
  return person(id, name, 'female', birth, death, LAIDIR_HOUSE_ID, {
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
    idPrefix: 'ruin-laidir-parentage',
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

const UNKNOWN_PARENTS = ['unknown-father-founder-laidir', 'unknown-mother-founder-laidir'];
const LUGHAIDH = ['lughaidh-founder-laidir', 'glaodhach-spouse-laidir'];
const AILBHE = ['tadhgan-airt', 'ailbhe-laidir'];
const VALTAIR = ['eithne-laoch', 'valtair-laidir'];
const HEARNAIT = ['ytaran-mhuir', 'hearnait-laidir'];
const AONGHUS = ['glaodhaich-choinnich', 'aonghus-laidir'];
const RIOGHNAN = ['rioghnan-laidir', 'orlaith-craobhan'];
const LUIBHEANN = ['raghallach-eirce', 'luibheann-laidir'];
const KADHGHAN = ['draighean-ruitheach', 'kadhghan-laidir'];
const TRIANACH = ['trianach-laidir', 'sinead-choinnich'];
const FECHIN = ['cearbhall-trodach', 'fechin-laidir'];
const PAILTEAR = ['pailtear-laidir', 'caireann-spouse-laidir'];
const PADRAIGIN = ['padraigin-laidir', 'junaid-tsaoir'];
const EIBHLIN = ['bairre-airt', 'eibhlin-laidir'];
const LUGHAIDH_1698 = ['lughaidh-1698-laidir', 'nalainn-blar'];
const TIONA = ['lachtnaid-cruthin', 'tiona-laidir'];

export const HOUSE_RUIN_LAIDIR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-laidir',
    title: 'Ruin’Laidir',
    motto: '',
    description: 'Dún-Tiarna-Haus der eigenen Lehensherrschaft in Tir an Comhchuibhis mit Sitz in Claisean.',
    emblem: LAIDIR_EMBLEM,
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES.laidir
  },
  houses: [
    house(LAIDIR_HOUSE_ID, 'Ruin’Laidir', LAIDIR_EMBLEM),
    house('house-mac-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-laoch', 'Ruin Ua Laoch', LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch']),
    house('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    house('house-choinnich', 'Ua’Choinnich', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich),
    house('house-craobhan', 'Haus Craobhan'),
    house('house-eirce', 'Clan Ua’Eirce', LEITHEACH_CADET_HOUSE_EMBLEMS['ua-eirce']),
    house('house-ruitheach', 'Dál’Ruitheach', TIR_NA_TONN_HOUSE_EMBLEMS.ruitheach),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-dal-t-saor', 'Dal T’Saor', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']),
    house('house-nic-blar', 'Clan Nic Blar', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['nic-blar']),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin'])
  ],
  persons: [
    spouse('unknown-father-founder-laidir', 'Unbekannter Vater', 'male', '????', '????'),
    spouse('unknown-mother-founder-laidir', 'Unbekannte Mutter', 'female', '????', '????'),

    person('lughaidh-founder-laidir', 'Lughaidh Laidir', 'male', '????', '????', LAIDIR_HOUSE_ID, {
      tags: ['Gründer']
    }),
    spouse('glaodhach-spouse-laidir', 'Glaodhach', 'female', '????', '????'),

    awayWoman('ailbhe-laidir', 'Ailbhe Laidir', '1610', '1679', 'airt'),
    spouse('tadhgan-airt', 'Tadhgán Airt', 'male', '1609', '1671', 'house-mac-airt'),
    person('valtair-laidir', 'Valtair Laidir', 'male', '1603', '1689'),
    spouse('eithne-laoch', 'Eithne Laoch', 'female', '1605', '1677', 'house-laoch'),

    awayWoman('hearnait-laidir', 'Hearnait Laidir', '1632', '1699', 'mhuir'),
    spouse('ytaran-mhuir', 'Ytáran Mhuir', 'male', '1628', '1694', 'house-na-mhuir'),
    person('aonghus-laidir', 'Aonghus Laidir', 'male', '1629', '1709'),
    spouse('glaodhaich-choinnich', 'Glaodhaich Choinnich', 'female', '1630', '1700', 'house-choinnich'),

    person('rioghnan-laidir', 'Ríoghnán Laidir', 'male', '1647', ''),
    spouse('orlaith-craobhan', 'Orlaith Craobhan', 'female', '1652', '1738', 'house-craobhan'),
    awayWoman('luibheann-laidir', 'Luibheann Laidir', '1650', '1725', 'eirce'),
    spouse('raghallach-eirce', 'Raghallach Eirce', 'male', '1648', '1704', 'house-eirce'),
    person('kadhghan-laidir', 'Kadhghán Laidir', 'female', '1649', '1705'),
    spouse('draighean-ruitheach', 'Draighean Ruitheach', 'male', '1652', '1709', 'house-ruitheach'),

    person('trianach-laidir', 'Trianach Laidir', 'male', '1671', ''),
    spouse('sinead-choinnich', 'Sinead Choinnich', 'female', '1675', '', 'house-choinnich'),
    person('fechin-laidir', 'Fechín Laidir', 'male', '1677', ''),
    spouse('cearbhall-trodach', 'Cearbhall Trodach', 'male', '1680', '', 'house-trodach'),
    person('pailtear-laidir', 'Pailtéar Laidir', 'male', '1674', ''),
    spouse('caireann-spouse-laidir', 'Caireann', 'female', '1677', ''),

    person('padraigin-laidir', 'Pádraigin Laidir', 'male', '1694', ''),
    spouse('junaid-tsaoir', 'Junaid T’Saoir', 'female', '1700', '', 'house-dal-t-saor', {
      extensions: { registryManagedFields: ['worldPersonId', 'houseId'] }
    }),
    awayWoman('eibhlin-laidir', 'Eibhlín Laidir', '1701', '', 'airt'),
    spouse('bairre-airt', 'Bairre Airt', 'male', '1699', '', 'house-mac-airt'),
    person('lughaidh-1698-laidir', 'Lughaidh Laidir', 'male', '1698', ''),
    spouse('nalainn-blar', 'Nálainn Blár', 'female', '1701', '', 'house-nic-blar'),
    person('fionnchu-laidir', 'Fionnchu Laidir', 'male', '1700', ''),
    awayWoman('tiona-laidir', 'Tíona Laidir', '1698', '', 'cruthin'),
    spouse('lachtnaid-cruthin', 'Lachtnaid Cruthin', 'male', '1695', '', 'house-cruthin'),

    person('nogh-laidir', 'Nógh Laidir', 'male', '1720', ''),
    person('onora-laidir', 'Onóra Laidir', 'female', '1724', ''),
    person('keitha-laidir', 'Keitha Laidir', 'male', '1723', ''),
    person('abhan-laidir', 'Abhán Laidir', 'female', '1726', '')
  ],
  partnerships: [
    alignChildGroupBelowParentPair(endedMarriage('marriage-unknown-parents-founder-laidir', UNKNOWN_PARENTS)),
    endedMarriage('marriage-lughaidh-glaodhach-laidir', LUGHAIDH),
    endedMarriage('marriage-tadhgan-ailbhe-airt', AILBHE, '1671'),
    alignChildGroupBelowParentPair(createMarriage('marriage-eithne-valtair', ...VALTAIR)),
    endedMarriage('marriage-ytaran-hearnait', HEARNAIT, '1694'),
    alignChildGroupBelowParentPair(endedMarriage('marriage-glaodhaich-aonghus-choinnich', AONGHUS, '1700')),
    alignChildGroupBelowParentPair(endedMarriage('marriage-rioghnan-orlaith-laidir', RIOGHNAN, '1738')),
    createMarriage('marriage-raghallach-luibheann', ...LUIBHEANN),
    alignChildGroupBelowParentPair(endedMarriage('marriage-draighean-kadhghan-ruitheach', KADHGHAN, '1705')),
    alignChildGroupBelowParentPair(createMarriage('marriage-trianach-sinead-choinnich', ...TRIANACH)),
    createMarriage('marriage-cearbhall-fechin', ...FECHIN),
    alignChildGroupBelowParentPair(createMarriage('marriage-pailtear-caireann-laidir', ...PAILTEAR)),
    alignChildGroupBelowParentPair(createMarriage('marriage-padraigin-junaid-tsaoir', ...PADRAIGIN)),
    createMarriage('marriage-bairre-eibhlin-airt', ...EIBHLIN),
    alignChildGroupBelowParentPair(createMarriage('marriage-lughaidh-nalainn-blar', ...LUGHAIDH_1698)),
    createMarriage('marriage-lachtnaid-tiona', ...TIONA)
  ],
  parentages: [
    ...childrenOf(['lughaidh-founder-laidir'], UNKNOWN_PARENTS, 'marriage-unknown-parents-founder-laidir'),
    ...childrenOf(['ailbhe-laidir', 'valtair-laidir'], LUGHAIDH, 'marriage-lughaidh-glaodhach-laidir', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die Quellakte setzt zwischen dem Gründerpaar und der ab 1603 datierten Linie eine ausdrückliche, nicht einzeln überlieferte Generationenfolge.',
      extensions: { timeJumpId: 'gap-lughaidh-ailbhe-valtair-laidir' }
    }),
    ...childrenOf(['hearnait-laidir', 'aonghus-laidir'], VALTAIR, 'marriage-eithne-valtair'),
    ...childrenOf(['rioghnan-laidir', 'luibheann-laidir', 'kadhghan-laidir'], AONGHUS, 'marriage-glaodhaich-aonghus-choinnich'),
    ...childrenOf(['trianach-laidir', 'fechin-laidir'], RIOGHNAN, 'marriage-rioghnan-orlaith-laidir'),
    ...childrenOf(['pailtear-laidir'], KADHGHAN, 'marriage-draighean-kadhghan-ruitheach'),
    ...childrenOf(['padraigin-laidir', 'eibhlin-laidir'], TRIANACH, 'marriage-trianach-sinead-choinnich'),
    ...childrenOf(['lughaidh-1698-laidir', 'fionnchu-laidir', 'tiona-laidir'], PAILTEAR, 'marriage-pailtear-caireann-laidir'),
    ...childrenOf(['nogh-laidir', 'onora-laidir'], PADRAIGIN, 'marriage-padraigin-junaid-tsaoir'),
    ...childrenOf(['keitha-laidir', 'abhan-laidir'], LUGHAIDH_1698, 'marriage-lughaidh-nalainn-blar')
  ],
  cadetBranches: [
    marriedAway('married-away-airt-ailbhe-laidir', 'marriage-tadhgan-ailbhe-airt', 'airt'),
    marriedAway('married-away-mhuir-hearnait-laidir', 'marriage-ytaran-hearnait', 'mhuir'),
    marriedAway('married-away-eirce-luibheann-laidir', 'marriage-raghallach-luibheann', 'eirce'),
    marriedAway('married-away-airt-eibhlin-laidir', 'marriage-bairre-eibhlin-airt', 'airt'),
    marriedAway('married-away-cruthin-tiona-laidir', 'marriage-lachtnaid-tiona', 'cruthin')
  ],
  timeJumps: [
    {
      id: 'gap-lughaidh-ailbhe-valtair-laidir',
      parentPartnershipId: 'marriage-lughaidh-glaodhach-laidir',
      childIds: ['ailbhe-laidir', 'valtair-laidir'],
      years: 0,
      fromYear: '????',
      toYear: '1603',
      label: 'Nicht einzeln überlieferte Generationen bis Ailbhe und Valtair',
      notes: 'Die Punktreihe der Quellakte bleibt als serieller Zeitsprung sichtbar.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-lughaidh-glaodhach-laidir',
    houseId: LAIDIR_HOUSE_ID,
    crestSubtitle: 'Dún Tiarna · Lehensherrschaft der Ruin’Laidir · Claisean · Tir an Comhchuibhis',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-founder-laidir',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Ruin’Laidir (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten und Oberhauptfolge folgen der bereitgestellten Ruin’Laidir-Akte. Das Oberhauptfeld „1689–1709“ bei Aonghus wird als Amtszeit gelesen; seine Lebensdaten 1629–1709 stammen aus der Genealogie. Die Punktreihe hinter Lughaidh und Glaodhach bleibt als nicht einzeln überlieferte Generationenfolge sichtbar. Die individuellen Laidir-Bilder der Quelle wurden auf ausdrückliche Freigabe übernommen; wiederholte Standardsilhouetten wurden verworfen. Für angeheiratete Personen werden ausschließlich bereits kanonische Porträts derselben Weltpersonen aus den Gegenakten gespiegelt. Junaids Hauskennung verweist nun auf die ausgearbeitete Hauptakte Dal T’Saor.',
    sourceRevision: 3,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Dún Tiarna der Ruin’Laidir',
      headOrder: Object.freeze([
        'lughaidh-founder-laidir',
        'valtair-laidir',
        'aonghus-laidir',
        'rioghnan-laidir'
      ]),
      publishedOrder: Object.freeze([])
    }),
    sourceDiscrepancies: Object.freeze({
      aonghusHeadTable: Object.freeze({
        headTable: '1689–1709',
        genealogy: '1629–1709',
        canonicalLife: '1629–1709',
        canonicalOffice: '1689–1709'
      })
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_RUIN_LAIDIR_REUSED_PORTRAIT_IDS,
      sourceImagesAllowed: true,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    historicalStatus: 'active',
    albicRank: 'dun-tiarna',
    administrativeRole: 'Dún Tiarna der Lehensherrschaft der Ruin’Laidir',
    immediateLiegeHouseId: 'haus-mac-airt',
    immediateLiegeHouseName: 'Clan Mac Airt',
    legacyTitles: Object.freeze(['Haus Laidir', "Ruin'Laidir"]),
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
    registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-tsaoir'],
      persons: ['haus-laidir-gruender', 'haus-laidir-gruenderin'],
      partnerships: ['marriage-haus-laidir-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
