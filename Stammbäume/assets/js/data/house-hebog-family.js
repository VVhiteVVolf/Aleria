import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_HEBOG_PORTRAITS } from './house-hebog-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const HEBOG_HOUSE_ID = 'house-hebog';
const HEBOG_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.hebog;
const FOUNDER_TIME_JUMP_ID = 'gap-hebog-mordred-to-ivain-hafren';
const EARLY_BRANCH_TIME_JUMP_ID = 'gap-hebog-ivain-hafren-to-hywel-myfanwy';
const LATE_BRANCH_TIME_JUMP_ID = 'gap-hebog-hywel-myfanwy-to-trahaern-malvina';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  hebog: HEBOG_EMBLEM,
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  llwynog: SONNENKUESTE_HOUSE_EMBLEMS.llwynog,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  tirAddawol: WEIDEBUCHT_HOUSE_EMBLEMS['tir-addawol'],
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan
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

const SUCCESSION_TITLES = Object.freeze({
  'mordred-aderyn': 'Gründer und erster Baron des Hauses Hebog',
  'ivain-hebog': 'Baron des Hauses Hebog bis 1201',
  'hywel-hebog': 'Baron des Hauses Hebog bis 1341',
  'trahaern-hebog': 'Baron des Hauses Hebog bis 1676',
  'mordred-hebog': 'Baron des Hauses Hebog 1676–1689',
  'thalen-hebog': 'Baron des Hauses Hebog 1689–1692',
  'sabrian-hebog': 'Baron des Hauses Hebog seit 1692',
  'meilyr-hebog': 'Erster Erbe des Hauses Hebog',
  'leolin-hebog': 'Zweiter Erbe des Hauses Hebog'
});

const HOUSE_HEAD_IDS = new Set([
  'mordred-aderyn',
  'ivain-hebog',
  'hywel-hebog',
  'trahaern-hebog',
  'mordred-hebog',
  'thalen-hebog',
  'sabrian-hebog'
]);

const MAIN_LINE_IDS = new Set(['meilyr-hebog', 'leolin-hebog']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? HEBOG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_HEBOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === HEBOG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
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
    tags: [...(options.tags || []), options.engagement ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function endedMarriage(id, participantIds, end = '') {
  return createMarriage(id, ...participantIds, {
    status: 'ended',
    end,
    extensions: { registryManagedFields: ['status', 'end'] }
  });
}

const COUPLES = Object.freeze({
  founders: ['mordred-aderyn', 'thalena-ancient-spouse'],
  ivain: ['ivain-hebog', 'raewyn-aderyn'],
  hafren: ['hafren-hebog', 'noghan-airdmhor'],
  hywel: ['gwenlian-gaeth', 'hywel-hebog'],
  myfanwy1270: ['gwalchgwyn-aderyn', 'myfanwy-hebog'],
  trahaern: ['myfanwy-gaeth', 'trahaern-hebog'],
  malvina: ['kelyddon-mwyalchen', 'malvina-hebog-mwyalchen'],
  mordred: ['mordred-hebog', 'ingeborg-feuerhaar'],
  armela: ['lunet-crefyddol', 'armela-hebog'],
  thalen: ['thalen-hebog', 'tesni-aderyn'],
  meredyddwynn: ['meredyddwynn-hebog', 'maiwyn-gwarchod'],
  sabrian: ['sabrian-hebog', 'klothilde-ridderspore'],
  ewynn: ['enevold-eryr', 'ewynn-hebog-eryr'],
  griffith: ['liliwen-gwyvern', 'griffith-hebog'],
  meilyr: ['tudful-1700-gaeth', 'meilyr-hebog'],
  thalena: ['lucan-tylluan', 'thalena-hebog'],
  saeth: ['saeth-hebog', 'gildas-ilyuncu'],
  sath: ['sath-hebog', 'karelia-goldbaer'],
  chryl: ['conway-mwyalchen', 'chryl-hebog'],
  leolin: ['dilys-aderyn', 'leolin-hebog'],
  glinda: ['iorwerth-gwefrydd', 'glinda-hebog'],
  eurig: ['brina-llwynog', 'eurig-hebog'],
  aliza: ['bhreac-tir-addawol', 'aliza-hebog']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-mordred-thalena-ancient': COUPLES.founders,
  'marriage-ivain-raewyn': COUPLES.ivain,
  'marriage-hafren-noghan-hebog': COUPLES.hafren,
  'marriage-gwenlian-hywel-hebog': COUPLES.hywel,
  'marriage-gwalchgwyn-myfanwy': COUPLES.myfanwy1270,
  'marriage-myfanwy-trahaern-hebog': COUPLES.trahaern,
  'marriage-kelyddon-malvina-mwyalchen': COUPLES.malvina,
  'marriage-mordred-ingeborg-hebog': COUPLES.mordred,
  'marriage-lunet-armela-crefyddol': COUPLES.armela,
  'marriage-thalen-tesni': COUPLES.thalen,
  'marriage-maiwyn-meredyddwynn-gwarchod': COUPLES.meredyddwynn,
  'marriage-sabrian-klothilde-hebog': COUPLES.sabrian,
  'marriage-enevold-ewynn-eryr': COUPLES.ewynn,
  'marriage-liliwen-griffith': COUPLES.griffith,
  'marriage-tudful-meilyr-hebog': COUPLES.meilyr,
  'marriage-lucan-thalena-tylluan': COUPLES.thalena,
  'marriage-saeth-gildas-ilyuncu': COUPLES.saeth,
  'marriage-sath-karelia-hebog': COUPLES.sath,
  'marriage-conway-chryl-mwyalchen': COUPLES.chryl,
  'engagement-dilys-leolin': COUPLES.leolin,
  'engagement-iorwerth-glinda-hebog': COUPLES.glinda,
  'engagement-brina-eurig-hebog-llwynog': COUPLES.eurig,
  'engagement-bhreac-aliza-tir-addawol': COUPLES.aliza
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'hebog-parentage',
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
    notes: options.notes || ''
  });
}

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear, sharedParentPartnershipIds = []) {
  return {
    id,
    parentPartnershipId,
    sharedParentPartnershipIds,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter Generationentrenner: genau ein gemeinsamer Zeitsprung folgt unter allen zuführenden Paaren; er steht niemals parallel zu Personen, Hausknoten oder weiteren Zeitsprüngen.',
    extensions: {}
  };
}

export const HOUSE_HEBOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-hebog',
    title: "Haus Hebog O'Talwyn",
    motto: '',
    description: 'Baronenhaus von Talwyn und alter Kadettenzweig des gräflichen Hauses Aderyn.',
    emblem: HEBOG_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.hebog
  },
  houses: [
    house(HEBOG_HOUSE_ID, "Haus Hebog O'Talwyn", HEBOG_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-airdmhor', 'Haus Airdmhor'),
    house('house-gaeth', "Haus Gaeth O'Penllyn", HOUSE_EMBLEMS.gaeth),
    house('house-mwyalchen', "Haus Mwyalchen O'Penbryn", HOUSE_EMBLEMS.mwyalchen),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod),
    house('house-ridderspore', 'Haus Ridderspore'),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-tylluan', "Haus Tylluan O'Penbryn", HOUSE_EMBLEMS.tylluan),
    house('house-ilyuncu', "Haus Ilyuncu O'Caer Gwennol", HOUSE_EMBLEMS.ilyuncu),
    house('house-goldbaer', 'Haus Goldbär'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-llwynog', "Haus Llwynog O'Aberon", HOUSE_EMBLEMS.llwynog),
    house('house-tir-addawol', 'Haus Tir Addawol', HOUSE_EMBLEMS.tirAddawol)
  ],
  persons: [
    person('mordred-aderyn', 'Mordred Aderyn', 'male', '????', '????', {
      houseId: 'house-aderyn',
      familyRole: 'core'
    }),
    spouse('thalena-ancient-spouse', 'Thalena', 'female', '????', '????'),

    person('ivain-hebog', 'Ivain Hebog', 'male', '1117', '1201'),
    person('hafren-hebog', 'Hafren Hebog', 'female', '1124', '1197'),
    spouse('raewyn-aderyn', 'Raewyn Aderyn', 'female', '1120', '1194', 'house-aderyn'),
    spouse('noghan-airdmhor', 'Noghán Airdmhor', 'male', '1120', '1179', 'house-airdmhor'),

    person('hywel-hebog', 'Hywel Hebog', 'male', '1267', '1341'),
    person('myfanwy-hebog', 'Myfanwy Hebog', 'female', '1270', '1355'),
    spouse('gwenlian-gaeth', 'Gwenlian Gaeth', 'female', '1270', '1317', 'house-gaeth'),
    spouse('gwalchgwyn-aderyn', 'Gwalchgwyn Aderyn', 'male', '1268', '1297', 'house-aderyn'),

    person('trahaern-hebog', 'Trahaern Hebog', 'male', '1612', '1676', {
      notes: 'Die Hebog-Quelle schreibt Trahaearn; die ausgearbeitete Gaeth-Gegenakte führt kanonisch Trahaern.'
    }),
    awayWoman('malvina-hebog-mwyalchen', 'Malvina Hebog O’Talwyn', '1610', '1663', 'Haus Mwyalchen'),
    spouse('myfanwy-gaeth', 'Myfanwy Gaeth', 'female', '1612', '1683', 'house-gaeth'),
    spouse('kelyddon-mwyalchen', 'Kelyddon Mwyalchen', 'male', '1607', '1653', 'house-mwyalchen'),

    person('mordred-hebog', 'Mordred Hebog', 'male', '1631', '1689'),
    awayWoman('armela-hebog', 'Armela Hebog', '1635', '1689', 'Haus Crefyddol', {
      notes: 'Die Hebog-Quelle nennt 1636–1712; die ausgearbeitete Crefyddol-Gegenakte führt dieselbe Weltperson kanonisch als 1635–1689.'
    }),
    spouse('ingeborg-feuerhaar', 'Ingeborg Feuerhaar', 'female', '1632', '1699', 'house-feuerhaar', {
      notes: 'Die ältere Hebog-Akte führte Ingeborg widersprüchlich als Eldhári. Die Feuerhaar-Quelle und ihre eingezeichnete Abstammung belegen sie als Tochter Ketills und Unndís.'
    }),
    spouse('lunet-crefyddol', 'Lunet Crefyddol', 'male', '1634', '1709', 'house-crefyddol'),

    person('thalen-hebog', 'Thalen Hebog', 'male', '1655', '1692', {
      notes: 'Die Hebog-Quelle nennt 1654; die ausgearbeitete Aderyn-Gegenakte führt kanonisch 1655.'
    }),
    awayWoman('meredyddwynn-hebog', 'Meredyddwynn Hebog', '1654', '1720', 'Haus Gwarchod'),
    spouse('tesni-aderyn', 'Tesni Aderyn', 'female', '1657', '1723', 'house-aderyn'),
    spouse('maiwyn-gwarchod', 'Maiwyn Gwarchod', 'male', '1648', '1717', 'house-gwarchod'),

    person('sabrian-hebog', 'Sabrian Hebog', 'male', '1674', ''),
    awayWoman('ewynn-hebog-eryr', 'Ewynn Hebog', '1676', '', 'Haus Eryr'),
    person('griffith-hebog', 'Griffith Hebog', 'male', '1677', ''),
    spouse('klothilde-ridderspore', 'Klothilde Ridderspore', 'female', '1674', '', 'house-ridderspore', {
      notes: 'Die Partnerkarte nennt Klothilde. Die spätere Kinderüberschrift „Sabrian & Solveig“ ist ein offenkundiger Tabellenfehler.'
    }),
    spouse('enevold-eryr', 'Enevold Eryr', 'male', '1678', '', 'house-eryr'),
    spouse('liliwen-gwyvern', 'Liliwen Gwyvern', 'female', '1676', '', 'house-gwyvern'),

    person('meilyr-hebog', 'Meilyr Hebog', 'male', '1693', ''),
    awayWoman('thalena-hebog', 'Thalena Hebog', '1697', '', 'Haus Tylluan'),
    awayWoman('saeth-hebog', 'Saeth Hebog', '1699', '', 'Haus Ilyuncu'),
    person('sath-hebog', 'Sath Hebog', 'male', '1697', ''),
    awayWoman('chryl-hebog', 'Chryl Hebog', '1701', '', 'Haus Mwyalchen'),
    spouse('tudful-1700-gaeth', 'Tudful Gaeth', 'female', '1700', '', 'house-gaeth'),
    spouse('lucan-tylluan', 'Lucan Tylluan', 'male', '1693', '', 'house-tylluan'),
    spouse('gildas-ilyuncu', 'Gildas Ilyuncu', 'male', '1695', '', 'house-ilyuncu'),
    spouse('karelia-goldbaer', 'Karelia Goldbär', 'female', '1698', '', 'house-goldbaer'),
    spouse('conway-mwyalchen', 'Conway Mwyalchen', 'male', '1699', '', 'house-mwyalchen'),

    person('leolin-hebog', 'Leolin Hebog', 'male', '1721', ''),
    awayWoman('glinda-hebog', 'Glinda Hebog', '1723', '', 'Haus Gwefrydd', {
      engagement: true,
      title: 'Wegverlobt an Haus Gwefrydd'
    }),
    person('eurig-hebog', 'Eurig Hebog', 'male', '1721', ''),
    awayWoman('aliza-hebog', 'Aliza Hebog', '1722', '', 'Haus Tir Addawol', {
      engagement: true,
      title: 'Wegverlobt an Haus Tir Addawol'
    }),
    spouse('dilys-aderyn', 'Dilys Aderyn', 'female', '1722', '', 'house-aderyn', {
      notes: 'Die Aderyn-Gegenakte verwendet die kanonische Schreibweise Dilys; die Hebog-Quelle schreibt Dylis.'
    }),
    spouse('iorwerth-gwefrydd', 'Iorwerth Gwefrydd', 'male', '1718', '', 'house-gwefrydd', {
      notes: 'Die Hebog-Quelle nennt 1723; die ausgearbeitete Gwefrydd-Gegenakte belegt kanonisch 1718.'
    }),
    spouse('brina-llwynog', 'Brina Llwynog', 'female', '1722', '', 'house-llwynog'),
    spouse('bhreac-tir-addawol', 'Bhreac Tir Addawol', 'male', '1718', '', 'house-tir-addawol')
  ],
  partnerships: [
    createMarriage('marriage-mordred-thalena-ancient', ...COUPLES.founders),
    createMarriage('marriage-ivain-raewyn', ...COUPLES.ivain),
    endedMarriage('marriage-hafren-noghan-hebog', COUPLES.hafren, '1179'),
    endedMarriage('marriage-gwenlian-hywel-hebog', COUPLES.hywel, '1317'),
    createMarriage('marriage-gwalchgwyn-myfanwy', ...COUPLES.myfanwy1270),
    endedMarriage('marriage-myfanwy-trahaern-hebog', COUPLES.trahaern, '1676'),
    endedMarriage('marriage-kelyddon-malvina-mwyalchen', COUPLES.malvina, '1653'),
    createMarriage('marriage-mordred-ingeborg-hebog', ...COUPLES.mordred, {
      status: 'ended',
      end: '1689',
      extensions: { registryManagedFields: ['participantIds', 'status', 'end'] }
    }),
    createMarriage('marriage-lunet-armela-crefyddol', ...COUPLES.armela),
    createMarriage('marriage-thalen-tesni', ...COUPLES.thalen),
    endedMarriage('marriage-maiwyn-meredyddwynn-gwarchod', COUPLES.meredyddwynn, '1717'),
    createMarriage('marriage-sabrian-klothilde-hebog', ...COUPLES.sabrian),
    createMarriage('marriage-enevold-ewynn-eryr', ...COUPLES.ewynn),
    createMarriage('marriage-liliwen-griffith', ...COUPLES.griffith),
    createMarriage('marriage-tudful-meilyr-hebog', ...COUPLES.meilyr),
    createMarriage('marriage-lucan-thalena-tylluan', ...COUPLES.thalena),
    createMarriage('marriage-saeth-gildas-ilyuncu', ...COUPLES.saeth),
    createMarriage('marriage-sath-karelia-hebog', ...COUPLES.sath),
    createMarriage('marriage-conway-chryl-mwyalchen', ...COUPLES.chryl),
    createMarriage('engagement-dilys-leolin', ...COUPLES.leolin, { type: 'engagement' }),
    createMarriage('engagement-iorwerth-glinda-hebog', ...COUPLES.glinda, { type: 'engagement' }),
    createMarriage('engagement-brina-eurig-hebog-llwynog', ...COUPLES.eurig, { type: 'engagement' }),
    createMarriage('engagement-bhreac-aliza-tir-addawol', ...COUPLES.aliza, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['ivain-hebog', 'hafren-hebog'], 'marriage-mordred-thalena-ancient', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Ivain und Hafren.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['hywel-hebog'], 'marriage-ivain-raewyn', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: EARLY_BRANCH_TIME_JUMP_ID }
    }),
    ...childrenOf(['myfanwy-hebog'], 'marriage-hafren-noghan-hebog', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: EARLY_BRANCH_TIME_JUMP_ID }
    }),
    ...childrenOf(['trahaern-hebog'], 'marriage-gwenlian-hywel-hebog', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: LATE_BRANCH_TIME_JUMP_ID }
    }),
    ...childrenOf(['malvina-hebog-mwyalchen'], 'marriage-gwalchgwyn-myfanwy', {
      type: 'claimed',
      certainty: 'probable',
      extensions: { timeJumpId: LATE_BRANCH_TIME_JUMP_ID }
    }),
    ...childrenOf(['mordred-hebog', 'armela-hebog'], 'marriage-myfanwy-trahaern-hebog'),
    ...childrenOf(['thalen-hebog', 'meredyddwynn-hebog'], 'marriage-mordred-ingeborg-hebog'),
    ...childrenOf(['sabrian-hebog', 'ewynn-hebog-eryr', 'griffith-hebog'], 'marriage-thalen-tesni'),
    ...childrenOf(['meilyr-hebog', 'thalena-hebog', 'saeth-hebog'], 'marriage-sabrian-klothilde-hebog'),
    ...childrenOf(['sath-hebog', 'chryl-hebog'], 'marriage-liliwen-griffith'),
    ...childrenOf(['leolin-hebog', 'glinda-hebog'], 'marriage-tudful-meilyr-hebog'),
    ...childrenOf(['eurig-hebog', 'aliza-hebog'], 'marriage-sath-karelia-hebog')
  ],
  cadetBranches: [
    marriedAway('married-away-malvina-hebog-mwyalchen', 'Haus Mwyalchen', 'marriage-kelyddon-malvina-mwyalchen', 'house-mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    marriedAway('married-away-armela-hebog-crefyddol', 'Haus Crefyddol', 'marriage-lunet-armela-crefyddol', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-meredyddwynn-hebog-gwarchod', 'Haus Gwarchod', 'marriage-maiwyn-meredyddwynn-gwarchod', 'house-gwarchod', HOUSE_EMBLEMS.gwarchod),
    marriedAway('married-away-ewynn-hebog-eryr', 'Haus Eryr', 'marriage-enevold-ewynn-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-thalena-hebog-tylluan', 'Haus Tylluan', 'marriage-lucan-thalena-tylluan', 'house-tylluan', HOUSE_EMBLEMS.tylluan),
    marriedAway('married-away-saeth-hebog-ilyuncu', 'Haus Ilyuncu', 'marriage-saeth-gildas-ilyuncu', 'house-ilyuncu', HOUSE_EMBLEMS.ilyuncu),
    marriedAway('married-away-chryl-hebog-mwyalchen', 'Haus Mwyalchen', 'marriage-conway-chryl-mwyalchen', 'house-mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    marriedAway('married-away-glinda-hebog-gwefrydd', 'Haus Gwefrydd', 'engagement-iorwerth-glinda-hebog', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd, {
      subtitle: 'Wegverlobt an Haus Gwefrydd'
    }),
    marriedAway('married-away-aliza-hebog-tir-addawol', 'Haus Tir Addawol', 'engagement-bhreac-aliza-tir-addawol', 'house-tir-addawol', HOUSE_EMBLEMS.tirAddawol, {
      subtitle: 'Wegverlobt an Haus Tir Addawol'
    })
  ],
  timeJumps: [
    timeJump(
      FOUNDER_TIME_JUMP_ID,
      'marriage-mordred-thalena-ancient',
      ['ivain-hebog', 'hafren-hebog'],
      '????',
      '1117'
    ),
    timeJump(
      EARLY_BRANCH_TIME_JUMP_ID,
      'marriage-ivain-raewyn',
      ['hywel-hebog', 'myfanwy-hebog'],
      '1179',
      '1267',
      ['marriage-hafren-noghan-hebog']
    ),
    timeJump(
      LATE_BRANCH_TIME_JUMP_ID,
      'marriage-gwenlian-hywel-hebog',
      ['trahaern-hebog', 'malvina-hebog-mwyalchen'],
      '1317',
      '1610',
      ['marriage-gwalchgwyn-myfanwy']
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-mordred-thalena-ancient',
    houseId: HEBOG_HOUSE_ID,
    crestSubtitle: 'Baronenhaus von Talwyn · Kadettenzweig der Aderyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'mordred-aderyn',
    orientation: 'vertical',
    ancestorDepth: 18,
    descendantDepth: 18,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Hebog O'Talwyn (bereitgestellte Altdaten)",
    sourceNote: 'Mordred Aderyn und Thalena begründen Haus Hebog. Drei Überlieferungslücken sind als strikt serielle, globale Generationentrenner modelliert: Der erste folgt auf Gründerpaar und Hausknoten; der zweite wird gemeinsam von Ivain/Raewyn und Hafren/Noghán gespeist; der dritte gemeinsam von Hywel/Gwenlian und Myfanwy/Gwalchgwyn. Dahinter bleiben die fachlichen Elternschaften getrennt, sodass kein paralleler Zeitsprung und keine falsche Abstammung entsteht. Die Hauptlinie führt über Ivain, Hywel, Trahaern, Mordred, Thalen, Sabrian, Meilyr und Leolin. Malvina, Armela, Meredyddwynn, Ewynn, Thalena, Saeth, Chryl, Glinda und Aliza erhalten direkte Wegverheiratet- beziehungsweise Wegverlobt-Knoten; fremde Nachkommen werden ausschließlich in ihrer fortführenden Hausakte gezeigt. Die Mwyalchen-Kinder Malvinas, die Gwarchod-Kinder Meredyddwynns, die Eryr-Kinder Ewynns, die Tylluan-Kinder Thalenas und das Mwyalchen-Kind Chryls werden daher hier nicht gedoppelt. Die fehlerhafte Kinderüberschrift „Sabrian & Solveig“ wurde anhand der unmittelbar zugeordneten Partnerkarte zu Sabrian und Klothilde berichtigt. Bereits ausgearbeitete Gegenakten bestimmen bei Abweichungen Namen, Lebensdaten, Partnerschafts-IDs und Porträts; dies betrifft insbesondere Trahaern, Armela, Thalen, Dilys und Iorwerth. Wiederholte schwarze Standardsilhouetten und die gerenderte Gesamtgrafik wurden nicht als Individualporträts importiert.',
    registryTombstones: {
      persons: ['ingeborg-eldhari']
    },
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
    registryManagedRecordFields: ['folderPath']
  }
});
