import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import {
  SILBERINSEL_HOUSE_EMBLEMS,
  SILBERINSEL_HOUSE_PROFILES
} from './silberinsel-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const CANWYLL_HOUSE_ID = 'house-canwyll';
const CANWYLL_EMBLEM = SILBERINSEL_HOUSE_EMBLEMS.canwyll;
const GAWAIN_TIME_JUMP_ID = 'gap-gawain-to-howell-canwyll';
const HOWELL_TIME_JUMP_ID = 'gap-howell-to-llywarch-canwyll';

const HOUSE_EMBLEMS = Object.freeze({
  blach: SONNENKUESTE_HOUSE_EMBLEMS.blach,
  canwyll: CANWYLL_EMBLEM,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  grawn: AEHRENTAL_HOUSE_EMBLEMS.grawn,
  marchog: AEHRENTAL_HOUSE_EMBLEMS.marchog,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  saith: SILBERINSEL_HOUSE_EMBLEMS.saith,
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
  teyrngarch: SONNENKUESTE_HOUSE_EMBLEMS.teyrngarch,
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
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

const MAINLINE_PERSON_IDS = new Set([
  'llwellyn-founder-canwyll',
  'gawain-canwyll',
  'howell-canwyll',
  'llywarch-canwyll',
  'glendower-canwyll',
  'eiddyl-canwyll',
  'cadoc-canwyll',
  'dyl-canwyll',
  'kane-canwyll'
]);

function lineageRoleFor(personId) {
  if (personId === 'llwellyn-founder-canwyll') return 'head';
  return MAINLINE_PERSON_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CANWYLL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CANWYLL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CANWYLL_HOUSE_ID ? 'core' : 'married'),
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
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  sieffre: ['jinelle-neidr', 'sieffre-der-fromme'],
  llwellyn: ['llwellyn-founder-canwyll', 'hafren-founder-canwyll'],
  llwyarch: ['llwyarch-founder-crefyddol', 'lynette-founder-crefyddol'],
  gawain: ['merlina-crefyddol', 'gawain-canwyll'],
  dolena: ['powell-neidr', 'dolena-canwyll'],
  gladdie: ['nodawl-crefyddol', 'gladdie-canwyll'],
  howell: ['howell-canwyll', 'carlyn-tiwna'],
  quendolin: ['gwythyr-neidr', 'quendolin-canwyll'],
  llywarch1605: ['gwendolyn-1607-crefyddol', 'llywarch-canwyll'],
  llewella1608: ['grufudd-chiffyddlon', 'llewella-canwyll'],
  glendower: ['saselia-teyrngarch', 'glendower-canwyll'],
  branwen: ['branwen-canwyll', 'rhodri-pawen'],
  leolin: ['leolin-canwyll', 'olwyn-pyrth'],
  eiddyl: ['gwenlian-blach', 'eiddyl-canwyll'],
  iorwen: ['iorwen-canwyll', 'jethro-pyrth'],
  enfys: ['enfys-canwyll', 'cadfan-selwyn'],
  cynwrig: ['cynwrig-canwyll', 'dylis-tiwna'],
  cadoc: ['rhiannon-neidr', 'cadoc-canwyll'],
  gorm: ['aeron-neidr', 'gorm-canwyll'],
  gwenifer: ['gwenifer-canwyll', 'ywain-draenog'],
  urien: ['urien-canwyll', 'zyraline-wivern'],
  aeronwen: ['conwy-neidr', 'aeronwen-canwyll'],
  glesni: ['iestyn-grawn', 'glesni-canwyll'],
  uvel: ['alaweyn-saith', 'uvel-canwyll'],
  jowan: ['vortigern-saith', 'jowan-canwyll'],
  dyl: ['olwyn-wylan', 'dyl-canwyll'],
  derwen: ['nyfain-crefyddol', 'derwen-canwyll'],
  mawr: ['gwenaelle-marchog', 'mawr-canwyll'],
  llewella1699: ['llewella-1699-canwyll', 'wynston-unigol'],
  orson: ['meghan-sgwarnog', 'orson-canwyll'],
  lynee: ['gethin-penderyn', 'lynee-canwyll']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-jinelle-sieffre': COUPLES.sieffre,
  'marriage-llwellyn-hafren-canwyll': COUPLES.llwellyn,
  'marriage-llwyarch-lynette-crefyddol': COUPLES.llwyarch,
  'marriage-merlina-gawain-canwyll': COUPLES.gawain,
  'marriage-powell-dolena': COUPLES.dolena,
  'marriage-nodawl-gladdie-crefyddol': COUPLES.gladdie,
  'marriage-howell-carlyn-canwyll': COUPLES.howell,
  'marriage-gwythyr-quendolin': COUPLES.quendolin,
  'marriage-gwendolyn-llywarch-canwyll': COUPLES.llywarch1605,
  'marriage-grufudd-llewella-chiffyddlon': COUPLES.llewella1608,
  'marriage-saselia-glendower-teyrngarch': COUPLES.glendower,
  'marriage-branwen-rhodri-canwyll': COUPLES.branwen,
  'marriage-leolin-olwyn-pyrth': COUPLES.leolin,
  'marriage-gwenlian-eiddyl-blach': COUPLES.eiddyl,
  'marriage-iorwen-jethro-canwyll': COUPLES.iorwen,
  'marriage-enfys-cadfan-canwyll': COUPLES.enfys,
  'marriage-cynwrig-dylis-canwyll': COUPLES.cynwrig,
  'marriage-rhiannon-cadoc': COUPLES.cadoc,
  'marriage-aeron-gorm': COUPLES.gorm,
  'marriage-gwenifer-ywain-canwyll': COUPLES.gwenifer,
  'marriage-urien-zyraline-canwyll': COUPLES.urien,
  'marriage-conwy-aeronwen': COUPLES.aeronwen,
  'marriage-iestyn-glesni': COUPLES.glesni,
  'marriage-alaweyn-uvel-saith': COUPLES.uvel,
  'marriage-vortigern-jowan-saith': COUPLES.jowan,
  'marriage-olwyn-dyl': COUPLES.dyl,
  'marriage-nyfain-derwen-canwyll': COUPLES.derwen,
  'marriage-gwenaelle-mawr-marchog': COUPLES.mawr,
  'marriage-llewella-wynston-canwyll': COUPLES.llewella1699,
  'marriage-meghan-orson-sgwarnog': COUPLES.orson,
  'marriage-gethin-lynee-penderyn': COUPLES.lynee
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'canwyll-parentage',
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
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_CANWYLL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-canwyll',
    title: "Haus Canwyll O'Llanvane",
    motto: 'Erleuchte deinen Weg!',
    description: 'Frommes Ritterfürstenhaus von Llanvane, gegründet von Llwellyn, dem Sohn Sieffres des Frommen. Sein Bruder Llwyarch begründete Haus Crefyddol.',
    emblem: CANWYLL_EMBLEM,
    houseProfile: SILBERINSEL_HOUSE_PROFILES.canwyll
  },
  houses: [
    house(CANWYLL_HOUSE_ID, "Haus Canwyll O'Llanvane", CANWYLL_EMBLEM),
    house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-teyrngarch', 'Haus Teyrngarch', HOUSE_EMBLEMS.teyrngarch),
    house('house-pawen', 'Haus Pawen'),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-blach', 'Haus Blach', HOUSE_EMBLEMS.blach),
    house('house-selwyn', 'Haus Selwyn'),
    house('house-draenog', 'Haus Draenog'),
    house('house-wivern', 'Haus Wivern'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-saith', 'Haus Saith', HOUSE_EMBLEMS.saith),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-marchog', 'Haus Marchog', HOUSE_EMBLEMS.marchog),
    house('house-unigol', 'Haus Unigol'),
    house('house-sgwarnog', 'Haus Sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn)
  ],
  persons: [
    spouse('sieffre-der-fromme', 'Sieffre der Fromme', 'male', '????', '????', '', {
      title: 'Heiliger Priester · Stammvater der Bruderhäuser Crefyddol und Canwyll',
      extensions: { cardFrameId: 'holy' }
    }),
    spouse('jinelle-neidr', 'Jinelle Neidr', 'female', '????', '????', 'house-neidr'),

    person('llwellyn-founder-canwyll', 'Llwellyn Canwyll', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Canwyll'
    }),
    spouse('hafren-founder-canwyll', 'Hafren', 'female', '????', '????'),
    spouse('llwyarch-founder-crefyddol', 'Llwyarch Crefyddol', 'male', '????', '????', 'house-crefyddol', {
      title: 'Gründer des Bruderhauses Crefyddol'
    }),
    spouse('lynette-founder-crefyddol', 'Lynette', 'female', '????', '????'),

    person('gawain-canwyll', 'Gawain Canwyll', 'male', '????', '????'),
    spouse('merlina-crefyddol', 'Merlina Crefyddol', 'female', '????', '????', 'house-crefyddol'),
    awayWoman('dolena-canwyll', 'Dolena Canwyll', '????', '????', 'Haus Neidr'),
    spouse('powell-neidr', 'Powell Neidr', 'male', '????', '????', 'house-neidr'),
    awayWoman('gladdie-canwyll', 'Gladdie Canwyll', '????', '????', 'Haus Crefyddol'),
    spouse('nodawl-crefyddol', 'Nodawl Crefyddol', 'male', '????', '????', 'house-crefyddol'),

    person('howell-canwyll', 'Howell Canwyll', 'male', '????', '????'),
    spouse('carlyn-tiwna', 'Caralyn Tiwna', 'female', '????', '????', 'house-tiwna'),
    awayWoman('quendolin-canwyll', 'Quendolin Canwyll', '????', '????', 'Haus Neidr'),
    spouse('gwythyr-neidr', 'Gwythyr Neidr', 'male', '????', '????', 'house-neidr'),

    person('llywarch-canwyll', 'Llywarch Canwyll', 'male', '1605', '1676'),
    spouse('gwendolyn-1607-crefyddol', 'Gwendolyn Crefyddol', 'female', '1607', '1680', 'house-crefyddol'),
    awayWoman('llewella-canwyll', 'Llewella Canwyll', '1608', '1678', 'Haus Chiffyddlon', {
      notes: 'Die kanonische Chiffyddlon-Gegenakte führt 1608–1678; die Canwyll-Tabelle nennt abweichend 1605–1693.'
    }),
    spouse('grufudd-chiffyddlon', 'Grufudd Chiffyddlon', 'male', '1605', '1679', 'house-chiffyddlon'),

    person('glendower-canwyll', 'Glendower Canwyll', 'male', '1629', '1698'),
    spouse('saselia-teyrngarch', 'Saselia Teyrngarch', 'female', '1634', '1701', 'house-teyrngarch'),
    awayWoman('branwen-canwyll', 'Branwen Canwyll', '1640', '1705', 'Haus Pawen'),
    spouse('rhodri-pawen', 'Rhodri Pawen', 'male', '1641', '1695', 'house-pawen'),
    person('leolin-canwyll', 'Leolin Canwyll', 'male', '1644', '1663'),
    spouse('olwyn-pyrth', 'Olwyn Pyrth', 'female', '1645', '1663', 'house-pyrth'),

    person('eiddyl-canwyll', 'Eiddyl Canwyll', 'male', '1652', ''),
    spouse('gwenlian-blach', 'Gwenlian Blach', 'female', '1654', '1729', 'house-blach'),
    awayWoman('iorwen-canwyll', 'Iorwen Canwyll', '1656', '1697', 'Haus Pyrth'),
    spouse('jethro-pyrth', 'Jethro Pyrth', 'male', '1656', '1720', 'house-pyrth'),
    person('meriel-canwyll', 'Meriel Canwyll', 'female', '1660', ''),
    awayWoman('enfys-canwyll', 'Enfys Canwyll', '1662', '1717', 'Haus Selwyn'),
    spouse('cadfan-selwyn', 'Cadfan Selwyn', 'male', '1661', '1720', 'house-selwyn'),
    person('cynwrig-canwyll', 'Cynwrig Canwyll', 'male', '1662', '1720'),
    spouse('dylis-tiwna', 'Dylis Tiwna', 'female', '1662', '1720', 'house-tiwna'),

    person('cadoc-canwyll', 'Cadoc Canwyll', 'male', '1671', ''),
    spouse('rhiannon-neidr', 'Rhiannon Neidr', 'female', '1676', '', 'house-neidr'),
    awayWoman('gorm-canwyll', 'Gorm Canwyll', '1673', '', 'Haus Neidr'),
    spouse('aeron-neidr', 'Aeron Neidr', 'male', '1671', '1720', 'house-neidr'),
    awayWoman('gwenifer-canwyll', 'Gwenifer Canwyll', '1675', '', 'Haus Draenog'),
    spouse('ywain-draenog', 'Ywain Draenog', 'male', '1678', '', 'house-draenog'),
    person('urien-canwyll', 'Urien Canwyll', 'male', '1680', ''),
    spouse('zyraline-wivern', 'Zyraline Wivern', 'female', '1680', '', 'house-wivern'),

    awayWoman('aeronwen-canwyll', 'Aeronwen Canwyll', '1678', '', 'Haus Neidr', {
      notes: 'Die Canwyll-Tabelle setzt ein Todeskreuz ohne Todesjahr; die kanonische Neidr-Gegenakte führt Aeronwen lebend.'
    }),
    spouse('conwy-neidr', 'Conwy Neidr', 'male', '1678', '', 'house-neidr'),
    awayWoman('glesni-canwyll', 'Glesni Canwyll', '1669', '', 'Haus Grawn'),
    spouse('iestyn-grawn', 'Iestyn Grawn', 'male', '1668', '', 'house-grawn'),
    person('uvel-canwyll', 'Uvel Canwyll', 'female', '1674', '', {
      title: 'Führt einen Canwyll-Nebenzweig fort',
      notes: 'Explizite matrilineare Ausnahme der Quelle: Die Kinder Orson und Lynee werden als Canwyll fortgeführt.'
    }),
    spouse('alaweyn-saith', 'Alaweyn Saith', 'male', '1676', '', 'house-saith'),
    awayWoman('jowan-canwyll', 'Jowan Canwyll', '1676', '', 'Haus Saith'),
    spouse('vortigern-saith', 'Vortigern Saith', 'male', '1674', '', 'house-saith'),

    person('dyl-canwyll', 'Dyl Canwyll', 'male', '1700', ''),
    spouse('olwyn-wylan', 'Olwyn Wylan', 'female', '1700', '', 'house-wylan'),
    awayWoman('derwen-canwyll', 'Derwen Canwyll', '1702', '', 'Haus Crefyddol'),
    spouse('nyfain-crefyddol', 'Nyfain Crefyddol', 'male', '1696', '', 'house-crefyddol'),
    person('mawr-canwyll', 'Mawr Canwyll', 'male', '1700', ''),
    spouse('gwenaelle-marchog', 'Gwenaelle Marchog', 'female', '1700', '', 'house-marchog'),
    awayWoman('llewella-1699-canwyll', 'Llewella Canwyll', '1699', '', 'Haus Unigol'),
    spouse('wynston-unigol', 'Wynston Unigol', 'male', '1697', '', 'house-unigol'),
    person('orson-canwyll', "Orson Canwyll O'Llanvane", 'male', '1695', ''),
    spouse('meghan-sgwarnog', 'Meghan Sgwarnog', 'female', '1696', '', 'house-sgwarnog'),
    awayWoman('lynee-canwyll', 'Lynee Canwyll', '1697', '', 'Haus Penderyn'),
    spouse('gethin-penderyn', 'Gethin Penderyn', 'male', '1696', '', 'house-penderyn'),

    person('kane-canwyll', 'Kane Canwyll', 'male', '1721', ''),
    person('iesin-canwyll', 'Iesin Canwyll', 'male', '1723', ''),
    person('taran-canwyll', 'Taran Canwyll', 'male', '1725', ''),
    person('itan-canwyll', 'Itan Canwyll', 'male', '1724', ''),
    person('hollie-canwyll', 'Hollie Canwyll', 'female', '1724', ''),
    person('ysolt-canwyll', 'Ysolt Canwyll', 'female', '1728', ''),
    person('hyrs-canwyll', 'Hyrs Canwyll', 'male', '1732', '')
  ],
  partnerships: [
    createMarriage('marriage-jinelle-sieffre', ...COUPLES.sieffre, {
      notes: 'Aus der Verbindung gingen Llwellyn, Gründer von Canwyll, und Llwyarch, Gründer von Crefyddol, hervor.'
    }),
    createMarriage('marriage-llwellyn-hafren-canwyll', ...COUPLES.llwellyn),
    createMarriage('marriage-llwyarch-lynette-crefyddol', ...COUPLES.llwyarch),
    createMarriage('marriage-merlina-gawain-canwyll', ...COUPLES.gawain),
    createMarriage('marriage-powell-dolena', ...COUPLES.dolena),
    createMarriage('marriage-nodawl-gladdie-crefyddol', ...COUPLES.gladdie),
    createMarriage('marriage-howell-carlyn-canwyll', ...COUPLES.howell),
    createMarriage('marriage-gwythyr-quendolin', ...COUPLES.quendolin),
    createMarriage('marriage-gwendolyn-llywarch-canwyll', ...COUPLES.llywarch1605),
    createMarriage('marriage-grufudd-llewella-chiffyddlon', ...COUPLES.llewella1608),
    createMarriage('marriage-saselia-glendower-teyrngarch', ...COUPLES.glendower),
    createMarriage('marriage-branwen-rhodri-canwyll', ...COUPLES.branwen),
    createMarriage('marriage-leolin-olwyn-pyrth', ...COUPLES.leolin),
    createMarriage('marriage-gwenlian-eiddyl-blach', ...COUPLES.eiddyl),
    createMarriage('marriage-iorwen-jethro-canwyll', ...COUPLES.iorwen),
    createMarriage('marriage-enfys-cadfan-canwyll', ...COUPLES.enfys),
    createMarriage('marriage-cynwrig-dylis-canwyll', ...COUPLES.cynwrig),
    createMarriage('marriage-rhiannon-cadoc', ...COUPLES.cadoc),
    createMarriage('marriage-aeron-gorm', ...COUPLES.gorm),
    createMarriage('marriage-gwenifer-ywain-canwyll', ...COUPLES.gwenifer),
    createMarriage('marriage-urien-zyraline-canwyll', ...COUPLES.urien),
    createMarriage('marriage-conwy-aeronwen', ...COUPLES.aeronwen),
    createMarriage('marriage-iestyn-glesni', ...COUPLES.glesni),
    createMarriage('marriage-alaweyn-uvel-saith', ...COUPLES.uvel),
    createMarriage('marriage-vortigern-jowan-saith', ...COUPLES.jowan),
    createMarriage('marriage-olwyn-dyl', ...COUPLES.dyl),
    createMarriage('marriage-nyfain-derwen-canwyll', ...COUPLES.derwen),
    createMarriage('marriage-gwenaelle-mawr-marchog', ...COUPLES.mawr),
    createMarriage('marriage-llewella-wynston-canwyll', ...COUPLES.llewella1699),
    createMarriage('marriage-meghan-orson-sgwarnog', ...COUPLES.orson),
    createMarriage('marriage-gethin-lynee-penderyn', ...COUPLES.lynee)
  ],
  parentages: [
    ...childrenOf(['llwellyn-founder-canwyll', 'llwyarch-founder-crefyddol'], 'marriage-jinelle-sieffre'),
    ...childrenOf(['gawain-canwyll', 'dolena-canwyll', 'gladdie-canwyll'], 'marriage-llwellyn-hafren-canwyll', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Llwellyn und dieser Generation liegen nicht einzeln überlieferte Canwyll-Vorfahren.'
    }),
    ...childrenOf(['howell-canwyll', 'quendolin-canwyll'], 'marriage-merlina-gawain-canwyll', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Gawain und dieser Generation liegen nicht einzeln überlieferte Canwyll-Vorfahren.',
      extensions: { timeJumpId: GAWAIN_TIME_JUMP_ID }
    }),
    ...childrenOf(['llywarch-canwyll', 'llewella-canwyll'], 'marriage-howell-carlyn-canwyll', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Howell und der ab 1605 belegten Generation liegen nicht einzeln überlieferte Canwyll-Vorfahren.',
      extensions: { timeJumpId: HOWELL_TIME_JUMP_ID }
    }),
    ...childrenOf(['glendower-canwyll', 'branwen-canwyll', 'leolin-canwyll'], 'marriage-gwendolyn-llywarch-canwyll'),
    ...childrenOf(['eiddyl-canwyll', 'iorwen-canwyll', 'meriel-canwyll', 'enfys-canwyll', 'cynwrig-canwyll'], 'marriage-saselia-glendower-teyrngarch'),
    ...childrenOf(['cadoc-canwyll', 'gorm-canwyll', 'gwenifer-canwyll', 'urien-canwyll'], 'marriage-gwenlian-eiddyl-blach'),
    ...childrenOf(['aeronwen-canwyll', 'glesni-canwyll', 'uvel-canwyll', 'jowan-canwyll'], 'marriage-cynwrig-dylis-canwyll'),
    ...childrenOf(['dyl-canwyll', 'derwen-canwyll'], 'marriage-rhiannon-cadoc'),
    ...childrenOf(['mawr-canwyll', 'llewella-1699-canwyll'], 'marriage-urien-zyraline-canwyll'),
    ...childrenOf(['orson-canwyll', 'lynee-canwyll'], 'marriage-alaweyn-uvel-saith', {
      notes: 'Explizite matrilineare Canwyll-Fortsetzung der Quelltabelle.'
    }),
    ...childrenOf(['kane-canwyll', 'iesin-canwyll', 'taran-canwyll'], 'marriage-olwyn-dyl'),
    ...childrenOf(['itan-canwyll', 'hollie-canwyll'], 'marriage-gwenaelle-mawr-marchog'),
    ...childrenOf(['ysolt-canwyll', 'hyrs-canwyll'], 'marriage-meghan-orson-sgwarnog')
  ],
  cadetBranches: [
    createLinkedLineBranch({
      id: 'brother-house-crefyddol-llwyarch',
      name: 'Haus Crefyddol',
      parentPartnershipId: 'marriage-llwyarch-lynette-crefyddol',
      houseId: 'house-crefyddol',
      targetFamilyId: 'haus-crefyddol',
      emblem: HOUSE_EMBLEMS.crefyddol,
      subtitle: 'Bruderhaus · gegründet von Llwyarch und Lynette',
      crestFrame: 'gold',
      notes: 'Llwyarch, der Bruder Llwellyns und zweite Sohn Sieffres des Frommen, begründet das eigenständige Haus Crefyddol. Seine Nachkommen werden ausschließlich dort fortgeführt.'
    }),
    marriedAway('married-away-dolena-canwyll-neidr', 'Haus Neidr', 'marriage-powell-dolena', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-gladdie-canwyll-crefyddol', 'Haus Crefyddol', 'marriage-nodawl-gladdie-crefyddol', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-quendolin-canwyll-neidr', 'Haus Neidr', 'marriage-gwythyr-quendolin', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-llewella1608-canwyll-chiffyddlon', 'Haus Chiffyddlon', 'marriage-grufudd-llewella-chiffyddlon', 'house-chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    marriedAway('married-away-branwen-canwyll-pawen', 'Haus Pawen', 'marriage-branwen-rhodri-canwyll', 'house-pawen'),
    marriedAway('married-away-iorwen-canwyll-pyrth', 'Haus Pyrth', 'marriage-iorwen-jethro-canwyll', 'house-pyrth', HOUSE_EMBLEMS.pyrth),
    marriedAway('married-away-enfys-canwyll-selwyn', 'Haus Selwyn', 'marriage-enfys-cadfan-canwyll', 'house-selwyn'),
    marriedAway('married-away-gorm-canwyll-neidr', 'Haus Neidr', 'marriage-aeron-gorm', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-gwenifer-canwyll-draenog', 'Haus Draenog', 'marriage-gwenifer-ywain-canwyll', 'house-draenog'),
    marriedAway('married-away-aeronwen-canwyll-neidr', 'Haus Neidr', 'marriage-conwy-aeronwen', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-glesni-canwyll-grawn', 'Haus Grawn', 'marriage-iestyn-glesni', 'house-grawn', HOUSE_EMBLEMS.grawn),
    marriedAway('married-away-jowan-canwyll-saith', 'Haus Saith', 'marriage-vortigern-jowan-saith', 'house-saith', HOUSE_EMBLEMS.saith),
    marriedAway('married-away-derwen-canwyll-crefyddol', 'Haus Crefyddol', 'marriage-nyfain-derwen-canwyll', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-llewella1699-canwyll-unigol', 'Haus Unigol', 'marriage-llewella-wynston-canwyll', 'house-unigol'),
    marriedAway('married-away-lynee-canwyll-penderyn', 'Haus Penderyn', 'marriage-gethin-lynee-penderyn', 'house-penderyn', HOUSE_EMBLEMS.penderyn)
  ],
  timeJumps: [
    {
      id: GAWAIN_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-merlina-gawain-canwyll',
      parentPersonId: '',
      childIds: ['howell-canwyll', 'quendolin-canwyll'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Canwyll-Generationen',
      notes: 'Der zweite absolute Generationentrenner setzt die Canwyll-Linie ausschließlich unter Gawain und Merlina fort.',
      extensions: {}
    },
    {
      id: HOWELL_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-howell-carlyn-canwyll',
      parentPersonId: '',
      childIds: ['llywarch-canwyll', 'llewella-canwyll'],
      years: 0,
      fromYear: '????',
      toYear: '1605',
      label: 'Die belegte Canwyll-Linie setzt 1605 wieder ein',
      notes: 'Der dritte absolute Generationentrenner setzt die Linie ausschließlich unter Howell und Carlyn fort; Quendolins Neidr-Zweig endet vorher.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-llwellyn-hafren-canwyll',
    houseId: CANWYLL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Llanvane · gegründet von Llwellyn und Hafren',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Canwyll-Generationen'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'sieffre-der-fromme',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Canwyll O'Llanvane (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten und Porträtzuordnungen folgen der bereitgestellten Canwyll-Hausseite. Sieffre der Fromme und Jinelle Neidr sind die gemeinsamen Eltern der Gründerbrüder; Sieffre trägt den Holy Frame. Llwellyn und Hafren tragen allein den Canwyll-Hausknoten und führen diese Akte fort, während Llwyarch und Lynette ausschließlich den verknüpften Bruderhaus-Knoten Crefyddol tragen. Alle drei Punktreihen sind als strikt serielle absolute Generationentrenner modelliert. Der fehlerhafte Tabellenkopf „Cadoc’s & Urien’s“ wurde anhand der Partner- und Spaltenordnung zu Cadoc und Rhiannon berichtigt; Dyl und Derwen sind ihre Kinder, Mawr und die jüngere Llewella stammen von Urien und Zyraline. Die Quellformen Llewelyn/Llewellyn, Crefyddoll, Tegyrnach und Chiffydlon sind auf die bestehenden Projektformen Llwellyn, Crefyddol, Teyrngarch und Chiffyddlon normalisiert. Für die ältere Llewella gelten die genauer gepflegten Chiffyddlon-Daten 1608–1678 statt 1605–1693; Aeronwens offener Lebensstatus folgt der Neidr-Gegenakte trotz eines undatierten Todeskreuzes in der Canwyll-Tabelle. Die chronologisch auffällige Geburt Glesnis 1669 bei 1662 geborenen Eltern bleibt mangels belastbarer Alternativdaten dokumentiert, aber unverändert. Uvel und Alaweyn bilden die ausdrücklich belegte matrilineare Ausnahme: Orson und Lynee werden ausschließlich in Canwyll fortgeführt. Kinder anderer wegverheirateter Canwyll-Frauen bleiben in den jeweiligen Gegenakten. Sämtliche fünfzehn verheirateten Canwyll-Frauen ohne eigene Canwyll-Fortsetzung besitzen direkte Zielhausknoten.',
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
