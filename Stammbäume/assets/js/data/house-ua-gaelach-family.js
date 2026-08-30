import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_UA_GAELACH_PORTRAITS } from './house-ua-gaelach-portraits.js';
import { CEITHEACH_HOUSE_EMBLEMS } from './ceitheach-house-profiles.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';

const GAELACH_HOUSE_ID = 'house-gealach';
const GAELACH_EMBLEM = LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'];

const HOUSE_EMBLEMS = Object.freeze({
  airt: LEITHEACH_HOUSE_EMBLEMS['mac-airt'],
  ceardaiocht: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht'],
  cleir: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir,
  cuinn: LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn'],
  cumhail: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'],
  eirce: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ua-eirce'],
  gaelach: GAELACH_EMBLEM,
  gallchobhair: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair,
  ghaiscioch: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch,
  laoch: LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch'],
  mhuir: TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir'],
  tarvo: LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo']
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: HOUSE_EMBLEMS.laoch
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: HOUSE_EMBLEMS.gallchobhair
  }),
  eirce: Object.freeze({
    name: 'Clan Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: HOUSE_EMBLEMS.eirce
  }),
  airgid: Object.freeze({
    name: 'Haus Airgid',
    houseId: 'house-airgid',
    targetFamilyId: 'haus-airgid',
    emblem: ''
  }),
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: HOUSE_EMBLEMS.ghaiscioch
  }),
  frisealach: Object.freeze({
    name: 'Haus Frisealach',
    houseId: 'house-frisealach',
    targetFamilyId: 'haus-frisealach',
    emblem: ''
  }),
  airt: Object.freeze({
    name: 'Clan Mac Airt',
    houseId: 'house-airt',
    targetFamilyId: 'haus-mac-airt',
    emblem: HOUSE_EMBLEMS.airt
  }),
  ruitheach: Object.freeze({
    name: 'Haus Ruitheach',
    houseId: 'house-ruitheach',
    targetFamilyId: 'haus-ruitheach',
    emblem: ''
  })
});

const HOUSE_HEAD_IDS = new Set([
  'donnchadh-cumhail',
  'dubhshlaine-gealach',
  'samthann-gealach',
  'fodhlaidh-gealach',
  'ciaran-gealach'
]);

const HEAD_TITLES = Object.freeze({
  'donnchadh-cumhail': 'Gründer und erster Mor Tiarna des Clans Ua’Gaelach',
  'dubhshlaine-gealach': 'Mor Tiarna von Tir na Sinsear · bis 1666',
  'samthann-gealach': 'Mor Tiarna von Tir na Sinsear · 1666–1698',
  'fodhlaidh-gealach': 'Mor Tiarna von Tir na Sinsear · 1698–1731',
  'ciaran-gealach': 'Mor Tiarna von Tir na Sinsear · seit 1731'
});

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GAELACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_UA_GAELACH_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    familyRole: options.familyRole || (houseId === GAELACH_HOUSE_ID ? 'core' : 'married'),
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
  const target = MARRIED_AWAY_TARGETS[targetKey];
  return person(id, name, 'female', birth, death, GAELACH_HOUSE_ID, {
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

const DONNCHADH_IDS = ['donnchadh-cumhail', 'keelaith-duibhne'];
const DUBHSHLAINE_IDS = ['dubhshlaine-gealach', 'macha-tarvo'];
const FAINCHE_IDS = ['naran-laoch', 'fainche-gealach'];
const UARNAN_IDS = ['uarnan-gealach', 'eamhfhlaith-duibhne'];
const SAMTHANN_IDS = ['samthann-gealach', 'cnamhfhionn-cruthin'];
const BEILEACH_IDS = ['beileach-gealach', 'cathalan-gallchobhair'];
const SITHEACH_IDS = ['eigneachan-eirce', 'sitheach-gealach'];
const AIBHISTIN_IDS = ['aibhistin-gealach', 'greineach-cleir'];
const FODHLAIDH_IDS = ['fodhlaidh-gealach', 'eire-cuinn'];
const GORMGAL_IDS = ['gormgal-gealach', 'torlaith-blar'];
const DEAGHLAITH_IDS = ['deaghlaith-gealach', 'meallchu-airgid'];
const DOIREND_IDS = ['doirend-gealach', 'loinigh-1657'];
const CIARAN_IDS = ['eithne-cumhail', 'ciaran-gealach'];
const LIODHNAIT_IDS = ['liodhnait-gealach', 'cleirchin-ghaiscioch'];
const GEALLAN_IDS = ['geallan-gealach', 'shila-gallchobhair'];
const ERLACH_IDS = ['erlach-gealach', 'blathli-ceardaiocht'];
const SLAINEFHLAITH_IDS = ['slainefhlaith-gealach', 'giollanaimhe-frisealach'];
const LAITHEAL_IDS = ['flannait-laoch', 'laitheal-gealach'];
const DEARBHLA_IDS = ['dearbhla-gealach', 'reamonn-airt'];
const FINNBARR_IDS = ['maoltuile-eirce', 'finnbarr-gealach'];
const BRECCAN_IDS = ['breccan-gealach', 'uasalan-tordach'];
const AOIBHRIGH_IDS = ['aoibhrigh-gealach', 'troscan-ruitheach'];
const BERCAN_IDS = ['uallach-fiachrach', 'bercan-gealach'];
const SAORGHLAS_IDS = ['saorghlas-gealach', 'tuaman-mhuir'];

export const HOUSE_UA_GAELACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ua-gaelach',
    title: 'Clan Ua’Gaelach',
    motto: '',
    description: 'Aus Donnchadh Cumhaills Kadettenlinie hervorgegangener Mor-Tiarna-Clan von Tir na Sinsear mit Sitz in Nossail.',
    emblem: GAELACH_EMBLEM,
    houseProfile: LEITHEACH_HOUSE_PROFILES['ua-gaelach']
  },
  houses: [
    house(GAELACH_HOUSE_ID, 'Clan Ua’Gaelach', GAELACH_EMBLEM),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', HOUSE_EMBLEMS.cumhail),
    house('house-duibhne', 'Haus Duibhne'),
    house('house-tarvo', 'Clan Fir An’Tarvo', HOUSE_EMBLEMS.tarvo),
    house('house-laoch', 'Ruin Ua Laoch', HOUSE_EMBLEMS.laoch),
    house('house-cruthin', 'Clan Dál’Cruthin', LEITHEACH_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-gallchobhair', 'Fir An’Gallchobhair', HOUSE_EMBLEMS.gallchobhair),
    house('house-eirce', 'Clan Ua’Eirce', HOUSE_EMBLEMS.eirce),
    house('house-fiachrach', 'Clan Uí Fiachrach', LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach']),
    house('house-cleir', 'Clan Ua’Cleir', HOUSE_EMBLEMS.cleir),
    house('house-cuinn', 'Clan Tir An’Cuinn', HOUSE_EMBLEMS.cuinn),
    house('house-nic-blar', 'Clan Nic Blar', CEITHEACH_HOUSE_EMBLEMS['nic-blar']),
    house('house-airgid', 'Haus Airgid'),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', HOUSE_EMBLEMS.ghaiscioch),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', HOUSE_EMBLEMS.ceardaiocht),
    house('house-frisealach', 'Haus Frisealach'),
    house('house-airt', 'Clan Mac Airt', HOUSE_EMBLEMS.airt),
    house('house-trodach', 'Ard Trodach', TIR_NA_GORTANNA_HOUSE_EMBLEMS['ard-trodach']),
    house('house-ruitheach', 'Haus Ruitheach'),
    house('house-na-mhuir', 'Clan Na’Mhuir', HOUSE_EMBLEMS.mhuir)
  ],
  persons: [
    person('donnchadh-cumhail', 'Donnchadh Cumhail', 'male', '????', '????', 'house-cumhail', {
      familyRole: 'core',
      notes: 'Donnchadh begründete den Kadettenclan Ua’Gaelach. Sein vorhandenes Cumhaill-Porträt wird in dieser Akte gemäß der Ua’Gaelach-Porträtvorgabe nicht übernommen.'
    }),
    spouse('keelaith-duibhne', 'Keelaith Duibhne', 'female', '????', '????', 'house-duibhne'),

    person('dubhshlaine-gealach', 'Dubhshláine Gealach', 'male', '1606', '1666'),
    awayWoman('fainche-gealach', 'Fainche Gealach', '1608', '1679', 'laoch'),
    person('uarnan-gealach', 'Uarnán Gealach', 'male', '1610', '1681'),
    spouse('macha-tarvo', 'Mácha Tarvo', 'female', '1609', '1671', 'house-tarvo'),
    spouse('naran-laoch', 'Nárán Laoch', 'male', '1607', '1697', 'house-laoch'),
    spouse('eamhfhlaith-duibhne', 'Eamhfhlaith Duibhne', 'female', '1612', '1694', 'house-duibhne'),

    person('samthann-gealach', 'Samthann Gealach', 'male', '1627', '1698'),
    awayWoman('beileach-gealach', 'Béileach Gealach', '1629', '1700', 'gallchobhair'),
    awayWoman('sitheach-gealach', 'Sítheach Gealach', '1630', '1704', 'eirce'),
    person('aibhistin-gealach', 'Aibhistín Gealach', 'male', '1633', '1709'),
    spouse('cnamhfhionn-cruthin', 'Cnámhfhionn Cruthin', 'female', '1632', '1679', 'house-cruthin'),
    spouse('cathalan-gallchobhair', 'Cáthalán Gallchobhair', 'male', '1626', '1698', 'house-gallchobhair', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('eigneachan-eirce', 'Eigneachán Eirce', 'male', '1630', '1694', 'house-eirce'),
    spouse('greineach-cleir', 'Gréineach Cleir', 'female', '1628', '1705', 'house-cleir'),

    person('fodhlaidh-gealach', 'Fódhlaidh Gealach', 'male', '1650', '1731'),
    person('gormgal-gealach', 'Gormgal Gealach', 'male', '1653', '1720'),
    awayWoman('deaghlaith-gealach', 'Déaghlaith Gealach', '1652', '1725', 'airgid'),
    person('doirend-gealach', 'Doirend Gealach', 'male', '1655', '1730'),
    spouse('eire-cuinn', 'Eire Cuinn', 'female', '1651', '1689', 'house-cuinn', {
      extensions: { registryManagedFields: ['death'] }
    }),
    spouse('torlaith-blar', 'Tórlaith Blár', 'female', '1652', '1738', 'house-nic-blar'),
    spouse('meallchu-airgid', 'Meallchú Airgid', 'male', '1650', '1728', 'house-airgid'),
    spouse('loinigh-1657', 'Lóinigh', 'female', '1657', '1700'),

    person('ciaran-gealach', 'Ciaran Gealach', 'male', '1669', ''),
    awayWoman('liodhnait-gealach', 'Líodhnait Gealach', '1672', '', 'ghaiscioch'),
    person('geallan-gealach', 'Geallán Gealach', 'male', '1675', ''),
    person('erlach-gealach', 'Érlach Gealach', 'male', '1676', ''),
    awayWoman('slainefhlaith-gealach', 'Slainefhlaith Gealach', '1677', '', 'frisealach'),
    spouse('eithne-cumhail', 'Eithne Cumhail', 'female', '1671', '', 'house-cumhail'),
    spouse('cleirchin-ghaiscioch', 'Cléirchín Ghaiscíoch', 'male', '1670', '1733', 'house-ghaiscioch'),
    spouse('shila-gallchobhair', 'Shila Gallchobhair', 'female', '1676', '', 'house-gallchobhair', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('blathli-ceardaiocht', 'Bláthlí Ceardaíocht', 'female', '1678', '', 'house-dal-ceardaiocht'),
    spouse('giollanaimhe-frisealach', 'Giollanáimhe Frisealach', 'male', '1672', '', 'house-frisealach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('laitheal-gealach', 'Laithéal Gealach', 'male', '1690', ''),
    awayWoman('dearbhla-gealach', 'Dearbhla Gealach', '1694', '', 'airt'),
    person('finnbarr-gealach', 'Finnbarr Gealach', 'male', '1698', ''),
    person('breccan-gealach', 'Breccán Gealach', 'male', '1695', ''),
    awayWoman('aoibhrigh-gealach', 'Aoibhrígh Gealach', '1700', '', 'ruitheach'),
    person('bercan-gealach', 'Bercán Gealach', 'male', '1698', ''),
    person('saorghlas-gealach', 'Saorghlas Gealach', 'male', '1700', ''),
    person('lachtnaid-gealach', 'Lachtnaid Gealach', 'female', '1703', ''),
    spouse('flannait-laoch', 'Flannait Laoch', 'female', '1695', '', 'house-laoch'),
    spouse('reamonn-airt', 'Reamonn Airt', 'male', '1688', '1720', 'house-airt'),
    spouse('maoltuile-eirce', 'Maoltuile Eirce', 'female', '1700', '', 'house-eirce'),
    spouse('uasalan-tordach', 'Úasalán Trodach', 'male', '1699', '', 'house-trodach', {
      extensions: { registryManagedFields: ['name', 'sex', 'portrait', 'houseId'] }
    }),
    spouse('troscan-ruitheach', 'Troscán Ruitheach', 'male', '1696', '', 'house-ruitheach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('uallach-fiachrach', 'Uallach Fiachrach', 'female', '1701', '', 'house-fiachrach'),
    spouse('tuaman-mhuir', 'Tuamán Mhuir', 'male', '1697', '', 'house-na-mhuir', {
      extensions: { registryManagedFields: ['sex', 'portrait'] }
    }),

    person('dubhaltach-gealach', 'Dubhaltach Gealach', 'male', '1718', ''),
    person('riaghnait-gealach', 'Ríaghnait Gealach', 'female', '1723', ''),
    person('raithin-gealach', 'Ráithín Gealach', 'female', '1726', ''),
    person('dubhshlaine-1722-gealach', 'Dubhshláine Gealach', 'male', '1722', ''),
    person('loinigh-1725-gealach', 'Lóinigh Gealach', 'female', '1725', ''),
    person('eaghran-gealach', 'Eaghran Gealach', 'male', '1723', ''),
    person('ceadghlas-gealach', 'Céadghlas Gealach', 'male', '1726', ''),
    person('cennetig-gealach', 'Cennétig Gealach', 'male', '1724', ''),
    person('fodhlaith-gealach', 'Fodhlaith Gealach', 'female', '1727', '')
  ],
  partnerships: [
    createMarriage('marriage-donnchadh-keelaith', ...DONNCHADH_IDS),
    createMarriage('marriage-dubhshlaine-macha', ...DUBHSHLAINE_IDS),
    createMarriage('marriage-naran-fainche', ...FAINCHE_IDS),
    createMarriage('marriage-uarnan-eamhfhlaith', ...UARNAN_IDS),
    createMarriage('marriage-samthann-cnamhfhionn', ...SAMTHANN_IDS),
    createMarriage('marriage-beileach-cathalan', ...BEILEACH_IDS),
    createMarriage('marriage-eigneachan-sitheach', ...SITHEACH_IDS),
    createMarriage('marriage-aibhistin-greineach', ...AIBHISTIN_IDS),
    createMarriage('marriage-fodhlaidh-eire', ...FODHLAIDH_IDS),
    createMarriage('marriage-gormgal-torlaith', ...GORMGAL_IDS),
    createMarriage('marriage-deaghlaith-meallchu', ...DEAGHLAITH_IDS),
    createMarriage('marriage-doirend-loinigh', ...DOIREND_IDS),
    createMarriage('marriage-eithne-ciaran', ...CIARAN_IDS),
    createMarriage('marriage-liodhnait-cleirchin', ...LIODHNAIT_IDS),
    createMarriage('marriage-geallan-shila', ...GEALLAN_IDS),
    createMarriage('marriage-erlach-blathli', ...ERLACH_IDS),
    createMarriage('marriage-slainefhlaith-giollanaimhe', ...SLAINEFHLAITH_IDS),
    createMarriage('marriage-flannait-laitheal', ...LAITHEAL_IDS),
    createMarriage('marriage-dearbhla-reamonn', ...DEARBHLA_IDS, {
      status: 'ended',
      end: '1720'
    }),
    createMarriage('marriage-maoltuile-finnbarr', ...FINNBARR_IDS),
    createMarriage('marriage-breccan-uasalan', ...BRECCAN_IDS),
    createMarriage('marriage-aoibhrigh-troscan', ...AOIBHRIGH_IDS),
    createMarriage('marriage-uallach-bercan', ...BERCAN_IDS),
    createMarriage('marriage-saorghlas-tuaman', ...SAORGHLAS_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['dubhshlaine-gealach', 'fainche-gealach', 'uarnan-gealach'],
      DONNCHADH_IDS,
      'marriage-donnchadh-keelaith',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und der ab 1606 datierten Ua’Gaelach-Linie.',
        extensions: { timeJumpId: 'gap-donnchadh-dubhshlaine' }
      }
    ),
    ...childrenOf(['samthann-gealach', 'beileach-gealach'], DUBHSHLAINE_IDS, 'marriage-dubhshlaine-macha'),
    ...childrenOf(['sitheach-gealach', 'aibhistin-gealach'], UARNAN_IDS, 'marriage-uarnan-eamhfhlaith'),
    ...childrenOf(['fodhlaidh-gealach', 'gormgal-gealach'], SAMTHANN_IDS, 'marriage-samthann-cnamhfhionn'),
    ...childrenOf(['deaghlaith-gealach', 'doirend-gealach'], AIBHISTIN_IDS, 'marriage-aibhistin-greineach'),
    ...childrenOf(['ciaran-gealach', 'liodhnait-gealach', 'geallan-gealach'], FODHLAIDH_IDS, 'marriage-fodhlaidh-eire'),
    ...childrenOf(['erlach-gealach', 'slainefhlaith-gealach'], DOIREND_IDS, 'marriage-doirend-loinigh'),
    ...childrenOf(['laitheal-gealach', 'dearbhla-gealach', 'finnbarr-gealach'], CIARAN_IDS, 'marriage-eithne-ciaran'),
    ...childrenOf(['breccan-gealach', 'aoibhrigh-gealach'], GEALLAN_IDS, 'marriage-geallan-shila'),
    ...childrenOf(['bercan-gealach', 'saorghlas-gealach', 'lachtnaid-gealach'], ERLACH_IDS, 'marriage-erlach-blathli'),
    ...childrenOf(['dubhaltach-gealach', 'riaghnait-gealach', 'raithin-gealach'], LAITHEAL_IDS, 'marriage-flannait-laitheal'),
    ...childrenOf(['dubhshlaine-1722-gealach', 'loinigh-1725-gealach'], FINNBARR_IDS, 'marriage-maoltuile-finnbarr'),
    ...childrenOf(['eaghran-gealach', 'ceadghlas-gealach'], BRECCAN_IDS, 'marriage-breccan-uasalan'),
    ...childrenOf(['cennetig-gealach', 'fodhlaith-gealach'], BERCAN_IDS, 'marriage-uallach-bercan')
  ],
  cadetBranches: [
    marriedAway('married-away-laoch-fainche', 'marriage-naran-fainche', 'laoch'),
    marriedAway('married-away-gallchobhair-beileach', 'marriage-beileach-cathalan', 'gallchobhair'),
    marriedAway('married-away-eirce-sitheach', 'marriage-eigneachan-sitheach', 'eirce'),
    marriedAway('married-away-airgid-deaghlaith', 'marriage-deaghlaith-meallchu', 'airgid'),
    marriedAway('married-away-ghaiscioch-liodhnait', 'marriage-liodhnait-cleirchin', 'ghaiscioch'),
    marriedAway('married-away-frisealach-slainefhlaith', 'marriage-slainefhlaith-giollanaimhe', 'frisealach'),
    marriedAway('married-away-airt-dearbhla', 'marriage-dearbhla-reamonn', 'airt'),
    marriedAway('married-away-ruitheach-aoibhrigh', 'marriage-aoibhrigh-troscan', 'ruitheach')
  ],
  timeJumps: [
    {
      id: 'gap-donnchadh-dubhshlaine',
      parentPartnershipId: 'marriage-donnchadh-keelaith',
      childIds: ['dubhshlaine-gealach', 'fainche-gealach', 'uarnan-gealach'],
      years: 0,
      fromYear: '????',
      toYear: '1606',
      label: 'Nicht einzeln überlieferte Generationen bis zur ab 1606 datierten Linie',
      notes: 'Die Quellhierarchie setzt zwischen Gründerpaar und späterer Hauptlinie eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-donnchadh-keelaith',
    houseId: GAELACH_HOUSE_ID,
    crestSubtitle: 'Mor Tiarnatum Tir na Sinsear · Nossail · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'donnchadh-cumhail',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Ua’Gaelach (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter und die große Überlieferungslücke folgen der bereitgestellten Ua’Gaelach-Hausseite. Die veralteten Porträts dieser Vorlage wurden vollständig ignoriert. Eigene Ua’Gaelach-Mitglieder und Donnchadh als Clanbegründer verwenden bis zur Erstellung neuer Bilder den automatischen Platzhalter; ausschließlich bereits kanonisch vorhandene Porträts angeheirateter Personen werden wiederverwendet. Die ausgearbeitete Ard-Trodach-Gegenakte präzisiert Úasaláns Hausnamen, weist ihn als Mann aus und liefert sein kanonisches Porträt. Tuamán wird anhand seines individuellen Na’Mhuir-Porträts ebenfalls als Mann geführt. Acht Ua’Gaelach-Frauen ohne im Clan fortgeführte Nachkommen besitzen direkte Wegverheiratet-Knoten. Die Kinder Fainches und Náráns verbleiben ausschließlich in der Ruin-Ua-Laoch-Akte. Die fünf völlig anonymen Verlobtenkarten der jüngsten Generation wurden mangels Identität und Zuordnung nicht als Personen erfunden.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 10,
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    albicRank: 'mor-tiarna',
    portraitPolicy: Object.freeze({
      pastedPortraitsIgnored: true,
      ownClanMembersUsePlaceholders: true,
      reusedMarriedInPersonIds: Object.freeze(Object.keys(HOUSE_UA_GAELACH_PORTRAITS))
    }),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: ['sourceNote', 'portraitPolicy'],
    registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
