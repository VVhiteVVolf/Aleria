import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_PAWEN_PORTRAITS } from './house-pawen-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { TAL_DER_MILANE_HOUSE_EMBLEMS } from './tal-der-milane-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';

const PAWEN_HOUSE_ID = 'house-pawen';
const PAWEN_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.pawen;
const FOUNDER_TIME_JUMP_ID = 'gap-lamorak-to-cadoc-pawen';

const HOUSE_EMBLEMS = Object.freeze({
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  canwyll: SILBERINSEL_HOUSE_EMBLEMS.canwyll,
  cath: VORTIGERNS_RUH_HOUSE_EMBLEMS.cath,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  cwningod: KLAUENINSEL_HOUSE_EMBLEMS.cwningod,
  eirth: KLAUENINSEL_HOUSE_EMBLEMS.eirth,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
  neidr: SILBERINSEL_HOUSE_EMBLEMS.neidr,
  pawen: PAWEN_EMBLEM,
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
  unigol: KLAUENINSEL_HOUSE_EMBLEMS.unigol
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

const MAINLINE_IDS = new Set([
  'cadoc-pawen',
  'sadwrn-pawen',
  'rhodri-pawen',
  'brac-pawen',
  'lamorak-pawen',
  'amaethon-pawen',
  'ianto-pawen'
]);

function lineageRoleFor(personId) {
  if (personId === 'amaethon-pawen') return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? PAWEN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_PAWEN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === PAWEN_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['lamorak-arth', 'mared-unknown'],
  cadoc: ['cadoc-pawen', 'kerenza-crafanc'],
  ceridwen: ['trahaern-arth', 'ceridwen-pawen'],
  sadwrn: ['isobel-1614-arth', 'sadwrn-pawen'],
  tegwyn: ['emrys-crefyddol', 'tegwyn-pawen'],
  rhodri: ['branwen-canwyll', 'rhodri-pawen'],
  morwen: ['madoc-tiwna', 'morwen-pawen'],
  grufudd: ['heledd-cath', 'grufudd-pawen'],
  brac: ['tarian-arth', 'brac-pawen'],
  libet: ['libet-pawen', 'artus-gwialen'],
  rhonwen: ['aneirin-brithyll', 'rhonwen-pawen'],
  lamorak: ['genofeva-neidr', 'lamorak-pawen'],
  gwenfrewi: ['domnall-arth', 'gwenfrewi-pawen'],
  blegywryd: ['blegywryd-pawen', 'mair-unknown-pawen'],
  amaethon: ['amaethon-pawen', 'glinda-crafanc'],
  joally: ['joally-pawen', 'tegid-cwningod'],
  lwyd: ['naili-mwyalchen', 'lwyd-pawen'],
  march: ['march-pawen', 'mabil-morfil'],
  mared: ['mared-pawen', 'urien-eirth']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-lamorak-mared': COUPLES.founders,
  'marriage-cadoc-kerenza-pawen': COUPLES.cadoc,
  'marriage-trahaern-ceridwen': COUPLES.ceridwen,
  'marriage-isobel-sadwrn': COUPLES.sadwrn,
  'marriage-emrys-tegwyn-crefyddol': COUPLES.tegwyn,
  'marriage-branwen-rhodri-canwyll': COUPLES.rhodri,
  'marriage-madoc-morwen-tiwna': COUPLES.morwen,
  'marriage-heledd-grufudd-pawen': COUPLES.grufudd,
  'marriage-tarian-brac': COUPLES.brac,
  'marriage-libet-artus-gwialen': COUPLES.libet,
  'marriage-aneirin-rhonwen-brithyll': COUPLES.rhonwen,
  'marriage-genofeva-lamorak': COUPLES.lamorak,
  'marriage-domnall-gwenfrewi': COUPLES.gwenfrewi,
  'marriage-blegywryd-mair-pawen': COUPLES.blegywryd,
  'marriage-amaethon-glinda-pawen': COUPLES.amaethon,
  'marriage-joally-tegid-pawen': COUPLES.joally,
  'marriage-naili-lwyd-mwyalchen': COUPLES.lwyd,
  'marriage-march-mabil-morfil': COUPLES.march,
  'marriage-mared-urien-pawen': COUPLES.mared
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'pawen-parentage',
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

export const HOUSE_PAWEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-pawen',
    title: "Haus Pawen O'Talgarth",
    motto: 'Die Pranke des Bären vereint Entschlossenheit und Stärke.',
    description: 'Ältestes Kadettenhaus der Arth und ritterfürstliche Pranke Talgarths.',
    emblem: PAWEN_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.pawen
  },
  houses: [
    house(PAWEN_HOUSE_ID, "Haus Pawen O'Talgarth", PAWEN_EMBLEM),
    house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
    house('house-unbekannt-mared', 'Unbekanntes Haus'),
    house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
    house('house-crefyddol', "Haus Crefyddol O'Llanvane", HOUSE_EMBLEMS.crefyddol),
    house('house-canwyll', "Haus Canwyll O'Llanvane", HOUSE_EMBLEMS.canwyll),
    house('house-tiwna', "Haus Tiwna O'Eiddon", HOUSE_EMBLEMS.tiwna),
    house('house-cath', "Haus Cath O'Mathragon", HOUSE_EMBLEMS.cath),
    house('house-gwialen', "Haus Gwialen O'Tredegar", HOUSE_EMBLEMS.gwialen),
    house('house-brithyll', "Haus Brithyll O'Tredegar", HOUSE_EMBLEMS.brithyll),
    house('house-neidr', "Haus Neidr O'Llanvane", HOUSE_EMBLEMS.neidr),
    house('house-unbekannt-mair', 'Unbekanntes Haus'),
    house('house-cwningod', "Haus Cwningod O'Morea", HOUSE_EMBLEMS.cwningod),
    house('house-mwyalchen', "Haus Mwyalchen O'Penbryn", HOUSE_EMBLEMS.mwyalchen),
    house('house-morfil', "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil),
    house('house-eirth', "Haus Eirth O'Caer Glaslyn", HOUSE_EMBLEMS.eirth),
    house('house-unigol', "Haus Unigol O'Caer Marwor", HOUSE_EMBLEMS.unigol)
  ],
  persons: [
    person('lamorak-arth', 'Lamorak Arth', 'male', '????', '????', {
      houseId: 'house-arth',
      familyRole: 'core',
      title: 'Gründer des Hauses Pawen'
    }),
    spouse('mared-unknown', 'Mared', 'female', '????', '????', 'house-unbekannt-mared', {
      worldPersonId: 'person--haus-unbekannt-mared--mared-unknown',
      title: 'Mitgründerin des Hauses Pawen'
    }),

    person('cadoc-pawen', 'Cadoc Pawen', 'male', '1592', '1643'),
    person('ceridwen-pawen', 'Ceridwen Pawen', 'female', '1595', '1662', {
      title: 'Mitgründerin des Hauses Unigol',
      tags: ['Kadettenhausgründerin']
    }),
    spouse('kerenza-crafanc', 'Kerenza Crafanc', 'female', '1596', '1643', 'house-crafanc'),
    spouse('trahaern-arth', 'Trahaern Arth', 'male', '1594', '1669', 'house-arth', {
      title: 'Mitgründer des Hauses Unigol'
    }),

    person('sadwrn-pawen', 'Sadwrn Pawen', 'male', '1614', '1670'),
    awayWoman('tegwyn-pawen', 'Tegwyn Pawen', '1616', '1680', 'Haus Crefyddol'),
    spouse('isobel-1614-arth', 'Isobel Arth', 'female', '1614', '1658', 'house-arth'),
    spouse('emrys-crefyddol', 'Emrys Crefyddol', 'male', '1615', '1676', 'house-crefyddol'),

    person('rhodri-pawen', 'Rhodri Pawen', 'male', '1641', '1695'),
    awayWoman('morwen-pawen', 'Morwen Pawen', '1642', '1659', 'Haus Tiwna'),
    person('grufudd-pawen', 'Grufudd Pawen', 'male', '1644', '1710'),
    spouse('branwen-canwyll', 'Branwen Canwyll', 'female', '1640', '1705', 'house-canwyll'),
    spouse('madoc-tiwna', 'Madoc Tiwna', 'male', '1630', '1705', 'house-tiwna', {
      title: 'Baron des Hauses Tiwna 1683–1705'
    }),
    spouse('heledd-cath', 'Heledd Cath', 'female', '1645', '1699', 'house-cath'),

    person('brac-pawen', 'Brac Pawen', 'male', '1660'),
    awayWoman('libet-pawen', 'Libet Pawen', '1660', '1693', 'Haus Gwialen'),
    awayWoman('rhonwen-pawen', 'Rhonwen Pawen', '1661', '1710', 'Haus Brithyll'),
    spouse('tarian-arth', 'Tarian Arth', 'female', '1660', '1710', 'house-arth'),
    spouse('artus-gwialen', 'Artus Gwialen', 'male', '1659', '1721', 'house-gwialen', {
      title: 'Ritterfürst des Hauses Gwialen 1702–1721'
    }),
    spouse('aneirin-brithyll', 'Aneirin Brithyll', 'male', '1660', '1720', 'house-brithyll'),

    person('lamorak-pawen', 'Lamorak Pawen', 'male', '1678'),
    awayWoman('gwenfrewi-pawen', 'Gwenfrewi Pawen', '1678', '1720', 'Haus Arth'),
    person('blegywryd-pawen', 'Blegywryd Pawen', 'male', '1678'),
    spouse('genofeva-neidr', 'Genofeva Neidr', 'female', '1679', '', 'house-neidr'),
    spouse('domnall-arth', 'Domnall Arth', 'male', '1672', '1720', 'house-arth'),
    spouse('mair-unknown-pawen', 'Mair', 'female', '1675', '1725', 'house-unbekannt-mair'),

    person('amaethon-pawen', 'Amaethon Pawen', 'male', '1695'),
    awayWoman('joally-pawen', 'Joally Pawen', '1696', '', 'Haus Cwningod'),
    person('lwyd-pawen', 'Lwyd Pawen', 'male', '1697'),
    person('march-pawen', 'March Pawen', 'male', '1696'),
    awayWoman('mared-pawen', 'Mared Pawen', '1697', '', 'Haus Eirth'),
    spouse('glinda-crafanc', 'Glinda Crafanc', 'female', '1693', '', 'house-crafanc'),
    spouse('tegid-cwningod', 'Tegid Cwningod', 'male', '1695', '', 'house-cwningod'),
    spouse('naili-mwyalchen', 'Naili Mwyalchen', 'female', '1697', '', 'house-mwyalchen'),
    spouse('mabil-morfil', 'Mabil Morfil', 'female', '1698', '', 'house-morfil'),
    spouse('urien-eirth', 'Urien Eirth', 'male', '1695', '', 'house-eirth'),

    person('ianto-pawen', 'Ianto Pawen', 'male', '1717'),
    person('owena-pawen', 'Owena Pawen', 'female', '1722'),
    person('thalen-pawen', 'Thalen Pawen', 'male', '1716'),
    person('niniel-pawen', 'Niniel Pawen', 'female', '1721'),
    person('guto-pawen', 'Guto Pawen', 'male', '1718')
  ],
  partnerships: [
    createMarriage('marriage-lamorak-mared', ...COUPLES.founders, {
      notes: 'Lamorak Arth und Mared begründen gemeinsam das Kadettenhaus Pawen.'
    }),
    createMarriage('marriage-cadoc-kerenza-pawen', ...COUPLES.cadoc, { status: 'ended', end: '1643' }),
    createMarriage('marriage-trahaern-ceridwen', ...COUPLES.ceridwen),
    createMarriage('marriage-isobel-sadwrn', ...COUPLES.sadwrn),
    createMarriage('marriage-emrys-tegwyn-crefyddol', ...COUPLES.tegwyn),
    createMarriage('marriage-branwen-rhodri-canwyll', ...COUPLES.rhodri),
    createMarriage('marriage-madoc-morwen-tiwna', ...COUPLES.morwen, { status: 'ended', end: '1659' }),
    createMarriage('marriage-heledd-grufudd-pawen', ...COUPLES.grufudd, { status: 'ended', end: '1699' }),
    createMarriage('marriage-tarian-brac', ...COUPLES.brac),
    createMarriage('marriage-libet-artus-gwialen', ...COUPLES.libet, { status: 'ended', end: '1693' }),
    createMarriage('marriage-aneirin-rhonwen-brithyll', ...COUPLES.rhonwen, { status: 'ended', end: '1710' }),
    createMarriage('marriage-genofeva-lamorak', ...COUPLES.lamorak),
    createMarriage('marriage-domnall-gwenfrewi', ...COUPLES.gwenfrewi),
    createMarriage('marriage-blegywryd-mair-pawen', ...COUPLES.blegywryd, { status: 'ended', end: '1725' }),
    createMarriage('marriage-amaethon-glinda-pawen', ...COUPLES.amaethon),
    createMarriage('marriage-joally-tegid-pawen', ...COUPLES.joally),
    createMarriage('marriage-naili-lwyd-mwyalchen', ...COUPLES.lwyd),
    createMarriage('marriage-march-mabil-morfil', ...COUPLES.march),
    createMarriage('marriage-mared-urien-pawen', ...COUPLES.mared)
  ],
  parentages: [
    ...childrenOf(['cadoc-pawen', 'ceridwen-pawen'], 'marriage-lamorak-mared', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Cadoc und Ceridwen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['sadwrn-pawen', 'tegwyn-pawen'], 'marriage-cadoc-kerenza-pawen'),
    ...childrenOf(['rhodri-pawen', 'morwen-pawen', 'grufudd-pawen'], 'marriage-isobel-sadwrn'),
    ...childrenOf(['brac-pawen', 'libet-pawen'], 'marriage-branwen-rhodri-canwyll'),
    ...childrenOf(['rhonwen-pawen'], 'marriage-heledd-grufudd-pawen'),
    ...childrenOf(['lamorak-pawen', 'gwenfrewi-pawen', 'blegywryd-pawen'], 'marriage-tarian-brac'),
    ...childrenOf(['amaethon-pawen', 'joally-pawen', 'lwyd-pawen'], 'marriage-genofeva-lamorak'),
    ...childrenOf(['march-pawen', 'mared-pawen'], 'marriage-blegywryd-mair-pawen'),
    ...childrenOf(['ianto-pawen', 'owena-pawen'], 'marriage-amaethon-glinda-pawen'),
    ...childrenOf(['thalen-pawen', 'niniel-pawen'], 'marriage-naili-lwyd-mwyalchen'),
    ...childrenOf(['guto-pawen'], 'marriage-march-mabil-morfil')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-unigol-ceridwen-pawen',
      name: 'Haus Unigol',
      parentPartnershipId: 'marriage-trahaern-ceridwen',
      houseId: 'house-unigol',
      targetFamilyId: 'haus-unigol',
      emblem: HOUSE_EMBLEMS.unigol,
      subtitle: 'Von Trahaern Arth und Ceridwen Pawen begründetes Kadettenhaus',
      extensions: { registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem'] }
    }),
    marriedAway('married-away-tegwyn-pawen-crefyddol', 'Haus Crefyddol', 'marriage-emrys-tegwyn-crefyddol', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-morwen-pawen-tiwna', 'Haus Tiwna', 'marriage-madoc-morwen-tiwna', 'house-tiwna', HOUSE_EMBLEMS.tiwna),
    marriedAway('married-away-libet-pawen-gwialen', 'Haus Gwialen', 'marriage-libet-artus-gwialen', 'house-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-rhonwen-pawen-brithyll', 'Haus Brithyll', 'marriage-aneirin-rhonwen-brithyll', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-gwenfrewi-pawen-arth', 'Haus Arth', 'marriage-domnall-gwenfrewi', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-joally-pawen-cwningod', 'Haus Cwningod', 'marriage-joally-tegid-pawen', 'house-cwningod', HOUSE_EMBLEMS.cwningod),
    marriedAway('married-away-mared-pawen-eirth', 'Haus Eirth', 'marriage-mared-urien-pawen', 'house-eirth', HOUSE_EMBLEMS.eirth)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-lamorak-mared',
      parentPersonId: '',
      childIds: ['cadoc-pawen', 'ceridwen-pawen'],
      years: 0,
      fromYear: '????',
      toYear: '1592',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Cadoc und Ceridwen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-lamorak-mared',
    houseId: PAWEN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Talgarth · Ältestes Kadettenhaus der Arth',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'lamorak-arth',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceFamilyId: 'haus-arth',
    sourcePartnershipId: 'marriage-lamorak-mared',
    sourceModule: "Haus Pawen O'Talgarth (bereitgestellte Altdaten)",
    sourceNote: 'Lamorak Arth und Mared begründen Haus Pawen. Der Hausknoten und genau ein serieller Zeitsprung stehen vor Cadoc und Ceridwen. Ceridwen und Trahaern Arth begründen Haus Unigol; ihre Linie endet deshalb hier am Kadettenhausknoten. Tegwyn, Morwen, Libet, Rhonwen, Gwenfrewi, Joally und Mared werden mit geraden Wegverheiratet-Verknüpfungen in ihre Zielhäuser geführt; deren Kinder bleiben ausschließlich in den fortführenden Zielhäusern. Gegenakten haben Vorrang bei widersprüchlichen Lebensdaten: Trahaern stirbt 1669, Madoc Tiwna wird 1630 geboren, Morwen stirbt 1659, Grufudd stirbt 1710, Artus 1721 und Aneirin 1720. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
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
