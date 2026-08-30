import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import {
  HOUSE_FIR_AN_GALLCHOBHAIR_LOCAL_PORTRAIT_IDS,
  HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS,
  HOUSE_FIR_AN_GALLCHOBHAIR_REUSED_PORTRAIT_IDS
} from './house-fir-an-gallchobhair-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS
} from './sonnenkueste-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const GALLCHOBHAIR_HOUSE_ID = 'house-gallchobhair';
const GALLCHOBHAIR_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair;

const HOUSE_EMBLEMS = Object.freeze({
  ceardaiocht: TIR_NA_SINSEAR_HOUSE_EMBLEMS['dal-ceardaiocht'],
  cleir: TIR_NA_SINSEAR_HOUSE_EMBLEMS.cleir,
  cruthin: LEITHEACH_HOUSE_EMBLEMS['dal-cruthin'],
  cumhail: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'],
  gaelach: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'],
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  ghaiscioch: TIR_NA_SINSEAR_HOUSE_EMBLEMS.ghaiscioch,
  grianlaoch: SONNENKUESTE_HOUSE_EMBLEMS.grianlaoch,
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  mhuir: TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  illewod: Object.freeze({
    name: 'Haus Illewod',
    houseId: 'house-illewod',
    targetFamilyId: 'haus-illewod',
    emblem: HOUSE_EMBLEMS.illewod
  }),
  cleir: Object.freeze({
    name: 'Clan Ua’Cleir',
    houseId: 'house-cleir',
    targetFamilyId: 'haus-cleir',
    emblem: HOUSE_EMBLEMS.cleir
  }),
  ghaiscioch: Object.freeze({
    name: 'Clan Ua’Ghaiscíoch',
    houseId: 'house-ghaiscioch',
    targetFamilyId: 'haus-ghaiscioch',
    emblem: HOUSE_EMBLEMS.ghaiscioch
  }),
  gafyr: Object.freeze({
    name: 'Haus Gafyr',
    houseId: 'house-gafyr',
    targetFamilyId: 'haus-gafyr',
    emblem: HOUSE_EMBLEMS.gafyr
  }),
  ceardaiocht: Object.freeze({
    name: 'Clan Dál’Ceardaíocht',
    houseId: 'house-dal-ceardaiocht',
    targetFamilyId: 'haus-dal-ceardaiocht',
    emblem: HOUSE_EMBLEMS.ceardaiocht
  }),
  mhuir: Object.freeze({
    name: 'Clan Na’Mhuir',
    houseId: 'house-na-mhuir',
    targetFamilyId: 'haus-na-mhuir',
    emblem: HOUSE_EMBLEMS.mhuir
  }),
  gaelach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gaelach
  }),
  cruthin: Object.freeze({
    name: 'Clan Dál’Cruthin',
    houseId: 'house-cruthin',
    targetFamilyId: 'haus-dal-cruthin',
    emblem: HOUSE_EMBLEMS.cruthin
  }),
  cumhail: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: HOUSE_EMBLEMS.cumhail
  })
});

const FOUNDED_HOUSE_TARGETS = Object.freeze({
  cleir: MARRIED_AWAY_TARGETS.cleir,
  ghaiscioch: MARRIED_AWAY_TARGETS.ghaiscioch,
  ceardaiocht: MARRIED_AWAY_TARGETS.ceardaiocht
});

const HOUSE_HEAD_IDS = new Set([
  'utgar-gallchobhair',
  'conall-gallchobhair',
  'diarmuid-gallchobhair',
  'gorn-gallchobhair',
  'meallan-gallchobhair',
  'cathalan-gallchobhair',
  'eoghair-gallchobhair',
  'faolan-gallchobhair'
]);

const SUCCESSION_IDS = new Set(['murchad-gallchobhair', 'ronan-gallchobhair']);

const HEAD_TITLES = Object.freeze({
  'utgar-gallchobhair': 'Gründer · erster Dún Tiarna von Dun Laog',
  'conall-gallchobhair': 'Ehemaliger Dún Tiarna von Dun Laog',
  'diarmuid-gallchobhair': 'Dún Tiarna von Dun Laog · bis 1200',
  'gorn-gallchobhair': 'Dún Tiarna von Dun Laog · bis 1643',
  'meallan-gallchobhair': 'Dún Tiarna von Dun Laog · 1643–1670',
  'cathalan-gallchobhair': 'Dún Tiarna von Dun Laog · 1670–1698',
  'eoghair-gallchobhair': 'Dún Tiarna von Dun Laog · 1698–1724',
  'faolan-gallchobhair': 'Dún Tiarna von Dun Laog · seit 1724'
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GALLCHOBHAIR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    familyRole: options.familyRole || (houseId === GALLCHOBHAIR_HOUSE_ID ? 'core' : 'married'),
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
  return person(id, name, 'female', birth, death, GALLCHOBHAIR_HOUSE_ID, {
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

function foundedLairdHouse(id, parentPersonId, targetKey) {
  const target = FOUNDED_HOUSE_TARGETS[targetKey];
  return createSingleFounderHouseBranch({
    id,
    name: target.name,
    parentPersonId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    crestFrame: 'silver',
    subtitle: `Begründeter Laird-Clan ${target.name}`,
    notes: `${target.name} geht laut Nutzerangabe unmittelbar auf diese einzelne Gallchobhair-Person zurück.`,
    extensions: {
      registryManagedFields: [
        'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem',
        'crestFrame', 'subtitle', 'notes'
      ]
    }
  });
}

const UTGAR_IDS = ['utgar-gallchobhair', 'niamhann-gallchobhair'];
const CONALL_IDS = ['conall-gallchobhair', 'imogen-suileach'];
const TAERLACH_IDS = ['taerlach-gallchobhair', 'keelaith-ancient'];
const LIADAN_IDS = ['berwyn-illewod', 'liadan-gallchobhair'];
const DIARMUID_IDS = ['diarmuid-gallchobhair', 'laoise-laga'];
const GILLEON_IDS = ['gilleon-gallchobhair', 'aisling-ancient'];
const GORN_IDS = ['myfanwy-dyngwn', 'gorn-gallchobhair'];
const AONGHUS_PARENT_IDS = ['gorn-gallchobhair', 'aoife-ancient'];
const RORIK_IDS = ['rorik-gallchobhair', 'polain-nessa'];
const MEALLAN_IDS = ['meallan-gallchobhair', 'grainne-durthacht'];
const AONGHUS_IDS = ['aonghus-gallchobhair', 'etain-ancient'];
const AONGHUS_PAIR_PLACEMENT = Object.freeze({
  side: 'before',
  orderedPersonIds: Object.freeze(['etain-ancient', 'aonghus-gallchobhair']),
  gapSlots: 1
});
const HIARNAN_IDS = ['hiarnan-gallchobhair', 'hoibre-craobhan'];
const CATHALAN_IDS = ['beileach-gealach', 'cathalan-gallchobhair'];
const UNAITH_IDS = ['unaith-gallchobhair', 'feidlimid-cleir'];
const JOTHRAN_IDS = ['niorla-laoch', 'jothran-gallchobhair'];
const ODHLANNA_IDS = ['odhlanna-gallchobhair', 'iosogan-ghaiscioch'];
const SIOBHAN_IDS = ['gerwyn-gafyr', 'siobhan-gallchobhair'];
const EOGHAIR_IDS = ['eoghair-gallchobhair', 'aithne-cuinn'];
const UATHACH_IDS = ['uathach-gallchobhair', 'lugaid-ceardaiocht'];
const MALLAIDH_IDS = ['mallaidh-gallchobhair', 'lochlainn-mhuir'];
const FAOLAN_IDS = ['faolan-gallchobhair', 'meridia-chulainn'];
const SHILA_IDS = ['geallan-gealach', 'shila-gallchobhair'];
const SLOANE_IDS = ['sloane-gallchobhair', 'clodagh-cleir'];
const KEELAITH_IDS = ['keelaith-gallchobhair', 'caoimhin-cruthin'];
const NOLAN_IDS = ['nolan-gallchobhair', 'joclynn-tarvo'];
const MURCHAD_IDS = ['murchad-gallchobhair', 'maeve-airt'];
const ALANA_IDS = ['merwin-illewod', 'alana-gallchobhair'];
const ORREN_IDS = ['orren-gallchobhair', 'tearnait-ghaiscioch'];
const TYNAN_IDS = ['anali-illewod', 'tynan-gallchobhair'];
const IARLAITH_IDS = ['odran-cumhail', 'iarlaith-gallchobhair'];
const HOLMAN_IDS = ['holman-gallchobhair', 'oonagh-mhuir'];
const AIDEEN_IDS = ['aideen-gallchobhair', 'rogan-ceardaiocht'];

export const HOUSE_FIR_AN_GALLCHOBHAIR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gallchobhair',
    title: 'Fir An’Gallchobhair',
    motto: '',
    description: 'Der Dún-Tiarna-Clan von Dun Laog in Tir na Sinsear, mit den aus seiner Linie hervorgegangenen Laird-Clans Ua’Cleir, Ua’Ghaiscíoch und Dál’Ceardaíocht.',
    emblem: GALLCHOBHAIR_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES.gallchobhair
  },
  houses: [
    house(GALLCHOBHAIR_HOUSE_ID, 'Fir An’Gallchobhair', GALLCHOBHAIR_EMBLEM),
    house('house-suileach', 'Haus Suileach'),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-laga', 'Haus Laga'),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-nessa', 'Haus Nessa'),
    house('house-durthacht', 'Haus Durthacht'),
    house('house-craobhan', 'Haus Craobhan'),
    house('house-gealach', 'Clan Ua’Gaelach', HOUSE_EMBLEMS.gaelach),
    house('house-cleir', 'Clan Ua’Cleir', HOUSE_EMBLEMS.cleir),
    house('house-laoch', 'Ruin Ua Laoch'),
    house('house-ghaiscioch', 'Clan Ua’Ghaiscíoch', HOUSE_EMBLEMS.ghaiscioch),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-cuinn', 'Clan Tir An’Cuinn'),
    house('house-dal-ceardaiocht', 'Clan Dál’Ceardaíocht', HOUSE_EMBLEMS.ceardaiocht),
    house('house-na-mhuir', 'Clan Na’Mhuir', HOUSE_EMBLEMS.mhuir),
    house('house-chulainn', 'Haus Chulainn'),
    house('house-cruthin', 'Clan Dál’Cruthin', HOUSE_EMBLEMS.cruthin),
    house('house-tarvo', 'Clan Fir An’Tarvo'),
    house('house-airt', 'Clan Mac Airt'),
    house('house-grianlaoch', 'Haus Grianlaoch', HOUSE_EMBLEMS.grianlaoch),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', HOUSE_EMBLEMS.cumhail)
  ],
  persons: [
    person('utgar-gallchobhair', 'Utgar Gallchobhair', 'male', '????', '????'),
    spouse('niamhann-gallchobhair', 'Níamhann', 'female', '????', '????'),

    person('conall-gallchobhair', 'Conall Gallchobhair', 'male', '????', '????'),
    spouse('imogen-suileach', 'Imogen Suileach', 'female', '????', '????', 'house-suileach'),
    person('taerlach-gallchobhair', 'Taerlach Gallchobhair', 'male', '????', '????'),
    spouse('keelaith-ancient', 'Keelaith', 'female', '????', '????'),

    awayWoman('liadan-gallchobhair', 'Liadan Gallchobhair', '1120', '1206', 'illewod'),
    spouse('berwyn-illewod', 'Berwyn Illewod', 'male', '1117', '1181', 'house-illewod'),
    person('diarmuid-gallchobhair', 'Diarmuid Gallchobhair', 'male', '1123', '1200'),
    spouse('laoise-laga', 'Laoise Laga', 'female', '1125', '1198', 'house-laga'),
    person('gilleon-gallchobhair', 'Gilleón Gallchobhair', 'male', '1170', '1207'),
    spouse('aisling-ancient', 'Aisling', 'female', '1130', '1229'),

    person('gorn-gallchobhair', 'Gorn Gallchobhair', 'male', '1568', '1643'),
    spouse('myfanwy-dyngwn', 'Myfanwy Dyngwn', 'female', '1571', '1639', 'house-dyngwn'),
    spouse('aoife-ancient', 'Aoife', 'female', '1592', '1645', '', { familyRole: 'affair' }),
    person('rorik-gallchobhair', 'Rorik Gallchobhair', 'male', '1582', '1650'),
    spouse('polain-nessa', 'Pólain Nessa', 'female', '1584', '1666', 'house-nessa'),

    person('meallan-gallchobhair', 'Meallán Gallchobhair', 'male', '1600', '1670'),
    spouse('grainne-durthacht', 'Gráinne Durthacht', 'female', '1604', '1679', 'house-durthacht'),
    person('aonghus-gallchobhair', 'Aonghus Gallchobhair', 'male', '1635', '1672', GALLCHOBHAIR_HOUSE_ID, {
      tags: ['Unehelich'],
      notes: 'Sohn Gorns und Aoifes aus einer Affäre; Begründer des Laird-Clans Dál’Ceardaíocht.'
    }),
    spouse('etain-ancient', 'Ètáin', 'female', '1622', '1695'),
    person('hiarnan-gallchobhair', 'Hiarnán Gallchobhair', 'male', '1604', '1671'),
    spouse('hoibre-craobhan', 'Hoibre Craobhan', 'female', '1608', '1669', 'house-craobhan'),

    person('cathalan-gallchobhair', 'Cáthalán Gallchobhair', 'male', '1626', '1698'),
    spouse('beileach-gealach', 'Béileach Gealach', 'female', '1629', '1700', 'house-gealach'),
    awayWoman('unaith-gallchobhair', 'Únaith Gallchobhair', '1630', '1700', 'cleir'),
    spouse('feidlimid-cleir', 'Feidlimid Cleir', 'male', '1628', '1689', 'house-cleir'),
    person('jothran-gallchobhair', 'Jothrán Gallchobhair', 'male', '1626', '1684'),
    spouse('niorla-laoch', 'Níórla Laoch', 'female', '1632', '1693', 'house-laoch'),
    awayWoman('odhlanna-gallchobhair', 'Odhlanna Gallchobhair', '1628', '1703', 'ghaiscioch'),
    spouse('iosogan-ghaiscioch', 'Íosógán Ghaiscíoch', 'male', '1626', '1698', 'house-ghaiscioch'),

    awayWoman('siobhan-gallchobhair', 'Siobhan Gallchobhair', '1648', '1711', 'gafyr'),
    spouse('gerwyn-gafyr', 'Gerwyn Gafyr', 'male', '1644', '1708', 'house-gafyr'),
    person('eoghair-gallchobhair', 'Eoghair Gallchobhair', 'male', '1646', '1724'),
    spouse('aithne-cuinn', 'Aithne Cuinn', 'female', '1646', '1727', 'house-cuinn', {
      extensions: { registryManagedFields: ['death'] }
    }),
    awayWoman('uathach-gallchobhair', 'Uathach Gallchobhair', '1652', '1711', 'ceardaiocht'),
    spouse('lugaid-ceardaiocht', 'Lugaid Ceardaíocht', 'male', '1650', '1720', 'house-dal-ceardaiocht'),
    awayWoman('mallaidh-gallchobhair', 'Mallaidh Gallchobhair', '1654', '1720', 'mhuir'),
    spouse('lochlainn-mhuir', 'Lochlainn Mhuir', 'male', '1650', '1720', 'house-na-mhuir'),

    person('faolan-gallchobhair', 'Faolan Gallchobhair', 'male', '1664', ''),
    spouse('meridia-chulainn', 'Meridia Chulainn', 'female', '1670', '', 'house-chulainn'),
    awayWoman('shila-gallchobhair', 'Shila Gallchobhair', '1676', '', 'gaelach'),
    spouse('geallan-gealach', 'Geallán Gealach', 'male', '1675', '', 'house-gealach'),
    person('sloane-gallchobhair', 'Sloane Gallchobhair', 'male', '1670', ''),
    spouse('clodagh-cleir', 'Clodagh Cleir', 'female', '1674', '', 'house-cleir'),
    awayWoman('keelaith-gallchobhair', 'Keelaith Gallchobhair', '1674', '', 'cruthin'),
    spouse('caoimhin-cruthin', 'Caoimhín Cruthin', 'male', '1670', '', 'house-cruthin'),
    person('nolan-gallchobhair', 'Nolan Gallchobhair', 'male', '1678', '1733'),
    spouse('joclynn-tarvo', 'Joclynn Tarvo', 'female', '1679', '', 'house-tarvo', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    person('murchad-gallchobhair', 'Murchad Gallchobhair', 'male', '1694', ''),
    spouse('maeve-airt', 'Maeve Airt', 'female', '1697', '', 'house-airt'),
    awayWoman('alana-gallchobhair', 'Alana Gallchobhair', '1697', '', 'illewod'),
    spouse('merwin-illewod', 'Merwin Illewod', 'male', '1694', '', 'house-illewod'),
    person('orren-gallchobhair', 'Orren Gallchobhair', 'male', '1703', '1733'),
    spouse('tearnait-ghaiscioch', 'Tearnait Ghaiscíoch', 'female', '1704', '', 'house-ghaiscioch'),
    person('tynan-gallchobhair', 'Tynan Gallchobhair', 'male', '1696', '', 'house-grianlaoch', {
      worldPersonId: 'person:haus-gallchobhair:tynan-gallchobhair',
      familyRole: 'core',
      title: 'Begründer des Hauses Grianlaoch an der Sonnenküste',
      tags: ['Hausgründer', 'Ausgewandert'],
      notes: 'Tynan verließ Dun Laog und begründete mit Anali Illewod in Gallchofaen das neue Haus Grianlaoch unter Haus Illewod.'
    }),
    spouse('anali-illewod', 'Anali Illewod', 'female', '1697', '', 'house-illewod', {
      worldPersonId: 'person:haus-illewod:anali-illewod'
    }),
    awayWoman('iarlaith-gallchobhair', 'Iarlaith Gallchobhair', '1700', '', 'cumhail', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    spouse('odran-cumhail', 'Odrán Cumhail', 'male', '1697', '', 'house-cumhail'),
    person('holman-gallchobhair', 'Hólman Gallchobhair', 'male', '1700', ''),
    spouse('oonagh-mhuir', 'Oonagh Mhuir', 'female', '1702', '', 'house-na-mhuir'),
    awayWoman('aideen-gallchobhair', 'Aideen Gallchobhair', '1703', '1733', 'ceardaiocht'),
    spouse('rogan-ceardaiocht', 'Rógán Ceardaíocht', 'male', '1696', '', 'house-dal-ceardaiocht'),

    person('gormlaith-gallchobhair', 'Gormlaith Gallchobhair', 'female', '1716', ''),
    person('ronan-gallchobhair', 'Rónán Gallchobhair', 'male', '1720', ''),
    person('isibeal-gallchobhair', 'Isibéal Gallchobhair', 'female', '1723', ''),
    person('harailt-gallchobhair', 'Harailt Gallchobhair', 'male', '1725', ''),
    person('ivarr-gallchobhair', 'Ivarr Gallchobhair', 'male', '1724', ''),
    person('flanna-gallchobhair', 'Flanna Gallchobhair', 'female', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-utgar-niamhann', ...UTGAR_IDS),
    createMarriage('marriage-conall-imogen', ...CONALL_IDS),
    createMarriage('marriage-taerlach-keelaith', ...TAERLACH_IDS),
    createMarriage('marriage-berwyn-liadan', ...LIADAN_IDS),
    createMarriage('marriage-diarmuid-laoise', ...DIARMUID_IDS),
    createMarriage('marriage-gilleon-aisling', ...GILLEON_IDS),
    createMarriage('marriage-myfanwy-gorn-dyngwn', ...GORN_IDS),
    createMarriage('affair-gorn-aoife', ...AONGHUS_PARENT_IDS, { type: 'affair', status: 'ended' }),
    createMarriage('marriage-rorik-polain', ...RORIK_IDS),
    createMarriage('marriage-meallan-grainne', ...MEALLAN_IDS),
    createMarriage('marriage-aonghus-etain', ...AONGHUS_IDS, {
      extensions: {
        chartPlacePairAtGenerationEdge: AONGHUS_PAIR_PLACEMENT,
        registryManagedExtensionFields: ['chartPlacePairAtGenerationEdge']
      }
    }),
    createMarriage('marriage-hiarnan-hoibre', ...HIARNAN_IDS),
    createMarriage('marriage-beileach-cathalan', ...CATHALAN_IDS),
    createMarriage('marriage-unaith-feidlimid', ...UNAITH_IDS),
    createMarriage('marriage-niorla-jothran', ...JOTHRAN_IDS),
    createMarriage('marriage-odhlanna-iosogan', ...ODHLANNA_IDS),
    createMarriage('marriage-gerwyn-siobhan', ...SIOBHAN_IDS),
    createMarriage('marriage-eoghair-aithne', ...EOGHAIR_IDS),
    createMarriage('marriage-uathach-lugaid', ...UATHACH_IDS),
    createMarriage('marriage-mallaidh-lochlainn', ...MALLAIDH_IDS),
    createMarriage('marriage-faolan-meridia', ...FAOLAN_IDS),
    createMarriage('marriage-geallan-shila', ...SHILA_IDS),
    createMarriage('marriage-sloane-clodagh', ...SLOANE_IDS),
    createMarriage('marriage-keelaith-caoimhin', ...KEELAITH_IDS),
    createMarriage('marriage-nolan-joclynn', ...NOLAN_IDS),
    createMarriage('marriage-murchad-maeve', ...MURCHAD_IDS),
    createMarriage('marriage-merwin-alana', ...ALANA_IDS),
    createMarriage('marriage-orren-tearnait', ...ORREN_IDS),
    createMarriage('marriage-anali-tynan', ...TYNAN_IDS),
    createMarriage('marriage-odran-iarlaith', ...IARLAITH_IDS),
    createMarriage('marriage-holman-oonagh', ...HOLMAN_IDS),
    createMarriage('marriage-aideen-rogan', ...AIDEEN_IDS)
  ],
  parentages: [
    ...childrenOf(['conall-gallchobhair', 'taerlach-gallchobhair'], UTGAR_IDS, 'marriage-utgar-niamhann', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: 'gap-utgar-conall' }
    }),
    ...childrenOf(
      ['liadan-gallchobhair', 'diarmuid-gallchobhair', 'gilleon-gallchobhair'],
      CONALL_IDS,
      'marriage-conall-imogen',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Punktreihe der Quelle markiert nicht einzeln überlieferte Generationen.',
        extensions: { timeJumpId: 'gap-conall-liadan' }
      }
    ),
    ...childrenOf(['gorn-gallchobhair', 'rorik-gallchobhair'], DIARMUID_IDS, 'marriage-diarmuid-laoise', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Diarmuids Linie und den ab 1568 datierten Personen fehlen viele Generationen.',
      extensions: { timeJumpId: 'gap-diarmuid-gorn' }
    }),
    ...childrenOf(['meallan-gallchobhair'], GORN_IDS, 'marriage-myfanwy-gorn-dyngwn'),
    ...childrenOf(['aonghus-gallchobhair'], AONGHUS_PARENT_IDS, 'affair-gorn-aoife', {
      legitimacy: 'illegitimate',
      notes: 'Aonghus stammt aus Gorns Affäre mit Aoife.'
    }),
    ...childrenOf(['hiarnan-gallchobhair'], RORIK_IDS, 'marriage-rorik-polain'),
    ...childrenOf(['cathalan-gallchobhair', 'unaith-gallchobhair'], MEALLAN_IDS, 'marriage-meallan-grainne'),
    ...childrenOf(['jothran-gallchobhair', 'odhlanna-gallchobhair'], HIARNAN_IDS, 'marriage-hiarnan-hoibre'),
    ...childrenOf(['siobhan-gallchobhair', 'eoghair-gallchobhair'], CATHALAN_IDS, 'marriage-beileach-cathalan'),
    ...childrenOf(['uathach-gallchobhair', 'mallaidh-gallchobhair'], JOTHRAN_IDS, 'marriage-niorla-jothran'),
    ...childrenOf(
      ['faolan-gallchobhair', 'shila-gallchobhair', 'sloane-gallchobhair', 'keelaith-gallchobhair', 'nolan-gallchobhair'],
      EOGHAIR_IDS,
      'marriage-eoghair-aithne'
    ),
    ...childrenOf(['murchad-gallchobhair', 'alana-gallchobhair', 'orren-gallchobhair'], FAOLAN_IDS, 'marriage-faolan-meridia'),
    ...childrenOf(['tynan-gallchobhair', 'iarlaith-gallchobhair'], SLOANE_IDS, 'marriage-sloane-clodagh'),
    ...childrenOf(['holman-gallchobhair', 'aideen-gallchobhair'], NOLAN_IDS, 'marriage-nolan-joclynn'),
    ...childrenOf(['gormlaith-gallchobhair', 'ronan-gallchobhair'], MURCHAD_IDS, 'marriage-murchad-maeve'),
    ...childrenOf(['isibeal-gallchobhair', 'harailt-gallchobhair'], ORREN_IDS, 'marriage-orren-tearnait'),
    ...childrenOf(['ivarr-gallchobhair', 'flanna-gallchobhair'], HOLMAN_IDS, 'marriage-holman-oonagh')
  ],
  cadetBranches: [
    foundedLairdHouse('cadet-ua-ghaiscioch-taerlach', 'taerlach-gallchobhair', 'ghaiscioch'),
    foundedLairdHouse('cadet-ua-cleir-gilleon', 'gilleon-gallchobhair', 'cleir'),
    foundedLairdHouse('cadet-dal-ceardaiocht-aonghus', 'aonghus-gallchobhair', 'ceardaiocht'),
    marriedAway('married-away-illewod-liadan', 'marriage-berwyn-liadan', 'illewod'),
    marriedAway('married-away-cleir-unaith', 'marriage-unaith-feidlimid', 'cleir'),
    marriedAway('married-away-ghaiscioch-odhlanna', 'marriage-odhlanna-iosogan', 'ghaiscioch'),
    marriedAway('married-away-gafyr-siobhan', 'marriage-gerwyn-siobhan', 'gafyr'),
    marriedAway('married-away-ceardaiocht-uathach', 'marriage-uathach-lugaid', 'ceardaiocht'),
    marriedAway('married-away-mhuir-mallaidh', 'marriage-mallaidh-lochlainn', 'mhuir'),
    marriedAway('married-away-gaelach-shila', 'marriage-geallan-shila', 'gaelach'),
    marriedAway('married-away-cruthin-keelaith', 'marriage-keelaith-caoimhin', 'cruthin'),
    marriedAway('married-away-illewod-alana', 'marriage-merwin-alana', 'illewod'),
    createCadetHouseBranch({
      id: 'cadet-grianlaoch-tynan',
      name: 'Haus Grianlaoch',
      parentPartnershipId: 'marriage-anali-tynan',
      houseId: 'house-grianlaoch',
      targetFamilyId: 'haus-grianlaoch',
      emblem: HOUSE_EMBLEMS.grianlaoch,
      crestFrame: 'silver',
      subtitle: 'Neues Haus an der Sonnenküste · unter Haus Illewod',
      notes: 'Tynans und Analis Nachkommen werden ausschließlich in der Grianlaoch- und Illewod-Akte fortgeführt.',
      extensions: {
        chartAlignBelowPartnership: true,
        registryManagedFields: [
          'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem',
          'crestFrame', 'subtitle', 'notes'
        ],
        registryManagedExtensionFields: ['chartAlignBelowPartnership']
      }
    }),
    marriedAway('married-away-cumhail-iarlaith', 'marriage-odran-iarlaith', 'cumhail'),
    marriedAway('married-away-ceardaiocht-aideen', 'marriage-aideen-rogan', 'ceardaiocht')
  ],
  timeJumps: [
    {
      id: 'gap-utgar-conall',
      parentPartnershipId: 'marriage-utgar-niamhann',
      childIds: ['conall-gallchobhair', 'taerlach-gallchobhair'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Quellhierarchie setzt hier eine ausdrückliche Punktreihe.',
      extensions: {}
    },
    {
      id: 'gap-conall-liadan',
      parentPartnershipId: 'marriage-conall-imogen',
      childIds: ['liadan-gallchobhair', 'diarmuid-gallchobhair', 'gilleon-gallchobhair'],
      years: 0,
      fromYear: '????',
      toYear: '1120',
      label: 'Die datierte Überlieferung setzt 1120 wieder ein',
      notes: 'Die Quellhierarchie setzt hier eine ausdrückliche Punktreihe.',
      extensions: {}
    },
    {
      id: 'gap-diarmuid-gorn',
      parentPartnershipId: 'marriage-diarmuid-laoise',
      childIds: ['gorn-gallchobhair', 'rorik-gallchobhair'],
      years: 368,
      fromYear: '1200',
      toYear: '1568',
      label: '368 Jahre und mehrere nicht einzeln überlieferte Generationen',
      notes: 'Die Quellhierarchie springt von Diarmuids Generation zur ab 1568 datierten Linie.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-utgar-niamhann',
    houseId: GALLCHOBHAIR_HOUSE_ID,
    crestSubtitle: 'Dún Tiarnatum Dun Laog · Tir na Sinsear · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'utgar-gallchobhair',
    orientation: 'vertical',
    ancestorDepth: 25,
    descendantDepth: 25,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Fir An’Gallchobhair (bereitgestellte Altdaten)',
    sourceNote: 'Genealogie, Lebensdaten, Hausoberhäupter, Amtszeiten und Erbfolge folgen der bereitgestellten Gallchobhair-Hausseite und ihrer Stammbaumgrafik. Die Amtszeitentafel wird nicht als Lebensdatentafel missverstanden. Gilleóns Geburtsjahr 1170 und Aonghus’ Geburtsjahr 1635 folgen den ausdrücklichen Nutzerkorrekturen. Die unmöglichen Quellfolgen Laoise 1125–1698 und Nolan 1678–1633 wurden zu 1125–1198 und 1678–1733 normalisiert. Taerlach, Gilleón und Aonghus besitzen personengebundene Gründerknoten zu den drei Gallchobhair unterstehenden Laird-Clans. Elf Gallchobhair-Frauen ohne lokal fortgeführte Nachkommen besitzen direkte Wegverheiratet-Knoten. Tynan und Anali verweisen stattdessen auf das neue Haus Grianlaoch unter Haus Illewod; Dymphna und Deaglan werden nicht dupliziert und bleiben ausschließlich in den Grianlaoch- und Illewod-Akten. Lochlainn und Oonagh verwenden ihre nun vorhandenen kanonischen Na’Mhuir-Porträts; Lochlainns Lebensdaten wurden aus dieser Gegenakte ergänzt. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 6,
    sourceCorrections: Object.freeze([
      'Gilleón Gallchobhair wurde 1170 statt 1125 geboren.',
      'Aonghus Gallchobhair wurde 1635 statt 1610 geboren.',
      'Laoise Lagas unmögliches Todesjahr 1698 wurde als Zahlendreher zu 1198 normalisiert.',
      'Nolan Gallchobhairs unmögliches Todesjahr 1633 wurde als Zahlendreher zu 1733 normalisiert.'
    ]),
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    albicRank: 'dun-tiarna',
    inheritance: {
      title: 'Dún Tiarna von Dun Laog',
      publishedOrder: ['murchad-gallchobhair', 'ronan-gallchobhair'],
      sourceDiscrepancy: 'Die Oberhaupttafel nennt bei Meallán, Cáthalán, Eoghair und Faolan Amtszeiten; die ausführliche Hierarchie enthält deren Lebensdaten.'
    },
    documentedLairdHouses: ['Clan Ua’Cleir', 'Clan Ua’Ghaiscíoch', 'Clan Dál’Ceardaíocht'],
    migratedHouse: Object.freeze({
      founderPersonId: 'tynan-gallchobhair',
      spousePersonId: 'anali-illewod',
      targetFamilyId: 'haus-grianlaoch',
      liegeHouseId: 'haus-illewod',
      excludedDescendantIds: Object.freeze(['dymphna-gallchobhair', 'deaglan-gallchobhair'])
    }),
    portraitPolicy: Object.freeze({
      repeatedSourceSilhouettesUsePlaceholders: true,
      localPersonIds: HOUSE_FIR_AN_GALLCHOBHAIR_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: HOUSE_FIR_AN_GALLCHOBHAIR_REUSED_PORTRAIT_IDS
    }),
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'sourceNote', 'sourceCorrections', 'inheritance', 'documentedLairdHouses',
      'migratedHouse', 'portraitPolicy'
    ],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
