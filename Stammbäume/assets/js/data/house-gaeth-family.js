import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_GAETH_PORTRAITS } from './house-gaeth-portraits.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const GAETH_HOUSE_ID = 'house-gaeth';
const GAETH_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth;
const FOUNDER_TIME_JUMP_ID = 'gap-gaeth-gereint-to-gwendal';
const GWENDAL_TIME_JUMP_ID = 'gap-gaeth-gwendal-to-geraint';
const GERAINT_TIME_JUMP_ID = 'gap-gaeth-geraint-to-gwayne';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  gaeth: GAETH_EMBLEM,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  morwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.morwyn,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan
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
  'gereint-aderyn': 'Gründer und erster Baron des Hauses Gaeth',
  'gwendal-gaeth': 'Baron des Hauses Gaeth bis 1179',
  'geraint-gaeth': 'Baron des Hauses Gaeth bis 1303',
  'gwayne-gaeth': 'Baron des Hauses Gaeth bis 1658',
  'meredydd-gaeth': 'Baron des Hauses Gaeth 1658–1668',
  'gereint-gaeth': 'Baron des Hauses Gaeth 1668–1696',
  'cledwyn-gaeth': 'Baron des Hauses Gaeth 1696–1720',
  'edwyn-gaeth': 'Baron des Hauses Gaeth seit 1720',
  'uthred-gaeth': 'Erster Erbe des Hauses Gaeth',
  'karris-gaeth': 'Zweiter Erbe des Hauses Gaeth',
  'kani-gaeth': 'Dritter Erbe des Hauses Gaeth'
});

const HOUSE_HEAD_IDS = new Set([
  'gereint-aderyn',
  'gwendal-gaeth',
  'geraint-gaeth',
  'gwayne-gaeth',
  'meredydd-gaeth',
  'gereint-gaeth',
  'cledwyn-gaeth',
  'edwyn-gaeth'
]);

const HEIR_IDS = new Set(['uthred-gaeth', 'karris-gaeth', 'kani-gaeth']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GAETH_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GAETH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GAETH_HOUSE_ID ? 'core' : 'married'),
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
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, {
    status: 'ended',
    end,
    extensions: { registryManagedFields: ['status', 'end'] }
  });
}

const COUPLES = Object.freeze({
  founders: ['gereint-aderyn', 'tudful'],
  gwendal: ['gwendal-gaeth', 'lynette-aderyn'],
  branwen: ['branwen-gaeth', 'eamon-mata'],
  geraint: ['geraint-gaeth', 'gwenhwyfar-1270-aderyn'],
  gwenlian: ['gwenlian-gaeth', 'hywel-hebog'],
  gwayne: ['caru-wylan', 'gwayne-gaeth'],
  gwenfrewi: ['iorwerth-mwyalchen', 'gwenfrewi-gaeth'],
  meredydd: ['sulwen-chiffyddlon', 'meredydd-gaeth'],
  myfanwy: ['myfanwy-gaeth', 'trahaern-hebog'],
  ellun: ['clwyd-aderyn', 'ellun-gaeth'],
  gereint: ['meeghan-hwyaden', 'gereint-gaeth'],
  gwendolen: ['gwynham-1630-tylluan', 'gwendolen-gaeth'],
  cledwyn: ['cledwyn-gaeth', 'saoirse-cleirigh'],
  wynndie: ['delwen-dienyddiwr', 'wynndie-gaeth'],
  edwyn: ['carys-dinefwr', 'edwyn-gaeth'],
  morweidd: ['morweidd-gaeth', 'carynn-morwyn'],
  gwenog: ['agravaine-1673-mwyalchen', 'gwenog-gaeth'],
  meriel: ['merfyn-aderyn', 'meriel-gaeth'],
  slevin: ['slevin-gaeth', 'thalena-1676-aderyn'],
  uthred: ['jeanne-saethwyr', 'uthred-gaeth'],
  rhian: ['daffyd-eryr', 'rhian-gaeth-eryr'],
  rhyannon: ['quellyn-eryr', 'rhyannon-gaeth-eryr'],
  arian: ['arian-gaeth', 'aithne-luachra'],
  rheinallt: ['rheinallt-gaeth', 'owena-gaeth-spouse'],
  tudor: ['eurfron-creyr', 'tudor-gaeth'],
  tudful1700: ['tudful-1700-gaeth', 'meilyr-hebog']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-gereint-tudful': COUPLES.founders,
  'marriage-gwendal-lynette': COUPLES.gwendal,
  'marriage-branwen-eamon-mata': COUPLES.branwen,
  'marriage-geraint-gwenhwyfar': COUPLES.geraint,
  'marriage-gwenlian-hywel-hebog': COUPLES.gwenlian,
  'marriage-caru-gwayne': COUPLES.gwayne,
  'marriage-iorwerth-gwenfrewi-mwyalchen': COUPLES.gwenfrewi,
  'marriage-sulwen-meredydd-chiffyddlon': COUPLES.meredydd,
  'marriage-myfanwy-trahaern-hebog': COUPLES.myfanwy,
  'marriage-clwyd-ellun': COUPLES.ellun,
  'marriage-meeghan-gereint-hwyaden': COUPLES.gereint,
  'marriage-gwynham-gwendolen-tylluan': COUPLES.gwendolen,
  'marriage-cledwyn-saoirse-cleirigh': COUPLES.cledwyn,
  'marriage-delwen-wynndie-dienyddiwr': COUPLES.wynndie,
  'marriage-carys-edwyn-dinefwr': COUPLES.edwyn,
  'marriage-morweidd-carynn-morwyn': COUPLES.morweidd,
  'marriage-agravaine-gwenog-mwyalchen': COUPLES.gwenog,
  'marriage-merfyn-meriel': COUPLES.meriel,
  'marriage-slevin-thalena': COUPLES.slevin,
  'marriage-jeanne-uthred': COUPLES.uthred,
  'marriage-daffyd-rhian-eryr': COUPLES.rhian,
  'marriage-quellyn-rhyannon-eryr': COUPLES.rhyannon,
  'marriage-arian-aithne-gaeth': COUPLES.arian,
  'marriage-rheinallt-owena-gaeth': COUPLES.rheinallt,
  'marriage-eurfron-tudor-creyr': COUPLES.tudor,
  'marriage-tudful-meilyr-hebog': COUPLES.tudful1700
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'gaeth-parentage',
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

function timeJump(id, parentPartnershipId, childIds, fromYear, toYear) {
  return {
    id,
    parentPartnershipId,
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear,
    toYear,
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter Generationentrenner: Der Zeitsprung folgt ausschließlich auf den vorherigen Haus- oder Paarknoten und darf niemals parallel zu einer Person, einem Hausknoten oder einem weiteren Zeitsprung stehen.',
    extensions: {}
  };
}

export const HOUSE_GAETH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gaeth',
    title: "Haus Gaeth O'Penllyn",
    motto: '',
    description: 'Baronenhaus von Penllyn und alter Kadettenzweig des gräflichen Hauses Aderyn.',
    emblem: GAETH_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.gaeth
  },
  houses: [
    house(GAETH_HOUSE_ID, "Haus Gaeth O'Penllyn", GAETH_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-mata', 'Haus Mata'),
    house('house-hebog', "Haus Hebog O'Talwyn", HOUSE_EMBLEMS.hebog),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan),
    house('house-mwyalchen', "Haus Mwyalchen O'Penbryn", HOUSE_EMBLEMS.mwyalchen),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-tylluan', "Haus Tylluan O'Penbryn", HOUSE_EMBLEMS.tylluan),
    house('house-hwyaden', "Haus Hwyaden O'Trefyddin", HOUSE_EMBLEMS.hwyaden),
    house('house-cleirigh', 'Haus Cléirigh'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-morwyn', 'Haus Morwyn', HOUSE_EMBLEMS.morwyn),
    house('house-ilyuncu', "Haus Ilyuncu O'Caer Gwennol", HOUSE_EMBLEMS.ilyuncu),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-luachra', 'Haus Luachra'),
    house('house-creyr', "Haus Créyr O'Esgairmor", HOUSE_EMBLEMS.creyr)
  ],
  persons: [
    person('gereint-aderyn', 'Gereint Aderyn', 'male', '????', '????', {
      houseId: 'house-aderyn',
      familyRole: 'core'
    }),
    spouse('tudful', 'Tudful', 'female', '????', '????', '', {
      worldPersonId: 'person--family-tree--tudful',
      title: 'Mitgründerin des Hauses Gaeth'
    }),

    person('gwendal-gaeth', 'Gwendal Gaeth', 'male', '1115', '1179'),
    awayWoman('branwen-gaeth', 'Branwen Gaeth', '1120', '1184', 'Haus Mata'),
    spouse('lynette-aderyn', 'Lynette Aderyn', 'female', '1116', '1179', 'house-aderyn'),
    spouse('eamon-mata', 'Eámon Mata', 'male', '1118', '1181', 'house-mata'),

    person('geraint-gaeth', 'Geraint Gaeth', 'male', '1268', '1303'),
    awayWoman('gwenlian-gaeth', 'Gwenlian Gaeth', '1270', '1317', 'Haus Hebog'),
    spouse('gwenhwyfar-1270-aderyn', 'Gwenhwyfar Aderyn', 'female', '1270', '1372', 'house-aderyn'),
    spouse('hywel-hebog', 'Hywel Hebog', 'male', '1267', '1341', 'house-hebog'),

    person('gwayne-gaeth', 'Gwayne Gaeth', 'male', '1586', '1658'),
    awayWoman('gwenfrewi-gaeth', 'Gwenfrewi Gaeth', '1587', '1679', 'Haus Mwyalchen', {
      notes: 'Die Gaeth-Quelle lässt das Todesjahr offen; die ausgearbeitete Mwyalchen-Gegenakte belegt 1679.'
    }),
    person('akkarin-gaeth', 'Akkarin Gaeth', 'male', '1594', '????'),
    spouse('caru-wylan', 'Caru Wylan', 'female', '1592', '1637', 'house-wylan'),
    spouse('iorwerth-mwyalchen', 'Iorwerth Mwyalchen', 'male', '1584', '1647', 'house-mwyalchen'),

    person('meredydd-gaeth', 'Meredydd Gaeth', 'male', '1606', '1668', {
      notes: 'Die Gaeth-Altdaten nennen 1611–1677; die bereits ausgearbeitete Chiffyddlon-Gegenakte führt dieselbe Weltperson kanonisch als 1606–1668.'
    }),
    awayWoman('myfanwy-gaeth', 'Myfanwy Gaeth', '1612', '1683', 'Haus Hebog'),
    awayWoman('ellun-gaeth', 'Ellun Gaeth', '1612', '1679', 'Haus Aderyn'),
    spouse('sulwen-chiffyddlon', 'Sulwen Chiffyddlon', 'female', '1609', '1670', 'house-chiffyddlon', {
      notes: 'Die Gaeth-Altdaten nennen 1613–1675; die ausgearbeitete Chiffyddlon-Gegenakte belegt 1609–1670.'
    }),
    spouse('trahaern-hebog', 'Trahaern Hebog', 'male', '1612', '1676', 'house-hebog'),
    spouse('clwyd-aderyn', 'Clywd Aderyn', 'male', '1610', '1673', 'house-aderyn', {
      notes: 'Die Gaeth-Quelle verwendet die Variante Clwyd; die Aderyn-Gegenakte führt die Quellschreibweise Clywd.'
    }),

    person('gereint-gaeth', 'Gereint Gaeth', 'male', '1630', '1696'),
    awayWoman('gwendolen-gaeth', 'Gwendolen Gaeth', '1632', '1687', 'Haus Tylluan'),
    spouse('meeghan-hwyaden', 'Meeghan Hwyaden', 'female', '1631', '1703', 'house-hwyaden'),
    spouse('gwynham-1630-tylluan', 'Gwynham Tylluan', 'male', '1630', '1685', 'house-tylluan'),

    person('cledwyn-gaeth', 'Cledwyn Gaeth', 'male', '1649', '1720'),
    awayWoman('wynndie-gaeth', 'Wynndie Gaeth', '1653', '1682', 'Haus Dienyddiwr'),
    spouse('saoirse-cleirigh', 'Saoirse Cléirigh', 'female', '1650', '1675', 'house-cleirigh'),
    spouse('delwen-dienyddiwr', 'Delwen Dienyddiwr', 'male', '1651', '1717', 'house-dienyddiwr'),

    person('edwyn-gaeth', 'Edwyn Gaeth', 'male', '1668', ''),
    person('morweidd-gaeth', 'Morweidd Gaeth', 'male', '1674', ''),
    awayWoman('gwenog-gaeth', 'Gwenog Gaeth', '1676', '', 'Haus Mwyalchen'),
    awayWoman('meriel-gaeth', 'Meriel Gaeth', '1670', '', 'Haus Ilyuncu', {
      title: 'Wegverheiratet und Mitgründerin des Hauses Ilyuncu',
      tags: ['Hausgründerin']
    }),
    person('slevin-gaeth', 'Slevin Gaeth', 'male', '1672', '', {
      title: 'Hoffalkner von Penbryn'
    }),
    spouse('carys-dinefwr', 'Carys Dinefwr', 'female', '1670', '', 'house-dinefwr'),
    spouse('carynn-morwyn', 'Carynn Morwyn', 'female', '1676', '', 'house-morwyn'),
    spouse('agravaine-1673-mwyalchen', 'Agravaine Mwyalchen', 'male', '1673', '', 'house-mwyalchen', {
      title: 'Ritterfürst des Hauses Mwyalchen seit 1718'
    }),
    spouse('merfyn-aderyn', 'Merfyn Aderyn', 'male', '1664', '', 'house-aderyn', {
      title: 'Mitgründer des Hauses Ilyuncu',
      notes: 'Die Gaeth-Quelle bezeichnet ihn nach dem gegründeten Zweig als Merfyn Ilyuncu; die Aderyn-Gegenakte führt seine Herkunft kanonisch als Merfyn Aderyn.'
    }),
    spouse('thalena-1676-aderyn', 'Thalena Aderyn', 'female', '1676', '', 'house-aderyn'),

    person('uthred-gaeth', 'Uthred Gaeth', 'male', '1692', ''),
    awayWoman('rhian-gaeth-eryr', 'Rhian Gaeth', '1696', '', 'Haus Eryr', {
      notes: 'Die Gaeth-Quelle schreibt Rhiann; die ausgearbeitete Eryr-Gegenakte führt dieselbe Weltperson kanonisch als Rhian.'
    }),
    awayWoman('rhyannon-gaeth-eryr', 'Rhyannon Gaeth', '1696', '', 'Haus Eryr'),
    person('arian-gaeth', 'Arian Gaeth', 'male', '1701', ''),
    person('rheinallt-gaeth', 'Rheinallt Gaeth', 'male', '1694', '1720'),
    person('tudor-gaeth', 'Tudor Gaeth', 'male', '1698', ''),
    awayWoman('tudful-1700-gaeth', 'Tudful Gaeth', '1700', '', 'Haus Hebog'),
    spouse('jeanne-saethwyr', 'Jeanne', 'female', '1694', '', 'house-saethwyr', {
      notes: 'Die Gaeth-Quelle schreibt Jennae Saethwyr; die ausgearbeitete Saethwyr-Gegenakte führt dieselbe Weltperson kanonisch als Jeanne.'
    }),
    spouse('daffyd-eryr', 'Daffyd Eryr', 'male', '1693', '', 'house-eryr', {
      title: 'Ritterfürst des Hauses Eryr seit 1734'
    }),
    spouse('quellyn-eryr', 'Quellyn Eryr', 'male', '1695', '', 'house-eryr'),
    spouse('aithne-luachra', 'Aithne Luachra', 'female', '1702', '', 'house-luachra'),
    spouse('owena-gaeth-spouse', 'Owena', 'female', '1698', '1721'),
    spouse('eurfron-creyr', 'Eurfron Créyr', 'female', '1701', '', 'house-creyr', {
      notes: 'Die Gaeth-Quelle schreibt Eurfon; die ausgearbeitete Créyr-Gegenakte führt dieselbe Weltperson kanonisch als Eurfron.'
    }),
    spouse('meilyr-hebog', 'Meilyr Hebog', 'male', '1693', '', 'house-hebog'),

    person('karris-gaeth', 'Karris Gaeth', 'male', '1718', ''),
    person('tymora-gaeth', 'Tymora Gaeth', 'female', '1721', ''),
    person('kani-gaeth', 'Kani Gaeth', 'male', '1723', ''),
    person('wenna-gaeth', 'Wenna Gaeth', 'female', '1725', ''),
    person('tiwlip-gaeth', 'Tiwlip Gaeth', 'female', '1721', ''),
    person('marvo-gaeth', 'Marvo Gaeth', 'male', '1721', ''),
    person('ceinlys-gaeth', 'Ceinlys Gaeth', 'female', '1723', ''),
    person('morin-gaeth', 'Morin Gaeth', 'male', '1724', ''),
    person('aeron-gaeth', 'Aeron Gaeth', 'male', '1723', ''),
    person('arddun-gaeth', 'Arddun Gaeth', 'female', '1725', '')
  ],
  partnerships: [
    createMarriage('marriage-gereint-tudful', ...COUPLES.founders),
    createMarriage('marriage-gwendal-lynette', ...COUPLES.gwendal),
    endedMarriage('marriage-branwen-eamon-mata', ...COUPLES.branwen, '1181'),
    createMarriage('marriage-geraint-gwenhwyfar', ...COUPLES.geraint),
    endedMarriage('marriage-gwenlian-hywel-hebog', ...COUPLES.gwenlian, '1317'),
    createMarriage('marriage-caru-gwayne', ...COUPLES.gwayne),
    endedMarriage('marriage-iorwerth-gwenfrewi-mwyalchen', ...COUPLES.gwenfrewi, '1647'),
    endedMarriage('marriage-sulwen-meredydd-chiffyddlon', ...COUPLES.meredydd, '1668'),
    endedMarriage('marriage-myfanwy-trahaern-hebog', ...COUPLES.myfanwy, '1676'),
    createMarriage('marriage-clwyd-ellun', ...COUPLES.ellun),
    endedMarriage('marriage-meeghan-gereint-hwyaden', ...COUPLES.gereint, '1696'),
    endedMarriage('marriage-gwynham-gwendolen-tylluan', ...COUPLES.gwendolen, '1685'),
    endedMarriage('marriage-cledwyn-saoirse-cleirigh', ...COUPLES.cledwyn, '1675'),
    createMarriage('marriage-delwen-wynndie-dienyddiwr', ...COUPLES.wynndie),
    createMarriage('marriage-carys-edwyn-dinefwr', ...COUPLES.edwyn),
    createMarriage('marriage-morweidd-carynn-morwyn', ...COUPLES.morweidd),
    createMarriage('marriage-agravaine-gwenog-mwyalchen', ...COUPLES.gwenog),
    createMarriage('marriage-merfyn-meriel', ...COUPLES.meriel),
    createMarriage('marriage-slevin-thalena', ...COUPLES.slevin),
    createMarriage('marriage-jeanne-uthred', ...COUPLES.uthred),
    createMarriage('marriage-daffyd-rhian-eryr', ...COUPLES.rhian),
    createMarriage('marriage-quellyn-rhyannon-eryr', ...COUPLES.rhyannon),
    createMarriage('marriage-arian-aithne-gaeth', ...COUPLES.arian),
    endedMarriage('marriage-rheinallt-owena-gaeth', ...COUPLES.rheinallt, '1720'),
    createMarriage('marriage-eurfron-tudor-creyr', ...COUPLES.tudor),
    createMarriage('marriage-tudful-meilyr-hebog', ...COUPLES.tudful1700)
  ],
  parentages: [
    ...childrenOf(['gwendal-gaeth', 'branwen-gaeth'], 'marriage-gereint-tudful', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Gwendal und Branwen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['geraint-gaeth', 'gwenlian-gaeth'], 'marriage-gwendal-lynette', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden Gwendals Linie mit Geraint und Gwenlian.',
      extensions: { timeJumpId: GWENDAL_TIME_JUMP_ID }
    }),
    ...childrenOf(['gwayne-gaeth', 'gwenfrewi-gaeth', 'akkarin-gaeth'], 'marriage-geraint-gwenhwyfar', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden Geraints Linie mit Gwayne, Gwenfrewi und Akkarin.',
      extensions: { timeJumpId: GERAINT_TIME_JUMP_ID }
    }),
    ...childrenOf(['meredydd-gaeth', 'myfanwy-gaeth', 'ellun-gaeth'], 'marriage-caru-gwayne'),
    ...childrenOf(['gereint-gaeth', 'gwendolen-gaeth'], 'marriage-sulwen-meredydd-chiffyddlon'),
    ...childrenOf(['cledwyn-gaeth', 'wynndie-gaeth'], 'marriage-meeghan-gereint-hwyaden'),
    ...childrenOf(
      ['edwyn-gaeth', 'morweidd-gaeth', 'gwenog-gaeth', 'meriel-gaeth', 'slevin-gaeth'],
      'marriage-cledwyn-saoirse-cleirigh'
    ),
    ...childrenOf(['uthred-gaeth', 'rhian-gaeth-eryr', 'rhyannon-gaeth-eryr', 'arian-gaeth'], 'marriage-carys-edwyn-dinefwr'),
    ...childrenOf(['rheinallt-gaeth', 'tudor-gaeth'], 'marriage-morweidd-carynn-morwyn'),
    ...childrenOf(['tudful-1700-gaeth'], 'marriage-slevin-thalena'),
    ...childrenOf(['karris-gaeth', 'tymora-gaeth', 'kani-gaeth', 'wenna-gaeth'], 'marriage-jeanne-uthred'),
    ...childrenOf(['tiwlip-gaeth'], 'marriage-rheinallt-owena-gaeth'),
    ...childrenOf(['marvo-gaeth', 'ceinlys-gaeth', 'morin-gaeth'], 'marriage-arian-aithne-gaeth'),
    ...childrenOf(['aeron-gaeth', 'arddun-gaeth'], 'marriage-eurfron-tudor-creyr')
  ],
  cadetBranches: [
    marriedAway('married-away-branwen-gaeth-mata', 'Haus Mata', 'marriage-branwen-eamon-mata', 'house-mata'),
    marriedAway('married-away-gwenlian-gaeth-hebog', 'Haus Hebog', 'marriage-gwenlian-hywel-hebog', 'house-hebog', HOUSE_EMBLEMS.hebog),
    marriedAway('married-away-gwenfrewi-gaeth-mwyalchen', 'Haus Mwyalchen', 'marriage-iorwerth-gwenfrewi-mwyalchen', 'house-mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    marriedAway('married-away-myfanwy-gaeth-hebog', 'Haus Hebog', 'marriage-myfanwy-trahaern-hebog', 'house-hebog', HOUSE_EMBLEMS.hebog),
    marriedAway('married-away-ellun-gaeth-aderyn', 'Haus Aderyn', 'marriage-clwyd-ellun', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-gwendolen-gaeth-tylluan', 'Haus Tylluan', 'marriage-gwynham-gwendolen-tylluan', 'house-tylluan', HOUSE_EMBLEMS.tylluan),
    marriedAway('married-away-wynndie-gaeth-dienyddiwr', 'Haus Dienyddiwr', 'marriage-delwen-wynndie-dienyddiwr', 'house-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-gwenog-gaeth-mwyalchen', 'Haus Mwyalchen', 'marriage-agravaine-gwenog-mwyalchen', 'house-mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    createCadetHouseBranch({
      id: 'cadet-ilyuncu-merfyn-meriel',
      name: 'Haus Ilyuncu',
      parentPartnershipId: 'marriage-merfyn-meriel',
      houseId: 'house-ilyuncu',
      targetFamilyId: 'haus-ilyuncu',
      emblem: HOUSE_EMBLEMS.ilyuncu,
      subtitle: 'Gegründetes Ritterfürstenhaus',
      notes: 'Merfyn Aderyn und Meriel Gaeth begründen Haus Ilyuncu; die Hausverknüpfung hängt unmittelbar und gemeinsam unter ihrem Paar.'
    }),
    marriedAway('married-away-rhian-gaeth-eryr', 'Haus Eryr', 'marriage-daffyd-rhian-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-rhyannon-gaeth-eryr', 'Haus Eryr', 'marriage-quellyn-rhyannon-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-tudful-gaeth-hebog', 'Haus Hebog', 'marriage-tudful-meilyr-hebog', 'house-hebog', HOUSE_EMBLEMS.hebog)
  ],
  timeJumps: [
    timeJump(FOUNDER_TIME_JUMP_ID, 'marriage-gereint-tudful', ['gwendal-gaeth', 'branwen-gaeth'], '????', '1115'),
    timeJump(GWENDAL_TIME_JUMP_ID, 'marriage-gwendal-lynette', ['geraint-gaeth', 'gwenlian-gaeth'], '1179', '1268'),
    timeJump(GERAINT_TIME_JUMP_ID, 'marriage-geraint-gwenhwyfar', ['gwayne-gaeth', 'gwenfrewi-gaeth', 'akkarin-gaeth'], '1303', '1586')
  ],
  lineage: {
    founderPartnershipId: 'marriage-gereint-tudful',
    houseId: GAETH_HOUSE_ID,
    crestSubtitle: 'Baronenhaus von Penllyn · Kadettenzweig der Aderyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gereint-aderyn',
    orientation: 'vertical',
    ancestorDepth: 18,
    descendantDepth: 18,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Gaeth O'Penllyn (bereitgestellte Altdaten)",
    sourceNote: 'Gereint Aderyn und Tudful begründen Haus Gaeth. Drei Überlieferungslücken sind als absolute, strikt serielle Generationentrenner modelliert: jeweils erst Paar beziehungsweise Hausknoten, dann genau ein Zeitsprung und erst danach die folgende Generation. Die Hauptlinie führt über Gwendal, Geraint, Gwayne, Meredydd, Gereint, Cledwyn und Edwyn. Branwen, Gwenlian, Gwenfrewi, Myfanwy, Ellun, Gwendolen, Wynndie, Gwenog, Rhian, Rhyannon und Tudful erhalten direkte Wegverheiratet-Knoten; fremde Nachkommen werden ausschließlich in ihrer jeweils fortführenden Hausakte gezeigt. Merfyn Aderyn und Meriel Gaeth begründen Haus Ilyuncu, dessen Hausknoten unmittelbar unter ihrem gemeinsamen Paar sitzt. Die Gaeth-Nachkommen werden nur unter den Paaren Edwyn und Carys, Morweidd und Carynn, Slevin und Thalena, Uthred und Jeanne, Rheinallt und Owena, Arian und Aithne sowie Tudor und Eurfron fortgeführt. Bereits ausgearbeitete Gegenakten bestimmen bei abweichenden Namen, Lebensdaten, Partnerschafts-IDs und Porträts den Kanon; die Varianten Meredydd 1611–1677, Sulwen 1613–1675, Clwyd, Rhiann, Jennae, Eurfon und Merfyn Ilyuncu bleiben an den betroffenen Personen dokumentiert. Wiederholte schwarze Standardsilhouetten und die gerenderte Gesamtgrafik wurden nicht als Individualporträts importiert.',
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
