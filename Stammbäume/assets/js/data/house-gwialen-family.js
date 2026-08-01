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
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';

const GWIALEN_HOUSE_ID = 'house-gwialen';
const GWIALEN_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.gwialen;
const FOUNDER_TIME_JUMP_ID = 'gap-gwialen-founders-to-llewarc-cadwyn';

const HOUSE_EMBLEMS = Object.freeze({
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwialen: GWIALEN_EMBLEM,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  wivern: GRAUE_WEITE_HOUSE_EMBLEMS.wivern
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
  'hascan-gwialen',
  'llewarc-gwialen',
  'categirn-gwialen',
  'artus-gwialen',
  'gereint-gwialen'
]);
const HEIR_IDS = new Set(['cwrgi-gwialen', 'catel-gwialen']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? GWIALEN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_GWIALEN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWIALEN_HOUSE_ID ? 'core' : 'married'),
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
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['aranhrod-pysgod', 'hascan-gwialen'],
  llewarc: ['jorunn-sturmgeborene', 'llewarc-gwialen'],
  cadwyn: ['rhodri-pysgod', 'cadwyn-gwialen'],
  categirn: ['aelwen-morfil', 'categirn-gwialen'],
  angharad: ['arwel-crefyddol', 'angharad-gwialen'],
  artus: ['libet-pawen', 'artus-gwialen'],
  gwladus: ['cador-brithyll', 'gwladus-gwialen'],
  esill: ['bledri-pysgod', 'esill-gwialen'],
  uther: ['glynis-wylan', 'uther-gwialen'],
  gereint: ['andarch-crafanc', 'gereint-gwialen'],
  morfudd: ['duncan-gafyr', 'morfudd-gwialen'],
  rhydderch: ['eilir-blodeuwedd', 'rhydderch-gwialen'],
  gwen: ['gwen-gwialen', 'bleddyn-illygoden'],
  cwrgi: ['finola-anbhair', 'cwrgi-gwialen'],
  cloten: ['cloten-gwialen', 'rhianedd-coedwig'],
  elgan: ['seren-unknown', 'elgan-gwialen'],
  alwen: ['alwen-gwialen', 'brynmor-wivern']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-aranhrod-hascan': COUPLES.founders,
  'marriage-jorunn-llewarc-gwialen': COUPLES.llewarc,
  'marriage-rhodri-cadwyn': COUPLES.cadwyn,
  'marriage-aelwen-categirn-gwialen': COUPLES.categirn,
  'marriage-arwel-angharad-crefyddol': COUPLES.angharad,
  'marriage-libet-artus-gwialen': COUPLES.artus,
  'marriage-cador-gwladus-brithyll': COUPLES.gwladus,
  'marriage-bledri-esill': COUPLES.esill,
  'marriage-glynis-uther': COUPLES.uther,
  'marriage-andarch-gereint-gwialen': COUPLES.gereint,
  'marriage-duncan-morfudd': COUPLES.morfudd,
  'marriage-eilir-rhydderch-gwialen': COUPLES.rhydderch,
  'marriage-gwen-bleddyn-gwialen': COUPLES.gwen,
  'marriage-finola-cwrgi-gwialen': COUPLES.cwrgi,
  'marriage-cloten-rhianedd-gwialen': COUPLES.cloten,
  'marriage-seren-elgan-gwialen': COUPLES.elgan,
  'marriage-alwen-brynmor-gwialen': COUPLES.alwen
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'gwialen-parentage',
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

export const HOUSE_GWIALEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwialen',
    title: "Haus Gwialen O'Tredegar",
    motto: '',
    description: 'Altes Ritterfürstenhaus von Tredegar, das aus einer albischen Fischerfamilie hervorging und eng mit Haus Pysgod verbunden ist.',
    emblem: GWIALEN_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.gwialen
  },
  houses: [
    house(GWIALEN_HOUSE_ID, "Haus Gwialen O'Tredegar", HOUSE_EMBLEMS.gwialen),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-sturmgeborene', 'Haus Sturmgeborene'),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-crefyddol', 'Haus Crefyddol', HOUSE_EMBLEMS.crefyddol),
    house('house-pawen', 'Haus Pawen'),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-wylan', 'Haus Wylan'),
    house('house-crafanc', 'Haus Crafanc'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-blodeuwedd', 'Haus Blodeuwedd'),
    house('house-illygoden-tredegar', "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden),
    house('house-anbhair', 'Haus Anbhair'),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-unbekannt-seren', 'Unbekanntes Haus'),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern)
  ],
  persons: [
    person('hascan-gwialen', 'Háscan Gwialen', 'male', '????', '????', {
      status: 'unknown',
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Gründer und erster Ritterfürst des Hauses Gwialen'
    }),
    spouse('aranhrod-pysgod', 'Arianhrod Pysgod', 'female', '????', '????', 'house-pysgod', {
      status: 'unknown',
      title: 'Mitgründerin des Hauses Gwialen',
      extensions: { registryManagedFields: ['name'] }
    }),

    person('llewarc-gwialen', 'Llewarc Gwialen', 'male', '1611', '1681', {
      title: 'Ritterfürst des Hauses Gwialen bis 1681'
    }),
    awayWoman('cadwyn-gwialen', 'Cadwyn Gwialen', '1613', '1685', 'Haus Pysgod'),
    spouse('jorunn-sturmgeborene', 'Jorunn Sturmgeborene', 'female', '1613', '1700', 'house-sturmgeborene'),
    spouse('rhodri-pysgod', 'Rhodri Pysgod', 'male', '1612', '1693', 'house-pysgod'),

    person('categirn-gwialen', 'Categirn Gwialen', 'male', '1634', '1702', {
      title: 'Ritterfürst des Hauses Gwialen 1681–1702'
    }),
    awayWoman('angharad-gwialen', 'Angharad Gwialen', '1636', '1712', 'Haus Crefyddol'),
    spouse('aelwen-morfil', 'Aelwen Morfil', 'female', '1634', '1705', 'house-morfil'),
    spouse('arwel-crefyddol', 'Arwel Crefyddol', 'male', '1634', '1704', 'house-crefyddol'),

    person('artus-gwialen', 'Artus Gwialen', 'male', '1659', '1721', {
      title: 'Ritterfürst des Hauses Gwialen 1702–1721'
    }),
    awayWoman('gwladus-gwialen', 'Gwladus Gwialen', '1656', '', 'Haus Brithyll'),
    awayWoman('esill-gwialen', 'Esill Gwialen', '1651', '1736', 'Haus Pysgod'),
    person('uther-gwialen', 'Uther Gwialen', 'male', '1661', '1720'),
    spouse('libet-pawen', 'Libet Pawen', 'female', '1660', '1693', 'house-pawen'),
    spouse('cador-brithyll', 'Cador Brithyll', 'male', '1650', '', 'house-brithyll'),
    spouse('bledri-pysgod', 'Bledri Pysgod', 'male', '1650', '1720', 'house-pysgod'),
    spouse('glynis-wylan', 'Glynis Wylan', 'female', '1660', '1715', 'house-wylan'),

    person('gereint-gwialen', 'Gereint Gwialen', 'male', '1676', '', {
      title: 'Ritterfürst des Hauses Gwialen seit 1721'
    }),
    awayWoman('morfudd-gwialen', 'Morfudd Gwialen', '1676', '', 'Haus Gafyr'),
    person('rhydderch-gwialen', 'Rhydderch Gwialen', 'male', '1675', ''),
    awayWoman('gwen-gwialen', 'Gwen Gwialen', '1677', '1700', "Haus Illygoden O'Tredegar"),
    spouse('andarch-crafanc', 'Andarch Crafanc', 'female', '1679', '', 'house-crafanc', {
      notes: 'Die Kinderüberschrift der Altquelle schreibt abweichend Amdarch; die Partnerkarte belegt Andarch.'
    }),
    spouse('duncan-gafyr', 'Duncan Gafyr', 'male', '1670', '', 'house-gafyr'),
    spouse('eilir-blodeuwedd', 'Eilir Blodeuwedd', 'female', '1675', '', 'house-blodeuwedd'),
    spouse('bleddyn-illygoden', 'Bleddyn Illygoden', 'male', '1672', '', 'house-illygoden-tredegar'),

    person('cwrgi-gwialen', 'Cwrgi Gwialen', 'male', '1696', '', {
      title: 'Erster Erbe des Hauses Gwialen',
      notes: 'Die Kinderüberschrift der Altquelle schreibt einmal Gwrgi; Hierarchie und Stammbaumgrafik belegen Cwrgi.'
    }),
    person('cloten-gwialen', 'Cloten Gwialen', 'male', '1699', ''),
    person('elgan-gwialen', 'Elgan Gwialen', 'male', '1694', ''),
    awayWoman('alwen-gwialen', 'Alwen Gwialen', '1699', '', 'Haus Wivern'),
    spouse('finola-anbhair', 'Finola Anbhair', 'female', '1698', '', 'house-anbhair'),
    spouse('rhianedd-coedwig', 'Rhianedd Coedwig', 'female', '1699', '', 'house-coedwig'),
    spouse('seren-unknown', 'Seren', 'female', '1696', '', 'house-unbekannt-seren'),
    spouse('brynmor-wivern', 'Brynmor Wivern', 'male', '1695', '', 'house-wivern'),

    person('catel-gwialen', 'Catel Gwialen', 'male', '1718', '', { title: 'Zweiter Erbe des Hauses Gwialen' }),
    person('arawn-gwialen', 'Arawn Gwialen', 'male', '1721', ''),
    person('adeon-gwialen', 'Adeon Gwialen', 'male', '1720', ''),
    person('ellis-gwialen', 'Ellis Gwialen', 'male', '1722', ''),
    person('iwerid-gwialen', 'Iwerid Gwialen', 'female', '1722', ''),
    person('tyra-gwialen', 'Tyra Gwialen', 'female', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-aranhrod-hascan', ...COUPLES.founders),
    createMarriage('marriage-jorunn-llewarc-gwialen', ...COUPLES.llewarc, { status: 'ended', end: '1681' }),
    createMarriage('marriage-rhodri-cadwyn', ...COUPLES.cadwyn),
    createMarriage('marriage-aelwen-categirn-gwialen', ...COUPLES.categirn, { status: 'ended', end: '1702' }),
    createMarriage('marriage-arwel-angharad-crefyddol', ...COUPLES.angharad),
    createMarriage('marriage-libet-artus-gwialen', ...COUPLES.artus, { status: 'ended', end: '1693' }),
    createMarriage('marriage-cador-gwladus-brithyll', ...COUPLES.gwladus),
    createMarriage('marriage-bledri-esill', ...COUPLES.esill),
    createMarriage('marriage-glynis-uther', ...COUPLES.uther),
    createMarriage('marriage-andarch-gereint-gwialen', ...COUPLES.gereint),
    createMarriage('marriage-duncan-morfudd', ...COUPLES.morfudd),
    createMarriage('marriage-eilir-rhydderch-gwialen', ...COUPLES.rhydderch),
    createMarriage('marriage-gwen-bleddyn-gwialen', ...COUPLES.gwen, { status: 'ended', end: '1700' }),
    createMarriage('marriage-finola-cwrgi-gwialen', ...COUPLES.cwrgi),
    createMarriage('marriage-cloten-rhianedd-gwialen', ...COUPLES.cloten),
    createMarriage('marriage-seren-elgan-gwialen', ...COUPLES.elgan),
    createMarriage('marriage-alwen-brynmor-gwialen', ...COUPLES.alwen)
  ],
  parentages: [
    ...childrenOf(['llewarc-gwialen', 'cadwyn-gwialen'], 'marriage-aranhrod-hascan', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Llewarc und Cadwyn.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['categirn-gwialen', 'angharad-gwialen'], 'marriage-jorunn-llewarc-gwialen'),
    ...childrenOf(['artus-gwialen', 'gwladus-gwialen', 'esill-gwialen', 'uther-gwialen'], 'marriage-aelwen-categirn-gwialen'),
    ...childrenOf(['gereint-gwialen', 'morfudd-gwialen'], 'marriage-libet-artus-gwialen'),
    ...childrenOf(['rhydderch-gwialen', 'gwen-gwialen'], 'marriage-glynis-uther'),
    ...childrenOf(['cwrgi-gwialen', 'cloten-gwialen'], 'marriage-andarch-gereint-gwialen'),
    ...childrenOf(['elgan-gwialen', 'alwen-gwialen'], 'marriage-eilir-rhydderch-gwialen'),
    ...childrenOf(['catel-gwialen', 'arawn-gwialen'], 'marriage-finola-cwrgi-gwialen'),
    ...childrenOf(['adeon-gwialen', 'ellis-gwialen'], 'marriage-cloten-rhianedd-gwialen'),
    ...childrenOf(['iwerid-gwialen', 'tyra-gwialen'], 'marriage-seren-elgan-gwialen')
  ],
  cadetBranches: [
    marriedAway('married-away-cadwyn-gwialen-pysgod', 'Haus Pysgod', 'marriage-rhodri-cadwyn', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-angharad-gwialen-crefyddol', 'Haus Crefyddol', 'marriage-arwel-angharad-crefyddol', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-gwladus-gwialen-brithyll', 'Haus Brithyll', 'marriage-cador-gwladus-brithyll', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-esill-gwialen-pysgod', 'Haus Pysgod', 'marriage-bledri-esill', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-morfudd-gwialen-gafyr', 'Haus Gafyr', 'marriage-duncan-morfudd', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-gwen-gwialen-illygoden', "Haus Illygoden O'Tredegar", 'marriage-gwen-bleddyn-gwialen', 'house-illygoden-tredegar', HOUSE_EMBLEMS.illygoden, {
      targetFamilyId: 'haus-illygoden-tredegar'
    }),
    marriedAway('married-away-alwen-gwialen-wivern', 'Haus Wivern', 'marriage-alwen-brynmor-gwialen', 'house-wivern', HOUSE_EMBLEMS.wivern)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-aranhrod-hascan',
      parentPersonId: '',
      childIds: ['llewarc-gwialen', 'cadwyn-gwialen'],
      years: 0,
      fromYear: '????',
      toYear: '1611',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Llewarc und Cadwyn.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-aranhrod-hascan',
    houseId: GWIALEN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Tredegar · Vasallen der Pysgod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Vollständiger Stammbaum: Der früheste Gründer bleibt Layout-Anker;
    // kein späterer Fokuspunkt darf Cadwyns Seitenzweig oder Nachfahren ausblenden.
    focusPersonId: 'hascan-gwialen',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Gwialen O'Tredegar (bereitgestellte Altdaten)",
    sourceNote: 'Háscan Gwialen und Arianhrod Pysgod begründen Haus Gwialen. Der Hausknoten und der einzige Zeitsprung stehen strikt seriell vor Llewarc und Cadwyn. Die Altquelle widerspricht sich bei Llewarc/Lewarc, Andarch/Amdarch und Cwrgi/Gwrgi; Stammbaumgrafik, Partnerkarte und Hierarchie belegen die hier verwendeten Formen. Kinder der wegverheirateten Cadwyn, Angharad, Gwladus, Esill, Morfudd, Gwen und Alwen werden ausschließlich in den jeweiligen Zielhäusern fortgeführt. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
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
