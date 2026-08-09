import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createLinkedLineBranch,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import {
  SILBERINSEL_HOUSE_EMBLEMS,
  SILBERINSEL_HOUSE_PROFILES
} from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const CREFYDDOL_HOUSE_ID = 'house-crefyddol';
const CREFYDDOL_EMBLEM = SILBERINSEL_HOUSE_EMBLEMS.crefyddol;
const SECOND_TIME_JUMP_ID = 'gap-nodawl-to-merrion-generation-crefyddol';

const HOUSE_EMBLEMS = Object.freeze({
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  crefyddol: CREFYDDOL_EMBLEM,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  saith: SILBERINSEL_HOUSE_EMBLEMS.saith,
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
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

const SUCCESSION_TITLES = Object.freeze({
  'llwyarch-founder-crefyddol': 'Gründer und erster Ritterfürst des Hauses Crefyddol',
  'nodawl-crefyddol': 'Ritterfürst des Hauses Crefyddol',
  'merrion-1582-crefyddol': 'Ritterfürst des Hauses Crefyddol bis 1662',
  'cadwallon-crefyddol': 'Ritterfürst des Hauses Crefyddol 1662–1685',
  'gwastad-crefyddol': 'Ritterfürst des Hauses Crefyddol 1685–1700',
  'lywelyn-crefyddol': 'Ritterfürst des Hauses Crefyddol 1700–1720',
  'kimball-crefydoll': 'Ritterfürst des Hauses Crefyddol seit 1720',
  'merrion-crefyddol': 'Erster Erbe des Hauses Crefyddol',
  'yvain-crefyddol': 'Zweiter Erbe des Hauses Crefyddol'
});

const HOUSE_HEAD_IDS = new Set([
  'llwyarch-founder-crefyddol',
  'nodawl-crefyddol',
  'merrion-1582-crefyddol',
  'cadwallon-crefyddol',
  'gwastad-crefyddol',
  'lywelyn-crefyddol',
  'kimball-crefydoll'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return ['merrion-crefyddol', 'yvain-crefyddol'].includes(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? CREFYDDOL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_CREFYDDOL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CREFYDDOL_HOUSE_ID ? 'core' : 'married'),
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
  llwyarch: ['llwyarch-founder-crefyddol', 'lynette-founder-crefyddol'],
  llwellyn: ['llwellyn-founder-canwyll', 'hafren-founder-canwyll'],
  nodawl: ['nodawl-crefyddol', 'gladdie-canwyll'],
  merlina: ['merlina-crefyddol', 'gawain-canwyll'],
  merrion: ['siana-marwolaeth', 'merrion-1582-crefyddol'],
  igraine: ['arthur-dyngwn', 'irgraine-crefyddol'],
  morien: ['igraine-neidr', 'morien-crefyddol'],
  cadwallon: ['cadwallon-crefyddol', 'zyraline-pyrth'],
  gwendolyn1607: ['gwendolyn-1607-crefyddol', 'llywarch-canwyll'],
  emrys: ['emrys-crefyddol', 'tegwyn-pawen'],
  gwastad: ['eirwyn-1634-pysgod', 'gwastad-crefyddol'],
  ysella: ['argyll-saith', 'ysella-crefyddol'],
  arwel: ['arwel-crefyddol', 'angharad-gwialen'],
  beynam: ['gladdie-neidr', 'beynon-crefyddol'],
  gwindor: ['celyn-wylan', 'gwindor-crefydoll'],
  lunet: ['lunet-crefyddol', 'armela-hebog'],
  lywelyn: ['mairwen-draig', 'lywelyn-crefyddol'],
  hafren: ['hafren-crefyddol', 'gwalchmai-tiwna'],
  blodwyn: ['blodwyn-crefyddol', 'gregory-marwolaeth'],
  hwywell: ['gwyneira-dienyddiwr', 'hwywell-crefyddol'],
  cenawen: ['glendower-dyngwn', 'cenawen-crefyddol'],
  gwydion: ['myfanwy-sgwarnog', 'gwydion-crefyddol'],
  cefinwen: ['cefinwen-crefyddol', 'penkawr-unigol'],
  kimball: ['deryn-wylan', 'kimball-crefydoll'],
  gwendolyn1674: ['darwyn-saith', 'gwendolyn-crefyddol'],
  lamorak: ['lamorak-crefyddol', 'telyn-coedwig'],
  gwendolen: ['gwendolen-crefyddol', 'wyndham-eirth'],
  gethin: ['gethin-crefyddol', 'katewen-morthwyl'],
  aneirin: ['anwen-penderyn', 'aneurin-crefyddol'],
  merrion1698: ['ael-neidr', 'merrion-crefyddol'],
  crystin: ['ninian-neidr', 'crystin-crefyddol'],
  nyfain: ['nyfain-crefyddol', 'derwen-canwyll'],
  siana: ['siana-crefyddol-sgwarnog', 'meical-sgwarnog'],
  rhisiog: ['nessa-chiffyddlon', 'rhisiog-crefyddol'],
  rhisiart: ['rhisiart-crefyddol', 'jeanae-gwarchod']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-jinelle-sieffre': COUPLES.sieffre,
  'marriage-llwyarch-lynette-crefyddol': COUPLES.llwyarch,
  'marriage-llwellyn-hafren-canwyll': COUPLES.llwellyn,
  'marriage-nodawl-gladdie-crefyddol': COUPLES.nodawl,
  'marriage-merlina-gawain-canwyll': COUPLES.merlina,
  'marriage-siana-merrion-marwolaeth': COUPLES.merrion,
  'marriage-arthur-irgraine-dyngwn': COUPLES.igraine,
  'marriage-igraine-morien': COUPLES.morien,
  'marriage-cadwallon-zyraline-crefyddol': COUPLES.cadwallon,
  'marriage-gwendolyn-llywarch-canwyll': COUPLES.gwendolyn1607,
  'marriage-emrys-tegwyn-crefyddol': COUPLES.emrys,
  'marriage-eirwyn1634-gwastad': COUPLES.gwastad,
  'marriage-argyll-ysella-saith': COUPLES.ysella,
  'marriage-arwel-angharad-crefyddol': COUPLES.arwel,
  'marriage-gladdie-beynon': COUPLES.beynam,
  'marriage-celyn-gwindor': COUPLES.gwindor,
  'marriage-lunet-armela-crefyddol': COUPLES.lunet,
  'marriage-mairwen-lywelyn': COUPLES.lywelyn,
  'marriage-hafren-gwalchmai-crefyddol': COUPLES.hafren,
  'marriage-gregory-blodwyn-marwolaeth': COUPLES.blodwyn,
  'marriage-gwyneira-hwywell-dienyddiwr': COUPLES.hwywell,
  'marriage-glendower-cenawen-dyngwn': COUPLES.cenawen,
  'marriage-myfanwy-gwydion-sgwarnog': COUPLES.gwydion,
  'marriage-cefinwen-penkawr-unigol': COUPLES.cefinwen,
  'marriage-deryn-kimball': COUPLES.kimball,
  'marriage-darwyn-gwendolyn-saith': COUPLES.gwendolyn1674,
  'marriage-lamorak-telyn-crefyddol': COUPLES.lamorak,
  'marriage-gwendolen-wyndham-eirth': COUPLES.gwendolen,
  'marriage-gethin-katewen-crefyddol': COUPLES.gethin,
  'marriage-anwen-aneurin-crefyddol': COUPLES.aneirin,
  'marriage-ael-merrion': COUPLES.merrion1698,
  'marriage-ninian-crystin': COUPLES.crystin,
  'marriage-nyfain-derwen-canwyll': COUPLES.nyfain,
  'marriage-meical-siana-sgwarnog': COUPLES.siana,
  'marriage-nessa-rhisiog-chiffyddlon': COUPLES.rhisiog,
  'marriage-jeanae-rhisiart-gwarchod': COUPLES.rhisiart
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'crefyddol-parentage',
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

export const HOUSE_CREFYDDOL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-crefyddol',
    title: "Haus Crefyddol O'Llanvane",
    motto: 'Licht in der Nacht.',
    description: 'Frommes Ritterfürstenhaus von Llanvane, gegründet von Llwyarch, dem Sohn Sieffres des Frommen. Sein Bruder Llwellyn begründete Haus Canwyll.',
    emblem: CREFYDDOL_EMBLEM,
    houseProfile: SILBERINSEL_HOUSE_PROFILES.crefyddol
  },
  houses: [
    house(CREFYDDOL_HOUSE_ID, "Haus Crefyddol O'Llanvane", CREFYDDOL_EMBLEM),
    house('house-canwyll', "Haus Canwyll O'Llanvane", HOUSE_EMBLEMS.canwyll),
    house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-pawen', 'Haus Pawen'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-saith', 'Haus Saith', HOUSE_EMBLEMS.saith),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-hebog', 'Haus Hebog'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-sgwarnog', 'Haus Sgwarnog', HOUSE_EMBLEMS.sgwarnog),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-eirth', 'Haus Eirth'),
    house('house-morthwyll', 'Haus Morthwyll'),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod),
    house('house-unigol', 'Haus Unigol')
  ],
  persons: [
    spouse('sieffre-der-fromme', 'Sieffre der Fromme', 'male', '????', '????', '', {
      title: 'Heiliger Priester · Stammvater der Bruderhäuser Crefyddol und Canwyll',
      extensions: { cardFrameId: 'holy' }
    }),
    spouse('jinelle-neidr', 'Jinelle Neidr', 'female', '????', '????', 'house-neidr'),

    person('llwyarch-founder-crefyddol', 'Llwyarch Crefyddol', 'male', '????', '????'),
    spouse('lynette-founder-crefyddol', 'Lynette', 'female', '????', '????'),
    spouse('llwellyn-founder-canwyll', 'Llwellyn Canwyll', 'male', '????', '????', 'house-canwyll', {
      familyRole: 'core',
      title: 'Gründer des Bruderhauses Canwyll'
    }),
    spouse('hafren-founder-canwyll', 'Hafren', 'female', '????', '????'),

    person('nodawl-crefyddol', 'Nodawl Crefyddol', 'male', '????', '????'),
    awayWoman('merlina-crefyddol', 'Merlina Crefyddol', '????', '????', 'Haus Canwyll'),
    spouse('gladdie-canwyll', 'Gladdie Canwyll', 'female', '????', '????', 'house-canwyll'),
    spouse('gawain-canwyll', 'Gawain Canwyll', 'male', '????', '????', 'house-canwyll'),

    person('merrion-1582-crefyddol', 'Merrion Crefyddol', 'male', '1582', '1662'),
    awayWoman('irgraine-crefyddol', 'Irgraine Crefyddol', '1585', '1655', 'Haus Dyngwn'),
    person('morien-crefyddol', 'Morien Crefyddol', 'male', '1587', '1615'),
    spouse('siana-marwolaeth', 'Siana Marwolaeth', 'female', '1586', '1693', 'house-marwolaeth'),
    spouse('arthur-dyngwn', 'Arthur Dyngwn', 'male', '1579', '1676', 'house-dyngwn'),
    spouse('igraine-neidr', 'Igraine Neidr', 'female', '1579', '1615', 'house-neidr'),

    person('cadwallon-crefyddol', 'Cadwallon Crefyddol', 'male', '1604', '1685'),
    awayWoman('gwendolyn-1607-crefyddol', 'Gwendolyn Crefyddol', '1607', '1680', 'Haus Canwyll'),
    person('emrys-crefyddol', 'Emrys Crefyddol', 'male', '1615', '1676'),
    spouse('zyraline-pyrth', 'Zyraline Pyrth', 'female', '1609', '1670', 'house-pyrth'),
    spouse('llywarch-canwyll', 'Llywarch Canwyll', 'male', '1605', '1676', 'house-canwyll'),
    spouse('tegwyn-pawen', 'Tegwyn Pawen', 'female', '1616', '1680', 'house-pawen'),

    person('gwastad-crefyddol', 'Gwastad Crefyddol', 'male', '1630', '1700'),
    awayWoman('ysella-crefyddol', 'Ysella Crefyddol', '1632', '1694', 'Haus Saith'),
    person('arwel-crefyddol', 'Arwel Crefyddol', 'male', '1634', '1704'),
    person('beynon-crefyddol', 'Beynon Crefyddol', 'male', '1628', '1713', {
      notes: 'Die Crefyddol-Quelle schreibt den Namen einmal als Beyon; die bestehende Neidr-Gegenakte führt kanonisch Beynon.'
    }),
    person('gwindor-crefydoll', 'Gwindor Crefyddol', 'male', '1631', '1673'),
    person('lunet-crefyddol', 'Lunet Crefyddol', 'male', '1634', '1709'),
    spouse('eirwyn-1634-pysgod', 'Eirwyn Pysgod', 'female', '1634', '1710', 'house-pysgod'),
    spouse('argyll-saith', 'Argyll Saith', 'male', '1629', '1701', 'house-saith'),
    spouse('angharad-gwialen', 'Angharad Gwialen', 'female', '1636', '1712', 'house-gwialen'),
    spouse('gladdie-neidr', 'Gladdie Neidr', 'female', '1627', '1699', 'house-neidr'),
    spouse('celyn-wylan', 'Célyn Wylan', 'female', '1633', '1712', 'house-wylan', {
      notes: 'Die Wylan-Herkunftsakte belegt das Todesjahr 1712; die Crefyddol-Tabelle nennt abweichend 1705.'
    }),
    spouse('armela-hebog', 'Armela Hebog', 'female', '1635', '1689', 'house-hebog'),

    person('lywelyn-crefyddol', 'Lywelyn Crefyddol', 'male', '1652', '1720'),
    awayWoman('hafren-crefyddol', 'Hafren Crefyddol', '1655', '1689', 'Haus Tiwna'),
    awayWoman('blodwyn-crefyddol', 'Blodwyn Crefyddol', '1654', '1711', 'Haus Marwolaeth'),
    person('hwywell-crefyddol', 'Hwywell Crefyddol', 'male', '1656', '1720'),
    awayWoman('cenawen-crefyddol', 'Cenawen Crefyddol', '1657', '1705', 'Haus Dyngwn'),
    person('gwydion-crefyddol', "Gwydion Crefyddol O'Llanvane", 'male', '1651', '1735'),
    awayWoman('cefinwen-crefyddol', 'Cefinwen Crefyddol', '1664', '', 'Haus Unigol'),
    spouse('mairwen-draig', 'Mairwen Draig', 'female', '1654', '1731', 'house-draig'),
    spouse('gwalchmai-tiwna', 'Gwalchmai Tiwna', 'male', '1655', '1710', 'house-tiwna'),
    spouse('gregory-marwolaeth', 'Gregory Marwolaeth', 'male', '1654', '1720', 'house-marwolaeth'),
    spouse('gwyneira-dienyddiwr', 'Gwyneira Dienyddiwr', 'female', '1657', '1680', 'house-dienyddiwr'),
    spouse('glendower-dyngwn', 'Glendower Dyngwn', 'male', '1655', '1720', 'house-dyngwn'),
    spouse('myfanwy-sgwarnog', 'Myfanwy Sgwarnog', 'female', '1652', '1703', 'house-sgwarnog'),
    spouse('penkawr-unigol', 'Penkawr Unigol', 'male', '1663', '1725', 'house-unigol', {
      notes: 'Das offenkundig unmögliche Quelljahr 1625 wurde als Zahlendreher zu 1725 normalisiert.'
    }),

    person('kimball-crefydoll', 'Kimball Crefyddol', 'male', '1673', ''),
    awayWoman('gwendolyn-crefyddol', 'Gwendolyn Crefyddol', '1674', '', 'Haus Saith'),
    person('lamorak-crefyddol', 'Lamorak Crefyddol', 'male', '1675', '1725'),
    awayWoman('gwendolen-crefyddol', 'Gwendolen Crefyddol', '1678', '', 'Haus Eirth'),
    person('gethin-crefyddol', 'Gethin Crefyddol', 'male', '1675', ''),
    person('aneurin-crefyddol', 'Aneurin Crefyddol', 'male', '1675', ''),
    spouse('deryn-wylan', 'Deryn Wylan', 'female', '1678', '', 'house-wylan'),
    spouse('darwyn-saith', 'Darwyn Saith', 'male', '1676', '', 'house-saith'),
    spouse('telyn-coedwig', 'Telyn Coedwig', 'female', '1674', '', 'house-coedwig'),
    spouse('wyndham-eirth', 'Wyndham Eirth', 'male', '1676', '', 'house-eirth'),
    spouse('katewen-morthwyl', 'Katewen Morthwyll', 'female', '1679', '1735', 'house-morthwyll'),
    spouse('anwen-penderyn', 'Anwen Penderyn', 'female', '1678', '1733', 'house-penderyn'),

    person('merrion-crefyddol', 'Merrion Crefyddol', 'male', '1698', ''),
    awayWoman('crystin-crefyddol', 'Crystin Crefyddol', '1700', '', 'Haus Neidr'),
    person('nyfain-crefyddol', 'Nyfain Crefyddol', 'male', '1696', ''),
    awayWoman('siana-crefyddol-sgwarnog', "Siana Crefyddol O'Llanvane", '1700', '', 'Haus Sgwarnog'),
    person('rhisiog-crefyddol', 'Rhisiog Crefyddol', 'male', '1698', ''),
    person('rhisiart-crefyddol', 'Rhisiart Crefyddol', 'male', '1698', ''),
    spouse('ael-neidr', 'Ael Neidr', 'female', '1700', '', 'house-neidr'),
    spouse('ninian-neidr', 'Ninian Neidr', 'male', '1699', '', 'house-neidr'),
    spouse('derwen-canwyll', 'Derwen Canwyll', 'female', '1702', '', 'house-canwyll'),
    spouse('meical-sgwarnog', 'Meical Sgwarnog', 'male', '1697', '', 'house-sgwarnog'),
    spouse('nessa-chiffyddlon', 'Nessa Chiffyddlon', 'female', '1696', '', 'house-chiffyddlon'),
    spouse('jeanae-gwarchod', 'Jeanae Gwarchod', 'female', '1700', '', 'house-gwarchod'),

    person('yvain-crefyddol', 'Yvain Crefyddol', 'male', '1723', ''),
    person('nye-crefyddol', 'Nye Crefyddol', 'male', '1721', ''),
    person('lowri-crefyddol', 'Lowri Crefyddol', 'female', '1722', ''),
    person('micah-crefyddol', 'Micah Crefyddol', 'male', '1722', ''),
    person('jenni-crefyddol', 'Jenni Crefyddol', 'female', '1726', ''),
    person('urien-crefyddol', 'Urien Crefyddol', 'male', '1722', ''),
    person('merriam-crefyddol', 'Merriam Crefyddol', 'female', '1726', '')
  ],
  partnerships: [
    createMarriage('marriage-jinelle-sieffre', ...COUPLES.sieffre, {
      notes: 'Aus der Verbindung gingen Llwyarch, Gründer von Crefyddol, und Llwellyn, Gründer von Canwyll, hervor.'
    }),
    createMarriage('marriage-llwyarch-lynette-crefyddol', ...COUPLES.llwyarch),
    createMarriage('marriage-llwellyn-hafren-canwyll', ...COUPLES.llwellyn),
    createMarriage('marriage-nodawl-gladdie-crefyddol', ...COUPLES.nodawl),
    createMarriage('marriage-merlina-gawain-canwyll', ...COUPLES.merlina),
    createMarriage('marriage-siana-merrion-marwolaeth', ...COUPLES.merrion),
    createMarriage('marriage-arthur-irgraine-dyngwn', ...COUPLES.igraine),
    createMarriage('marriage-igraine-morien', ...COUPLES.morien),
    createMarriage('marriage-cadwallon-zyraline-crefyddol', ...COUPLES.cadwallon),
    createMarriage('marriage-gwendolyn-llywarch-canwyll', ...COUPLES.gwendolyn1607),
    createMarriage('marriage-emrys-tegwyn-crefyddol', ...COUPLES.emrys),
    createMarriage('marriage-eirwyn1634-gwastad', ...COUPLES.gwastad),
    createMarriage('marriage-argyll-ysella-saith', ...COUPLES.ysella, { status: 'ended', end: '1694' }),
    createMarriage('marriage-arwel-angharad-crefyddol', ...COUPLES.arwel),
    createMarriage('marriage-gladdie-beynon', ...COUPLES.beynam),
    createMarriage('marriage-celyn-gwindor', ...COUPLES.gwindor),
    createMarriage('marriage-lunet-armela-crefyddol', ...COUPLES.lunet),
    createMarriage('marriage-mairwen-lywelyn', ...COUPLES.lywelyn),
    createMarriage('marriage-hafren-gwalchmai-crefyddol', ...COUPLES.hafren),
    createMarriage('marriage-gregory-blodwyn-marwolaeth', ...COUPLES.blodwyn),
    createMarriage('marriage-gwyneira-hwywell-dienyddiwr', ...COUPLES.hwywell),
    createMarriage('marriage-glendower-cenawen-dyngwn', ...COUPLES.cenawen),
    createMarriage('marriage-myfanwy-gwydion-sgwarnog', ...COUPLES.gwydion, { status: 'ended', end: '1703' }),
    createMarriage('marriage-cefinwen-penkawr-unigol', ...COUPLES.cefinwen),
    createMarriage('marriage-deryn-kimball', ...COUPLES.kimball),
    createMarriage('marriage-darwyn-gwendolyn-saith', ...COUPLES.gwendolyn1674),
    createMarriage('marriage-lamorak-telyn-crefyddol', ...COUPLES.lamorak, { status: 'ended', end: '1725' }),
    createMarriage('marriage-gwendolen-wyndham-eirth', ...COUPLES.gwendolen),
    createMarriage('marriage-gethin-katewen-crefyddol', ...COUPLES.gethin),
    createMarriage('marriage-anwen-aneurin-crefyddol', ...COUPLES.aneirin, { status: 'widowed', end: '1733' }),
    createMarriage('marriage-ael-merrion', ...COUPLES.merrion1698),
    createMarriage('marriage-ninian-crystin', ...COUPLES.crystin),
    createMarriage('marriage-nyfain-derwen-canwyll', ...COUPLES.nyfain),
    createMarriage('marriage-meical-siana-sgwarnog', ...COUPLES.siana),
    createMarriage('marriage-nessa-rhisiog-chiffyddlon', ...COUPLES.rhisiog),
    createMarriage('marriage-jeanae-rhisiart-gwarchod', ...COUPLES.rhisiart)
  ],
  parentages: [
    ...childrenOf(['llwyarch-founder-crefyddol', 'llwellyn-founder-canwyll'], 'marriage-jinelle-sieffre'),
    ...childrenOf(['nodawl-crefyddol', 'merlina-crefyddol'], 'marriage-llwyarch-lynette-crefyddol', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Llwyarch und dieser Generation liegen nicht einzeln überlieferte Crefyddol-Vorfahren.'
    }),
    ...childrenOf(['merrion-1582-crefyddol', 'irgraine-crefyddol', 'morien-crefyddol'], 'marriage-nodawl-gladdie-crefyddol', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Nodawl und der ab 1582 belegten Generation liegen nicht einzeln überlieferte Crefyddol-Vorfahren.',
      extensions: { timeJumpId: SECOND_TIME_JUMP_ID }
    }),
    ...childrenOf(['cadwallon-crefyddol', 'gwendolyn-1607-crefyddol', 'emrys-crefyddol'], 'marriage-siana-merrion-marwolaeth'),
    ...childrenOf(['gwastad-crefyddol', 'ysella-crefyddol', 'arwel-crefyddol'], 'marriage-cadwallon-zyraline-crefyddol'),
    ...childrenOf(['beynon-crefyddol', 'gwindor-crefydoll', 'lunet-crefyddol'], 'marriage-emrys-tegwyn-crefyddol'),
    ...childrenOf(['lywelyn-crefyddol', 'hafren-crefyddol'], 'marriage-eirwyn1634-gwastad'),
    ...childrenOf(['blodwyn-crefyddol', 'hwywell-crefyddol'], 'marriage-arwel-angharad-crefyddol'),
    ...childrenOf(['cenawen-crefyddol'], 'marriage-gladdie-beynon'),
    ...childrenOf(['gwydion-crefyddol'], 'marriage-celyn-gwindor'),
    ...childrenOf(['cefinwen-crefyddol'], 'marriage-lunet-armela-crefyddol'),
    ...childrenOf(['kimball-crefydoll', 'gwendolyn-crefyddol', 'lamorak-crefyddol'], 'marriage-mairwen-lywelyn'),
    ...childrenOf(['gwendolen-crefyddol', 'gethin-crefyddol'], 'marriage-gwyneira-hwywell-dienyddiwr'),
    ...childrenOf(['aneurin-crefyddol'], 'marriage-myfanwy-gwydion-sgwarnog'),
    ...childrenOf(['merrion-crefyddol', 'crystin-crefyddol'], 'marriage-deryn-kimball'),
    ...childrenOf(['nyfain-crefyddol', 'siana-crefyddol-sgwarnog'], 'marriage-lamorak-telyn-crefyddol'),
    ...childrenOf(['rhisiog-crefyddol'], 'marriage-gethin-katewen-crefyddol'),
    ...childrenOf(['rhisiart-crefyddol'], 'marriage-anwen-aneurin-crefyddol'),
    ...childrenOf(['yvain-crefyddol'], 'marriage-ael-merrion'),
    ...childrenOf(['nye-crefyddol', 'lowri-crefyddol'], 'marriage-nyfain-derwen-canwyll'),
    ...childrenOf(['micah-crefyddol', 'jenni-crefyddol'], 'marriage-nessa-rhisiog-chiffyddlon'),
    ...childrenOf(['urien-crefyddol', 'merriam-crefyddol'], 'marriage-jeanae-rhisiart-gwarchod')
  ],
  cadetBranches: [
    createLinkedLineBranch({
      id: 'brother-house-canwyll-llwellyn',
      name: 'Haus Canwyll',
      parentPartnershipId: 'marriage-llwellyn-hafren-canwyll',
      houseId: 'house-canwyll',
      targetFamilyId: 'haus-canwyll',
      emblem: HOUSE_EMBLEMS.canwyll,
      subtitle: 'Bruderhaus · gegründet von Llwellyn und Hafren',
      crestFrame: 'gold',
      notes: 'Llwellyn, der Bruder Llwyarchs und zweite Sohn Sieffres des Frommen, begründet das eigenständige Haus Canwyll. Seine Nachkommen werden ausschließlich dort fortgeführt.'
    }),
    marriedAway('married-away-merlina-crefyddol-canwyll', 'Haus Canwyll', 'marriage-merlina-gawain-canwyll', 'house-canwyll', HOUSE_EMBLEMS.canwyll),
    marriedAway('married-away-irgraine-crefyddol-dyngwn', 'Haus Dyngwn', 'marriage-arthur-irgraine-dyngwn', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-gwendolyn1607-crefyddol-canwyll', 'Haus Canwyll', 'marriage-gwendolyn-llywarch-canwyll', 'house-canwyll', HOUSE_EMBLEMS.canwyll),
    marriedAway('married-away-ysella-crefyddol-saith', 'Haus Saith', 'marriage-argyll-ysella-saith', 'house-saith', HOUSE_EMBLEMS.saith),
    marriedAway('married-away-hafren-crefyddol-tiwna', 'Haus Tiwna', 'marriage-hafren-gwalchmai-crefyddol', 'house-tiwna', HOUSE_EMBLEMS.tiwna),
    marriedAway('married-away-blodwyn-crefyddol-marwolaeth', 'Haus Marwolaeth', 'marriage-gregory-blodwyn-marwolaeth', 'house-marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    marriedAway('married-away-cenawen-crefyddol-dyngwn', 'Haus Dyngwn', 'marriage-glendower-cenawen-dyngwn', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-cefinwen-crefyddol-unigol', 'Haus Unigol', 'marriage-cefinwen-penkawr-unigol', 'house-unigol'),
    marriedAway('married-away-gwendolyn-crefyddol-saith', 'Haus Saith', 'marriage-darwyn-gwendolyn-saith', 'house-saith', HOUSE_EMBLEMS.saith),
    marriedAway('married-away-gwendolen-crefyddol-eirth', 'Haus Eirth', 'marriage-gwendolen-wyndham-eirth', 'house-eirth'),
    marriedAway('married-away-crystin-crefyddol-neidr', 'Haus Neidr', 'marriage-ninian-crystin', 'house-neidr', HOUSE_EMBLEMS.neidr),
    marriedAway('married-away-siana-crefyddol-sgwarnog', 'Haus Sgwarnog', 'marriage-meical-siana-sgwarnog', 'house-sgwarnog', HOUSE_EMBLEMS.sgwarnog)
  ],
  timeJumps: [
    {
      id: SECOND_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-nodawl-gladdie-crefyddol',
      parentPersonId: '',
      childIds: ['merrion-1582-crefyddol', 'irgraine-crefyddol', 'morien-crefyddol'],
      years: 0,
      fromYear: '????',
      toYear: '1582',
      label: 'Die belegte Crefyddol-Linie setzt 1582 wieder ein',
      notes: 'Der zweite absolute Generationentrenner liegt ausschließlich unter Nodawl und Gladdie; Merlinas Canwyll-Zweig speist ihn nicht.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-llwyarch-lynette-crefyddol',
    houseId: CREFYDDOL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Llanvane · gegründet von Llwyarch und Lynette',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Crefyddol-Generationen'
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
    sourceRevision: 4,
    sourceModule: "Haus Crefyddoll O'Llanvane (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Amtsfolge und Porträtzuordnungen folgen der bereitgestellten Crefyddoll-Hausseite. Die Nutzerfestlegung und der ausführliche Geschichtstext haben Vorrang vor der widersprüchlichen Tabellenzeile, die fälschlich Bors Saith und Gwennan Neidr als Ursprung nennt: Sieffre der Fromme und Jinelle Neidr sind die gemeinsamen Eltern der Hausgründer. Sieffre trägt den Holy Frame. Llwyarch und Lynette tragen allein den Crefyddol-Hausknoten und führen diese Akte fort; Llwellyn und Hafren tragen ausschließlich den verknüpften Bruderhaus-Knoten Canwyll. Beide überlieferten Punktreihen werden als strikt serielle Zeitsprünge geführt. Die Schreibweisen Crefyddoll/Crefydoll und Beyon werden unter den bestehenden Projektformen Crefyddol und Beynon vereinheitlicht; die stabilen Gegenakten-IDs gwindor-crefydoll und kimball-crefydoll bleiben zur Identitätserhaltung bestehen. Penkawrs unmögliches Todesjahr 1625 ist zu 1725 normalisiert. Célyn Wylans Todesjahr 1712 folgt ihrer ausführlicheren Wylan-Herkunftsakte statt der hier genannten 1705. Kinder werden nur im fortführenden Haus geführt: Rhondia bei Dyngwn, Argylls Nachkommen bei Saith, Gregorys Nachkommen bei Marwolaeth, Glendowers Nachkommen bei Dyngwn, Darwyns Nachkommen bei Saith und Ninians Nachkommen bei Neidr; die Crefyddol-Nachkommen stehen ausschließlich hier. Sämtliche zwölf wegverheirateten Crefyddol-Frauen besitzen direkte Zielhausknoten. Revision 2 ergänzt das inzwischen belegte Gwialen-Wappen an der gemeinsamen Ehe Arwel/Angharad; Revision 4 vereinheitlicht Katewens Herkunft technisch mit der kanonischen Haus-ID `house-morthwyll`.',
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
