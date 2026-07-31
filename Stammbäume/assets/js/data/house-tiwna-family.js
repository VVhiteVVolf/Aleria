import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';
import {
  SILBERINSEL_HOUSE_EMBLEMS,
  SILBERINSEL_HOUSE_PROFILES
} from './silberinsel-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const TIWNA_HOUSE_ID = 'house-tiwna';
const TIWNA_EMBLEM = SILBERINSEL_HOUSE_EMBLEMS.tiwna;
const CARADOC_TIME_JUMP_ID = 'gap-caradoc-to-brannock-tiwna';

const HOUSE_EMBLEMS = Object.freeze({
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  dinefwr: WEIDEBUCHT_HOUSE_EMBLEMS.dinefwr,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  llwynog: SONNENKUESTE_HOUSE_EMBLEMS.llwynog,
  morforwyn: SONNENKUESTE_HOUSE_EMBLEMS.morforwyn,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  saith: SILBERINSEL_HOUSE_EMBLEMS.saith,
  tiwna: TIWNA_EMBLEM,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan,
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
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

const HEAD_IDS = new Set([
  'morholt-pysgod',
  'caradoc-tiwna',
  'brannock-tiwna',
  'madoc-tiwna',
  'gavin-tiwna',
  'efrawg-tiwna',
  'morholt-tiwna'
]);

const HEIR_IDS = new Set(['andras-tiwna', 'glyndwr-tiwna']);

function lineageRoleFor(personId) {
  if (personId === 'morholt-tiwna') return 'head';
  if (HEAD_IDS.has(personId) || HEIR_IDS.has(personId)) return 'mainline';
  return 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? TIWNA_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_TIWNA_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TIWNA_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married',
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
    ...(emblem ? { extensions: { registryManagedFields: ['name', 'emblem'] } } : {})
  };
}

const COUPLES = Object.freeze({
  founders: ['morholt-pysgod', 'caitrin-neidr'],
  caradoc: ['caradoc-tiwna', 'telyth-tylwyth'],
  caralyn: ['howell-canwyll', 'carlyn-tiwna'],
  brannock: ['brannock-tiwna', 'braith-morfil'],
  eirian: ['eirian-tiwna', 'meredydd-coedwig'],
  madoc: ['madoc-tiwna', 'morwen-pawen'],
  heledd: ['heledd-tiwna', 'custenin-brithyll'],
  caled: ['blawd-wylan', 'caled-tiwna'],
  meiriona: ['gildas-neidr', 'meiriona-tiwna'],
  eiddon: ['frewi-pysgod', 'eiddon-tiwna'],
  gavin: ['gavin-tiwna', 'essylt-roich'],
  dylis: ['cynwrig-canwyll', 'dylis-tiwna'],
  trahaearn: ['trahaearn-tiwna', 'dearbhail-reannachain'],
  teleri: ['teleri-tiwna', 'aengus-cuilen'],
  gwalchmai: ['hafren-crefyddol', 'gwalchmai-tiwna'],
  efrawg: ['sioned-morforwyn', 'efrawg-tiwna'],
  dytiana: ['gwilym-chiffyddlon', 'dytiana-tiwna'],
  cici: ['gwynfor-dienyddiwr', 'cici-tiwna'],
  tarian: ['edwynna-llwynog', 'tarian-tiwna'],
  meghan: ['evan-dinefwr', 'meghan-tiwna'],
  cynfarch: ['cynfarch-tiwna', 'uaine-erskine'],
  morholt: ['dilwen-neidr', 'morholt-tiwna'],
  caitrin: ['caitrin-tiwna', 'yorath-pyrth'],
  morien: ['betws-blach', 'morien-tiwna'],
  bran: ['lyabelle-saith', 'bran-tiwna'],
  aeddan: ['ystafel-dyngwn', 'aeddan-tiwna'],
  cadfan: ['aelwyd-wyrm', 'cadfan-tiwna'],
  olwyna: ['meilyr-creyr', 'olwyna-tiwna']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-caitrin-morholt': COUPLES.founders,
  'marriage-caradoc-telyth-tiwna': COUPLES.caradoc,
  'marriage-howell-carlyn-canwyll': COUPLES.caralyn,
  'marriage-brannock-braith-tiwna': COUPLES.brannock,
  'marriage-eirian-meredydd-tiwna': COUPLES.eirian,
  'marriage-madoc-morwen-tiwna': COUPLES.madoc,
  'marriage-heledd-custenin-tiwna': COUPLES.heledd,
  'marriage-blawd-caled': COUPLES.caled,
  'marriage-gildas-meiriona': COUPLES.meiriona,
  'marriage-frewi-eiddon': COUPLES.eiddon,
  'marriage-gavin-essylt-tiwna': COUPLES.gavin,
  'marriage-cynwrig-dylis-canwyll': COUPLES.dylis,
  'marriage-trahaearn-dearbhail-tiwna': COUPLES.trahaearn,
  'marriage-teleri-aengus-tiwna': COUPLES.teleri,
  'marriage-hafren-gwalchmai-crefyddol': COUPLES.gwalchmai,
  'marriage-sioned-efrawg-morforwyn': COUPLES.efrawg,
  'marriage-gwilym-dytiana-chiffyddlon': COUPLES.dytiana,
  'marriage-gwynfor-cici-dienyddiwr': COUPLES.cici,
  'marriage-edwynna-tarian-llwynog': COUPLES.tarian,
  'marriage-evan-meghan-dinefwr': COUPLES.meghan,
  'marriage-cynfarch-uaine-tiwna': COUPLES.cynfarch,
  'marriage-dilwen-morholt': COUPLES.morholt,
  'marriage-caitrin-yorath-tiwna': COUPLES.caitrin,
  'marriage-betws-morien-blach': COUPLES.morien,
  'marriage-lyabelle-bran-saith': COUPLES.bran,
  'marriage-ystafel-aeddan-dyngwn': COUPLES.aeddan,
  'marriage-aelwyd-cadfan': COUPLES.cadfan,
  'marriage-meilyr-olwyna-creyr': COUPLES.olwyna
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'tiwna-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
  });
}

export const HOUSE_TIWNA_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tiwna',
    title: "Haus Tiwna O'Eiddon",
    motto: '',
    description: 'Baronenhaus von Eiddon und Kadettenhaus der Pysgod, begründet von Morholt Pysgod und Caitrin Neidr.',
    emblem: TIWNA_EMBLEM,
    houseProfile: SILBERINSEL_HOUSE_PROFILES.tiwna
  },
  houses: [
    house(TIWNA_HOUSE_ID, "Haus Tiwna O'Eiddon", TIWNA_EMBLEM),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-canwyll', "Haus Canwyll O'Llanvane", HOUSE_EMBLEMS.canwyll),
    house('house-morfil', 'Haus Morfil'),
    house('house-coedwig', 'Haus Coedwig'),
    house('house-pawen', 'Haus Pawen'),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-wylan', "Haus Wylan O'Cerrigarth", HOUSE_EMBLEMS.wylan),
    house('house-roich', 'Haus Roich'),
    house('house-reannachain', 'Haus Reannachain'),
    house('house-cuilen', 'Haus Cuilen'),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-morforwyn', "Haus Morforwyn O'Carngol", HOUSE_EMBLEMS.morforwyn),
    house('house-chiffyddlon', "Haus Chiffyddlon O'Glyndraith", HOUSE_EMBLEMS.chiffyddlon),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-llwynog', 'Haus Llwynog', HOUSE_EMBLEMS.llwynog),
    house('house-dinefwr', "Haus Dinefwr O'Cerrigarth", HOUSE_EMBLEMS.dinefwr),
    house('house-erskine', 'Haus Erskine'),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-saith', "Haus Saith O'Llanvane", HOUSE_EMBLEMS.saith),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr)
  ],
  persons: [
    person('morholt-pysgod', 'Morholt Pysgod', 'male', '????', '????', {
      houseId: 'house-pysgod',
      familyRole: 'core',
      title: 'Gründer und erster Baron des Hauses Tiwna'
    }),
    spouse('caitrin-neidr', 'Caitrin Neidr', 'female', '????', '????', 'house-neidr', {
      title: 'Mitgründerin des Hauses Tiwna'
    }),

    person('caradoc-tiwna', 'Caradoc Tiwna', 'male', '????', '????', { title: 'Baron des Hauses Tiwna' }),
    awayWoman('carlyn-tiwna', 'Caralyn Tiwna', '????', '????', 'Haus Canwyll'),
    spouse('telyth-tylwyth', 'Telyth Tylwyth', 'female', '????', '????', 'house-tylwyth'),
    spouse('howell-canwyll', 'Howell Canwyll', 'male', '????', '????', 'house-canwyll'),

    person('brannock-tiwna', 'Brannock Tiwna', 'male', '1612', '1683', { title: 'Baron des Hauses Tiwna bis 1683' }),
    awayWoman('eirian-tiwna', 'Eirian Tiwna', '1614', '1636', 'Haus Coedwig'),
    spouse('braith-morfil', 'Braith Morfil', 'female', '1613', '1696', 'house-morfil'),
    spouse('meredydd-coedwig', 'Meredydd Coedwig', 'male', '1610', '1683', 'house-coedwig'),

    person('madoc-tiwna', 'Madoc Tiwna', 'male', '1630', '1705', { title: 'Baron des Hauses Tiwna 1683–1705' }),
    awayWoman('heledd-tiwna', 'Heledd Tiwna', '1630', '1673', 'Haus Brithyll'),
    person('caled-tiwna', 'Caled Tiwna', 'male', '1634', '1669'),
    awayWoman('meiriona-tiwna', 'Meiriona Tiwna', '1632', '1669', 'Haus Neidr'),
    person('eiddon-tiwna', 'Eiddon Tiwna', 'male', '1632', '1700'),
    spouse('morwen-pawen', 'Morwen Pawen', 'female', '1642', '1659', 'house-pawen'),
    spouse('custenin-brithyll', 'Custenin Brithyll', 'male', '1628', '1702', 'house-brithyll'),
    spouse('blawd-wylan', 'Blawd Wylan', 'female', '1633', '1681', 'house-wylan'),
    spouse('gildas-neidr', 'Gildas Neidr', 'male', '1630', '1662', 'house-neidr'),
    spouse('frewi-pysgod', 'Frewi Pysgod', 'female', '1632', '1701', 'house-pysgod'),

    person('gavin-tiwna', 'Gavin Tiwna', 'male', '1651', '1714', { title: 'Baron des Hauses Tiwna 1705–1714' }),
    awayWoman('dylis-tiwna', 'Dylis Tiwna', '1662', '1720', 'Haus Canwyll'),
    person('trahaearn-tiwna', 'Trahaearn Tiwna', 'male', '1653', '1700'),
    awayWoman('teleri-tiwna', 'Teleri Tiwna', '1659', '1711', 'Haus Cuilen'),
    person('gwalchmai-tiwna', 'Gwalchmai Tiwna', 'male', '1655', '1710'),
    spouse('essylt-roich', 'Essylt Roich', 'female', '1654', '1711', 'house-roich'),
    spouse('cynwrig-canwyll', 'Cynwrig Canwyll', 'male', '1662', '1720', 'house-canwyll'),
    spouse('dearbhail-reannachain', 'Dearbhail Reannachain', 'female', '1655', '1689', 'house-reannachain'),
    spouse('aengus-cuilen', 'Aengus Cuilen', 'male', '1656', '1720', 'house-cuilen'),
    spouse('hafren-crefyddol', 'Hafren Crefyddol', 'female', '1655', '1689', 'house-crefyddol'),

    person('efrawg-tiwna', 'Efrawg Tiwna', 'male', '1672', '1720', { title: 'Baron des Hauses Tiwna 1714–1720' }),
    awayWoman('dytiana-tiwna', 'Dytiana Tiwna', '1676', '1720', 'Haus Chiffyddlon'),
    awayWoman('cici-tiwna', 'Cici Tiwna', '1672', '1720', 'Haus Dienyddiwr'),
    person('tarian-tiwna', 'Tarian Tiwna', 'male', '1672', '1720'),
    awayWoman('meghan-tiwna', 'Meghan Tiwna', '1675', '1714', 'Haus Dinefwr'),
    person('cynfarch-tiwna', 'Cynfarch Tiwna', 'male', '1677', ''),
    spouse('sioned-morforwyn', 'Sioned Morforwyn', 'female', '1673', '', 'house-morforwyn'),
    spouse('gwilym-chiffyddlon', 'Gwilym Chiffyddlon', 'male', '1674', '1720', 'house-chiffyddlon'),
    spouse('gwynfor-dienyddiwr', 'Gwynfor Dienyddiwr', 'male', '1674', '', 'house-dienyddiwr'),
    spouse('edwynna-llwynog', 'Edwynna Llwynog', 'female', '1674', '', 'house-llwynog'),
    spouse('evan-dinefwr', 'Evan Dinefwr', 'male', '1674', '', 'house-dinefwr'),
    spouse('uaine-erskine', 'Uaine Erskine', 'female', '1677', '1720', 'house-erskine'),

    person('morholt-tiwna', 'Morholt Tiwna', 'male', '1690', '', { title: 'Baron und Oberhaupt des Hauses Tiwna seit 1720' }),
    awayWoman('caitrin-tiwna', 'Caitrin Tiwna', '1695', '', 'Haus Pyrth'),
    person('morien-tiwna', 'Morien Tiwna', 'male', '1697', ''),
    person('bran-tiwna', 'Bran Tiwna', 'male', '1700', ''),
    person('aeddan-tiwna', 'Aeddan Tiwna', 'male', '1695', ''),
    person('cadfan-tiwna', 'Cadfan Tiwna', 'male', '1696', ''),
    awayWoman('olwyna-tiwna', 'Olwyna Tiwna', '1698', '', 'Haus Créyr'),
    spouse('dilwen-neidr', 'Dilwen Neidr', 'female', '1694', '', 'house-neidr'),
    spouse('yorath-pyrth', 'Yorath Pyrth', 'male', '1694', '', 'house-pyrth'),
    spouse('betws-blach', 'Betws Blach', 'female', '1699', '', 'house-blach'),
    spouse('lyabelle-saith', 'Lyabelle Saith', 'female', '1704', '', 'house-saith'),
    spouse('ystafel-dyngwn', 'Ystafel Dyngwn', 'female', '1700', '', 'house-dyngwn'),
    spouse('aelwyd-wyrm', 'Aelwyd Wyrm', 'female', '1701', '', 'house-wyrm'),
    spouse('meilyr-creyr', 'Meilyr Créyr', 'male', '1696', '', 'house-creyr'),

    person('andras-tiwna', 'Andras Tiwna', 'male', '????', '', { title: 'Erster Erbe des Hauses Tiwna' }),
    person('tharwynn-tiwna', 'Tharwynn Tiwna', 'male', '????', ''),
    person('seren-tiwna', 'Seren Tiwna', 'female', '????', ''),
    person('glyndwr-tiwna', 'Glyndwr Tiwna', 'male', '????', '', { title: 'Zweiter Erbe des Hauses Tiwna' }),
    person('morfydd-tiwna', 'Morfydd Tiwna', 'female', '????', '????'),
    person('ystrad-tiwna', 'Ystrad Tiwna', 'male', '????', ''),
    person('cadwy-tiwna', 'Cadwy Tiwna', 'male', '????', ''),
    person('ysgol-tiwna', 'Ysgol Tiwna', 'male', '????', ''),
    person('garmon-tiwna', 'Garmon Tiwna', 'male', '????', ''),
    person('llio-tiwna', 'Llio Tiwna', 'female', '????', ''),
    person('cefin-tiwna', 'Cefin Tiwna', 'male', '????', ''),
    person('sian-tiwna', 'Siân Tiwna', 'female', '????', '')
  ],
  partnerships: [
    createMarriage('marriage-caitrin-morholt', ...COUPLES.founders, {
      notes: 'Morholt Pysgod und Caitrin Neidr begründen gemeinsam das Kadettenhaus Tiwna.'
    }),
    createMarriage('marriage-caradoc-telyth-tiwna', ...COUPLES.caradoc),
    createMarriage('marriage-howell-carlyn-canwyll', ...COUPLES.caralyn),
    createMarriage('marriage-brannock-braith-tiwna', ...COUPLES.brannock, { status: 'ended', end: '1683' }),
    createMarriage('marriage-eirian-meredydd-tiwna', ...COUPLES.eirian, { status: 'ended', end: '1636' }),
    createMarriage('marriage-madoc-morwen-tiwna', ...COUPLES.madoc, { status: 'ended', end: '1659' }),
    createMarriage('marriage-heledd-custenin-tiwna', ...COUPLES.heledd, { status: 'ended', end: '1673' }),
    createMarriage('marriage-blawd-caled', ...COUPLES.caled),
    createMarriage('marriage-gildas-meiriona', ...COUPLES.meiriona),
    createMarriage('marriage-frewi-eiddon', ...COUPLES.eiddon),
    createMarriage('marriage-gavin-essylt-tiwna', ...COUPLES.gavin, { status: 'ended', end: '1711' }),
    createMarriage('marriage-cynwrig-dylis-canwyll', ...COUPLES.dylis),
    createMarriage('marriage-trahaearn-dearbhail-tiwna', ...COUPLES.trahaearn, { status: 'ended', end: '1689' }),
    createMarriage('marriage-teleri-aengus-tiwna', ...COUPLES.teleri, { status: 'ended', end: '1711' }),
    createMarriage('marriage-hafren-gwalchmai-crefyddol', ...COUPLES.gwalchmai),
    createMarriage('marriage-sioned-efrawg-morforwyn', ...COUPLES.efrawg, { status: 'ended', end: '1720' }),
    createMarriage('marriage-gwilym-dytiana-chiffyddlon', ...COUPLES.dytiana, { status: 'ended', end: '1720' }),
    createMarriage('marriage-gwynfor-cici-dienyddiwr', ...COUPLES.cici),
    createMarriage('marriage-edwynna-tarian-llwynog', ...COUPLES.tarian, { status: 'ended', end: '1720' }),
    createMarriage('marriage-evan-meghan-dinefwr', ...COUPLES.meghan, { status: 'ended', end: '1714' }),
    createMarriage('marriage-cynfarch-uaine-tiwna', ...COUPLES.cynfarch, { status: 'ended', end: '1720' }),
    createMarriage('marriage-dilwen-morholt', ...COUPLES.morholt),
    createMarriage('marriage-caitrin-yorath-tiwna', ...COUPLES.caitrin),
    createMarriage('marriage-betws-morien-blach', ...COUPLES.morien),
    createMarriage('marriage-lyabelle-bran-saith', ...COUPLES.bran),
    createMarriage('marriage-ystafel-aeddan-dyngwn', ...COUPLES.aeddan),
    createMarriage('marriage-aelwyd-cadfan', ...COUPLES.cadfan),
    createMarriage('marriage-meilyr-olwyna-creyr', ...COUPLES.olwyna)
  ],
  parentages: [
    ...childrenOf(['caradoc-tiwna', 'carlyn-tiwna'], 'marriage-caitrin-morholt', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und Caradocs Generation liegen nicht einzeln überlieferte Tiwna-Vorfahren.'
    }),
    ...childrenOf(['brannock-tiwna', 'eirian-tiwna'], 'marriage-caradoc-telyth-tiwna', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Caradoc und der ab 1612 belegten Generation liegen nicht einzeln überlieferte Tiwna-Vorfahren.',
      extensions: { timeJumpId: CARADOC_TIME_JUMP_ID }
    }),
    ...childrenOf(['madoc-tiwna', 'heledd-tiwna', 'caled-tiwna', 'meiriona-tiwna', 'eiddon-tiwna'], 'marriage-brannock-braith-tiwna'),
    ...childrenOf(['gavin-tiwna', 'dylis-tiwna'], 'marriage-madoc-morwen-tiwna'),
    ...childrenOf(['trahaearn-tiwna'], 'marriage-blawd-caled'),
    ...childrenOf(['teleri-tiwna', 'gwalchmai-tiwna'], 'marriage-frewi-eiddon'),
    ...childrenOf(['efrawg-tiwna', 'dytiana-tiwna'], 'marriage-gavin-essylt-tiwna'),
    ...childrenOf(['cici-tiwna', 'tarian-tiwna'], 'marriage-trahaearn-dearbhail-tiwna'),
    ...childrenOf(['meghan-tiwna', 'cynfarch-tiwna'], 'marriage-hafren-gwalchmai-crefyddol'),
    ...childrenOf(['morholt-tiwna', 'caitrin-tiwna', 'morien-tiwna', 'bran-tiwna'], 'marriage-sioned-efrawg-morforwyn'),
    ...childrenOf(['aeddan-tiwna'], 'marriage-edwynna-tarian-llwynog'),
    ...childrenOf(['cadfan-tiwna', 'olwyna-tiwna'], 'marriage-cynfarch-uaine-tiwna'),
    ...childrenOf(['andras-tiwna', 'tharwynn-tiwna', 'seren-tiwna', 'glyndwr-tiwna'], 'marriage-dilwen-morholt'),
    ...childrenOf(['morfydd-tiwna', 'ystrad-tiwna'], 'marriage-betws-morien-blach'),
    ...childrenOf(['cadwy-tiwna', 'ysgol-tiwna'], 'marriage-lyabelle-bran-saith'),
    ...childrenOf(['garmon-tiwna', 'llio-tiwna'], 'marriage-ystafel-aeddan-dyngwn'),
    ...childrenOf(['cefin-tiwna', 'sian-tiwna'], 'marriage-aelwyd-cadfan')
  ],
  cadetBranches: [
    marriedAway('married-away-caralyn-tiwna-canwyll', 'Haus Canwyll', 'marriage-howell-carlyn-canwyll', 'house-canwyll', HOUSE_EMBLEMS.canwyll),
    marriedAway('married-away-eirian-tiwna-coedwig', 'Haus Coedwig', 'marriage-eirian-meredydd-tiwna', 'house-coedwig'),
    marriedAway('married-away-heledd-tiwna-brithyll', 'Haus Brithyll', 'marriage-heledd-custenin-tiwna', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-meiriona-tiwna-neidr', 'Haus Neidr', 'marriage-gildas-meiriona', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-dylis-tiwna-canwyll', 'Haus Canwyll', 'marriage-cynwrig-dylis-canwyll', 'house-canwyll', HOUSE_EMBLEMS.canwyll),
    marriedAway('married-away-teleri-tiwna-cuilen', 'Haus Cuilen', 'marriage-teleri-aengus-tiwna', 'house-cuilen'),
    marriedAway('married-away-dytiana-tiwna-chiffyddlon', 'Haus Chiffyddlon', 'marriage-gwilym-dytiana-chiffyddlon', 'house-chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    marriedAway('married-away-cici-tiwna-dienyddiwr', 'Haus Dienyddiwr', 'marriage-gwynfor-cici-dienyddiwr', 'house-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-meghan-tiwna-dinefwr', 'Haus Dinefwr', 'marriage-evan-meghan-dinefwr', 'house-dinefwr', HOUSE_EMBLEMS.dinefwr),
    marriedAway('married-away-caitrin-tiwna-pyrth', 'Haus Pyrth', 'marriage-caitrin-yorath-tiwna', 'house-pyrth', HOUSE_EMBLEMS.pyrth),
    marriedAway('married-away-olwyna-tiwna-creyr', 'Haus Créyr', 'marriage-meilyr-olwyna-creyr', 'house-creyr', HOUSE_EMBLEMS.creyr)
  ],
  timeJumps: [
    {
      id: CARADOC_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-caradoc-telyth-tiwna',
      parentPersonId: '',
      childIds: ['brannock-tiwna', 'eirian-tiwna'],
      years: 0,
      fromYear: '????',
      toYear: '1612',
      label: 'Die belegte Tiwna-Linie setzt 1612 wieder ein',
      notes: 'Der zweite absolute Generationentrenner setzt die Hauslinie ausschließlich unter Caradoc und Telyth fort; Caralyns Canwyll-Zweig endet vorher.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-caitrin-morholt',
    houseId: TIWNA_HOUSE_ID,
    crestSubtitle: 'Baronenhaus von Eiddon · Kadettenhaus der Pysgod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Tiwna-Generationen'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'morholt-pysgod',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Tiwna O'Eiddon (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge und Porträtzuordnungen folgen der bereitgestellten Tiwna-Hausseite. Morholt Pysgod und Caitrin Neidr bilden das Gründerpaar; ihr goldener Tiwna-Hausknoten hängt unmittelbar unter beiden. Die beiden Punktreihen sind strikt serielle absolute Generationentrenner: der erste folgt auf das Hauswappen, der zweite ausschließlich unter Caradoc und Telyth. Caralyns Canwyll-Zweig endet vor dem zweiten Sprung. Die Schreibvarianten Carlyn/Caralyn, Dyllis/Dylis, Brannoc/Brannock, Olwyn/Olwyna, Ystafell/Ystafel, Pirth/Pyrth, Dyngyn/Dyngwn, Crefyddoll/Crefyddol und Gwylim/Gwilym werden zugunsten bestehender Gegenakten beziehungsweise der ausführlichen Hierarchie vereinheitlicht; stabile vorhandene IDs bleiben erhalten. Caralyn, Eirian, Heledd, Meiriona, Dylis, Teleri, Dytiana, Cici, Meghan, Caitrin und Olwyna besitzen direkte Wegverheiratet-Knoten. Ihre in Canwyll, Neidr, Chiffyddlon, Dienyddiwr, Dinefwr und Créyr fortgeführten Kinder werden ausschließlich in den jeweiligen Gegenakten gezeigt. Die genauer belegten Todesjahre 1662 für Gildas und 1669 für Meiriona werden in der Neidr-Gegenakte gespiegelt. Wiederholte schwarze Standardsilhouetten werden nicht als Individualporträts importiert.',
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
