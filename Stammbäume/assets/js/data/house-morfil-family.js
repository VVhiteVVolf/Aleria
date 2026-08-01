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
import { HOUSE_MORFIL_PORTRAITS } from './house-morfil-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const MORFIL_HOUSE_ID = 'house-morfil';
const MORFIL_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.morfil;
const FOUNDER_TIME_JUMP_ID = 'gap-morfil-founders-to-murvin-braith';

const HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  morfil: MORFIL_EMBLEM,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
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
  'trayvion-pysgod',
  'murvin-morfil',
  'berwyn-morfil',
  'cafael-morfil',
  'aneurin-morfil'
]);
const HEIR_IDS = new Set(['bran-morfil', 'alun-morfil']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? MORFIL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_MORFIL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === MORFIL_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['trayvion-pysgod', 'brighde-unknown'],
  murvin: ['aeronwy-dyngwn', 'murvin-morfil'],
  braith: ['brannock-tiwna', 'braith-morfil'],
  berwyn: ['berwyn-morfil', 'arianwen-draenog'],
  aelwen: ['aelwen-morfil', 'categirn-gwialen'],
  bedwyr: ['bedwyr-morfil', 'helga-unknown'],
  arial: ['garym-pysgod', 'arial-morfil'],
  cafael: ['cafael-morfil', 'blodwen-wivern'],
  talaith: ['rhydderch-arth', 'talaith-morfil'],
  merrion: ['merrion-morfil', 'guenevere-unknown-morfil'],
  aneurin: ['aneurin-morfil', 'llewella-brithyll'],
  caru: ['grippiud-1672-creyr', 'caru-morfil'],
  siriol: ['sten-skogg', 'siriol-morfil'],
  travion: ['travion-morfil', 'emer-unknown-morfil'],
  bran: ['bran-morfil', 'alaw-coedwig'],
  guto: ['guto-morfil', 'eilun-llyfant'],
  mabil: ['march-pawen', 'mabil-morfil'],
  glendower: ['myfanwy-pysgod', 'glendower-morfil'],
  neirin: ['neirin-morfil', 'deliah-rosenblueth'],
  caraf: ['gronw-gwaedlyd', 'caraf-morfil']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-trayvion-brighde': COUPLES.founders,
  'marriage-aeronwy-murvin-dyngwn': COUPLES.murvin,
  'marriage-brannock-braith-tiwna': COUPLES.braith,
  'marriage-berwyn-arianwen-morfil': COUPLES.berwyn,
  'marriage-aelwen-categirn-gwialen': COUPLES.aelwen,
  'marriage-bedwyr-helga-morfil': COUPLES.bedwyr,
  'marriage-garym-arial': COUPLES.arial,
  'marriage-cafael-blodwen-morfil': COUPLES.cafael,
  'marriage-rhydderch-talaith': COUPLES.talaith,
  'marriage-merrion-guenevere-morfil': COUPLES.merrion,
  'marriage-aneurin-llewella-brithyll': COUPLES.aneurin,
  'marriage-grippiud-caru-creyr': COUPLES.caru,
  'marriage-sten-siriol-morfil': COUPLES.siriol,
  'marriage-travion-emer-morfil': COUPLES.travion,
  'marriage-bran-alaw-coedwig': COUPLES.bran,
  'marriage-guto-eilun-morfil': COUPLES.guto,
  'marriage-march-mabil-morfil': COUPLES.mabil,
  'marriage-myfanwy-glendower': COUPLES.glendower,
  'marriage-neirin-deliah-morfil': COUPLES.neirin,
  'marriage-gronw-caraf-morfil': COUPLES.caraf
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'morfil-parentage',
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

export const HOUSE_MORFIL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-morfil',
    title: "Haus Morfil O'Talsarn",
    motto: '',
    description: 'Erstes Kadettenhaus der Pysgod und Baronshaus der Hafen- und Schiffbauerstadt Talsarn an der Grauküste.',
    emblem: MORFIL_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.morfil
  },
  houses: [
    house(MORFIL_HOUSE_ID, "Haus Morfil O'Talsarn", HOUSE_EMBLEMS.morfil),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-skogg', 'Haus Skogg'),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-lyfant-caer-asgwrn', "Haus Lyfant O'Caer Asgwrn", HOUSE_EMBLEMS.lyfant),
    house('house-pawen', 'Haus Pawen'),
    house('house-gwaedlyd-tredegar', "Haus Gwaedlyd O'Tredegar", HOUSE_EMBLEMS.gwaedlyd),
    house('house-rosenblueth', 'Haus Rosenblüth')
  ],
  persons: [
    person('trayvion-pysgod', 'Trayvion Pysgod', 'male', '????', '????', {
      houseId: 'house-pysgod',
      familyRole: 'founder',
      title: 'Gründer des Hauses Morfil'
    }),
    spouse('brighde-unknown', 'Brighde', 'female', '????', '????', 'house-unbekannt-brighde', {
      title: 'Mitgründerin des Hauses Morfil'
    }),

    person('murvin-morfil', 'Murvin Morfil', 'male', '1611', '1682', {
      title: 'Baron des Hauses Morfil bis 1682'
    }),
    awayWoman('braith-morfil', 'Braith Morfil', '1613', '1696', 'Haus Tiwna'),
    spouse('aeronwy-dyngwn', 'Aeronwy Dyngwn', 'female', '1614', '1698', 'house-dyngwn'),
    spouse('brannock-tiwna', 'Brannock Tiwna', 'male', '1612', '1683', 'house-tiwna'),

    person('berwyn-morfil', 'Berwyn Morfil', 'male', '1631', '1707', {
      title: 'Baron des Hauses Morfil 1682–1707'
    }),
    awayWoman('aelwen-morfil', 'Aelwen Morfil', '1634', '1705', 'Haus Gwialen'),
    person('bedwyr-morfil', 'Bedwyr Morfil', 'male', '1631', '1700'),
    awayWoman('arial-morfil', 'Arial Morfil', '1633', '1711', 'Haus Pysgod'),
    spouse('arianwen-draenog', 'Arianwen Draenog', 'female', '1632', '1715', 'house-draenog'),
    spouse('categirn-gwialen', 'Categirn Gwialen', 'male', '1634', '1702', 'house-gwialen'),
    spouse('helga-unknown', 'Helga', 'female', '1631', '1704', 'house-unbekannt-helga'),
    spouse('garym-pysgod', 'Garym Pysgod', 'male', '1632', '1692', 'house-pysgod'),

    person('cafael-morfil', 'Cafael Morfil', 'male', '1649', '1723', {
      title: 'Baron des Hauses Morfil 1707–1723',
      notes: 'Die Ämterliste schreibt einmal Cadfael; Karte und Stammbaumgrafik belegen Cafael.'
    }),
    awayWoman('talaith-morfil', 'Talaith Morfil', '1651', '????', 'Haus Arth', { status: 'dead' }),
    person('merrion-morfil', 'Merrion Morfil', 'male', '1652', '1720'),
    spouse('blodwen-wivern', 'Blodwen Wivern', 'female', '1656', '1732', 'house-wivern'),
    spouse('rhydderch-arth', 'Rhydderch Arth', 'male', '1651', '1698', 'house-arth'),
    spouse('guenevere-unknown-morfil', 'Guenevere', 'female', '1654', '1734', 'house-unbekannt-guenevere'),

    person('aneurin-morfil', 'Aneurin Morfil', 'male', '1674', '', {
      title: 'Baron des Hauses Morfil seit 1723'
    }),
    awayWoman('caru-morfil', 'Caru Morfil', '1676', '', 'Haus Créyr'),
    awayWoman('siriol-morfil', 'Siriol Morfil', '1674', '1735', 'Haus Skogg'),
    person('travion-morfil', 'Travion Morfil', 'male', '1672', ''),
    spouse('llewella-brithyll', 'Llewella Brithyll', 'female', '1677', '', 'house-brithyll'),
    spouse('grippiud-1672-creyr', 'Grippiud Créyr', 'male', '1672', '', 'house-creyr'),
    spouse('sten-skogg', 'Sten Skogg', 'male', '1670', '', 'house-skogg'),
    spouse('emer-unknown-morfil', 'Emer', 'female', '1673', '1739', 'house-unbekannt-emer'),

    person('bran-morfil', 'Bran Morfil', 'male', '1694', '', { title: 'Erster Erbe des Hauses Morfil' }),
    person('guto-morfil', 'Guto Morfil', 'male', '1696', ''),
    person('carys-morfil', 'Carys Morfil', 'female', '1698', '', { title: 'Unverheiratet' }),
    awayWoman('mabil-morfil', 'Mabil Morfil', '1698', '', 'Haus Pawen'),
    person('glendower-morfil', 'Glendower Morfil', 'male', '1707', ''),
    spouse('alaw-coedwig', 'Alaw Coedwig', 'female', '1698', '', 'house-coedwig'),
    spouse('eilun-llyfant', 'Eilun Llyfant', 'female', '1697', '', 'house-lyfant-caer-asgwrn'),
    spouse('march-pawen', 'March Pawen', 'male', '1696', '', 'house-pawen'),
    spouse('myfanwy-pysgod', 'Myfanwy Pysgod', 'female', '1702', '', 'house-pysgod'),

    person('neirin-morfil', 'Neirin Morfil', 'male', '1695', ''),
    awayWoman('caraf-morfil', 'Caraf Morfil', '1697', '', "Haus Gwaedlyd O'Tredegar"),
    spouse('deliah-rosenblueth', 'Deliah Rosenblüth', 'female', '1696', '', 'house-rosenblueth'),
    spouse('gronw-gwaedlyd', 'Gronw Gwaedlyd', 'male', '1692', '', 'house-gwaedlyd-tredegar'),

    person('alun-morfil', 'Alun Morfil', 'male', '1720', '', { title: 'Zweiter Erbe des Hauses Morfil' }),
    person('efa-morfil', 'Efa Morfil', 'female', '1722', ''),
    person('ioan-morfil', 'Ioan Morfil', 'male', '1722', ''),
    person('eira-morfil', 'Eira Morfil', 'female', '1724', ''),
    person('llew-morfil', 'Llew Morfil', 'male', '1732', ''),
    person('teir-morfil', 'Teir Morfil', 'female', '1721', ''),
    person('sian-morfil', 'Sian Morfil', 'female', '1723', '')
  ],
  partnerships: [
    createMarriage('marriage-trayvion-brighde', ...COUPLES.founders),
    createMarriage('marriage-aeronwy-murvin-dyngwn', ...COUPLES.murvin, { status: 'ended', end: '1682' }),
    createMarriage('marriage-brannock-braith-tiwna', ...COUPLES.braith, { status: 'ended', end: '1683' }),
    createMarriage('marriage-berwyn-arianwen-morfil', ...COUPLES.berwyn, { status: 'ended', end: '1707' }),
    createMarriage('marriage-aelwen-categirn-gwialen', ...COUPLES.aelwen, { status: 'ended', end: '1702' }),
    createMarriage('marriage-bedwyr-helga-morfil', ...COUPLES.bedwyr, { status: 'ended', end: '1700' }),
    createMarriage('marriage-garym-arial', ...COUPLES.arial, { status: 'ended', end: '1692' }),
    createMarriage('marriage-cafael-blodwen-morfil', ...COUPLES.cafael, { status: 'ended', end: '1723' }),
    createMarriage('marriage-rhydderch-talaith', ...COUPLES.talaith, { status: 'ended', end: '1698' }),
    createMarriage('marriage-merrion-guenevere-morfil', ...COUPLES.merrion, { status: 'ended', end: '1720' }),
    createMarriage('marriage-aneurin-llewella-brithyll', ...COUPLES.aneurin),
    createMarriage('marriage-grippiud-caru-creyr', ...COUPLES.caru),
    createMarriage('marriage-sten-siriol-morfil', ...COUPLES.siriol, { status: 'ended', end: '1735' }),
    createMarriage('marriage-travion-emer-morfil', ...COUPLES.travion, { status: 'ended', end: '1739' }),
    createMarriage('marriage-bran-alaw-coedwig', ...COUPLES.bran),
    createMarriage('marriage-guto-eilun-morfil', ...COUPLES.guto),
    createMarriage('marriage-march-mabil-morfil', ...COUPLES.mabil),
    createMarriage('marriage-myfanwy-glendower', ...COUPLES.glendower),
    createMarriage('marriage-neirin-deliah-morfil', ...COUPLES.neirin),
    createMarriage('marriage-gronw-caraf-morfil', ...COUPLES.caraf)
  ],
  parentages: [
    ...childrenOf(['murvin-morfil', 'braith-morfil'], 'marriage-trayvion-brighde', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Murvin und Braith.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['berwyn-morfil', 'aelwen-morfil', 'bedwyr-morfil', 'arial-morfil'], 'marriage-aeronwy-murvin-dyngwn'),
    ...childrenOf(['cafael-morfil', 'talaith-morfil'], 'marriage-berwyn-arianwen-morfil'),
    ...childrenOf(['merrion-morfil'], 'marriage-bedwyr-helga-morfil'),
    ...childrenOf(['aneurin-morfil', 'caru-morfil'], 'marriage-cafael-blodwen-morfil'),
    ...childrenOf(['siriol-morfil', 'travion-morfil'], 'marriage-merrion-guenevere-morfil'),
    ...childrenOf(['bran-morfil', 'guto-morfil', 'carys-morfil', 'mabil-morfil', 'glendower-morfil'], 'marriage-aneurin-llewella-brithyll'),
    ...childrenOf(['neirin-morfil', 'caraf-morfil'], 'marriage-travion-emer-morfil'),
    ...childrenOf(['alun-morfil', 'efa-morfil'], 'marriage-bran-alaw-coedwig'),
    ...childrenOf(['ioan-morfil', 'eira-morfil'], 'marriage-guto-eilun-morfil'),
    ...childrenOf(['llew-morfil'], 'marriage-myfanwy-glendower'),
    ...childrenOf(['teir-morfil', 'sian-morfil'], 'marriage-neirin-deliah-morfil')
  ],
  cadetBranches: [
    marriedAway('married-away-braith-morfil-tiwna', 'Haus Tiwna', 'marriage-brannock-braith-tiwna', 'house-tiwna', HOUSE_EMBLEMS.tiwna),
    marriedAway('married-away-aelwen-morfil-gwialen', 'Haus Gwialen', 'marriage-aelwen-categirn-gwialen', 'house-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-arial-morfil-pysgod', "Haus Pysgod O'Tredegar", 'marriage-garym-arial', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-talaith-morfil-arth', 'Haus Arth', 'marriage-rhydderch-talaith', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-caru-morfil-creyr', 'Haus Créyr', 'marriage-grippiud-caru-creyr', 'house-creyr', HOUSE_EMBLEMS.creyr),
    marriedAway('married-away-siriol-morfil-skogg', 'Haus Skogg', 'marriage-sten-siriol-morfil', 'house-skogg'),
    marriedAway('married-away-mabil-morfil-pawen', 'Haus Pawen', 'marriage-march-mabil-morfil', 'house-pawen'),
    marriedAway('married-away-caraf-morfil-gwaedlyd', "Haus Gwaedlyd O'Tredegar", 'marriage-gronw-caraf-morfil', 'house-gwaedlyd-tredegar', HOUSE_EMBLEMS.gwaedlyd, {
      targetFamilyId: 'haus-gwaedlyd-tredegar'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-trayvion-brighde',
      parentPersonId: '',
      childIds: ['murvin-morfil', 'braith-morfil'],
      years: 0,
      fromYear: '????',
      toYear: '1611',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Murvin und Braith.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-trayvion-brighde',
    houseId: MORFIL_HOUSE_ID,
    crestSubtitle: 'Baronshaus der Grauküste · Sitz Talsarn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Vollständiger Stammbaum: Der früheste Gründer ist der technische
    // Layout-Anker; kein späteres Oberhaupt darf Seitenzweige ausblenden.
    focusPersonId: 'trayvion-pysgod',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Morfil O'Talsarn (bereitgestellte Altdaten)",
    sourceNote: 'Trayvion Pysgod und Brighde begründen das erste Pysgod-Kadettenhaus. Der Hausknoten und genau ein serieller Zeitsprung stehen vor Murvin und Braith. Cafael folgt der Karten- und Grafikschreibung; Cadfael in der Ämterliste ist als Quellabweichung dokumentiert. Die in der Hierarchietabelle fälschlich erneut mit Glendower und Myfanwy beschrifteten Kinder Teir und Sian gehören nach der vollständigen Stammbaumgrafik zu Neirin und Deliah. Kinder wegverheirateter Morfil-Frauen werden ausschließlich in den fortführenden Zielhäusern geführt. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
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
