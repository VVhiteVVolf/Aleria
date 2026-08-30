import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  HOUSE_MAC_AIRT_PORTRAITS,
  HOUSE_MAC_AIRT_REUSED_PORTRAIT_IDS
} from './house-mac-airt-portraits.js';
import { LEITHEACH_HOUSE_EMBLEMS } from './leitheach-house-profiles.js';
import { TIR_NA_GORTANNA_HOUSE_EMBLEMS } from './tir-na-gortanna-house-profiles.js';
import { TIR_NA_SINSEAR_HOUSE_EMBLEMS } from './tir-na-sinsear-house-profiles.js';
import { TIR_NA_SRUTH_HOUSE_EMBLEMS } from './tir-na-sruth-house-profiles.js';
import { TIR_NA_TONN_HOUSE_EMBLEMS } from './tir-na-tonn-house-profiles.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';

const MAC_AIRT_HOUSE_ID = 'house-mac-airt';
const MAC_AIRT_EMBLEM = TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['mac-airt'];

const HOUSE_HEAD_IDS = new Set([
  'colman-founder-airt',
  'ultach-airt',
  'neil-airt',
  'cormac-1270-airt',
  'coemgen-airt',
  'seamus-airt',
  'aidan-airt',
  'cormac-1664-airt'
]);
const SUCCESSION_IDS = new Set(['bairre-airt']);

const HEAD_TITLES = Object.freeze({
  'colman-founder-airt': 'Legendärer Gründer des Clan Mac Airt',
  'ultach-airt': 'Frühes Oberhaupt des Clan Mac Airt',
  'neil-airt': 'Oberhaupt des Clan Mac Airt · bis 1296',
  'cormac-1270-airt': 'Oberhaupt des Clan Mac Airt · 1296–1340',
  'coemgen-airt': 'Mor Tiarna von Tir an Comhchuibhis · bis 1659',
  'seamus-airt': 'Mor Tiarna von Tir an Comhchuibhis · 1659–1684',
  'aidan-airt': 'Mor Tiarna von Tir an Comhchuibhis · 1684–1715',
  'cormac-1664-airt': 'Mor Tiarna von Tir an Comhchuibhis · Herr von Sruthlann · seit 1715',
  'bairre-airt': 'Erster der Erbfolge des Mor Tiarna'
});

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'vencha-airth': 'person--haus-airth--vencha-airth',
  'fionn-1245-cumhail': 'person--haus-cumhail--fionn-1245-cumhail',
  'seamus-airt': 'person--haus-airt--seamus-airt',
  'mairead-tarvo': 'person--haus-tarvo--mairead-tarvo',
  'fidelma-airt': 'person--haus-airt--fidelma-airt',
  'rhiwallon-draig': 'person--haus-draig--rhiwallon-draig',
  'cliodhna-airt': 'person--haus-airt--cliodhna-airt',
  'farrell-laoch': 'person--haus-laoch--farrell-laoch',
  'aidan-airt': 'person--haus-airt--aidan-airt',
  'duana-cruthin': 'person--haus-cruthin--duana-cruthin',
  'muireann-airt': 'person--haus-airt--muireann-airt',
  'gwynnan-dyngwn': 'person--haus-dyngwn--gwynnan-dyngwn',
  'cliodhna-airth': 'person--haus-airth--cliodhna-airth',
  'cathair-cumhail': 'person--haus-cumhail--cathair-cumhail',
  'beatha-airt': 'person--haus-airt--beatha-airt',
  'aethlem-gwyvern': 'person--haus-gwyvern--aethlem-gwyvern',
  'niallan-airt': 'person--haus-airt--niallan-airt',
  'caoilte-gortach': 'person--haus-gortach--caoilte-gortach',
  'reamonn-airt': 'person--haus-airt--reamonn-airt',
  'dearbhla-gealach': 'person--haus-gealach--dearbhla-gealach',
  'seamair-airt': 'person--haus-airt--seamair-airt',
  'bebhinn-caoimhe': 'person--haus-caoimhe--bebhinn-caoimhe',
  'maeve-airt': 'person--haus-airt--maeve-airt',
  'murchad-gallchobhair': 'person--haus-gallchobhair--murchad-gallchobhair',
  'fintan-airt': 'person--haus-airt--fintan-airt',
  'rhianu-illwath': 'person--haus-illwath--rhianu-illwath'
});

const TARGETS = Object.freeze({
  cumhaill: Object.freeze({
    name: 'Clan Mac Ard Cumhaill',
    houseId: 'house-cumhail',
    targetFamilyId: 'haus-mac-ard-cumhaill',
    emblem: LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']
  }),
  choinnich: Object.freeze({
    name: 'Ua’Choinnich',
    houseId: 'house-choinnich',
    targetFamilyId: 'haus-choinnich',
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich
  }),
  draig: Object.freeze({
    name: 'Haus Draig',
    houseId: 'house-draig',
    targetFamilyId: 'haus-draig',
    emblem: 'assets/images/houses/Llamreis Ankunft/haus-draig.png'
  }),
  laoch: Object.freeze({
    name: 'Ruin Ua Laoch',
    houseId: 'house-laoch',
    targetFamilyId: 'haus-ruin-ua-laoch',
    emblem: 'assets/images/houses/Leitheach/clan-ruin-ua-laoch.png'
  }),
  cuinn: Object.freeze({
    name: 'Clan Tir An’Cuinn',
    houseId: 'house-cuinn',
    targetFamilyId: 'haus-tir-an-cuinn',
    emblem: LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn']
  }),
  dyngwn: Object.freeze({
    name: 'Haus Dyngwn',
    houseId: 'house-dyngwn',
    targetFamilyId: 'haus-dyngwn',
    emblem: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-dyngwn.png'
  }),
  gwyvern: Object.freeze({
    name: 'Haus Gwyvern',
    houseId: 'house-gwyvern',
    targetFamilyId: 'haus-gwyvern',
    emblem: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png'
  }),
  amrhan: Object.freeze({
    name: 'Clan Ua’Amhran',
    houseId: 'house-amrhan',
    targetFamilyId: 'haus-amrhan',
    emblem: ''
  }),
  gallchobhair: Object.freeze({
    name: 'Fir An’Gallchobhair',
    houseId: 'house-gallchobhair',
    targetFamilyId: 'haus-gallchobhair',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
  })
});

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = MAC_AIRT_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_MAC_AIRT_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === MAC_AIRT_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || HEAD_TITLES[id] || '',
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
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
  return person(id, name, 'female', birth, death, MAC_AIRT_HOUSE_ID, {
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
    idPrefix: 'mac-airt-parentage',
    ...options
  });
}

function endedMarriage(id, participantIds, end = '', options = {}) {
  return createMarriage(id, ...participantIds, { ...options, status: 'ended', end });
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

const COLMAN_IDS = ['colman-founder-airt', 'blathnat-spouse-airt'];
const ULTACH_IDS = ['ultach-airt', 'maonach-suileach'];
const SWEENEY_IDS = ['sweeney-airt', 'laoiseach-spouse-airt'];
const FIONN_IDS = ['fionn-1245-cumhail', 'vencha-airth'];
const NEIL_GOBNAIT_IDS = ['neil-airt', 'gobnait-spouse-airt'];
const NEIL_EARC_IDS = ['neil-airt', 'earc-affair-airt'];
const CORMAC_1270_IDS = ['cormac-1270-airt', 'aodhnait-morna'];
const COEMGEN_IDS = ['coemgen-airt', 'rheanne-grawn'];
const TEGWEN_IDS = ['garbhan-choinnich', 'tegwen-airt'];
const TADHGAN_IDS = ['tadhgan-airt', 'ailbhe-laidir'];
const UNKNOWN_BRANCH_IDS = ['unknown-branch-parent-airt', 'unknown-branch-spouse-airt'];
const SEAMUS_IDS = ['seamus-airt', 'mairead-tarvo'];
const FIDELMA_IDS = ['rhiwallon-draig', 'fidelma-airt'];
const TURLOUGH_IDS = ['turlough-airt', 'saoirse-t-saor'];
const CLIODHNA_1633_IDS = ['farrell-laoch', 'cliodhna-airt'];
const AIDAN_IDS = ['duana-cruthin', 'aidan-airt'];
const LIADAN_IDS = ['brendan-cuinn', 'liadan-airt'];
const MUIREANN_IDS = ['gwynnan-dyngwn', 'muireann-airt'];
const EIMEAR_IDS = ['eimear-airt', 'seafra-spouse-airt'];
const CORMAC_1664_IDS = ['cormac-1664-airt', 'faoiltiama-chulainn'];
const CLIODHNA_1666_IDS = ['cathair-cumhail', 'cliodhna-airth'];
const BEATHA_IDS = ['aethlem-gwyvern', 'beatha-airt'];
const NIALLAN_IDS = ['niallan-airt', 'caoilte-gortach'];
const FIADH_IDS = ['fionntan-amrhan', 'fiadh-airt'];
const DONOVAN_IDS = ['donovan-airt', 'eilis-choinnich'];
const REAMONN_IDS = ['dearbhla-gealach', 'reamonn-airt'];
const SEAMAIR_IDS = ['seamair-airt', 'bebhinn-caoimhe'];
const MAEVE_IDS = ['murchad-gallchobhair', 'maeve-airt'];
const BAIRRE_IDS = ['bairre-airt', 'eibhlin-laidir'];
const COIREALL_IDS = ['coireall-airt', 'muirenn-durthacht'];
const SIOFRA_IDS = ['siofra-airt', 'wylie-choinnich'];
const FINTAN_IDS = ['rhianu-illwath', 'fintan-airt'];
const STIOFAN_IDS = ['stiofan-airt', 'una-spouse-airt'];
const KEVYN_IDS = ['kevyn-airt', 'roisin-blar'];

export const HOUSE_MAC_AIRT_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-mac-airt',
    title: 'Clan Mac Airt',
    motto: '',
    description: 'Mor-Tiarna-Clan von Tir an Comhchuibhis mit Sitz in Sruthlann; der Clan führt seine sagenhafte Gründung auf den Fianna Colman zurück.',
    emblem: MAC_AIRT_EMBLEM,
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES['mac-airt']
  },
  houses: [
    house(MAC_AIRT_HOUSE_ID, 'Clan Mac Airt', MAC_AIRT_EMBLEM),
    house('house-suileach', 'Clan Mac Suileach', TIR_NA_GORTANNA_HOUSE_EMBLEMS.suileach),
    house('house-cumhail', 'Clan Mac Ard Cumhaill', LEITHEACH_HOUSE_EMBLEMS['mac-ard-cumhaill']),
    house('house-morna', 'Clan Morna'),
    house('house-grawn', 'Haus Grawn', 'assets/images/houses/Ährental/haus-grawn.png'),
    house('house-choinnich', 'Ua’Choinnich', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.choinnich),
    house('house-laidir', 'Ruin’Laidir', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS.laidir),
    house('house-tarvo', 'Clan Fir An’Tarvo', LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo']),
    house('house-draig', 'Haus Draig', TARGETS.draig.emblem),
    house('house-dal-t-saor', 'Dal T’Saor', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['dal-t-saor']),
    house('house-laoch', 'Ruin Ua Laoch', TARGETS.laoch.emblem),
    house('house-cruthin', 'Clan Dál’Cruthin', LEITHEACH_HOUSE_EMBLEMS['dal-cruthin']),
    house('house-cuinn', 'Clan Tir An’Cuinn', LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn']),
    house('house-dyngwn', 'Haus Dyngwn', TARGETS.dyngwn.emblem),
    house('house-chulainn', 'Haus Chulainn'),
    house('house-gwyvern', 'Haus Gwyvern', TARGETS.gwyvern.emblem),
    house('house-gortach', 'Ru’Gortach', TIR_NA_TONN_HOUSE_EMBLEMS.gortach),
    house('house-amrhan', 'Clan Ua’Amhran', TIR_NA_SRUTH_HOUSE_EMBLEMS.amrhan),
    house('house-gealach', 'Clan Ua’Gaelach', LEITHEACH_HOUSE_EMBLEMS['ua-gaelach']),
    house('house-caoimhe', 'Clan Nic Caoimhe', TIR_NA_GORTANNA_HOUSE_EMBLEMS['nic-caoimhe']),
    house('house-gallchobhair', 'Fir An’Gallchobhair', TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair),
    house('house-illwath', 'Haus Illwath'),
    house('house-durthacht', 'Haus Durthacht'),
    house('house-nic-blar', 'Clan Nic Blar', TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS['nic-blar']),
    house('house-ceallaigh', 'Haus Ceallaigh')
  ],
  persons: [
    person('colman-founder-airt', 'Colman Airt', 'male', '????', '????', MAC_AIRT_HOUSE_ID, {
      tags: ['Gründer', 'Fianna'],
      notes: 'Sagenhafter Fianna und Stammvater. Colman erhielt ein Lehen am Rand Ceitheachs; die daraus erwachsene Siedlung wurde zum späteren Sruthlann.'
    }),
    spouse('blathnat-spouse-airt', 'Bláthnat', 'female', '????', '????'),
    person('ultach-airt', 'Ultach Airt', 'male', '????', '????'),
    spouse('maonach-suileach', 'Maonach Suileach', 'female', '????', '????', 'house-suileach'),
    person('sweeney-airt', 'Sweeney Airt', 'male', '????', '????'),
    spouse('laoiseach-spouse-airt', 'Laoiseach', 'female', '????', '????'),

    awayWoman('vencha-airth', 'Vencha Airt', '1247', '1304', 'cumhaill'),
    spouse('fionn-1245-cumhail', 'Fionn Cumhail', 'male', '1245', '1279', 'house-cumhail'),
    person('neil-airt', 'Neil Airt', 'male', '1249', '1296'),
    spouse('gobnait-spouse-airt', 'Gobnait', 'female', '1252', '1289'),
    spouse('earc-affair-airt', 'Earc', 'female', '1263', '1290', '', {
      familyRole: 'affair',
      title: 'Affäre Neils · Mutter Lorcans',
      tags: ['Affäre']
    }),
    person('cormac-1270-airt', 'Cormac Airt', 'male', '1270', '1340'),
    person('lorcan-1281-airt', 'Lorcan Airt', 'male', '1281', '1350', MAC_AIRT_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastardsohn Neils und Earcs',
      tags: ['Bastard'],
      notes: 'Unehelicher Sohn aus Neils Affäre mit Earc.'
    }),
    spouse('aodhnait-morna', 'Aodhnait Morna', 'female', '1273', '1359', 'house-morna'),

    person('coemgen-airt', 'Coemgen Airt', 'male', '1605', '1659'),
    spouse('rheanne-grawn', 'Rheanne Grawn', 'female', '1606', '1635', 'house-grawn'),
    awayWoman('tegwen-airt', 'Tegwen Airt', '1607', '1684', 'choinnich'),
    spouse('garbhan-choinnich', 'Garbhán Choinnich', 'male', '1603', '1659', 'house-choinnich'),
    person('tadhgan-airt', 'Tadhgán Airt', 'male', '1609', '1671'),
    spouse('ailbhe-laidir', 'Ailbhe Laidir', 'female', '1610', '1679', 'house-laidir'),
    person('unknown-branch-parent-airt', 'Unbekannter Mac Airt', 'male', '????', '', MAC_AIRT_HOUSE_ID, {
      status: 'unknown',
      title: 'Nicht überliefertes Elternteil Muireanns und Eimears',
      notes: 'Die Quelle nennt für Muireann und Eimear lediglich ein unbekanntes Elternpaar.'
    }),
    spouse('unknown-branch-spouse-airt', 'Unbekannte Ehefrau', 'female', '????', '', '', {
      status: 'unknown',
      title: 'Nicht überliefertes Elternteil Muireanns und Eimears'
    }),

    person('seamus-airt', 'Séamus Airt', 'male', '1625', '1684'),
    spouse('mairead-tarvo', 'Mairéad Tarvo', 'female', '1628', '1709', 'house-tarvo'),
    awayWoman('fidelma-airt', 'Fidelma Airt', '1627', '1696', 'draig'),
    spouse('rhiwallon-draig', 'Rhiwallon Draig', 'male', '1625', '1691', 'house-draig'),
    person('turlough-airt', 'Turlough Airt', 'male', '1630', '1691'),
    spouse('saoirse-t-saor', 'Saoirse T’Saor', 'female', '1632', '1694', 'house-dal-t-saor'),
    awayWoman('cliodhna-airt', 'Clíodhna Airt', '1633', '1704', 'laoch'),
    spouse('farrell-laoch', 'Farrell Laoch', 'male', '1629', '1691', 'house-laoch'),

    person('aidan-airt', 'Aidan Airt', 'male', '1646', '1715'),
    spouse('duana-cruthin', 'Duana Cruthin', 'female', '1646', '1700', 'house-cruthin'),
    awayWoman('liadan-airt', 'Líadan Airt', '1650', '1717', 'cuinn', {
      extensions: { registryManagedFields: ['death'] }
    }),
    spouse('brendan-cuinn', 'Brendan Cuinn', 'male', '1648', '1705', 'house-cuinn'),
    person('coleman-airt', 'Coleman Airt', 'male', '1652', ''),
    awayWoman('muireann-airt', 'Muireann Airt', '1654', '1711', 'dyngwn', {
      notes: 'Die Zuordnung Gwynnan/Muireann ist in der Quelle mit einem Fragezeichen versehen.'
    }),
    spouse('gwynnan-dyngwn', 'Gwynnan Dyngwn', 'male', '1653', '1720', 'house-dyngwn'),
    person('eimear-airt', 'Eimear Airt', 'female', '1658', '1703'),
    spouse('seafra-spouse-airt', 'Séafra', 'male', '1660', '1707'),

    person('cormac-1664-airt', 'Cormac Airt', 'male', '1664', ''),
    spouse('faoiltiama-chulainn', 'Faoiltiama Chulainn', 'female', '1668', '', 'house-chulainn'),
    awayWoman('cliodhna-airth', 'Clíodhna Airt', '1666', '', 'cumhaill'),
    spouse('cathair-cumhail', 'Cathair Cumhail', 'male', '1664', '1722', 'house-cumhail'),
    person('iollan-airt', 'Iollan Airt', 'male', '1670', ''),
    awayWoman('beatha-airt', 'Beatha Airt', '1674', '', 'gwyvern'),
    spouse('aethlem-gwyvern', 'Aethlem Gwyvern', 'male', '1670', '', 'house-gwyvern'),
    person('niallan-airt', 'Niallán Airt', 'male', '1677', ''),
    spouse('caoilte-gortach', 'Caoilte Gortach', 'female', '1679', '', 'house-gortach'),
    awayWoman('fiadh-airt', 'Fíadh Airt', '1678', '', 'amrhan'),
    spouse('fionntan-amrhan', 'Fionntan Amrhan', 'male', '1676', '', 'house-amrhan', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('donovan-airt', 'Donovan Airt', 'male', '1680', ''),
    spouse('eilis-choinnich', 'Eilís Choinnich', 'female', '1680', '', 'house-choinnich'),

    person('reamonn-airt', 'Reamonn Airt', 'male', '1688', '1720'),
    spouse('dearbhla-gealach', 'Dearbhla Gealach', 'female', '1694', '', 'house-gealach'),
    person('seamair-airt', 'Seamair Airt', 'male', '1692', '1735'),
    spouse('bebhinn-caoimhe', 'Bébhinn Caoimhe', 'female', '1694', '', 'house-caoimhe'),
    awayWoman('maeve-airt', 'Maeve Airt', '1697', '', 'gallchobhair'),
    spouse('murchad-gallchobhair', 'Murchad Gallchobhair', 'male', '1694', '', 'house-gallchobhair'),
    person('bairre-airt', 'Bairre Airt', 'male', '1699', ''),
    spouse('eibhlin-laidir', 'Eibhlín Laidir', 'female', '1701', '', 'house-laidir', {
      extensions: { registryManagedFields: ['portrait'] }
    }),
    person('coireall-airt', 'Coireall Airt', 'male', '1702', ''),
    spouse('muirenn-durthacht', 'Muirenn Durthacht', 'female', '1704', '', 'house-durthacht'),
    person('siofra-airt', 'Síofra Airt', 'female', '1698', ''),
    spouse('wylie-choinnich', 'Wylie Choinnich', 'male', '1695', '', 'house-choinnich'),
    person('fintan-airt', 'Fintan Airt', 'male', '1700', ''),
    spouse('rhianu-illwath', 'Rhianu Illwath', 'female', '1700', '', 'house-illwath'),
    person('stiofan-airt', 'Stíofán Airt', 'male', '1700', ''),
    spouse('una-spouse-airt', 'Úna', 'female', '????', '', '', { status: 'unknown' }),
    person('kevyn-airt', 'Kevyn Airt', 'male', '1703', ''),
    spouse('roisin-blar', 'Róisín Blár', 'female', '1700', '', 'house-nic-blar'),

    person('cathaoir-1714-airt', 'Cathaoir Airt', 'male', '1714', ''),
    person('damhnait-airt', 'Damhnait Airt', 'female', '1716', ''),
    person('domhnallan-airt', 'Domhnallán Airt', 'male', '1717', ''),
    person('caireach-airt', 'Caireach Airt', 'female', '1718', ''),
    person('sassa-airt', 'Sassa Airt', 'female', '1720', ''),
    person('lorcan-1725-airt', 'Lorcan Airt', 'male', '1725', ''),
    person('cinnfhlaith-ceallaigh', 'Cinnfhlaith Ceallaigh', 'female', '1725', '', 'house-ceallaigh', {
      familyRole: 'ward',
      title: 'Mündel Bairres',
      tags: ['Mündel'],
      notes: 'Cinnfhlaith ist Bairres Mündel und kein leibliches Kind des Paares.'
    }),
    person('cian-airt', 'Cian Airt', 'male', '1722', ''),
    person('ciarach-airt', 'Ciarach Airt', 'female', '1726', ''),
    person('eibhear-airt', 'Éibhear Airt', 'male', '1723', ''),
    person('eibhlin-1727-airt', 'Éibhlín Airt', 'female', '1727', ''),
    person('doireann-airt', 'Doireann Airt', 'female', '1725', ''),
    person('dunlang-airt', 'Dúnlang Airt', 'male', '1730', '')
  ],
  partnerships: [
    endedMarriage('marriage-colman-blathnat-airt', COLMAN_IDS),
    endedMarriage('marriage-ultach-maonach-airt', ULTACH_IDS),
    endedMarriage('marriage-sweeney-laoiseach-airt', SWEENEY_IDS),
    endedMarriage('marriage-fionn-vencha', FIONN_IDS, '1279'),
    endedMarriage('marriage-neil-gobnait-airt', NEIL_GOBNAIT_IDS, '1289'),
    endedMarriage('affair-neil-earc-airt', NEIL_EARC_IDS, '1290', {
      type: 'affair',
      visibility: 'secret',
      notes: 'Außereheliche Beziehung; Ursprung Lorcans.'
    }),
    endedMarriage('marriage-cormac-aodhnait-airt', CORMAC_1270_IDS, '1340'),
    endedMarriage('marriage-coemgen-rheanne-airt', COEMGEN_IDS, '1635'),
    endedMarriage('marriage-garbhan-tegwen-airt', TEGWEN_IDS, '1659'),
    endedMarriage('marriage-tadhgan-ailbhe-airt', TADHGAN_IDS, '1671'),
    createMarriage('marriage-unknown-branch-parents-airt', ...UNKNOWN_BRANCH_IDS, {
      certainty: 'confirmed',
      notes: 'Die Existenz eines Elternpaares ist belegt; beide Namen sind nicht überliefert.'
    }),
    endedMarriage('marriage-seamus-mairead', SEAMUS_IDS, '1684'),
    endedMarriage('marriage-rhiwallon-fidelma', FIDELMA_IDS, '1691'),
    endedMarriage('marriage-turlough-saoirse-airt', TURLOUGH_IDS, '1691'),
    endedMarriage('marriage-farrell-cliodhna', CLIODHNA_1633_IDS, '1691'),
    endedMarriage('marriage-duana-aidan', AIDAN_IDS, '1700'),
    endedMarriage('marriage-brendan-liadan-airt', LIADAN_IDS, '1705'),
    endedMarriage('marriage-gwynnan-muireann-dyngwn', MUIREANN_IDS, '1711', {
      certainty: 'disputed',
      notes: 'Die Quelle kennzeichnet Muireanns Zuordnung zu Gwynnan mit einem Fragezeichen.'
    }),
    endedMarriage('marriage-eimear-seafra-airt', EIMEAR_IDS, '1703'),
    createMarriage('marriage-cormac-faoiltiama-airt', ...CORMAC_1664_IDS),
    endedMarriage('marriage-cathair-cliodhna', CLIODHNA_1666_IDS, '1722'),
    createMarriage('marriage-aethlem-beatha', ...BEATHA_IDS),
    createMarriage('marriage-niallan-caoilte-gortach', ...NIALLAN_IDS),
    createMarriage('marriage-fionntan-fiadh-airt', ...FIADH_IDS),
    createMarriage('marriage-donovan-eilis-airt', ...DONOVAN_IDS),
    endedMarriage('marriage-dearbhla-reamonn', REAMONN_IDS, '1720'),
    endedMarriage('marriage-seamair-bebhinn', SEAMAIR_IDS, '1735'),
    createMarriage('marriage-murchad-maeve', ...MAEVE_IDS),
    createMarriage('marriage-bairre-eibhlin-airt', ...BAIRRE_IDS),
    createMarriage('marriage-coireall-muirenn-airt', ...COIREALL_IDS),
    createMarriage('marriage-siofra-wylie-airt', ...SIOFRA_IDS),
    createMarriage('marriage-rhianu-fintan-illwath', ...FINTAN_IDS),
    createMarriage('marriage-stiofan-una-airt', ...STIOFAN_IDS),
    createMarriage('marriage-kevyn-roisin-airt', ...KEVYN_IDS)
  ],
  parentages: [
    ...childrenOf(['ultach-airt', 'sweeney-airt'], COLMAN_IDS, 'marriage-colman-blathnat-airt'),
    ...childrenOf(['vencha-airth', 'neil-airt'], ULTACH_IDS, 'marriage-ultach-maonach-airt', {
      type: 'claimed',
      certainty: 'disputed',
      notes: 'Die nicht einzeln überlieferten Generationen werden entsprechend der Oberhauptfolge an Ultachs Hauptlinie angeschlossen.',
      extensions: { timeJumpId: 'gap-ultach-vencha-neil-airt' }
    }),
    ...childrenOf(['cormac-1270-airt'], NEIL_GOBNAIT_IDS, 'marriage-neil-gobnait-airt'),
    ...childrenOf(['lorcan-1281-airt'], NEIL_EARC_IDS, 'affair-neil-earc-airt', {
      legitimacy: 'illegitimate'
    }),
    ...childrenOf(
      ['coemgen-airt', 'tegwen-airt', 'tadhgan-airt', 'unknown-branch-parent-airt'],
      CORMAC_1270_IDS,
      'marriage-cormac-aodhnait-airt',
      {
        type: 'claimed',
        certainty: 'disputed',
        notes: 'Zwischen Cormacs Generation und der ab 1605 belegten Linie sind die einzelnen Vorfahren nicht überliefert.',
        extensions: { timeJumpId: 'gap-cormac-coemgen-line-airt' }
      }
    ),
    ...childrenOf(['seamus-airt', 'fidelma-airt', 'turlough-airt'], COEMGEN_IDS, 'marriage-coemgen-rheanne-airt'),
    ...childrenOf(['cliodhna-airt'], TADHGAN_IDS, 'marriage-tadhgan-ailbhe-airt'),
    ...childrenOf(['muireann-airt', 'eimear-airt'], UNKNOWN_BRANCH_IDS, 'marriage-unknown-branch-parents-airt'),
    ...childrenOf(['aidan-airt', 'liadan-airt', 'coleman-airt'], SEAMUS_IDS, 'marriage-seamus-mairead'),
    ...childrenOf(
      ['cormac-1664-airt', 'cliodhna-airth', 'iollan-airt', 'beatha-airt', 'niallan-airt'],
      AIDAN_IDS,
      'marriage-duana-aidan'
    ),
    ...childrenOf(['fiadh-airt', 'donovan-airt'], EIMEAR_IDS, 'marriage-eimear-seafra-airt'),
    ...childrenOf(
      ['reamonn-airt', 'seamair-airt', 'maeve-airt', 'bairre-airt', 'coireall-airt'],
      CORMAC_1664_IDS,
      'marriage-cormac-faoiltiama-airt'
    ),
    ...childrenOf(['siofra-airt', 'fintan-airt'], NIALLAN_IDS, 'marriage-niallan-caoilte-gortach'),
    ...childrenOf(['stiofan-airt', 'kevyn-airt'], DONOVAN_IDS, 'marriage-donovan-eilis-airt'),
    ...childrenOf(['cathaoir-1714-airt', 'damhnait-airt'], REAMONN_IDS, 'marriage-dearbhla-reamonn'),
    ...childrenOf(['domhnallan-airt', 'caireach-airt'], SEAMAIR_IDS, 'marriage-seamair-bebhinn'),
    ...childrenOf(['sassa-airt', 'lorcan-1725-airt'], BAIRRE_IDS, 'marriage-bairre-eibhlin-airt'),
    ...childrenOf(['cinnfhlaith-ceallaigh'], ['bairre-airt'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Cinnfhlaith Ceallaigh ist Bairres Mündel und kein leibliches Kind.'
    }),
    ...childrenOf(['cian-airt', 'ciarach-airt'], COIREALL_IDS, 'marriage-coireall-muirenn-airt'),
    ...childrenOf(['eibhear-airt', 'eibhlin-1727-airt'], FINTAN_IDS, 'marriage-rhianu-fintan-illwath'),
    ...childrenOf(['doireann-airt'], STIOFAN_IDS, 'marriage-stiofan-una-airt'),
    ...childrenOf(['dunlang-airt'], KEVYN_IDS, 'marriage-kevyn-roisin-airt')
  ],
  cadetBranches: [
    marriedAway('married-away-cumhaill-vencha', 'marriage-fionn-vencha', 'cumhaill'),
    marriedAway('married-away-choinnich-tegwen', 'marriage-garbhan-tegwen-airt', 'choinnich'),
    marriedAway('married-away-draig-fidelma', 'marriage-rhiwallon-fidelma', 'draig'),
    marriedAway('married-away-laoch-cliodhna-1633', 'marriage-farrell-cliodhna', 'laoch'),
    marriedAway('married-away-cuinn-liadan', 'marriage-brendan-liadan-airt', 'cuinn'),
    marriedAway('married-away-dyngwn-muireann', 'marriage-gwynnan-muireann-dyngwn', 'dyngwn'),
    marriedAway('married-away-cumhaill-cliodhna-1666', 'marriage-cathair-cliodhna', 'cumhaill'),
    marriedAway('married-away-gwyvern-beatha', 'marriage-aethlem-beatha', 'gwyvern'),
    marriedAway('married-away-amrhan-fiadh', 'marriage-fionntan-fiadh-airt', 'amrhan'),
    marriedAway('married-away-gallchobhair-maeve', 'marriage-murchad-maeve', 'gallchobhair')
  ],
  timeJumps: [
    {
      id: 'gap-ultach-vencha-neil-airt',
      parentPartnershipId: 'marriage-ultach-maonach-airt',
      childIds: ['vencha-airth', 'neil-airt'],
      years: 0,
      fromYear: '????',
      toYear: '1247',
      label: 'Nicht einzeln überlieferte Generationen bis Vencha und Neil',
      notes: 'Die Oberhauptfolge führt über Ultach zu Neil; die dazwischenliegenden Personen sind nicht benannt.',
      extensions: {}
    },
    {
      id: 'gap-cormac-coemgen-line-airt',
      parentPartnershipId: 'marriage-cormac-aodhnait-airt',
      childIds: ['coemgen-airt', 'tegwen-airt', 'tadhgan-airt', 'unknown-branch-parent-airt'],
      years: 265,
      fromYear: '1340',
      toYear: '1605',
      label: '265 Jahre nicht einzeln überlieferte Generationen',
      notes: 'Die Quelle setzt zwischen Cormacs Linie und der Generation ab 1605 eine ausdrückliche Punktreihe.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-colman-blathnat-airt',
    houseId: MAC_AIRT_HOUSE_ID,
    crestSubtitle: 'Mor Tiarnatum Tir an Comhchuibhis · Sruthlann · Fürstentum Leitheach',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'colman-founder-airt',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Clan Mac Airt (bereitgestellte HTML-Familienakte)',
    sourceNote: 'Genealogie, Lebensdaten, Oberhauptfolge und Erbfolge folgen der bereitgestellten Mac-Airt-Akte. Colman gilt als sagenhafter Fianna-Gründer; die beiden Punktreihen bleiben als serielle Überlieferungslücken sichtbar. Muireann und Eimear sind ausdrücklich Kinder eines namentlich unbekannten Elternpaares; dessen Anschluss an die frühneuzeitliche Mac-Airt-Linie bleibt beansprucht und umgeht eine erfundene konkrete Elternschaft. Reamonns unmögliches Todesjahr 1620 wird zu 1720 und Seamairs 1635 zu 1735 berichtigt; die führende 17 fehlt in der Quelle, beide sind dort als Cormacs verstorbene älteste Söhne ausgewiesen. Cinnfhlaith Ceallaigh ist Bairres Mündel und kein leibliches Kind. Kinder wegverheirateter Linien werden nur in den jeweiligen Zielakten fortgeführt. Alle Bildangaben der alten Mac-Airt-Quelle wurden verworfen; ausschließlich bereits kanonische Porträts eindeutig identischer Personen aus bestehenden Stammbäumen werden gespiegelt. Die unbenannten Verlobtenfelder der jüngsten Generation werden nicht als Personen importiert.',
    sourceRevision: 6,
    blankFamily: false,
    preparedMainLine: false,
    inheritance: Object.freeze({
      title: 'Mor Tiarna von Tir an Comhchuibhis',
      headOrder: Object.freeze([
        'colman-founder-airt',
        'ultach-airt',
        'neil-airt',
        'cormac-1270-airt',
        'coemgen-airt',
        'seamus-airt',
        'aidan-airt',
        'cormac-1664-airt'
      ]),
      publishedOrder: Object.freeze(['bairre-airt'])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: Object.freeze([]),
      reusedPersonIds: HOUSE_MAC_AIRT_REUSED_PORTRAIT_IDS,
      sourceImagesIgnored: true,
      genericSourceSilhouettesIgnored: true
    }),
    principality: 'Leitheach',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    historicalStatus: 'active',
    directMorTiarnaBarony: true,
    albicRank: 'mor-tiarna',
    administrativeRole: 'Mor Tiarna von Tir an Comhchuibhis',
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
    registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['houseId'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      houses: [],
      persons: ['haus-mac-airt-gruender', 'haus-mac-airt-gruenderin'],
      partnerships: ['marriage-haus-mac-airt-founders'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  }
});
