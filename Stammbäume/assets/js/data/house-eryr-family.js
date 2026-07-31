import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';

const ERYR_HOUSE_ID = 'house-eryr';
const ERYR_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.eryr;
const FOUNDER_TIME_JUMP_ID = 'gap-eryr-aeron-to-eiddyl';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  baedd: AEHRENTAL_HOUSE_EMBLEMS.baedd,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  eryr: ERYR_EMBLEM,
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  mwyalchen: TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen,
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

const HOUSE_HEAD_IDS = new Set([
  'aeron-aderyn',
  'eiddyl-eryr',
  'wyndham-eryr',
  'cynfelyn-eryr',
  'sheev-eryr',
  'gruffyd-eryr',
  'daffyd-eryr'
]);

const HEIR_IDS = new Set(['aled-eryr', 'aeron-1715-eryr']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? ERYR_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ERYR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ERYR_HOUSE_ID ? 'core' : 'married'),
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
    tags: [...(options.tags || []), options.engagement ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['aeron-aderyn', 'rhianu-1266-spouse'],
  eiddyl: ['eiddyl-eryr', 'siriol-aderyn'],
  wyndham: ['wyndham-eryr', 'eirian-mwyalchen-eryr'],
  ellanah: ['llwyd-illysywen', 'ellanah-eryr'],
  cynfelyn: ['cynfelyn-eryr', 'manon-tylluan-eryr'],
  sheev: ['mererid-1657-chiffyddlon', 'sheev-eryr'],
  malvina: ['kimbal-baedd', 'malvina-eryr'],
  glyndwr: ['glyndwr-eryr', 'noreen-cleirigh'],
  gruffyd: ['gruffyd-eryr', 'carwyn-mwyalchen-eryr'],
  venora: ['bowen-tylluan', 'venora-eryr'],
  enevold: ['enevold-eryr', 'ewynn-hebog-eryr'],
  ellis: ['ellis-eryr', 'serena-eryr-spouse'],
  daffyd: ['daffyd-eryr', 'rhian-gaeth-eryr'],
  quellyn: ['quellyn-eryr', 'rhyannon-gaeth-eryr'],
  meriel: ['aksel-feuerhaar', 'meriel-eryr'],
  sian: ['brynthan-ilyuncu', 'sian-eryr'],
  aysha: ['catwan-aderyn', 'aysha-eryr']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-aeron-rhianu': COUPLES.founders,
  'marriage-eiddyl-siriol': COUPLES.eiddyl,
  'marriage-wyndham-eirian-eryr': COUPLES.wyndham,
  'marriage-llwyd-ellanah': COUPLES.ellanah,
  'marriage-cynfelyn-manon-eryr': COUPLES.cynfelyn,
  'marriage-mererid-sheev-chiffyddlon': COUPLES.sheev,
  'marriage-kimbal-malvina-baedd': COUPLES.malvina,
  'marriage-glyndwr-noreen-eryr': COUPLES.glyndwr,
  'marriage-gruffyd-carwyn-eryr': COUPLES.gruffyd,
  'marriage-bowen-venora-eryr': COUPLES.venora,
  'marriage-enevold-ewynn-eryr': COUPLES.enevold,
  'marriage-ellis-serena-eryr': COUPLES.ellis,
  'marriage-daffyd-rhian-eryr': COUPLES.daffyd,
  'marriage-quellyn-rhyannon-eryr': COUPLES.quellyn,
  'marriage-aksel-meriel-eryr': COUPLES.meriel,
  'marriage-brynthan-sian-eryr': COUPLES.sian,
  'engagement-catwan-aysha': COUPLES.aysha
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'eryr-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_ERYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eryr',
    title: "Haus Eryr O'Penbryn",
    motto: 'Fel un, rydyn ni\'n codi ein hunain yn uwch. – Gemeinsam, erheben wir uns höher hinauf!',
    description: 'Altes Ritterfürsten- und Helwyrgeschlecht von Penbryn, gegründet als Kadettenzweig des Hauses Aderyn.',
    emblem: ERYR_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.eryr
  },
  houses: [
    house(ERYR_HOUSE_ID, "Haus Eryr O'Penbryn", ERYR_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-mwyalchen', 'Haus Mwyalchen', HOUSE_EMBLEMS.mwyalchen),
    house('house-illysywen', 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-tylluan', 'Haus Tylluan', HOUSE_EMBLEMS.tylluan),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-baedd', 'Haus Baedd', HOUSE_EMBLEMS.baedd),
    house('house-cleirigh', 'Haus Cléirigh'),
    house('house-hebog', 'Haus Hebog', HOUSE_EMBLEMS.hebog),
    house('house-gaeth', 'Haus Gaeth', HOUSE_EMBLEMS.gaeth),
    house('house-feuerhaar', 'Haus Feuerhaar'),
    house('house-ilyuncu', 'Haus Ilyuncu', HOUSE_EMBLEMS.ilyuncu)
  ],
  persons: [
    person('aeron-aderyn', 'Aeron Aderyn', 'male', '1262', '1314', {
      houseId: 'house-aderyn',
      title: 'Gründer und erster Ritterfürst des Hauses Eryr',
      familyRole: 'core',
      lineageRole: 'head',
      notes: 'Die Hierarchietabelle und die kanonische Aderyn-Akte nennen 1262; die Hofübersicht nennt abweichend 1286.'
    }),
    spouse('rhianu-1266-spouse', 'Rhianu', 'female', '1266', '1300', '', {
      title: 'Mitgründerin des Hauses Eryr',
      familyRole: 'married'
    }),

    person('eiddyl-eryr', 'Eiddyl Eryr', 'male', '1590', '1652', { title: 'Ritterfürst des Hauses Eryr bis 1652' }),
    spouse('siriol-aderyn', 'Siriol Aderyn', 'female', '1594', '1669', 'house-aderyn'),
    person('wyndham-eryr', 'Wyndham Eryr', 'male', '1615', '1663', { title: 'Ritterfürst des Hauses Eryr 1652–1663' }),
    awayWoman('ellanah-eryr', 'Ellanah Eryr', '1610', '1671', 'Haus Illysywen'),
    spouse('eirian-mwyalchen-eryr', 'Eirian Mwyalchen', 'female', '1615', '1656', 'house-mwyalchen'),
    spouse('llwyd-illysywen', 'Llwyd Illysywen', 'male', '1609', '1681', 'house-illysywen'),

    person('cynfelyn-eryr', 'Cynfelyn Eryr', 'male', '1632', '1690', { title: 'Ritterfürst des Hauses Eryr 1663–1690' }),
    spouse('manon-tylluan-eryr', 'Manon Tylluan', 'female', '1633', '1691', 'house-tylluan'),
    person('sheev-eryr', 'Sheev Eryr', 'male', '1655', '1697', { title: 'Ritterfürst des Hauses Eryr 1690–1697' }),
    awayWoman('malvina-eryr', 'Malvina Eryr', '1651', '1696', 'Haus Baedd'),
    person('glyndwr-eryr', 'Glyndwr Eryr', 'male', '1657', '1709'),
    spouse('mererid-1657-chiffyddlon', 'Mererid Chiffyddlon', 'female', '1657', '1715', 'house-chiffyddlon'),
    spouse('kimbal-baedd', 'Kimbal Baedd', 'male', '1649', '1696', 'house-baedd'),
    spouse('noreen-cleirigh', 'Noreen Cléirigh', 'female', '1662', '1687', 'house-cleirigh'),

    person('gruffyd-eryr', 'Gruffyd Eryr', 'male', '1673', '1734', { title: 'Ritterfürst des Hauses Eryr 1697–1734' }),
    awayWoman('venora-eryr', 'Venora Eryr', '1675', '', 'Haus Tylluan'),
    person('enevold-eryr', 'Enevold Eryr', 'male', '1678', ''),
    person('ellis-eryr', 'Ellis Eryr', 'male', '1683', '1720'),
    spouse('carwyn-mwyalchen-eryr', 'Carwyn Mwyalchen', 'female', '1675', '', 'house-mwyalchen', {
      notes: 'Die Kinderüberschrift schreibt Carwen; die Partnerkarte verwendet Carwyn.'
    }),
    spouse('bowen-tylluan', 'Bowen Tylluan', 'male', '1668', '', 'house-tylluan'),
    spouse('ewynn-hebog-eryr', 'Ewynn Hebog', 'female', '1676', '', 'house-hebog', {
      notes: 'Die Kinderüberschrift schreibt Enwynn; die Partnerkarte verwendet Ewynn.'
    }),
    spouse('serena-eryr-spouse', 'Serena', 'female', '1689', '1710'),

    person('daffyd-eryr', 'Daffyd Eryr', 'male', '1693', '', { title: 'Ritterfürst des Hauses Eryr seit 1734' }),
    person('quellyn-eryr', 'Quellyn Eryr', 'male', '1695', ''),
    person('victaryon-eryr', 'Victaryon Eryr', 'male', '1697', '1720', { notes: 'Unverheiratet und ohne Nachkommen gefallen.' }),
    awayWoman('meriel-eryr', 'Meriel Eryr', '1700', '', 'Haus Feuerhaar'),
    person('artus-eryr', 'Artus Eryr', 'male', '1710', '1718', { notes: 'Im Alter von acht Jahren verstorben.' }),
    spouse('rhian-gaeth-eryr', 'Rhian Gaeth', 'female', '1696', '', 'house-gaeth', {
      notes: 'Die Altquelle schreibt Geath; im Almanach lautet der Hausname Gaeth.'
    }),
    spouse('rhyannon-gaeth-eryr', 'Rhyannon Gaeth', 'female', '1696', '', 'house-gaeth', {
      notes: 'Die Altquelle schreibt Geath; im Almanach lautet der Hausname Gaeth.'
    }),
    spouse('aksel-feuerhaar', 'Aksel Feuerhaar', 'male', '1699', '', 'house-feuerhaar'),

    person('aled-eryr', 'Aled Eryr', 'male', '1714', '', { title: 'Erster Erbe des Hauses Eryr' }),
    person('aeron-1715-eryr', 'Aeron Eryr', 'male', '1715', '', { title: 'Zweiter Erbe des Hauses Eryr' }),
    awayWoman('sian-eryr', 'Sian Eryr', '1721', '', 'Haus Ilyuncu'),
    person('euron-eryr', 'Euron Eryr', 'male', '1714', ''),
    person('balon-eryr', 'Balon Eryr', 'male', '1716', ''),
    awayWoman('aysha-eryr', "Aysha Eryr O'Penbryn", '1717', '', 'Haus Aderyn', {
      engagement: true,
      title: 'Wegverlobt an Haus Aderyn'
    }),
    person('quenton-eryr', 'Quenton Eryr', 'male', '1718', '1735'),
    spouse('brynthan-ilyuncu', 'Bynthan Ilyuncu', 'male', '1718', '', 'house-ilyuncu', {
      notes: 'Die ausgearbeitete Ilyuncu-Gegenakte belegt die Schreibweise Bynthan; die technische ID bleibt aus Kompatibilitätsgründen stabil.'
    }),
    spouse('catwan-aderyn', 'Catwan Aderyn', 'male', '1714', '', 'house-aderyn', { title: 'Erbe des Hauses Aderyn' })
  ],
  partnerships: [
    createMarriage('marriage-aeron-rhianu', ...COUPLES.founders, { status: 'ended', end: '1300' }),
    createMarriage('marriage-eiddyl-siriol', ...COUPLES.eiddyl, { status: 'ended', end: '1652' }),
    createMarriage('marriage-wyndham-eirian-eryr', ...COUPLES.wyndham, { status: 'ended', end: '1656' }),
    createMarriage('marriage-llwyd-ellanah', ...COUPLES.ellanah, { status: 'ended', end: '1671' }),
    createMarriage('marriage-cynfelyn-manon-eryr', ...COUPLES.cynfelyn, { status: 'ended', end: '1690' }),
    createMarriage('marriage-mererid-sheev-chiffyddlon', ...COUPLES.sheev, { status: 'ended', end: '1697' }),
    createMarriage('marriage-kimbal-malvina-baedd', ...COUPLES.malvina, { status: 'ended', end: '1696' }),
    createMarriage('marriage-glyndwr-noreen-eryr', ...COUPLES.glyndwr, { status: 'ended', end: '1687' }),
    createMarriage('marriage-gruffyd-carwyn-eryr', ...COUPLES.gruffyd, { status: 'ended', end: '1734' }),
    createMarriage('marriage-bowen-venora-eryr', ...COUPLES.venora),
    createMarriage('marriage-enevold-ewynn-eryr', ...COUPLES.enevold),
    createMarriage('marriage-ellis-serena-eryr', ...COUPLES.ellis, { status: 'ended', end: '1710' }),
    createMarriage('marriage-daffyd-rhian-eryr', ...COUPLES.daffyd),
    createMarriage('marriage-quellyn-rhyannon-eryr', ...COUPLES.quellyn),
    createMarriage('marriage-aksel-meriel-eryr', ...COUPLES.meriel),
    createMarriage('marriage-brynthan-sian-eryr', ...COUPLES.sian),
    createMarriage('engagement-catwan-aysha', ...COUPLES.aysha, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['eiddyl-eryr'], 'marriage-aeron-rhianu', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Eiddyl.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['wyndham-eryr', 'ellanah-eryr'], 'marriage-eiddyl-siriol'),
    ...childrenOf(['cynfelyn-eryr'], 'marriage-wyndham-eirian-eryr'),
    ...childrenOf(['sheev-eryr', 'malvina-eryr', 'glyndwr-eryr'], 'marriage-cynfelyn-manon-eryr'),
    ...childrenOf(['gruffyd-eryr', 'venora-eryr'], 'marriage-mererid-sheev-chiffyddlon'),
    ...childrenOf(['enevold-eryr', 'ellis-eryr'], 'marriage-glyndwr-noreen-eryr'),
    ...childrenOf(['daffyd-eryr', 'quellyn-eryr', 'victaryon-eryr'], 'marriage-gruffyd-carwyn-eryr'),
    ...childrenOf(['meriel-eryr'], 'marriage-enevold-ewynn-eryr'),
    ...childrenOf(['artus-eryr'], 'marriage-ellis-serena-eryr'),
    ...childrenOf(['aled-eryr', 'aeron-1715-eryr', 'sian-eryr'], 'marriage-daffyd-rhian-eryr'),
    ...childrenOf(['euron-eryr', 'balon-eryr', 'aysha-eryr', 'quenton-eryr'], 'marriage-quellyn-rhyannon-eryr')
  ],
  cadetBranches: [
    marriedAway('married-away-ellanah-eryr-illysywen', 'Haus Illysywen', 'marriage-llwyd-ellanah', 'house-illysywen', HOUSE_EMBLEMS.illysywen),
    marriedAway('married-away-malvina-eryr-baedd', 'Haus Baedd', 'marriage-kimbal-malvina-baedd', 'house-baedd', HOUSE_EMBLEMS.baedd),
    marriedAway('married-away-venora-eryr-tylluan', 'Haus Tylluan', 'marriage-bowen-venora-eryr', 'house-tylluan', HOUSE_EMBLEMS.tylluan),
    marriedAway('married-away-meriel-eryr-feuerhaar', 'Haus Feuerhaar', 'marriage-aksel-meriel-eryr', 'house-feuerhaar'),
    marriedAway('married-away-sian-eryr-ilyuncu', 'Haus Ilyuncu', 'marriage-brynthan-sian-eryr', 'house-ilyuncu', HOUSE_EMBLEMS.ilyuncu),
    marriedAway('engaged-away-aysha-eryr-aderyn', 'Haus Aderyn', 'engagement-catwan-aysha', 'house-aderyn', HOUSE_EMBLEMS.aderyn, {
      subtitle: 'Wegverlobt an Haus Aderyn',
      notes: 'Aysha und Catwan sind verlobt; die Verbindung wird nicht als bereits geschlossene Ehe dargestellt.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-aeron-rhianu',
      parentPersonId: '',
      childIds: ['eiddyl-eryr'],
      years: 0,
      fromYear: '1314',
      toYear: '1590',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Der Zeitsprung steht ausschließlich nach dem Hausknoten des Gründerpaares und vor Eiddyl.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-aeron-rhianu',
    houseId: ERYR_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Penbryn · Kadettenzweig der Aderyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aeron-aderyn',
    orientation: 'vertical',
    ancestorDepth: 16,
    descendantDepth: 16,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Eryr O'Penbryn (bereitgestellte Altdaten)",
    sourceNote: 'Die Eryr werden als von Aeron Aderyn und Rhianu begründeter Kadettenzweig geführt. Hausknoten und einziger Zeitsprung stehen strikt seriell: Aeron/Rhianu, Haus Eryr, Überlieferungslücke, Eiddyl. Die detaillierte Genealogie und die bereits kanonische Aderyn-Akte belegen Aerons Geburt 1262; die abweichende Hofangabe 1286 wird verworfen. Ellanahs Illysywen-Kinder und Malvinas Baedd-Kinder bleiben ausschließlich in ihren Zielhäusern; im Eryr-Baum stehen dafür direkte Wegverheiratet-Knoten. Umgekehrt werden die Kinder Sheevs und Mererids ausschließlich hier fortgeführt. Venora, Meriel und Sian erhalten ebenfalls direkte Zielhausknoten; Ayshas Verbindung mit Catwan bleibt ausdrücklich eine Verlobung. Neutrale Standardsilhouetten der Quelle wurden nicht als individuelle Porträts importiert.',
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
