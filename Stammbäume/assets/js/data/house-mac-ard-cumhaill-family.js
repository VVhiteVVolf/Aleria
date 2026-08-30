import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createSingleFounderHouseBranch
} from './family-record-builders.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import {
  LEITHEACH_CADET_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_LAIRD_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';

const CUMHAIL_HOUSE_ID = 'house-cumhail';
const CUMHAIL_EMBLEM = LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill'];
const HOUSE_MOTTO = 'Guigh ar Teutates agus iontráil';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  eirce: LEITHEACH_CADET_HOUSE_EMBLEMS['ua-eirce'],
  fiachrach: LEITHEACH_LAIRD_HOUSE_EMBLEMS['ui-fiachrach'],
  gealach: LEITHEACH_HOUSE_EMBLEMS['ua-gaelach'],
  laoch: LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch'],
  marwolaeth: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-marwolaeth.png',
  tarvo: LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo']
});

const MARRIED_AWAY_TARGETS = Object.freeze({
  urquhart: Object.freeze({
    name: 'Haus Urquhart',
    houseId: 'house-urquhart',
    targetFamilyId: 'haus-urquhart',
    emblem: ''
  }),
  draig: Object.freeze({
    name: 'Haus Draig',
    houseId: 'house-draig',
    targetFamilyId: 'haus-draig',
    emblem: HOUSE_EMBLEMS.draig
  }),
  roth: Object.freeze({
    name: 'Haus Roth',
    houseId: 'house-roth',
    targetFamilyId: 'haus-roth',
    emblem: ''
  }),
  tarvo: Object.freeze({
    name: 'Clan Fir An’Tarvo',
    houseId: 'house-tarvo',
    targetFamilyId: 'haus-fir-an-tarvo',
    emblem: HOUSE_EMBLEMS.tarvo
  }),
  gealach: Object.freeze({
    name: 'Clan Ua’Gaelach',
    houseId: 'house-gealach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gealach
  }),
  fiachrach: Object.freeze({
    name: 'Clan Uí Fiachrach',
    houseId: 'house-fiachrach',
    targetFamilyId: 'haus-fiachrach',
    emblem: HOUSE_EMBLEMS.fiachrach
  }),
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: HOUSE_EMBLEMS.laoch
  }),
  morna: Object.freeze({
    name: 'Haus Morna',
    houseId: 'house-morna',
    targetFamilyId: 'haus-morna',
    emblem: ''
  }),
  eirce: Object.freeze({
    name: 'Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: HOUSE_EMBLEMS.eirce
  })
});

const CADET_HOUSE_TARGETS = Object.freeze({
  eirce: Object.freeze({
    name: 'Ua’Eirce',
    houseId: 'house-eirce',
    targetFamilyId: 'haus-ua-eirce',
    emblem: HOUSE_EMBLEMS.eirce
  }),
  gaelach: Object.freeze({
    name: 'Ua Gaelach',
    houseId: 'house-gaelach',
    targetFamilyId: 'haus-ua-gaelach',
    emblem: HOUSE_EMBLEMS.gealach
  }),
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: HOUSE_EMBLEMS.laoch
  })
});

const HOUSE_HEAD_IDS = new Set([
  'fionnbarr-cumhail',
  'faolan-ancient-cumhail',
  'tadhg-ancient-cumhail',
  'cadan-cumhail',
  'daithin-cumhail',
  'fionn-1245-cumhail',
  'fergus-cumhail',
  'domnall-cumhail',
  'oisin-1599-cumhail',
  'finnegan-cumhail',
  'lugh-cumhail',
  'cathair-cumhail',
  'fionn-1686-cumhail'
]);

const SUCCESSION_IDS = new Set([
  'faolan-1714-cumhail',
  'oisin-1716-cumhail',
  'fiona-cumhail',
  'finn-cumhail'
]);

const HEAD_TITLES = Object.freeze({
  'fionnbarr-cumhail': 'Gründer des Clans · erster Ard Mac Cumhaill',
  'faolan-ancient-cumhail': 'Ehemaliger Ard Mac Cumhaill · Begründer der Airig-Klasse',
  'tadhg-ancient-cumhail': 'Ehemaliger Ard Mac Cumhaill',
  'cadan-cumhail': 'Ehemaliger Ard Mac Cumhaill',
  'daithin-cumhail': 'Ehemaliger Ard Mac Cumhaill',
  'fionn-1245-cumhail': 'Ehemaliger Ard Mac Cumhaill',
  'fergus-cumhail': 'Ehemaliger Ard Mac Cumhaill',
  'domnall-cumhail': 'Ehemaliger Ard Mac Cumhaill · bis 1635',
  'oisin-1599-cumhail': 'Ard Mac Cumhaill · 1635–1650',
  'finnegan-cumhail': 'Ard Mac Cumhaill · 1650–1681',
  'lugh-cumhail': 'Ard Mac Cumhaill · 1681–1712',
  'cathair-cumhail': 'Ard Mac Cumhaill · 1712–1722',
  'fionn-1686-cumhail': 'Ard Mac Cumhaill · Ard Tiarna von Leitheach · seit 1722'
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CUMHAIL_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_MAC_ARD_CUMHAILL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CUMHAIL_HOUSE_ID ? 'core' : 'married'),
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
  return person(id, name, 'female', birth, death, CUMHAIL_HOUSE_ID, {
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

function cadetFounder(id, name, sex, birth, death, targetKey, options = {}) {
  const target = CADET_HOUSE_TARGETS[targetKey];
  return person(id, name, sex, birth, death, CUMHAIL_HOUSE_ID, {
    ...options,
    title: options.title || `Begründer des Kadettenhauses ${target.name}`,
    tags: [...(options.tags || []), 'Kadettenhausgründer'],
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: [
        ...new Set([
          ...(options.extensions?.registryManagedFields || []),
          'sex',
          'birth',
          'death',
          'title',
          'tags'
        ])
      ]
    }
  });
}

function house(id, name, emblem = '', motto = '') {
  return {
    id,
    name,
    motto,
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'motto', 'emblem', 'status'] }
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

function foundedCadetHouse(id, parentPersonId, targetKey) {
  const target = CADET_HOUSE_TARGETS[targetKey];
  return createSingleFounderHouseBranch({
    id,
    name: target.name,
    parentPersonId,
    houseId: target.houseId,
    targetFamilyId: target.targetFamilyId,
    emblem: target.emblem,
    subtitle: `Begründetes Kadettenhaus ${target.name}`,
    notes: `${target.name} geht laut Quelltafel unmittelbar auf die bezeichnete Cumhaill-Person zurück; der Hausknoten hängt deshalb an dieser Einzelperson.`,
    extensions: {
      registryManagedFields: [
        'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle', 'notes'
      ]
    }
  });
}

const FIONNBARR_IDS = ['fionnbarr-cumhail', 'gormlaith-cumhail'];
const FAOLAN_IDS = ['faolan-ancient-cumhail', 'aodnait-tuathanach'];
const TADHG_IDS = ['tadhg-ancient-cumhail', 'uaine-suileach'];
const CADAN_IDS = ['cadan-cumhail', 'rionach-diulb'];
const DAITHIN_IDS = ['daithin-cumhail', 'mairin-talamh'];
const FIONN_1245_IDS = ['fionn-1245-cumhail', 'vencha-airth'];
const FERGUS_IDS = ['fergus-cumhail', 'isibeal-cetchathach'];
const DOMNALL_IDS = ['domnall-cumhail', 'tudorwen-draig'];
const OISIN_IDS = ['oisin-1599-cumhail', 'feidlim-ronain'];
const RUADHAN_IDS = ['ruadhan-cumhail', 'eibhlin-rochraide'];
const FINNEGAN_IDS = ['finnegan-cumhail', 'laoise-laga'];
const TIERNAN_IDS = ['tiernan-cumhail', 'liadan-cuinn'];
const LUGH_IDS = ['lugh-cumhail', 'aisling-diulb'];
const DUBHAN_IDS = ['dubhan-cumhail', 'sadhbh-gortach'];
const CATHAIR_IDS = ['cathair-cumhail', 'cliodhna-airth'];
const TAIRDELBACH_IDS = ['tairdelbach-cumhail', 'uilinn-frisealach'];
const FIONN_1686_IDS = ['fionn-1686-cumhail', 'grainne-chuulain'];
const SENAN_1700_IDS = ['senan-1700-cumhail', 'polain-cruthin'];
const ODRAN_IDS = ['odran-cumhail', 'iarlaith-gallchobhair'];
const DOMHNALL_1702_IDS = ['domhnall-1702-cumhail', 'caragh-coronach'];

export const HOUSE_MAC_ARD_CUMHAILL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-mac-ard-cumhaill',
    title: 'Clan Mac Ard Cumhaill',
    motto: `${HOUSE_MOTTO} · Bete zum Vater und tritt ein.`,
    description: 'Der albische Fürstenclan von Tir na Sleagh: von Fionnbarr und den nur lückenhaft überlieferten frühen Ard Mac Cumhaill bis zu Fionn und seiner Erbfolge der Gegenwart.',
    emblem: CUMHAIL_EMBLEM,
    houseProfile: LEITHEACH_HOUSE_PROFILES['mac-ard-cumhaill']
  },
  houses: [
    {
      ...house(CUMHAIL_HOUSE_ID, 'Haus Cumhail', CUMHAIL_EMBLEM, HOUSE_MOTTO),
      extensions: { registryManagedFields: ['emblem', 'motto'] }
    },
    house('house-urquhart', 'Haus Urquhart'),
    house('house-tuathanach', 'Haus Tuathánach'),
    house('house-suileach', 'Haus Suileach'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-diulb', 'Haus Diulb'),
    house('house-talamh', 'Haus Ui Talamh'),
    house('house-duibhne', 'Haus Duibhne'),
    house('house-airth', 'Haus Airth'),
    house('house-cetchathach', 'Haus Cétchathach'),
    house('house-ronain', 'Haus Rónáin'),
    house('house-rochraide', 'Haus Rochraide'),
    house('house-laga', 'Haus Laga'),
    house('house-roth', 'Haus Roth'),
    house('house-cuinn', 'Haus Cuinn'),
    house('house-tarvo', 'Haus Tarvo'),
    house('house-gortach', 'Haus Gortach'),
    house('house-gealach', 'Haus Gealach'),
    house('house-fiachrach', 'Clan Uí Fiachrach', HOUSE_EMBLEMS.fiachrach),
    house('house-laoch', 'Ruin Ua Laoch', HOUSE_EMBLEMS.laoch),
    house('house-frisealach', 'Haus Frisealach'),
    house('house-chuulain', 'Haus Chuulain'),
    house('house-morna', 'Haus Morna'),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-cruthin', 'Haus Cruthin'),
    house('house-eirce', 'Ua’Eirce', HOUSE_EMBLEMS.eirce),
    house('house-gallchobhair', 'Haus Gallchobhair'),
    house('house-coronach', 'Haus Corónach'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-blar', 'Haus Blár'),
    house('house-ruca', 'Haus Rúca'),
    house('house-gaelach', 'Ua Gaelach', HOUSE_EMBLEMS.gealach)
  ],
  persons: [
    // Gründerpaar und frühe, nur über Überlieferungslücken verbundene Generationen
    person('fionnbarr-cumhail', 'Fionnbarr Cumhail', 'male', '????', '????', CUMHAIL_HOUSE_ID, {
      tags: ['Fianna'],
      notes: 'Gründer des Hauses Cumhail, Held seiner Zeit und einer der ersten Fianna.'
    }),
    spouse('gormlaith-cumhail', 'Gormlaith', 'female'),

    awayWoman('faoiltiama-cumhail', 'Faoiltiama Cumhail', '????', '????', 'urquhart'),
    spouse('dermod-urquhart', 'Dermod Urquhart', 'male', '????', '????', 'house-urquhart'),
    person('faolan-ancient-cumhail', 'Faolan Cumhail', 'male', '????', '????', CUMHAIL_HOUSE_ID, {
      notes: 'Faolan der Ältere heiratete eine Tochter des albischen Königs, brachte königliches Blut in den Clan und begründete die Airig-Klasse.'
    }),
    spouse('aodnait-tuathanach', 'Aodnait Tuathánach', 'female', '????', '????', 'house-tuathanach'),

    person('tadhg-ancient-cumhail', 'Tadhg Cumhail', 'male', '????', '????'),
    spouse('uaine-suileach', 'Uaine Suileach', 'unknown', '????', '????', 'house-suileach'),
    cadetFounder('senan-ancient-cumhail', 'Senán Cumhail', 'male', '????', '????', 'laoch'),
    spouse('doireann-cumhail', 'Doireann', 'female'),

    awayWoman('findabhair-cumhail', 'Findabhair Cumhail', '????', '????', 'draig'),
    spouse('celtigern-draig', 'Celtigern', 'male', '????', '????', 'house-draig'),
    person('cadan-cumhail', 'Cadan Cumhail', 'male', '????', '????'),
    spouse('rionach-diulb', 'Rionach Diulb', 'female', '????', '????', 'house-diulb'),

    person('daithin-cumhail', 'Dáithin Cumhail', 'male', '????', '????'),
    spouse('mairin-talamh', 'Máirín Talamh', 'female', '????', '????', 'house-talamh'),
    cadetFounder('donnchadh-cumhail', 'Donnchadh Cumhail', 'male', '????', '????', 'gaelach'),
    spouse('keelaith-duibhne', 'Keelaith Duibhne', 'female', '????', '????', 'house-duibhne'),

    person('fionn-1245-cumhail', 'Fionn Cumhail', 'male', '1245', '1279'),
    spouse('vencha-airth', 'Vencha Airth', 'female', '1247', '1304', 'house-airth'),
    person('aurnia-cumhail', 'Aurnia Cumhail', 'female', '1248', '1265'),
    spouse('garith-draig', 'Garith', 'male', '1247', '1266', 'house-draig'),
    cadetFounder('sinna-1250-cumhail', 'Sinna Cumhail', 'male', '1275', '1311', 'eirce', {
      notes: 'Die korrigierte Quellangabe datiert Sinnas Geburt auf 1275.'
    }),
    spouse('eimear-cumhail', 'Eimear', 'female', '1252', '1300'),

    awayWoman('beibhinn-cumhail', 'Beibhinn Cumhail', '????', '????', 'draig'),
    spouse('cynan-draig', 'Cynan', 'male', '????', '????', 'house-draig'),
    person('fergus-cumhail', 'Fergus Cumhail', 'male', '????', '????'),
    spouse('isibeal-cetchathach', 'Isibéal Cétchathach', 'female', '????', '????', 'house-cetchathach'),

    // Ab Domnall ist die Elternschaft wieder unmittelbar überliefert
    person('domnall-cumhail', 'Domnall Cumhail', 'male', '1580', '1635'),
    spouse('tudorwen-draig', 'Tudorwen', 'female', '1581', '1664', 'house-draig'),
    awayWoman('fearcharae-cumhail', 'Fearcharae Cumhail', '1584', '1644', 'urquhart'),
    spouse('conchobhair-urquhart', 'Conchobhair Urquhart', 'male', '1580', '1685', 'house-urquhart'),

    person('oisin-1599-cumhail', 'Oisín Cumhail', 'male', '1599', '1650'),
    spouse('feidlim-ronain', 'Feidlim Rónáin', 'unknown', '1602', '1666', 'house-ronain'),
    person('lochlainn-cumhail', 'Lochlainn Cumhail', 'male', '1602', '1691', CUMHAIL_HOUSE_ID, {
      tags: ['Fianna'],
      notes: 'Lochlainn war einer der Fianna.'
    }),
    person('ruadhan-cumhail', 'Ruadhan Cumhail', 'male', '1606', '1682'),
    spouse('eibhlin-rochraide', 'Eibhlin Rochraide', 'female', '1609', '1655', 'house-rochraide'),

    person('finnegan-cumhail', 'Finnegan Cumhail', 'male', '1620', '1681'),
    spouse('laoise-laga', 'Laoise Laga', 'female', '1625', '1671', 'house-laga'),
    awayWoman('oonagh-cumhail', 'Oonagh Cumhail', '1625', '1700', 'roth'),
    spouse('cainneach-roth', 'Cainneach Roth', 'male', '1622', '1674', 'house-roth'),
    person('roarke-cumhail', 'Roarke Cumhail', 'male', '1628', '1650'),
    person('tiernan-cumhail', 'Tiernan Cumhail', 'male', '1633', '1688'),
    spouse('liadan-cuinn', 'Líadan Cuinn', 'female', '1635', '1677', 'house-cuinn'),

    person('lugh-cumhail', 'Lugh Cumhail', 'male', '1643', '1712'),
    spouse('aisling-diulb', 'Aisling Diulb', 'female', '1645', '1710', 'house-diulb'),
    awayWoman('alawen-cumhail', 'Alawen Cumhail', '1645', '1705', 'draig'),
    spouse('cahir-draig', 'Cahir', 'male', '1641', '1702', 'house-draig'),
    awayWoman('geillis-cumhail', 'Geillis Cumhail', '1653', '1700', 'tarvo'),
    spouse('ceiron-tarvo', 'Ceiron Tarvo', 'male', '1649', '1684', 'house-tarvo', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('dubhan-cumhail', 'Dubhan Cumhail', 'male', '1655', '1716'),
    spouse('sadhbh-gortach', 'Sadhbh Gortach', 'female', '1655', '1704', 'house-gortach'),

    person('cathair-cumhail', 'Cathair Cumhail', 'male', '1664', '1722', CUMHAIL_HOUSE_ID, {
      notes: 'Beliebter Fürst. Cathair kämpfte 1720 in der Entscheidungsschlacht gegen seinen Sohn Sinna, wurde von ihm schwer verwundet und starb zwei Jahre später an den Folgen.'
    }),
    spouse('cliodhna-airth', 'Cliodhna Airth', 'female', '1666', '', 'house-airth'),
    awayWoman('eithne-cumhail', 'Eithne Cumhail', '1671', '', 'gealach'),
    spouse('ciaran-gealach', 'Ciaran Gealach', 'male', '1669', '', 'house-gealach'),
    awayWoman('roisin-cumhail', 'Roisin Cumhail', '1674', '', 'fiachrach'),
    spouse('grada-fiachrach', 'Gráda Fiachrach', 'male', '1670', '', 'house-fiachrach', {
      extensions: { registryManagedFields: ['sex', 'portrait'] }
    }),
    awayWoman('earraigh-cumhail', 'Earraigh Cumhail', '1673', '', 'laoch'),
    spouse('reamonn-laoch', 'Reamonn Laoch', 'male', '1671', '', 'house-laoch', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('tairdelbach-cumhail', 'Tairdelbach Cumhail', 'male', '1674', ''),
    spouse('uilinn-frisealach', 'Uilinn Frisealach', 'female', '1676', '', 'house-frisealach', {
      extensions: { registryManagedFields: ['portrait'] }
    }),

    // Gegenwärtige Fürstenlinie
    person('fionn-1686-cumhail', 'Fionn Cumhail', 'male', '1686', ''),
    spouse('grainne-chuulain', 'Gráinne Chuulain', 'female', '1688', '', 'house-chuulain'),
    awayWoman('saorlaith-cumhail', 'Saorlaith Cumhail', '1691', '', 'morna'),
    spouse('garbhan-morna', 'Garbhán Morna', 'male', '1689', '', 'house-morna'),
    person('sinna-cumhail', 'Sinna Cumhail', 'male', '1693', '', CUMHAIL_HOUSE_ID, {
      title: 'Sohn Cathairs · Gegner seines Vaters im Krieg von 1720',
      tags: ['Erzwungene Verbindung'],
      notes: 'Sinna verwundete seinen Vater Cathair 1720 schwer. Die Verbindung zu Morwenna Marwolaeth war ein Verbrechen und kein freiwilliges Verhältnis.',
      extensions: { registryManagedFields: ['birth'] }
    }),
    spouse('morwenna-marwolaeth', 'Morwenna Marwolaeth', 'female', '1695', '', 'house-marwolaeth', {
      familyRole: 'affair',
      title: 'Sinnas Opfer',
      notes: 'Morwenna war Sinnas Opfer während des Großen Krieges; die Verbindung wird ausdrücklich nicht als Ehe oder freiwillige Affäre geführt.'
    }),
    person('orflaith-cumhail', 'Órflaith Cumhail', 'female', '1697', ''),
    person('senan-1700-cumhail', 'Senán Cumhail', 'male', '1700', ''),
    spouse('polain-cruthin', 'Pólain Cruthin', 'female', '1700', '', 'house-cruthin'),

    awayWoman('brietta-cumhail', 'Brietta Cumhail', '1695', '', 'eirce'),
    spouse('brock-eirce', 'Brock Eirce', 'male', '1694', '', 'house-eirce', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('odran-cumhail', 'Odrán Cumhail', 'male', '1697', ''),
    spouse('iarlaith-gallchobhair', 'Iarlaith Gallchobhair', 'female', '1700', '', 'house-gallchobhair', {
      extensions: { registryManagedFields: ['sex', 'portrait'] }
    }),
    person('cennetig-cumhail', 'Cennétig Cumhail', 'male', '1700', ''),
    person('domhnall-1702-cumhail', 'Domhnall Cumhail', 'male', '1702', ''),
    spouse('caragh-coronach', 'Caragh Corónach', 'female', '1703', '', 'house-coronach'),

    // Kinder, Mündel und verbundene Linien der Gegenwart
    person('faolan-1714-cumhail', 'Faolan Cumhail', 'male', '1714', '', CUMHAIL_HOUSE_ID, {
      title: '1. Stelle der Erbfolge'
    }),
    person('oisin-1716-cumhail', 'Oisín Cumhail', 'male', '1716', '', CUMHAIL_HOUSE_ID, {
      title: '2. Stelle der Erbfolge'
    }),
    person('fiona-cumhail', 'Fiona Cumhail', 'female', '1717', '', CUMHAIL_HOUSE_ID, {
      title: '3. Stelle der überlieferten Erbfolgetafel',
      notes: 'Die Quelle führt Fiona an dritter Stelle, obwohl ihre Erbfolgeregel Frauen erst beim Fehlen männlicher Erben und unter Heiratsauflagen zulässt.'
    }),
    person('finn-cumhail', 'Finn Cumhail', 'male', '1724', '', CUMHAIL_HOUSE_ID, {
      title: '4. Stelle der überlieferten Erbfolgetafel'
    }),
    person('arthen-aderyn', 'Arthen Aderyn', 'male', '1716', '', 'house-aderyn', {
      familyRole: 'ward',
      title: 'Mündel Fionns',
      notes: 'Leiblicher Sohn des Hauses Aderyn; Fionn Cumhail ist sein Vormund, nicht sein Vater.'
    }),
    person('peredur-geoffrey-marwolaeth', 'Peredur Geoffrey Marwolaeth', 'male', '1721', '', 'house-marwolaeth', {
      familyRole: 'core',
      title: 'Legitimierter Sohn Morwennas',
      tags: ['Legitimiert'],
      notes: 'Sohn Morwennas und Sinnas aus der erzwungenen Verbindung; nach seiner Geburt legitimiert.',
      extensions: { registryManagedFields: ['birth'] }
    }),
    person('muireen-cumhail', 'Muireen Cumhail', 'female', '1719', ''),
    person('ronan-cumhail', 'Rónán Cumhail', 'male', '1723', ''),
    person('eoghan-cumhail', 'Eoghan Cumhail', 'male', '1726', ''),
    person('nuala-blar', 'Nuala Blár', 'female', '1726', '', 'house-blar', {
      familyRole: 'ward',
      title: 'Mündel Senáns',
      notes: 'Senán Cumhail ist Nualas Vormund, nicht ihr leiblicher Vater.'
    }),
    person('narach-cumhail', 'Nárach Cumhail', 'male', '1722', ''),
    person('alawen-1726-cumhail', 'Alawen Cumhail', 'female', '1726', ''),
    person('mughna-ruca', 'Mughna Rúca', 'female', '1724', '', 'house-ruca', {
      familyRole: 'core',
      notes: 'Leibliche Tochter Domhnalls und Caraghs; die Quellgrafik ordnet sie der verbundenen Linie Rúca zu.'
    }),
    person('ailis-cumhail', 'Ailis Cumhail', 'female', '1728', '')
  ],
  partnerships: [
    createMarriage('marriage-fionnbarr-gormlaith', ...FIONNBARR_IDS),
    createMarriage('marriage-faoiltiama-dermod', 'faoiltiama-cumhail', 'dermod-urquhart'),
    createMarriage('marriage-faolan-aodnait', ...FAOLAN_IDS),
    createMarriage('marriage-tadhg-uaine', ...TADHG_IDS),
    createMarriage('marriage-senan-doireann', 'senan-ancient-cumhail', 'doireann-cumhail'),
    createMarriage('marriage-celtigern-findabhair', 'celtigern-draig', 'findabhair-cumhail'),
    createMarriage('marriage-cadan-rionach', ...CADAN_IDS),
    createMarriage('marriage-daithin-mairin', ...DAITHIN_IDS),
    createMarriage('marriage-donnchadh-keelaith', 'donnchadh-cumhail', 'keelaith-duibhne'),
    createMarriage('marriage-fionn-vencha', ...FIONN_1245_IDS),
    createMarriage('engagement-garith-aurnia', 'garith-draig', 'aurnia-cumhail', {
      type: 'engagement',
      status: 'ended'
    }),
    createMarriage('marriage-sinna-eimear', 'sinna-1250-cumhail', 'eimear-cumhail'),
    createMarriage('marriage-cynan-beibhinn', 'cynan-draig', 'beibhinn-cumhail'),
    createMarriage('marriage-fergus-isibeal', ...FERGUS_IDS),
    createMarriage('marriage-tudorwen-domnall', 'tudorwen-draig', 'domnall-cumhail'),
    createMarriage('marriage-fearcharae-conchobhair', 'fearcharae-cumhail', 'conchobhair-urquhart'),
    createMarriage('marriage-oisin-feidlim', ...OISIN_IDS),
    createMarriage('marriage-ruadhan-eibhlin', ...RUADHAN_IDS),
    createMarriage('marriage-finnegan-laoise', ...FINNEGAN_IDS),
    createMarriage('marriage-oonagh-cainneach', 'oonagh-cumhail', 'cainneach-roth'),
    createMarriage('marriage-tiernan-liadan', ...TIERNAN_IDS),
    createMarriage('marriage-lugh-aisling', ...LUGH_IDS),
    createMarriage('marriage-cahir-alawen', 'cahir-draig', 'alawen-cumhail'),
    createMarriage('marriage-geillis-ceiron', 'geillis-cumhail', 'ceiron-tarvo'),
    createMarriage('marriage-dubhan-sadhbh', ...DUBHAN_IDS),
    createMarriage('marriage-cathair-cliodhna', ...CATHAIR_IDS),
    createMarriage('marriage-eithne-ciaran', 'eithne-cumhail', 'ciaran-gealach'),
    createMarriage('marriage-roisin-grada', 'roisin-cumhail', 'grada-fiachrach'),
    createMarriage('marriage-earraigh-reamonn', 'earraigh-cumhail', 'reamonn-laoch'),
    createMarriage('marriage-tairdelbach-uilinn', ...TAIRDELBACH_IDS),
    createMarriage('marriage-fionn-grainne', ...FIONN_1686_IDS),
    createMarriage('marriage-saorlaith-garbhan', 'saorlaith-cumhail', 'garbhan-morna'),
    createMarriage('forced-morwenna-sinna-marwolaeth', 'morwenna-marwolaeth', 'sinna-cumhail', {
      type: 'forced',
      status: 'ended',
      notes: 'Die Quelle bezeichnet Sinna ausdrücklich als Morwennas Schänder; dies ist keine freiwillige Affäre.'
    }),
    createMarriage('marriage-senan-polain', ...SENAN_1700_IDS),
    createMarriage('marriage-brietta-brock', 'brietta-cumhail', 'brock-eirce'),
    createMarriage('marriage-odran-iarlaith', ...ODRAN_IDS),
    createMarriage('marriage-domhnall-caragh', ...DOMHNALL_1702_IDS)
  ],
  parentages: [
    ...childrenOf(['faoiltiama-cumhail', 'faolan-ancient-cumhail'], FIONNBARR_IDS, 'marriage-fionnbarr-gormlaith', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-fionnbarr-faolan' }
    }),
    ...childrenOf(['tadhg-ancient-cumhail', 'senan-ancient-cumhail'], FAOLAN_IDS, 'marriage-faolan-aodnait', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-faolan-tadhg' }
    }),
    ...childrenOf(['findabhair-cumhail', 'cadan-cumhail'], TADHG_IDS, 'marriage-tadhg-uaine', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-tadhg-cadan' }
    }),
    ...childrenOf(['daithin-cumhail', 'donnchadh-cumhail'], CADAN_IDS, 'marriage-cadan-rionach', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-cadan-daithin' }
    }),
    ...childrenOf(['fionn-1245-cumhail', 'aurnia-cumhail', 'sinna-1250-cumhail'], DAITHIN_IDS, 'marriage-daithin-mairin', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-daithin-fionn' }
    }),
    ...childrenOf(['beibhinn-cumhail', 'fergus-cumhail'], FIONN_1245_IDS, 'marriage-fionn-vencha', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-fionn-fergus' }
    }),
    ...childrenOf(['domnall-cumhail', 'fearcharae-cumhail'], FERGUS_IDS, 'marriage-fergus-isibeal', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: 'gap-fergus-domnall' }
    }),
    ...childrenOf(['oisin-1599-cumhail', 'lochlainn-cumhail', 'ruadhan-cumhail'], DOMNALL_IDS, 'marriage-tudorwen-domnall'),
    ...childrenOf(['finnegan-cumhail', 'oonagh-cumhail'], OISIN_IDS, 'marriage-oisin-feidlim'),
    ...childrenOf(['roarke-cumhail', 'tiernan-cumhail'], RUADHAN_IDS, 'marriage-ruadhan-eibhlin'),
    ...childrenOf(['lugh-cumhail', 'alawen-cumhail'], FINNEGAN_IDS, 'marriage-finnegan-laoise'),
    ...childrenOf(['geillis-cumhail', 'dubhan-cumhail'], TIERNAN_IDS, 'marriage-tiernan-liadan'),
    ...childrenOf(['cathair-cumhail', 'eithne-cumhail', 'roisin-cumhail'], LUGH_IDS, 'marriage-lugh-aisling'),
    ...childrenOf(['earraigh-cumhail', 'tairdelbach-cumhail'], DUBHAN_IDS, 'marriage-dubhan-sadhbh'),
    ...childrenOf(
      ['fionn-1686-cumhail', 'saorlaith-cumhail', 'sinna-cumhail', 'orflaith-cumhail', 'senan-1700-cumhail'],
      CATHAIR_IDS,
      'marriage-cathair-cliodhna'
    ),
    ...childrenOf(
      ['brietta-cumhail', 'odran-cumhail', 'cennetig-cumhail', 'domhnall-1702-cumhail'],
      TAIRDELBACH_IDS,
      'marriage-tairdelbach-uilinn'
    ),
    ...childrenOf(
      ['faolan-1714-cumhail', 'oisin-1716-cumhail', 'fiona-cumhail', 'finn-cumhail'],
      FIONN_1686_IDS,
      'marriage-fionn-grainne'
    ),
    ...childrenOf(['arthen-aderyn'], ['fionn-1686-cumhail'], '', {
      idPrefix: 'fosterage-fionn',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Fionn ist Arthens Vormund; es besteht keine leibliche Abstammung.'
    }),
    ...childrenOf(['peredur-geoffrey-marwolaeth'], ['morwenna-marwolaeth', 'sinna-cumhail'], 'forced-morwenna-sinna-marwolaeth', {
      legitimacy: 'legitimized',
      notes: 'Peredur wurde nach seiner Geburt legitimiert.',
      extensions: { registryManagedFields: ['legitimacy', 'notes'] }
    }),
    ...childrenOf(['muireen-cumhail', 'ronan-cumhail', 'eoghan-cumhail'], SENAN_1700_IDS, 'marriage-senan-polain'),
    ...childrenOf(['nuala-blar'], ['senan-1700-cumhail'], '', {
      idPrefix: 'fosterage-senan',
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Senán ist Nualas Vormund; es besteht keine leibliche Abstammung.'
    }),
    ...childrenOf(['narach-cumhail', 'alawen-1726-cumhail'], ODRAN_IDS, 'marriage-odran-iarlaith'),
    ...childrenOf(['mughna-ruca', 'ailis-cumhail'], DOMHNALL_1702_IDS, 'marriage-domhnall-caragh')
  ],
  cadetBranches: [
    foundedCadetHouse('cadet-ruin-ua-laoch-senan', 'senan-ancient-cumhail', 'laoch'),
    foundedCadetHouse('cadet-ua-gaelach-donnchadh', 'donnchadh-cumhail', 'gaelach'),
    foundedCadetHouse('cadet-ua-eirce-sinna', 'sinna-1250-cumhail', 'eirce'),
    marriedAway('married-away-urquhart-faoiltiama', 'marriage-faoiltiama-dermod', 'urquhart'),
    marriedAway('married-away-draig-findabhair', 'marriage-celtigern-findabhair', 'draig'),
    marriedAway('married-away-draig-beibhinn', 'marriage-cynan-beibhinn', 'draig'),
    marriedAway('married-away-urquhart-fearcharae', 'marriage-fearcharae-conchobhair', 'urquhart'),
    marriedAway('married-away-roth-oonagh', 'marriage-oonagh-cainneach', 'roth'),
    marriedAway('married-away-draig-alawen', 'marriage-cahir-alawen', 'draig'),
    marriedAway('married-away-tarvo-geillis', 'marriage-geillis-ceiron', 'tarvo'),
    marriedAway('married-away-gealach-eithne', 'marriage-eithne-ciaran', 'gealach'),
    marriedAway('married-away-fiachrach-roisin', 'marriage-roisin-grada', 'fiachrach'),
    marriedAway('married-away-laoch-earraigh', 'marriage-earraigh-reamonn', 'laoch'),
    marriedAway('married-away-morna-saorlaith', 'marriage-saorlaith-garbhan', 'morna'),
    marriedAway('married-away-eirce-brietta', 'marriage-brietta-brock', 'eirce')
  ],
  timeJumps: [
    {
      id: 'gap-fionnbarr-faolan',
      parentPartnershipId: 'marriage-fionnbarr-gormlaith',
      childIds: ['faoiltiama-cumhail', 'faolan-ancient-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Die Quelle setzt zwischen Fionnbarr und der Generation Faoiltiamas und Faolans ausdrücklich eine Überlieferungslücke.',
      extensions: {}
    },
    {
      id: 'gap-faolan-tadhg',
      parentPartnershipId: 'marriage-faolan-aodnait',
      childIds: ['tadhg-ancient-cumhail', 'senan-ancient-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: '',
      extensions: {}
    },
    {
      id: 'gap-tadhg-cadan',
      parentPartnershipId: 'marriage-tadhg-uaine',
      childIds: ['findabhair-cumhail', 'cadan-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: '',
      extensions: {}
    },
    {
      id: 'gap-cadan-daithin',
      parentPartnershipId: 'marriage-cadan-rionach',
      childIds: ['daithin-cumhail', 'donnchadh-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: '',
      extensions: {}
    },
    {
      id: 'gap-daithin-fionn',
      parentPartnershipId: 'marriage-daithin-mairin',
      childIds: ['fionn-1245-cumhail', 'aurnia-cumhail', 'sinna-1250-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '1245',
      label: 'Die datierte Überlieferung setzt 1245 wieder ein',
      notes: '',
      extensions: {}
    },
    {
      id: 'gap-fionn-fergus',
      parentPartnershipId: 'marriage-fionn-vencha',
      childIds: ['beibhinn-cumhail', 'fergus-cumhail'],
      years: 0,
      fromYear: '1304',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: '',
      extensions: {}
    },
    {
      id: 'gap-fergus-domnall',
      parentPartnershipId: 'marriage-fergus-isibeal',
      childIds: ['domnall-cumhail', 'fearcharae-cumhail'],
      years: 0,
      fromYear: '????',
      toYear: '1580',
      label: 'Die datierte Überlieferung setzt 1580 wieder ein',
      notes: '',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-fionnbarr-gormlaith',
    houseId: CUMHAIL_HOUSE_ID,
    crestSubtitle: 'Ard Tiarnatum Leitheach · Dun Athar · Tir na Sleagh',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'fionnbarr-cumhail',
    orientation: 'vertical',
    ancestorDepth: 30,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten, Beziehungen, sieben Überlieferungslücken, Hausoberhäupter und Erbfolgetafel folgen der bereitgestellten Mac-Ard-Cumhaill-Tabelle und ihrer Stammbaumgrafik. Die drei personengebundenen Kadettenhausknoten führen von Sinna zu Ua’Eirce, von Donnchadh zu Ua Gaelach und vom frühen Senan zu Ruin Ua Laoch; Sinnas korrigierte Lebensdaten lauten 1275–1311. Zwölf verheiratete Cumhaill-Frauen ohne fortgeführte Cumhaill-Nachkommen besitzen einen Wegverheiratet-Zweig zum Haus ihres Ehepartners. Aurnias bloße Verlobung und Morwennas erzwungene Verbindung sind davon ausdrücklich ausgenommen. Wiederholte Standardsilhouetten wurden nicht als Individualporträts übernommen. Draig-, Aderyn-, Marwolaeth-, Ua’Eirce-, Uí-Fiachrach-, Ruin-Ua-Laoch- und Gallchobhair-Personen verwenden dieselben Weltpersonen-IDs und Porträtdateien wie ihre Gegenakten; Iarlaith ist gemäß der Gallchobhair-Akte eine Frau.',
    blankFamily: false,
    preparedMainLine: false,
    sourceRevision: 10,
    principality: 'Leitheach',
    territory: 'Tir na Sleagh',
    territoryGloss: 'Land der Speere',
    albicRank: 'ard-tiarna',
    inheritance: {
      title: 'Ard Mac Cumhaill',
      primaryRule: 'männliche Erbfolge',
      fallbackRule: 'Erstgeborene Tochter nur ohne männlichen Erben und bei Heirat eines Prinzen aus einem primären Fürstenclan; der Gatte nimmt den Namen Mac Cumhaill an.',
      publishedOrder: ['faolan-1714-cumhail', 'oisin-1716-cumhail', 'fiona-cumhail', 'finn-cumhail'],
      sourceDiscrepancy: 'Die veröffentlichte Erbfolgetafel führt Fiona trotz vorhandener jüngerer männlicher Erben an dritter Stelle.'
    },
    documentedCadetHouses: ['Ua’Eirce', 'Ua Gaelach', 'Ruin Ua Laoch'],
    registryManagedDocumentFields: ['emblem', 'motto', 'description'],
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
