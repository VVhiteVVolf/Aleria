import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_RUIN_UA_LAOCH_PORTRAITS } from './house-ruin-ua-laoch-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';

const LAOCH_HOUSE_ID = 'house-laoch';
const LAOCH_EMBLEM = LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch'];

const HOUSE_EMBLEMS = Object.freeze({
  airt: LEITHEACH_HOUSE_EMBLEMS['mac-airt'],
  cuinn: LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn'],
  cumhail: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'],
  eirce: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce'],
  fiachrach: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach'],
  gallchobhair: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair,
  ghaiscioch: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch,
  gealach: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'],
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png'
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  gwefrydd: Object.freeze({
    name: 'Haus Gwefrydd',
    houseId: 'house-gwefrydd',
    targetFamilyId: 'haus-gwefrydd',
    emblem: HOUSE_EMBLEMS.gwefrydd
  }),
  laidir: Object.freeze({
    name: 'Haus Laidir',
    houseId: 'house-laidir',
    targetFamilyId: 'haus-laidir',
    emblem: ''
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: HOUSE_EMBLEMS.gallchobhair
  }),
  dundas: Object.freeze({
    name: 'Haus Dundas',
    houseId: 'house-dundas',
    targetFamilyId: 'haus-dundas',
    emblem: ''
  }),
  fiachrach: Object.freeze({
    name: 'Clan Uí Fiachrach',
    houseId: 'house-fiachrach',
    targetFamilyId: 'haus-fiachrach',
    emblem: HOUSE_EMBLEMS.fiachrach
  }),
  eirce: Object.freeze({
    name: 'Clan Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: HOUSE_EMBLEMS.eirce
  }),
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: HOUSE_EMBLEMS.ghaiscioch
  }),
  gealach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gealach
  })
});

const HOUSE_HEAD_IDS = new Set([
  'senan-ancient-cumhail',
  'roibeard-laoch',
  'naran-laoch',
  'talamhan-laoch',
  'reamonn-laoch'
]);

const SUCCESSION_IDS = new Set([
  'zadran-laoch',
  'eamon-laoch',
  'fergal-laoch'
]);

const HEAD_TITLES = Object.freeze({
  'senan-ancient-cumhail': 'Gründer und erster Laird des Clans Ruin Ua Laoch',
  'roibeard-laoch': 'Laird des Clans Ruin Ua Laoch · bis 1654',
  'naran-laoch': 'Laird des Clans Ruin Ua Laoch · 1654–1697',
  'talamhan-laoch': 'Laird des Clans Ruin Ua Laoch · 1697–1728',
  'reamonn-laoch': 'Laird des Clans Ruin Ua Laoch · seit 1728'
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = LAOCH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_RUIN_UA_LAOCH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === LAOCH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: { ...(options.extensions || {}) }
  });
}

function spouse(id, name, sex, birth = '????', death = '????', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    ...options,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetKey, options = {}) {
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return person(id, name, 'female', birth, death, LAOCH_HOUSE_ID, {
    ...options,
    title: options.title || `Wegverheiratet an ${target.name}`,
    tags: [...(options.tags || []), 'Wegverheiratet'],
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: [
        ...new Set([
          ...(options.extensions?.registryManagedFields || []),
          'sex',
          'title',
          'tags'
        ])
      ]
    }
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
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, partnershipId, targetKey) {
  const target = MARRIED_AWAY_TARGETS[targetKey];
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

const SENAN_IDS = ['senan-ancient-cumhail', 'doireann-cumhail'];
const ROIBEARD_IDS = ['roibeard-laoch', 'conchenn-suiste'];
const AISLING_IDS = ['aisling-laoch', 'borros-gwefrydd'];
const RONAN_IDS = ['ronan-laoch', 'luighseach-gairner'];
const EITHNE_IDS = ['eithne-laoch', 'valtair-laidir'];
const NARAN_IDS = ['naran-laoch', 'fainche-gealach'];
const TORMOD_IDS = ['tormod-laoch', 'scailin-unknown-laoch'];
const FARRELL_IDS = ['farrell-laoch', 'cliodhna-airt'];
const NIORLA_IDS = ['niorla-laoch', 'jothran-gallchobhair'];
const EOLANN_IDS = ['eolann-laoch', 'bebhinn-1635-eirce'];
const TALAMHAN_IDS = ['talamhan-laoch', 'laoiseach-stwatchn'];
const URCHRIST_IDS = ['urchrist-laoch', 'alasdair-dundas'];
const SINNA_IDS = ['sinna-laoch', 'mabh-unknown-laoch'];
const YSALACH_IDS = ['ysalach-laoch', 'domhnallach-fiachrach'];
const REAMONN_IDS = ['reamonn-laoch', 'earraigh-cumhail'];
const WYLBA_IDS = ['wylba-laoch', 'fiachra-eirce'];
const TREASA_IDS = ['treasa-laoch', 'zeighlan-ghaiscioch'];
const FLANN_IDS = ['flann-laoch', 'nainsi-unknown-laoch'];
const ZADRAN_IDS = ['zadran-laoch', 'aimhirne-cuinn'];
const FLANNAIT_IDS = ['flannait-laoch', 'laitheal-gealach'];
const YORAN_IDS = ['yoran-laoch', 'bebinn-unknown-laoch'];
const TRIAN_IDS = ['trian-laoch', 'fara-unknown-laoch'];

export const HOUSE_RUIN_UA_LAOCH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ruin-ua-laoch',
    title: 'Ruin Ua Laoch',
    motto: '',
    description: 'Die aus Senán „Laoch“ Cumhail hervorgegangene Heldenlinie bewahrt ein kriegerisches Ideal aus Mut, Standhaftigkeit, Opferbereitschaft und Schutzpflicht.',
    emblem: LAOCH_EMBLEM,
    houseProfile: LEITHEACH_LAIRD_HOUSE_PROFILES['ruin-ua-laoch']
  },
  houses: [
    house(LAOCH_HOUSE_ID, 'Ruin Ua Laoch', LAOCH_EMBLEM),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', HOUSE_EMBLEMS.cumhail),
    house('house-suiste', 'Haus Suiste'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-gairner', 'Haus Gáirnér'),
    house('house-laidir', 'Haus Laidir'),
    house('house-gealach', 'Clan Ua’Gaelach', HOUSE_EMBLEMS.gealach),
    house('house-airt', 'Clan Mac Airt', HOUSE_EMBLEMS.airt),
    house('house-gallchobhair', 'Fir An’Gallchobhair', HOUSE_EMBLEMS.gallchobhair),
    house('house-eirce', 'Clan Ua’Eirce', HOUSE_EMBLEMS.eirce),
    house('house-stwatchn', 'Haus Stwatchn'),
    house('house-dundas', 'Haus Dundas'),
    house('house-fiachrach', 'Clan Uí Fiachrach', HOUSE_EMBLEMS.fiachrach),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', HOUSE_EMBLEMS.ghaiscioch),
    house('house-cuinn', 'Clan Tir An’Cuinn', HOUSE_EMBLEMS.cuinn),
    house('house-eala', 'Haus Eala')
  ],
  persons: [
    person('senan-ancient-cumhail', 'Senán Cumhail', 'male', '????', '????', 'house-cumhail'),
    spouse('doireann-cumhail', 'Doireann', 'female'),

    person('roibeard-laoch', 'Roibeard Laoch', 'male', '1579', '1654'),
    awayWoman('aisling-laoch', 'Aisling Laoch', '1579', '1644', 'gwefrydd'),
    person('ronan-laoch', 'Rónán Laoch', 'male', '1584', '1658'),
    spouse('conchenn-suiste', 'Conchenn Suiste', 'female', '1585', '1651', 'house-suiste', {
      notes: 'Die Quelltabelle nennt unmöglich 1685–1651; 1585–1651 folgt der Generation, Ehe und Geburt der Kinder.'
    }),
    spouse('borros-gwefrydd', 'Borros Gwefrydd', 'male', '1578', '1650', 'house-gwefrydd'),
    spouse('luighseach-gairner', 'Luighseach Gáirnér', 'female', '1587', '1680', 'house-gairner', {
      notes: 'Die Quelltabelle nennt unmöglich 1687–1680; 1587–1680 folgt der Generation, Ehe und Geburt Tormods.'
    }),

    awayWoman('eithne-laoch', 'Eithne Laoch', '1605', '1677', 'laidir'),
    person('naran-laoch', 'Nárán Laoch', 'male', '1607', '1697'),
    person('tormod-laoch', 'Tormod Laoch', 'male', '1605', '1681'),
    spouse('valtair-laidir', 'Valtair Laidir', 'male', '1603', '1689', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('fainche-gealach', 'Fainche Gealach', 'female', '1608', '1679', 'house-gealach'),
    spouse('scailin-unknown-laoch', 'Scáilin', 'female', '1607', '1684'),

    person('farrell-laoch', 'Farrell Laoch', 'male', '1629', '1691'),
    awayWoman('niorla-laoch', 'Níórla Laoch', '1632', '1693', 'gallchobhair'),
    person('eolann-laoch', 'Eolann Laoch', 'male', '1634', '1699'),
    person('xeinidh-laoch', 'Xéinidh Laoch', 'female', '1630', '', LAOCH_HOUSE_ID, {
      extensions: { registryManagedFields: ['sex'] }
    }),
    spouse('cliodhna-airt', 'Clíodhna Airt', 'female', '1633', '1704', 'house-airt'),
    spouse('jothran-gallchobhair', 'Jothrán Gallchobhair', 'male', '1626', '1684', 'house-gallchobhair', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('bebhinn-1635-eirce', 'Bébhinn Eirce', 'female', '1635', '1701', 'house-eirce'),

    person('talamhan-laoch', 'Talamhán Laoch', 'male', '1651', '1728'),
    awayWoman('urchrist-laoch', 'Úrchrist Laoch', '1655', '1731', 'dundas'),
    person('sinna-laoch', 'Sinna Laoch', 'male', '1653', '1709'),
    awayWoman('ysalach-laoch', 'Ysalach Laoch', '1655', '1729', 'fiachrach'),
    spouse('laoiseach-stwatchn', 'Laoiseach Stwatchn', 'female', '1652', '1738', 'house-stwatchn'),
    spouse('alasdair-dundas', 'Alasdair Dundas', 'male', '1652', '1720', 'house-dundas'),
    spouse('mabh-unknown-laoch', 'Mabh', 'female', '1658', '1728'),
    spouse('domhnallach-fiachrach', 'Domhnallach Fiachrach', 'male', '1651', '1734', 'house-fiachrach'),

    person('reamonn-laoch', 'Reamonn Laoch', 'male', '1671', ''),
    awayWoman('wylba-laoch', 'Wylba Laoch', '1675', '1739', 'eirce'),
    awayWoman('treasa-laoch', 'Treasa Laoch', '1679', '', 'ghaiscioch'),
    person('flann-laoch', 'Flann Laoch', 'male', '1680', ''),
    spouse('earraigh-cumhail', 'Earraigh Cumhail', 'female', '1673', '', 'house-cumhail'),
    spouse('fiachra-eirce', 'Fiachra Eirce', 'male', '1668', '1720', 'house-eirce'),
    spouse('zeighlan-ghaiscioch', 'Zeighlan Ghaiscíoch', 'male', '1677', '', 'house-ghaiscioch'),
    spouse('nainsi-unknown-laoch', 'Nainsí', 'female', '1683', ''),

    person('zadran-laoch', 'Zadrán Laoch', 'male', '1698', '', LAOCH_HOUSE_ID, {
      title: '1. Stelle der Erbfolge'
    }),
    awayWoman('flannait-laoch', 'Flannait Laoch', '1695', '', 'gealach'),
    person('yoran-laoch', 'Yòrán Laoch', 'male', '1700', ''),
    person('fionait-laoch', 'Fíonnait Laoch', 'female', '1704', ''),
    person('trian-laoch', 'Trian Laoch', 'male', '1702', ''),
    spouse('aimhirne-cuinn', 'Aimhirne Cuinn', 'female', '1704', '', 'house-cuinn'),
    spouse('laitheal-gealach', 'Laithéal Gealach', 'male', '1690', '', 'house-gealach'),
    spouse('bebinn-unknown-laoch', 'Bébinn', 'female', '1703', ''),
    spouse('fara-unknown-laoch', 'Fara', 'female', '1704', ''),

    person('eamon-laoch', 'Eamon Laoch', 'male', '1722', '', LAOCH_HOUSE_ID, {
      title: '2. Stelle der Erbfolge'
    }),
    person('fergal-laoch', 'Fergal Laoch', 'male', '1727', '', LAOCH_HOUSE_ID, {
      title: '3. Stelle der Erbfolge',
      notes: 'Die Erbfolgetafel verkürzt den Namen einmal zu Feral; Stammbaum und Familientabelle verwenden Fergal.'
    }),
    person('morag-eala', 'Mórag Eala', 'female', '1728', '', 'house-eala', {
      familyRole: 'ward',
      title: 'Mündel Zadráns',
      notes: 'Zadrán ist Mórags Vormund, nicht ihr leiblicher Vater.'
    }),
    person('giollan-laoch', 'Giollan Laoch', 'male', '1723', ''),
    person('peadar-laoch', 'Peadar Laoch', 'male', '1725', ''),
    person('muireall-laoch', 'Muireall Laoch', 'female', '1722', ''),
    person('niamh-laoch', 'Niamh Laoch', 'female', '1725', ''),
    person('lile-laoch', 'Líle Laoch', 'female', '1727', ''),
    person('deirdre-laoch', 'Deirdre Laoch', 'female', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-senan-doireann', ...SENAN_IDS),
    createMarriage('marriage-roibeard-conchenn', ...ROIBEARD_IDS),
    createMarriage('marriage-borros-aisling', ...AISLING_IDS),
    createMarriage('marriage-ronan-luighseach', ...RONAN_IDS),
    createMarriage('marriage-eithne-valtair', ...EITHNE_IDS),
    createMarriage('marriage-naran-fainche', ...NARAN_IDS),
    createMarriage('marriage-tormod-scailin', ...TORMOD_IDS),
    createMarriage('marriage-farrell-cliodhna', ...FARRELL_IDS),
    createMarriage('marriage-niorla-jothran', ...NIORLA_IDS),
    createMarriage('marriage-bebhinn-eolann', ...EOLANN_IDS),
    createMarriage('marriage-talamhan-laoiseach', ...TALAMHAN_IDS),
    createMarriage('marriage-urchrist-alasdair', ...URCHRIST_IDS),
    createMarriage('marriage-sinna-mabh', ...SINNA_IDS),
    createMarriage('marriage-domhnallach-ysalach', ...YSALACH_IDS),
    createMarriage('marriage-earraigh-reamonn', ...REAMONN_IDS),
    createMarriage('marriage-fiachra-wylba', ...WYLBA_IDS),
    createMarriage('marriage-treasa-zeighlan', ...TREASA_IDS),
    createMarriage('marriage-flann-nainsi', ...FLANN_IDS),
    createMarriage('marriage-zadran-aimhirne', ...ZADRAN_IDS),
    createMarriage('marriage-flannait-laitheal', ...FLANNAIT_IDS),
    createMarriage('marriage-yoran-bebinn', ...YORAN_IDS),
    createMarriage('marriage-trian-fara', ...TRIAN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['roibeard-laoch', 'aisling-laoch', 'ronan-laoch'],
      SENAN_IDS,
      'marriage-senan-doireann',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Punktreihe im Stammbaum markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1579 datierten Linie.',
        extensions: { timeJumpId: 'gap-senan-roibeard' }
      }
    ),
    ...childrenOf(['eithne-laoch', 'naran-laoch'], ROIBEARD_IDS, 'marriage-roibeard-conchenn'),
    ...childrenOf(['tormod-laoch'], RONAN_IDS, 'marriage-ronan-luighseach'),
    ...childrenOf(['farrell-laoch', 'niorla-laoch', 'eolann-laoch'], NARAN_IDS, 'marriage-naran-fainche'),
    ...childrenOf(['xeinidh-laoch'], TORMOD_IDS, 'marriage-tormod-scailin'),
    ...childrenOf(['talamhan-laoch', 'urchrist-laoch'], FARRELL_IDS, 'marriage-farrell-cliodhna'),
    ...childrenOf(['sinna-laoch', 'ysalach-laoch'], EOLANN_IDS, 'marriage-bebhinn-eolann'),
    ...childrenOf(['reamonn-laoch', 'wylba-laoch'], TALAMHAN_IDS, 'marriage-talamhan-laoiseach'),
    ...childrenOf(['treasa-laoch', 'flann-laoch'], SINNA_IDS, 'marriage-sinna-mabh'),
    ...childrenOf(
      ['zadran-laoch', 'flannait-laoch', 'yoran-laoch', 'fionait-laoch'],
      REAMONN_IDS,
      'marriage-earraigh-reamonn'
    ),
    ...childrenOf(['trian-laoch'], FLANN_IDS, 'marriage-flann-nainsi'),
    ...childrenOf(['eamon-laoch', 'fergal-laoch'], ZADRAN_IDS, 'marriage-zadran-aimhirne'),
    ...childrenOf(['morag-eala'], ['zadran-laoch'], '', {
      idPrefix: 'fosterage-zadran',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Zadrán ist Mórags Vormund; es besteht keine leibliche Abstammung.'
    }),
    ...childrenOf(['giollan-laoch', 'peadar-laoch'], YORAN_IDS, 'marriage-yoran-bebinn'),
    ...childrenOf(
      ['muireall-laoch', 'niamh-laoch', 'lile-laoch', 'deirdre-laoch'],
      TRIAN_IDS,
      'marriage-trian-fara'
    )
  ],
  cadetBranches: [
    marriedAway('married-away-gwefrydd-aisling', 'marriage-borros-aisling', 'gwefrydd'),
    marriedAway('married-away-laidir-eithne', 'marriage-eithne-valtair', 'laidir'),
    marriedAway('married-away-gallchobhair-niorla', 'marriage-niorla-jothran', 'gallchobhair'),
    marriedAway('married-away-dundas-urchrist', 'marriage-urchrist-alasdair', 'dundas'),
    marriedAway('married-away-fiachrach-ysalach', 'marriage-domhnallach-ysalach', 'fiachrach'),
    marriedAway('married-away-eirce-wylba', 'marriage-fiachra-wylba', 'eirce'),
    marriedAway('married-away-ghaiscioch-treasa', 'marriage-treasa-zeighlan', 'ghaiscioch'),
    marriedAway('married-away-gealach-flannait', 'marriage-flannait-laitheal', 'gealach')
  ],
  timeJumps: [
    {
      id: 'gap-senan-roibeard',
      parentPartnershipId: 'marriage-senan-doireann',
      childIds: ['roibeard-laoch', 'aisling-laoch', 'ronan-laoch'],
      years: 0,
      fromYear: '????',
      toYear: '1579',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1579 datierten Linie',
      notes: 'Die Quellgrafik setzt unterhalb des Clanwappens eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-senan-doireann',
    houseId: LAOCH_HOUSE_ID,
    crestSubtitle: 'Lairdtum in Tir na Sleagh · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'senan-ancient-cumhail',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Ruin Ua Laoch (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter, Erbfolge, Mündel und Überlieferungslücke folgen der bereitgestellten Ruin-Ua-Laoch-Hausseite und ihrer Stammbaumgrafik. Die unmöglichen Quellangaben Conchenn 1685–1651 und Luighseach 1687–1680 wurden anhand der Generationenfolge zu 1585–1651 und 1587–1680 berichtigt. Die detaillierte Tabelle nennt Náráns und Talamháns Lebensdaten; die kürzeren Jahresangaben der Oberhaupttafel sind deren Amtszeiten. Fergal folgt der ausführlichen Tabelle und der Stammbaumgrafik statt der einmaligen Kurzform Feral in der Erbfolgetafel. Aisling, Eithne, Níórla, Úrchrist, Ysalach, Wylba, Treasa und Flannait besitzen direkte Wegverheiratet-Knoten zu ihren Zielhäusern. Senán/Doireann, Borros/Aisling, Bébhinn/Eolann, Domhnallach/Ysalach, Earraigh/Reamonn und Fiachra/Wylba verwenden dieselben Weltpersonen-, Ehe- und Porträtzuordnungen wie ihre ausgearbeiteten Gegenakten. Mórag Eala ist Zadráns Mündel und kein leibliches Kind. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 4,
    sourceCorrections: Object.freeze([
      'Xéinidh Laoch ist gemäß Nutzerkorrektur eine Frau.'
    ]),
    principality: 'Leitheach',
    territory: 'Tir na Sleagh',
    albicRank: 'laird',
    inheritance: {
      primaryRule: 'männliche Primogenitur',
      fallbackRule: 'Töchter erben nur ohne anerkannten männlichen Nachkommen und mit Zustimmung des Fürstenhauses.',
      publishedOrder: ['zadran-laoch', 'eamon-laoch', 'fergal-laoch'],
      sourceDiscrepancy: 'Die Erbfolgetafel schreibt Fergal einmal verkürzt als Feral.'
    },
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: ['sourceNote', 'sourceCorrections'],
    registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
