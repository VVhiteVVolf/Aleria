import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_FIR_AN_TARVO_LOCAL_PORTRAIT_IDS,
  HOUSE_FIR_AN_TARVO_PORTRAITS,
  HOUSE_FIR_AN_TARVO_REUSED_PORTRAIT_IDS
} from './house-fir-an-tarvo-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import {
  TIR_NA_TONN_HOUSE_EMBLEMS,
  TIR_NA_TONN_HOUSE_PROFILES,
  TIR_NA_TONN_MANAGED_PROFILE_FIELDS
} from './tir-na-tonn-house-profiles.js';

const TARVO_HOUSE_ID = 'house-tarvo';
const TARVO_EMBLEM = TIR_NA_TONN_HOUSE_EMBLEMS['fir-an-tarvo'];

const HOUSE_HEAD_IDS = new Set([
  'tarvonius-tarvo',
  'luntorius-tarvo',
  'usbran-tarvo',
  'neartan-tarvo'
]);
const SUCCESSION_IDS = new Set(['athluan-tarvo', 'uallghus-tarvo', 'crispus-tarvo']);

const HEAD_TITLES = Object.freeze({
  'tarvonius-tarvo': 'Angenommener Ahnherr und Gründer der Kolonie Tarvonnis',
  'luntorius-tarvo': 'Mor Tiarna von Tir na Tonn · bis 1698',
  'usbran-tarvo': 'Mor Tiarna von Tir na Tonn · 1698–1704',
  'neartan-tarvo': 'Mor Tiarna von Tir na Tonn · seit 1704',
  'athluan-tarvo': 'Erster der Erbfolge des Mor Tiarna',
  'uallghus-tarvo': 'Zweiter der Erbfolge des Mor Tiarna',
  'crispus-tarvo': 'Dritter der Erbfolge des Mor Tiarna'
});

const TARGETS = Object.freeze({
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-airt']
  }),
  abor: Object.freeze({
    name: 'Haus Abor',
    houseId: 'house-abor',
    targetFamilyId: 'haus-abor',
    emblem: ''
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  }),
  gortach: Object.freeze({
    name: 'Ru’Gortach',
    houseId: 'house-gortach',
    targetFamilyId: 'haus-gortach',
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS.gortach
  }),
  cuinn: Object.freeze({
    name: 'Clan Tir An’Cuinn',
    houseId: 'house-cuinn',
    targetFamilyId: 'haus-tir-an-cuinn',
    emblem: LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn']
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TARVO_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_FIR_AN_TARVO_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === TARVO_HOUSE_ID ? 'core' : 'married'),
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
  return person(id, name, 'female', birth, death, TARVO_HOUSE_ID, {
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
    idPrefix: 'fir-an-tarvo-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, { status: 'ended', end });
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

const TARVONIUS_IDS = ['tarvonius-tarvo', 'cearbhallan-tarvo'];
const LUNTORIUS_IDS = ['luntorius-tarvo', 'glaisnait-gortach'];
const MACHA_IDS = ['dubhshlaine-gealach', 'macha-tarvo'];
const GAODHALAN_IDS = ['gaodhalan-tarvo', 'stiubharda'];
const MAIREAD_IDS = ['seamus-airt', 'mairead-tarvo'];
const USBRAN_IDS = ['usbran-tarvo', 'aeliana-vinicius'];
const MAOLCHARNA_IDS = ['maolcharna-tarvo', 'veturian-abor'];
const CEIRON_IDS = ['geillis-cumhail', 'ceiron-tarvo'];
const ZEILTHRA_IDS = ['cathaoir-cruthin', 'zeilthra-tarvo'];
const ZAILBHEAN_IDS = ['zailbhean-tarvo', 'vibiana-tullius'];
const NEARTAN_IDS = ['neartan-tarvo', 'lutoria-arentino'];
const JOCLYNN_IDS = ['nolan-gallchobhair', 'joclynn-tarvo'];
const LAIMREAC_IDS = ['laimreac-tarvo', 'conairean-ruitheach'];
const SGAIL_IDS = ['aiden-cuinn', 'sgail-tarvo'];
const ATHLUAN_IDS = ['athluan-tarvo', 'oirthnait-cuinn'];
const RONMARA_IDS = ['peighneachan-gortach', 'ronmara-tarvo'];
const GAIUS_IDS = ['sorcha-1700-cruthin', 'gaius-tarvo'];
const TURLACHAN_IDS = ['turlachan-tarvo', 'dallbhra'];

export const HOUSE_FIR_AN_TARVO_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-fir-an-tarvo',
    title: 'Clan Fir An’Tarvo',
    motto: '',
    description: 'Mor-Tiarna-Clan von Tir na Tonn mit Sitz in Dun Rothar; die Familie versteht Tarvonius als ihren Ahnherrn, obwohl die frühe Abstammung historisch ungesichert ist.',
    emblem: TARVO_EMBLEM,
    houseProfile: TIR_NA_TONN_HOUSE_PROFILES['fir-an-tarvo']
  },
  houses: [
    house(TARVO_HOUSE_ID, 'Clan Fir An’Tarvo', TARVO_EMBLEM),
    house('house-gortach', 'Ru’Gortach', TIR_NA_TONN_HOUSE_EMBLEMS.gortach),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-airt', 'Clan Mac Airt', LEITHEACH_HOUSE_EMBLEMS['mac-airt']),
    house('house-vinicius', 'Haus Vinicius'),
    house('house-abor', 'Haus Abor'),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-cruthin', 'Clan Dál’Cruthin', TIR_NA_GORTANNA_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-tullius', 'Haus Tullius'),
    house('house-arentino', 'Haus Arentino'),
    house('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    house('house-ruitheach', 'Dál’Ruitheach', TIR_NA_TONN_HOUSE_EMBLEMS.ruitheach),
    house('house-cuinn', 'Clan Tir An’Cuinn', LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn'])
  ],
  persons: [
    person('tarvonius-tarvo', 'Tarvonius', 'male', '????', '????', TARVO_HOUSE_ID, {
      tags: ['Gründer', 'Angenommener Ahnherr'],
      notes: 'Tarvonius gründete die Kolonie Tarvonnis. Ob der spätere Clan tatsächlich von ihm abstammt, ist nicht belegt; die Fir An’Tarvo nehmen ihn dennoch als Ahnherrn an.'
    }),
    spouse('cearbhallan-tarvo', 'Cearbhallán', 'female', '????', '????'),

    person('luntorius-tarvo', 'Luntorius Tarvo', 'male', '1607', '1698'),
    spouse('glaisnait-gortach', 'Glaisnait Gortach', 'female', '1611', '1688', 'house-gortach'),
    awayWoman('macha-tarvo', 'Mácha Tarvo', '1609', '1671', 'gaelach'),
    spouse('dubhshlaine-gealach', 'Dubhshláine Gealach', 'male', '1606', '1666', 'house-gealach'),
    person('gaodhalan-tarvo', 'Gaodhalán Tarvo', 'male', '1612', '1674'),
    spouse('stiubharda', 'Stiúbharda', 'female', '1615', '1659'),

    awayWoman('mairead-tarvo', 'Mairéad Tarvo', '1628', '1709', 'airt'),
    spouse('seamus-airt', 'Séamus Airt', 'male', '1625', '1684', 'house-airt'),
    person('usbran-tarvo', 'Ùsbran Tarvo', 'male', '1630', '1704'),
    spouse('aeliana-vinicius', 'Aeliana Vinicius', 'female', '1631', '1711', 'house-vinicius'),
    awayWoman('maolcharna-tarvo', 'Maolcharna Tarvo', '1635', '1701', 'abor'),
    spouse('veturian-abor', 'Veturian Abor', 'male', '1632', '1700', 'house-abor'),

    person('ceiron-tarvo', 'Ceiron Tarvo', 'male', '1649', '1684', TARVO_HOUSE_ID, {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('geillis-cumhail', 'Geillis Cumhail', 'female', '1653', '1700', 'house-cumhail'),
    awayWoman('zeilthra-tarvo', 'Zeilthra Tarvo', '1652', '1733', 'cruthin'),
    spouse('cathaoir-cruthin', 'Cathaoir Cruthin', 'male', '1641', '', 'house-cruthin', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('zailbhean-tarvo', 'Záilbhean Tarvo', 'male', '1655', '1731'),
    spouse('vibiana-tullius', 'Vibiana Tullius', 'female', '1656', '', 'house-tullius'),

    person('neartan-tarvo', 'Neartán Tarvo', 'male', '1673', ''),
    spouse('lutoria-arentino', 'Lutoria Arentino', 'female', '1677', '', 'house-arentino'),
    awayWoman('joclynn-tarvo', 'Joclynn Tarvo', '1679', '', 'gallchobhair', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('nolan-gallchobhair', 'Nolan Gallchobhair', 'male', '1678', '1733', 'house-gallchobhair', {
      extensions: { registryManagedFields: ['portrait', 'death'] }
    }),
    person('laimreac-tarvo', 'Laimreac Tarvo', 'male', '1675', ''),
    spouse('conairean-ruitheach', 'Conairean Ruitheach', 'female', '1679', '', 'house-ruitheach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    awayWoman('sgail-tarvo', 'Sgáil Tarvo', '1678', '', 'cuinn'),
    spouse('aiden-cuinn', 'Aiden Cuinn', 'male', '1676', '1733', 'house-cuinn'),

    person('athluan-tarvo', 'Athluan Tarvo', 'male', '1693', ''),
    spouse('oirthnait-cuinn', 'Oirthnait Cuinn', 'female', '1698', '', 'house-cuinn'),
    awayWoman('ronmara-tarvo', 'Rónmara Tarvo', '1695', '', 'gortach'),
    spouse('peighneachan-gortach', 'Peighneachan Gortach', 'male', '1690', '', 'house-gortach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('gaius-tarvo', 'Gaius Tarvo', 'male', '1696', '', TARVO_HOUSE_ID, {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('sorcha-1700-cruthin', 'Sorcha Cruthin', 'female', '1700', '', 'house-cruthin', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('tlachtga-tarvo', 'Tlachtga Tarvo', 'female', '1697', ''),
    person('turlachan-tarvo', 'Turlachán Tarvo', 'male', '1700', ''),
    spouse('dallbhra', 'Dallbhra', 'female', '1704', ''),

    person('uallghus-tarvo', 'Uallghus Tarvo', 'male', '1719', ''),
    person('glaisnin-tarvo', 'Glaisnín Tarvo', 'male', '1722', ''),
    person('crispus-tarvo', 'Crispus Tarvo', 'male', '1726', ''),
    person('aurexia-tullius', 'Aurexia Tullius', 'female', '1726', '', 'house-tullius', {
      familyRole: 'ward',
      title: 'Mündel Athluans',
      tags: ['Mündel'],
      notes: 'Aurexia Tullius ist Athluans aufgenommenes Mündel und kein leibliches Kind der Fir An’Tarvo.'
    }),
    person('imchad-tarvo', 'Imchad Tarvo', 'male', '1722', ''),
    person('iothlan-tarvo', 'Iothlán Tarvo', 'male', '1725', ''),
    person('earcra-tarvo', 'Earcra Tarvo', 'female', '1724', ''),
    person('flannmara-tarvo', 'Flannmara Tarvo', 'female', '1729', '')
  ],
  partnerships: [
    endedMarriage('marriage-tarvonius-cearbhallan', TARVONIUS_IDS),
    endedMarriage('marriage-luntorius-glaisnait', LUNTORIUS_IDS, '1688'),
    endedMarriage('marriage-dubhshlaine-macha', MACHA_IDS, '1666'),
    endedMarriage('marriage-gaodhalan-stiubharda', GAODHALAN_IDS, '1659'),
    endedMarriage('marriage-seamus-mairead', MAIREAD_IDS, '1684'),
    endedMarriage('marriage-usbran-aeliana', USBRAN_IDS, '1704'),
    endedMarriage('marriage-maolcharna-veturian', MAOLCHARNA_IDS, '1700'),
    endedMarriage('marriage-geillis-ceiron', CEIRON_IDS, '1684'),
    endedMarriage('marriage-cathaoir-zeilthra', ZEILTHRA_IDS, '1733'),
    endedMarriage('marriage-zailbhean-vibiana', ZAILBHEAN_IDS, '1731'),
    createMarriage('marriage-neartan-lutoria', ...NEARTAN_IDS),
    endedMarriage('marriage-nolan-joclynn', JOCLYNN_IDS, '1733'),
    createMarriage('marriage-laimreac-conairean', ...LAIMREAC_IDS),
    endedMarriage('marriage-aiden-sgail', SGAIL_IDS, '1733'),
    createMarriage('marriage-athluan-oirthnait', ...ATHLUAN_IDS),
    createMarriage('marriage-peighneachan-ronmara', ...RONMARA_IDS),
    createMarriage('marriage-sorcha-gaius', ...GAIUS_IDS),
    createMarriage('marriage-turlachan-dallbhra', ...TURLACHAN_IDS)
  ],
  parentages: [
    ...childrenOf(['luntorius-tarvo', 'macha-tarvo', 'gaodhalan-tarvo'], TARVONIUS_IDS, 'marriage-tarvonius-cearbhallan', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die frühen Generationen zwischen Tarvonius und der ab 1607 belegten Linie sind nicht einzeln überliefert; selbst Tarvonius’ tatsächliche Abstammungsverbindung zum Clan ist ungesichert.',
      extensions: { timeJumpId: 'gap-tarvonius-luntorius-macha-gaodhalan' }
    }),
    ...childrenOf(['mairead-tarvo', 'usbran-tarvo'], LUNTORIUS_IDS, 'marriage-luntorius-glaisnait'),
    ...childrenOf(['maolcharna-tarvo'], GAODHALAN_IDS, 'marriage-gaodhalan-stiubharda'),
    ...childrenOf(['ceiron-tarvo', 'zeilthra-tarvo', 'zailbhean-tarvo'], USBRAN_IDS, 'marriage-usbran-aeliana'),
    ...childrenOf(['neartan-tarvo', 'joclynn-tarvo'], CEIRON_IDS, 'marriage-geillis-ceiron'),
    ...childrenOf(['laimreac-tarvo', 'sgail-tarvo'], ZAILBHEAN_IDS, 'marriage-zailbhean-vibiana'),
    ...childrenOf(['athluan-tarvo', 'ronmara-tarvo', 'gaius-tarvo'], NEARTAN_IDS, 'marriage-neartan-lutoria'),
    ...childrenOf(['tlachtga-tarvo', 'turlachan-tarvo'], LAIMREAC_IDS, 'marriage-laimreac-conairean'),
    ...childrenOf(['uallghus-tarvo', 'glaisnin-tarvo', 'crispus-tarvo'], ATHLUAN_IDS, 'marriage-athluan-oirthnait'),
    ...childrenOf(['aurexia-tullius'], ['athluan-tarvo'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Aurexia Tullius ist Athluans Mündel und kein leibliches Kind.'
    }),
    ...childrenOf(['imchad-tarvo', 'iothlan-tarvo'], GAIUS_IDS, 'marriage-sorcha-gaius'),
    ...childrenOf(['earcra-tarvo', 'flannmara-tarvo'], TURLACHAN_IDS, 'marriage-turlachan-dallbhra')
  ],
  cadetBranches: [
    marriedAway('married-away-gaelach-macha', 'marriage-dubhshlaine-macha', 'gaelach'),
    marriedAway('married-away-airt-mairead', 'marriage-seamus-mairead', 'airt'),
    marriedAway('married-away-abor-maolcharna', 'marriage-maolcharna-veturian', 'abor'),
    marriedAway('married-away-cruthin-zeilthra', 'marriage-cathaoir-zeilthra', 'cruthin'),
    marriedAway('married-away-gallchobhair-joclynn', 'marriage-nolan-joclynn', 'gallchobhair'),
    marriedAway('married-away-gortach-ronmara', 'marriage-peighneachan-ronmara', 'gortach'),
    marriedAway('married-away-cuinn-sgail', 'marriage-aiden-sgail', 'cuinn')
  ],
  timeJumps: [
    {
      id: 'gap-tarvonius-luntorius-macha-gaodhalan',
      parentPartnershipId: 'marriage-tarvonius-cearbhallan',
      childIds: ['luntorius-tarvo', 'macha-tarvo', 'gaodhalan-tarvo'],
      years: 0,
      fromYear: '????',
      toYear: '1607',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1607 datierten Linie',
      notes: 'Die Quelle setzt zwischen dem angenommenen Ahnherrn Tarvonius und der späteren Hauptlinie eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-tarvonius-cearbhallan',
    houseId: TARVO_HOUSE_ID,
    crestSubtitle: 'Mor Tiarnatum Tir na Tonn · Dun Rothar · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tarvonius-tarvo',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Fir An’Tarvo (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Amtszeiten und Erbfolge folgen der bereitgestellten Fir-An’Tarvo-Akte. Tarvonius gründete Tarvonnis und gilt dem Clan als Ahnherr, obwohl die tatsächliche Abstammung ausdrücklich ungesichert ist; die frühe Lücke wird deshalb als beanspruchte Abstammung über einen seriellen Zeitsprung geführt. Mácha, Ceiron, Zeilthra, Joclynn, Gaius und Peighneachan verwenden dieselben Weltpersonen- und Ehe-IDs wie ihre Gegenakten. Cathaoir, Sorcha, Nolan und Peighneachan übernehmen ihre bereits kanonischen Porträts; Nolans unmögliches Quelltodesjahr 1633 wird anhand seiner Gallchobhair-Akte zu 1733 berichtigt. Aurexia Tullius ist ausschließlich Athluans Mündel. Wiederholte Standardsilhouetten und die fünf unbenannten Verlobtenfelder der jüngsten Generation werden nicht als individuelle Personen importiert.',
    sourceRevision: 5,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Mor Tiarna von Tir na Tonn',
      headOrder: Object.freeze([
        'tarvonius-tarvo',
        'luntorius-tarvo',
        'usbran-tarvo',
        'neartan-tarvo'
      ]),
      publishedOrder: Object.freeze(['athluan-tarvo', 'uallghus-tarvo', 'crispus-tarvo'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: HOUSE_FIR_AN_TARVO_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_FIR_AN_TARVO_REUSED_PORTRAIT_IDS,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir na Tonn',
    territoryGloss: 'Land der Wellen',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'mor-tiarna',
    administrativeRole: 'Mor Tiarna von Tir na Tonn',
    immediateLiegeHouseId: 'haus-mac-ard-cumhaill',
    immediateLiegeHouseName: 'Clan Mac Ard Cumhaill',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'blankFamily',
      'preparedMainLine',
      'sourceNote',
      'inheritance',
      'portraitPolicy',
      'principality',
      'territory',
      'territoryGloss',
      'historicalStatus',
      'directMorTiarnaBarony',
      'albicRank',
      'administrativeRole',
      'immediateLiegeHouseId',
      'immediateLiegeHouseName'
    ],
    registryManagedHouseProfileFields: TIR_NA_TONN_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: ['house-fir-an-tarvo'],
      persons: ['haus-fir-an-tarvo-gruender', 'haus-fir-an-tarvo-gruenderin'],
      partnerships: ['marriage-haus-fir-an-tarvo-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
