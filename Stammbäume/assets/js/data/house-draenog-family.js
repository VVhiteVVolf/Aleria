import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_DRAENOG_PORTRAITS } from './house-draenog-portraits.js';

const DRAENOG_HOUSE_ID = 'house-draenog';
const DRAENOG_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.draenog;
const FOUNDER_TIME_JUMP_ID = 'gap-draenog-founders-to-llywellyn-rhianu';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  canwyll: 'assets/images/houses/Silberinsel/Silberbucht/haus-canwyll.png',
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  draenog: DRAENOG_EMBLEM,
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  hwyaden: 'assets/images/houses/Weidebucht/Borkenstein/haus-hwyaden.png',
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  marwolaeth: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-marwolaeth.png',
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  mwyalchen: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-mwyalchen.png',
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  saith: 'assets/images/houses/Silberinsel/Silberbucht/haus-saith.png',
  wivern: GRAUE_WEITE_HOUSE_EMBLEMS.wivern,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

const HOUSE_HEAD_IDS = new Set([
  'mathonwy-founder-draenog',
  'llywellyn-draenog',
  'limwris-draenog',
  'sieffre-draenog',
  'deiniol-draenog'
]);
const HEIR_IDS = new Set([
  'mathonwy-draenog',
  'ninian-draenog',
  'gower-draenog',
  'arfon-draenog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? DRAENOG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_DRAENOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === DRAENOG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
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
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['mathonwy-founder-draenog', 'ariana-founder-draenog'],
  llywellyn: ['gladdie-gwefrydd', 'llywellyn-draenog'],
  rhianu: ['dirmyg-pysgod', 'rhianu-draenog'],
  limwris: ['gwydolwyn-marwolaeth', 'limwris-draenog'],
  cariad: ['bors-pendrag', 'cariad-draenog'],
  ariana: ['penllyn-wylan', 'ariana-draenog'],
  sieffre: ['enfys-saith', 'sieffre-draenog'],
  arianwen: ['berwyn-morfil', 'arianwen-draenog'],
  deiniol: ['deiniol-draenog', 'tanwyn-coedwig'],
  gwerful: ['grugyn-hwyaden', 'gwerful-draenog'],
  banw: ['banw-draenog', 'idwallon-tylwyth'],
  meical: ['meical-draenog', 'lleucu-walvers'],
  mathonwy: ['lunet-neidr', 'mathonwy-draenog'],
  llwyn: ['pedr-brithyll', 'llwyn-draenog'],
  zethyra: ['zethyra-draenog', 'ulysses-1672-wivern'],
  ywain: ['gwenifer-canwyll', 'ywain-draenog'],
  siriol: ['caled-illewod', 'siriol-draenog'],
  tarah: ['iorwerth-1685-grawn', 'tarah-draenog'],
  ninian: ['ninian-draenog', 'enora-blaidd'],
  erwm: ['wynthonya-mwyalchen', 'erwm-draenog'],
  eluned: ['selwyn-aderyn', 'eluned-draenog'],
  gwydion: ['gwydion-draenog', 'faelan-illygoden'],
  briallen: ['briallen-draenog', 'uthyr-gwaedlyd'],
  waleran: ['waleran-draenog', 'eimear-ceallaigh']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-mathonwy-ariana-draenog': COUPLES.founders,
  'marriage-gladdie-llywellyn': COUPLES.llywellyn,
  'marriage-dirmyg-rhianu': COUPLES.rhianu,
  'marriage-gwydolwyn-limwris-marwolaeth': COUPLES.limwris,
  'marriage-bors-cariad': COUPLES.cariad,
  'marriage-penllyn-ariana': COUPLES.ariana,
  'marriage-enfys-sieffre-saith': COUPLES.sieffre,
  'marriage-berwyn-arianwen-morfil': COUPLES.arianwen,
  'marriage-deiniol-tanwyn-coedwig': COUPLES.deiniol,
  'marriage-grugyn-gwerful-hwyaden': COUPLES.gwerful,
  'marriage-banw-idwallon-draenog': COUPLES.banw,
  'marriage-meical-lleucu-draenog': COUPLES.meical,
  'marriage-lunet-mathonwy': COUPLES.mathonwy,
  'marriage-pedr-llwyn-brithyll': COUPLES.llwyn,
  'marriage-ulysses-zethyra-wivern': COUPLES.zethyra,
  'marriage-gwenifer-ywain-canwyll': COUPLES.ywain,
  'marriage-caled-siriol': COUPLES.siriol,
  'marriage-iorwerth-tarah': COUPLES.tarah,
  'marriage-ninian-enora-draenog': COUPLES.ninian,
  'marriage-wynthonya-erwm-mwyalchen': COUPLES.erwm,
  'marriage-selwyn-eluned': COUPLES.eluned,
  'marriage-gwydion-faelan-draenog': COUPLES.gwydion,
  'marriage-briallen-uthyr-draenog': COUPLES.briallen,
  'marriage-waleran-eimear-draenog': COUPLES.waleran
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'draenog-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: options.targetFamilyId || houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || '',
    extensions: {
      registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem']
    }
  });
}

export const HOUSE_DRAENOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-draenog',
    title: "Haus Draenog O'Llanforwyn",
    motto: 'Tarian yn y Ffydd. · Schild im Glauben.',
    description: 'Priester- und Ritterfamilie sowie Baronshaus des Silberwaldes mit Sitz in Llanforwyn.',
    emblem: DRAENOG_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.draenog
  },
  houses: [
    house(DRAENOG_HOUSE_ID, "Haus Draenog O'Llanforwyn", HOUSE_EMBLEMS.draenog),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-saith', 'Haus Saith', HOUSE_EMBLEMS.saith),
    house('house-morfil', "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-walvers', 'Haus Walvers'),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern),
    house('house-canwyll', 'Haus Canwyll', HOUSE_EMBLEMS.canwyll),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-blaidd-tredegar', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaidd),
    house('house-mwyalchen', 'Haus Mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-illygoden-tredegar', "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
    house('house-gwaedlyd-tredegar', "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
    house('house-ceallaigh', 'Haus Ceallaigh')
  ],
  persons: [
    person('mathonwy-founder-draenog', 'Mathonwy Draenog', 'male', '????', '????', {
      familyRole: 'founder',
      title: 'Gründer und erster Baron des Hauses Draenog'
    }),
    person('ariana-founder-draenog', 'Ariana', 'female', '????', '????', {
      familyRole: 'founder',
      title: 'Mitgründerin des Hauses Draenog'
    }),

    person('llywellyn-draenog', 'Llywellyn Draenog', 'male', '1582', '1652', {
      title: 'Baron des Hauses Draenog bis 1652'
    }),
    awayWoman('rhianu-draenog', 'Rhianu Draenog', '1593', '????', 'Haus Pysgod', {
      notes: 'Die ausgearbeitete Pysgod-Gegenakte lässt das Todesjahr offen; die Draenog-Altquelle nennt 1688.'
    }),
    spouse('gladdie-gwefrydd', 'Gladdie', 'female', '1590', '1644', 'house-gwefrydd', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('dirmyg-pysgod', 'Dirmyg Pysgod', 'male', '1594', '1690', 'house-pysgod'),

    person('limwris-draenog', 'Limwris Draenog', 'male', '1604', '1680', {
      title: 'Baron des Hauses Draenog 1652–1680'
    }),
    awayWoman('cariad-draenog', 'Cariad Draenog', '1606', '1683', 'Haus Pendrag', {
      notes: 'Die ausgearbeitete Pendrag-Gegenakte ist für das Todesjahr kanonisch; die Draenog-Altquelle nennt 1725.'
    }),
    awayWoman('ariana-draenog', 'Ariana Draenog', '1610', '1677', 'Haus Wylan', {
      notes: 'Die ausgearbeitete Wylan-Gegenakte ist für das Todesjahr kanonisch; die Draenog-Altquelle nennt 1715.'
    }),
    spouse('gwydolwyn-marwolaeth', 'Gwydolwyn Marwolaeth', 'female', '1608', '1679', 'house-marwolaeth', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('bors-pendrag', 'Bors Pendrag', 'male', '1600', '1653', 'house-pendrag'),
    spouse('penllyn-wylan', 'Penllyn Wylan', 'male', '1610', '1675', 'house-wylan'),

    person('sieffre-draenog', 'Sieffre Draenog', 'male', '1625', '1704', {
      title: 'Baron des Hauses Draenog 1680–1704'
    }),
    awayWoman('arianwen-draenog', 'Arianwen Draenog', '1632', '1715', "Haus Morfil O'Talsarn", {
      notes: 'Die ausgearbeitete Morfil-Gegenakte ist für das Todesjahr kanonisch; die Draenog-Altquelle nennt 1729.'
    }),
    spouse('enfys-saith', 'Enfys Saith', 'female', '1629', '1698', 'house-saith', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('berwyn-morfil', 'Berwyn Morfil', 'male', '1631', '1707', 'house-morfil', {
      title: 'Baron des Hauses Morfil 1682–1707'
    }),

    person('deiniol-draenog', 'Deiniol Draenog', 'male', '1646', '', {
      title: 'Baron von Llanforwyn seit 1704'
    }),
    awayWoman('gwerful-draenog', 'Gwerful Draenog', '1648', '', 'Haus Hwyaden'),
    awayWoman('banw-draenog', 'Banw Draenog', '1650', '1695', 'Haus Tylwyth'),
    person('meical-draenog', 'Meical Draenog', 'male', '1652', ''),
    spouse('tanwyn-coedwig', 'Tanwyn Coedwig', 'female', '1652', '1720', 'house-coedwig', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('grugyn-hwyaden', 'Grugyn Hwyaden', 'male', '1652', '1717', 'house-hwyaden', {
      title: 'Baron von Trefyddin 1703–1717'
    }),
    spouse('idwallon-tylwyth', 'Idwallon Tylwyth', 'male', '1650', '1695', 'house-tylwyth'),
    spouse('lleucu-walvers', 'Lleucu Walvers', 'female', '1656', '1712', 'house-walvers', {
      title: 'Wegverheiratet an Haus Draenog'
    }),

    person('mathonwy-draenog', 'Mathonwy Draenog', 'male', '1670', '', {
      title: 'Erster Erbe des Hauses Draenog'
    }),
    awayWoman('llwyn-draenog', 'Llwyn Draenog', '1675', '', 'Haus Brithyll'),
    awayWoman('zethyra-draenog', 'Zethyra Draenog', '1677', '', 'Haus Wivern'),
    person('ywain-draenog', 'Ywain Draenog', 'male', '1678', ''),
    awayWoman('siriol-draenog', 'Siriol Draenog', '1678', '', 'Haus Illewod'),
    spouse('lunet-neidr', 'Lunet Neidr', 'female', '1672', '', 'house-neidr', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('pedr-brithyll', 'Pedr Brithyll', 'male', '1674', '', 'house-brithyll'),
    spouse('ulysses-1672-wivern', 'Ulysses Wivern', 'male', '1672', '', 'house-wivern', {
      title: 'Erster Erbe des Hauses Wivern'
    }),
    spouse('gwenifer-canwyll', 'Gwenifer Canwyll', 'female', '1675', '', 'house-canwyll', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('caled-illewod', 'Caled Illewod', 'male', '1675', '', 'house-illewod'),

    awayWoman('tarah-draenog', 'Tarah Draenog', '1689', '', 'Haus Grawn'),
    person('ninian-draenog', 'Ninian Draenog', 'male', '1695', '', {
      title: 'Zweiter Erbe des Hauses Draenog'
    }),
    person('erwm-draenog', 'Erwm Draenog', 'male', '1697', ''),
    awayWoman('eluned-draenog', 'Eluned Draenog', '1699', '', 'Haus Aderyn'),
    person('gwydion-draenog', 'Gwydion Draenog', 'male', '1698', ''),
    awayWoman('briallen-draenog', 'Briallen Draenog', '1698', '', "Haus Gwaedlyd O'Tredegar"),
    person('waleran-draenog', 'Waleran Draenog', 'male', '1700', ''),
    spouse('iorwerth-1685-grawn', 'Iorwerth Grawn', 'male', '1685', '', 'house-grawn', {
      title: 'Graf des Ährentals seit 1720'
    }),
    spouse('enora-blaidd', 'Enora Blaidd', 'female', '1699', '', 'house-blaidd-tredegar', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('wynthonya-mwyalchen', 'Wynthonya Mwyalchen', 'female', '1699', '', 'house-mwyalchen', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('selwyn-aderyn', 'Selwyn Aderyn', 'male', '1698', '', 'house-aderyn'),
    spouse('faelan-illygoden', 'Faelan Illygoden', 'female', '1696', '', 'house-illygoden-tredegar', {
      title: 'Wegverheiratet an Haus Draenog'
    }),
    spouse('uthyr-gwaedlyd', 'Uthyr Gwaedlyd', 'male', '1696', '', 'house-gwaedlyd-tredegar'),
    spouse('eimear-ceallaigh', 'Eimear Ceallaigh', 'female', '1700', '', 'house-ceallaigh', {
      title: 'Wegverheiratet an Haus Draenog'
    }),

    person('gower-draenog', 'Gower Draenog', 'male', '1720', '', {
      title: 'Dritter Erbe des Hauses Draenog'
    }),
    person('gladdy-draenog', 'Gladdy Draenog', 'female', '1720', ''),
    person('arfon-draenog', 'Arfon Draenog', 'male', '1723', '', {
      title: 'Vierter Erbe des Hauses Draenog'
    }),
    person('rhys-draenog', 'Rhys Draenog', 'male', '1722', ''),
    person('prys-draenog', 'Prys Draenog', 'male', '1725', ''),
    person('uvel-draenog', 'Uvel Draenog', 'male', '1724', ''),
    person('ynesa-draenog', 'Ynesa Draenog', 'female', '1726', ''),
    person('bysen-draenog', 'Bysen Draenog', 'male', '1725', ''),
    person('ulyana-draenog', 'Ulyana Draenog', 'female', '1727', ''),
    person('lowenna-draenog', 'Lowenna Draenog', 'female', '????', '')
  ],
  partnerships: [
    createMarriage('marriage-mathonwy-ariana-draenog', ...COUPLES.founders),
    createMarriage('marriage-gladdie-llywellyn', ...COUPLES.llywellyn),
    createMarriage('marriage-dirmyg-rhianu', ...COUPLES.rhianu),
    createMarriage('marriage-gwydolwyn-limwris-marwolaeth', ...COUPLES.limwris),
    createMarriage('marriage-bors-cariad', ...COUPLES.cariad),
    createMarriage('marriage-penllyn-ariana', ...COUPLES.ariana),
    createMarriage('marriage-enfys-sieffre-saith', ...COUPLES.sieffre, { status: 'ended', end: '1698' }),
    createMarriage('marriage-berwyn-arianwen-morfil', ...COUPLES.arianwen, { status: 'ended', end: '1707' }),
    createMarriage('marriage-deiniol-tanwyn-coedwig', ...COUPLES.deiniol, { status: 'ended', end: '1720' }),
    createMarriage('marriage-grugyn-gwerful-hwyaden', ...COUPLES.gwerful, { status: 'ended', end: '1717' }),
    createMarriage('marriage-banw-idwallon-draenog', ...COUPLES.banw, { status: 'ended', end: '1695' }),
    createMarriage('marriage-meical-lleucu-draenog', ...COUPLES.meical, { status: 'ended', end: '1712' }),
    createMarriage('marriage-lunet-mathonwy', ...COUPLES.mathonwy),
    createMarriage('marriage-pedr-llwyn-brithyll', ...COUPLES.llwyn),
    createMarriage('marriage-ulysses-zethyra-wivern', ...COUPLES.zethyra),
    createMarriage('marriage-gwenifer-ywain-canwyll', ...COUPLES.ywain),
    createMarriage('marriage-caled-siriol', ...COUPLES.siriol),
    createMarriage('marriage-iorwerth-tarah', ...COUPLES.tarah),
    createMarriage('marriage-ninian-enora-draenog', ...COUPLES.ninian),
    createMarriage('marriage-wynthonya-erwm-mwyalchen', ...COUPLES.erwm),
    createMarriage('marriage-selwyn-eluned', ...COUPLES.eluned),
    createMarriage('marriage-gwydion-faelan-draenog', ...COUPLES.gwydion),
    createMarriage('marriage-briallen-uthyr-draenog', ...COUPLES.briallen),
    createMarriage('marriage-waleran-eimear-draenog', ...COUPLES.waleran)
  ],
  parentages: [
    ...childrenOf(['llywellyn-draenog', 'rhianu-draenog'], 'marriage-mathonwy-ariana-draenog', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Llywellyn und Rhianu.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['limwris-draenog', 'cariad-draenog', 'ariana-draenog'], 'marriage-gladdie-llywellyn'),
    ...childrenOf(['sieffre-draenog', 'arianwen-draenog'], 'marriage-gwydolwyn-limwris-marwolaeth'),
    ...childrenOf(['deiniol-draenog', 'gwerful-draenog', 'banw-draenog', 'meical-draenog'], 'marriage-enfys-sieffre-saith'),
    ...childrenOf(['mathonwy-draenog', 'llwyn-draenog', 'zethyra-draenog'], 'marriage-deiniol-tanwyn-coedwig'),
    ...childrenOf(['ywain-draenog', 'siriol-draenog'], 'marriage-meical-lleucu-draenog'),
    ...childrenOf(['tarah-draenog', 'ninian-draenog', 'erwm-draenog', 'eluned-draenog'], 'marriage-lunet-mathonwy'),
    ...childrenOf(['gwydion-draenog', 'briallen-draenog', 'waleran-draenog'], 'marriage-gwenifer-ywain-canwyll'),
    ...childrenOf(['gower-draenog', 'gladdy-draenog', 'arfon-draenog'], 'marriage-ninian-enora-draenog'),
    ...childrenOf(['rhys-draenog', 'prys-draenog'], 'marriage-wynthonya-erwm-mwyalchen'),
    ...childrenOf(['uvel-draenog', 'ynesa-draenog'], 'marriage-gwydion-faelan-draenog'),
    ...childrenOf(['bysen-draenog', 'ulyana-draenog', 'lowenna-draenog'], 'marriage-waleran-eimear-draenog')
  ],
  cadetBranches: [
    marriedAway('married-away-rhianu-draenog-pysgod', "Haus Pysgod O'Tredegar", 'marriage-dirmyg-rhianu', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-cariad-draenog-pendrag', 'Haus Pendrag', 'marriage-bors-cariad', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-ariana-draenog-wylan', 'Haus Wylan', 'marriage-penllyn-ariana', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-arianwen-draenog-morfil', "Haus Morfil O'Talsarn", 'marriage-berwyn-arianwen-morfil', 'house-morfil', HOUSE_EMBLEMS.morfil),
    marriedAway('married-away-gwerful-draenog-hwyaden', 'Haus Hwyaden', 'marriage-grugyn-gwerful-hwyaden', 'house-hwyaden', HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-banw-draenog-tylwyth', 'Haus Tylwyth', 'marriage-banw-idwallon-draenog', 'house-tylwyth'),
    marriedAway('married-away-llwyn-draenog-brithyll', 'Haus Brithyll', 'marriage-pedr-llwyn-brithyll', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-zethyra-draenog-wivern', 'Haus Wivern', 'marriage-ulysses-zethyra-wivern', 'house-wivern', HOUSE_EMBLEMS.wivern),
    marriedAway('married-away-siriol-draenog-illewod', 'Haus Illewod', 'marriage-caled-siriol', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-tarah-draenog-grawn', 'Haus Grawn', 'marriage-iorwerth-tarah', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-eluned-draenog-aderyn', 'Haus Aderyn', 'marriage-selwyn-eluned', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-briallen-draenog-gwaedlyd', "Haus Gwaedlyd O'Tredegar", 'marriage-briallen-uthyr-draenog', 'house-gwaedlyd-tredegar', HOUSE_EMBLEMS.gwaedlyd, {
      targetFamilyId: 'haus-gwaedlyd-tredegar'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-mathonwy-ariana-draenog',
      parentPersonId: '',
      childIds: ['llywellyn-draenog', 'rhianu-draenog'],
      years: 0,
      fromYear: '????',
      toYear: '1582',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst darunter Llywellyn und Rhianu.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-mathonwy-ariana-draenog',
    houseId: DRAENOG_HOUSE_ID,
    crestSubtitle: 'Baronshaus des Silberwaldes · Sitz Llanforwyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Vollständiger Stammbaum: Der früheste Gründer bleibt Layout-Anker;
    // kein späterer Fokuspunkt darf Seitenzweige ausblenden.
    focusPersonId: 'mathonwy-founder-draenog',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Draenog O'Llanforwyn (bereitgestellte Altdaten)",
    sourceNote: 'Der vollständige Stammbaum beginnt beim unbekannt datierten Gründerpaar und führt nach Hausknoten und genau einem seriellen Zeitsprung zu Llywellyn und Rhianu. Alle zwölf Draenog-Frauen, deren Linien in anderen Häusern enden, besitzen direkt an ihrer Ehe einen Wegverheiratet-Knoten. Kinder solcher Ehen werden nur dort geführt, wo die jeweilige Hauslinie tatsächlich fortgesetzt wird. Geteilte Weltpersonen, Partnerschafts-IDs und Porträts mit bereits ausgearbeiteten Gegenakten werden unverändert wiederverwendet. Bei Rhianu, Cariad, Ariana und Arianwen gelten die vorhandenen Gegenakten als kanonisch; abweichende Todesjahre der Draenog-Altquelle sind an den Personen dokumentiert. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
