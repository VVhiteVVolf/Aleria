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
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';

const BRITHYLL_HOUSE_ID = 'house-brithyll';
const BRITHYLL_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.brithyll;
const FOUNDER_TIME_JUMP_ID = 'gap-brithyll-founders-to-custenin-siblings';

const HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  blaiddTredegar: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  brithyll: BRITHYLL_EMBLEM,
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
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
  'categirn-pysgod',
  'custenin-brithyll',
  'cador-brithyll'
]);
const HEIR_IDS = new Set(['categirn-1695-brithyll', 'aled-brithyll']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? BRITHYLL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_BRITHYLL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BRITHYLL_HOUSE_ID ? 'core' : 'married'),
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
  founders: ['categirn-pysgod', 'marwine-unknown'],
  custenin: ['heledd-tiwna', 'custenin-brithyll'],
  hafren: ['murvin-drewi', 'hafren-brithyll'],
  gareth: ['gareth-brithyll', 'gwyneth-coedwig'],
  rhydian: ['rhydian-brithyll', 'gwyneth-coedwig'],
  dafyddwen: ['galahad-arth', 'dafyddwen-brithyll'],
  cador: ['cador-brithyll', 'gwladus-gwialen'],
  luned: ['heveydd-gwenyen', 'luned-brithyll'],
  rhiwallaun: ['enfys-pysgod', 'rhiwallaun-brithyll'],
  blodeuyn: ['gereint-pysgod', 'blodeuyn-brithyll'],
  aneirin: ['aneirin-brithyll', 'rhonwen-pawen'],
  pedr: ['pedr-brithyll', 'llwyn-draenog'],
  menna: ['meical-illewod', 'menna-brithyll'],
  ifwin: ['ifwin-brithyll', 'arwen-wivern'],
  tomos: ['tomos-brithyll', 'lili-unknown'],
  llwellyn: ['llwellyn-brithyll', 'wenna-unknown'],
  llewella: ['aneurin-morfil', 'llewella-brithyll'],
  categirn1695: ['categirn-1695-brithyll', 'ranva-silberzunge'],
  erin: ['seamus-o-cenyr', 'erin-brithyll'],
  ithail: ['ithail-brithyll', 'nest-unknown'],
  ysbail: ['lucan-coedwig', 'ysbail-brithyll'],
  efan: ['efan-brithyll', 'maygan-blodeuwedd'],
  jenkin: ['jenkin-brithyll', 'tara-treada'],
  gwenllian: ['ossian-blaidd', 'gwenllian-brithyll']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-categirn-marwine': COUPLES.founders,
  'marriage-heledd-custenin-tiwna': COUPLES.custenin,
  'marriage-murvin-hafren-brithyll': COUPLES.hafren,
  'engagement-gareth-gwyneth-brithyll': COUPLES.gareth,
  'marriage-rhydian-gwyneth-brithyll': COUPLES.rhydian,
  'marriage-galahad-dafyddwen': COUPLES.dafyddwen,
  'marriage-cador-gwladus-brithyll': COUPLES.cador,
  'marriage-heveydd-luned-brithyll': COUPLES.luned,
  'marriage-enfys-rhiwallaun': COUPLES.rhiwallaun,
  'marriage-gereint-blodeuyn': COUPLES.blodeuyn,
  'marriage-aneirin-rhonwen-brithyll': COUPLES.aneirin,
  'marriage-pedr-llwyn-brithyll': COUPLES.pedr,
  'marriage-meical-menna': COUPLES.menna,
  'marriage-ifwin-arwen-brithyll': COUPLES.ifwin,
  'marriage-tomos-lili-brithyll': COUPLES.tomos,
  'marriage-llwellyn-wenna-brithyll': COUPLES.llwellyn,
  'marriage-aneurin-llewella-brithyll': COUPLES.llewella,
  'marriage-categirn-ranva-brithyll': COUPLES.categirn1695,
  'marriage-seamus-erin-brithyll': COUPLES.erin,
  'marriage-ithail-nest-brithyll': COUPLES.ithail,
  'marriage-lucan-ysbail-brithyll': COUPLES.ysbail,
  'marriage-efan-maygan-brithyll': COUPLES.efan,
  'marriage-jenkin-tara-brithyll': COUPLES.jenkin,
  'marriage-ossian-gwenllian-brithyll': COUPLES.gwenllian
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'brithyll-parentage',
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

export const HOUSE_BRITHYLL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-brithyll',
    title: "Haus Brithyll O'Tredegar",
    motto: 'Ein Fisch findet Weisheit in der Strömung.',
    description: 'Ritterfürstliches Kadettenhaus der Pysgod von Tredegar, gegründet durch Categirn Pysgod und Marwine.',
    emblem: BRITHYLL_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.brithyll
  },
  houses: [
    house(BRITHYLL_HOUSE_ID, "Haus Brithyll O'Tredegar", HOUSE_EMBLEMS.brithyll),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-unbekannt-marwine', 'Unbekanntes Haus'),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-drewi', 'Haus Drewi'),
    house('house-coedwig', 'Haus Coedwig', HOUSE_EMBLEMS.coedwig),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-gwenyen', 'Haus Gwenyen'),
    house('house-pawen', 'Haus Pawen'),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-silberzunge', 'Haus Silberzunge'),
    house('house-o-cenyr', "Haus O'Cenyr"),
    house('house-blodeuwedd', 'Haus Blodeuwedd'),
    house('house-treada', 'Haus Tréada'),
    house('house-blaidd-tredegar', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaiddTredegar)
  ],
  persons: [
    person('categirn-pysgod', 'Categirn Pysgod', 'male', '????', '????', {
      houseId: 'house-pysgod',
      status: 'unknown',
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Gründer und erster Ritterfürst des Hauses Brithyll'
    }),
    spouse('marwine-unknown', 'Marwine', 'female', '????', '????', 'house-unbekannt-marwine', {
      status: 'unknown',
      title: 'Mitgründerin des Hauses Brithyll'
    }),

    person('custenin-brithyll', 'Custenin Brithyll', 'male', '1628', '1702', { title: 'Ritterfürst des Hauses Brithyll bis 1702' }),
    awayWoman('hafren-brithyll', 'Hafren Brithyll', '1632', '1710', 'Haus Drewi'),
    person('gareth-brithyll', 'Gareth Brithyll', 'male', '1637', '1657', { title: 'Verlobter Gwyneth Coedwigs' }),
    person('rhydian-brithyll', 'Rhydian Brithyll', 'male', '1639', '1675'),
    awayWoman('dafyddwen-brithyll', 'Dafyddwen Brithyll', '1642', '1719', 'Haus Arth'),
    spouse('heledd-tiwna', 'Heledd Tiwna', 'female', '1630', '1673', 'house-tiwna'),
    spouse('murvin-drewi', 'Murvin Drewi', 'male', '1631', '1702', 'house-drewi'),
    spouse('gwyneth-coedwig', 'Gwyneth Coedwig', 'female', '1637', '1709', 'house-coedwig', {
      notes: 'Zunächst mit Gareth Brithyll verlobt; nach dessen Tod mit Rhydian Brithyll verheiratet.'
    }),
    spouse('galahad-arth', 'Galahad Arth', 'male', '1642', '1708', 'house-arth'),

    person('cador-brithyll', 'Cador Brithyll', 'male', '1650', '', { title: 'Ritterfürst des Hauses Brithyll seit 1702' }),
    awayWoman('luned-brithyll', 'Luned Brithyll', '1652', '1720', 'Haus Gwenyen'),
    person('rhiwallaun-brithyll', 'Rhiwallaun Brithyll', 'male', '1652', ''),
    awayWoman('blodeuyn-brithyll', 'Blodeuyn Brithyll', '1651', '1710', 'Haus Pysgod'),
    person('aneirin-brithyll', 'Aneirin Brithyll', 'male', '1660', '1720'),
    spouse('gwladus-gwialen', 'Gwladus Gwialen', 'female', '1656', '', 'house-gwialen'),
    spouse('heveydd-gwenyen', 'Heveydd Gwenyen', 'male', '1650', '1720', 'house-gwenyen'),
    spouse('enfys-pysgod', 'Enfys Pysgod', 'female', '1652', '', 'house-pysgod'),
    spouse('gereint-pysgod', 'Gereint Pysgod', 'male', '1651', '1718', 'house-pysgod'),
    spouse('rhonwen-pawen', 'Rhonwen Pawen', 'female', '1661', '1710', 'house-pawen'),

    person('pedr-brithyll', 'Pedr Brithyll', 'male', '1674', ''),
    awayWoman('menna-brithyll', 'Menna Brithyll', '1675', '1715', 'Haus Illewod'),
    person('ifwin-brithyll', 'Ifwin Brithyll', 'male', '1677', ''),
    person('tomos-brithyll', 'Tomos Brithyll', 'male', '1678', '1720'),
    person('llwellyn-brithyll', 'Llwellyn Brithyll', 'male', '1677', ''),
    awayWoman('llewella-brithyll', 'Llewella Brithyll', '1677', '', 'Haus Morfil'),
    spouse('llwyn-draenog', 'Llwyn Draenog', 'female', '1675', '', 'house-draenog'),
    spouse('meical-illewod', 'Meical Illewod', 'male', '1674', '', 'house-illewod'),
    spouse('arwen-wivern', 'Arwen Wivern', 'female', '1677', '', 'house-wivern'),
    spouse('lili-unknown', 'Lili', 'female', '1679', '1739'),
    spouse('wenna-unknown', 'Wenna', 'female', '1677', ''),
    spouse('aneurin-morfil', 'Aneurin Morfil', 'male', '1674', '', 'house-morfil'),

    person('categirn-1695-brithyll', 'Categirn Brithyll', 'male', '1695', '', { title: 'Erster Erbe des Hauses Brithyll' }),
    awayWoman('erin-brithyll', 'Erin Brithyll', '1699', '', "Haus O'Cenyr", {
      title: "Wegverheiratet an Haus O'Cenyr"
    }),
    person('ithail-brithyll', 'Ithail Brithyll', 'male', '1694', ''),
    awayWoman('ysbail-brithyll', 'Ysbail Brithyll', '1696', '', 'Haus Coedwig'),
    person('efan-brithyll', 'Efan Brithyll', 'male', '1698', ''),
    person('jenkin-brithyll', 'Jenkin Brithyll', 'male', '1695', ''),
    awayWoman('gwenllian-brithyll', 'Gwenllian Brithyll', '1696', '', "Haus Blaidd O'Tredegar"),
    spouse('ranva-silberzunge', 'Ranva Silberzunge', 'female', '1696', '', 'house-silberzunge'),
    spouse('seamus-o-cenyr', "Seamus O'Cenyr", 'male', '1701', '', 'house-o-cenyr'),
    spouse('nest-unknown', 'Nest', 'female', '1697', ''),
    spouse('lucan-coedwig', 'Lucan Coedwig', 'male', '1695', '', 'house-coedwig'),
    spouse('maygan-blodeuwedd', 'Maygan Blodeuwedd', 'female', '1700', '', 'house-blodeuwedd', {
      notes: 'Die Partnerkarte und die Genealogie nennen Maygan; die Kinderüberschrift der Altquelle nennt abweichend Haw.'
    }),
    spouse('tara-treada', 'Tara Tréada', 'female', '1696', '', 'house-treada'),
    spouse('ossian-blaidd', 'Ossian Blaidd', 'male', '1695', '', 'house-blaidd-tredegar'),

    person('aled-brithyll', 'Aled Brithyll', 'male', '1718', '', { title: 'Zweiter Erbe des Hauses Brithyll' }),
    person('iona-brithyll', 'Iona Brithyll', 'female', '1723', ''),
    person('cai-brithyll', 'Cai Brithyll', 'male', '1718', ''),
    person('una-brithyll', 'Una Brithyll', 'female', '1723', ''),
    person('math-brithyll', 'Math Brithyll', 'male', '1720', ''),
    person('iola-brithyll', 'Iola Brithyll', 'female', '1726', ''),
    person('paddy-brithyll', 'Paddy Brithyll', 'male', '1723', ''),
    person('eleri-brithyll', 'Eleri Brithyll', 'female', '1726', ''),
    person('uri-brithyll', 'Uri Brithyll', 'male', '1722', ''),
    person('undeg-brithyll', 'Undeg Brithyll', 'female', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-categirn-marwine', ...COUPLES.founders),
    createMarriage('marriage-heledd-custenin-tiwna', ...COUPLES.custenin, { status: 'ended', end: '1673' }),
    createMarriage('marriage-murvin-hafren-brithyll', ...COUPLES.hafren, { status: 'ended', end: '1702' }),
    createMarriage('engagement-gareth-gwyneth-brithyll', ...COUPLES.gareth, { type: 'engagement', status: 'ended', end: '1657' }),
    createMarriage('marriage-rhydian-gwyneth-brithyll', ...COUPLES.rhydian, { status: 'ended', end: '1675' }),
    createMarriage('marriage-galahad-dafyddwen', ...COUPLES.dafyddwen, { status: 'ended', end: '1708' }),
    createMarriage('marriage-cador-gwladus-brithyll', ...COUPLES.cador),
    createMarriage('marriage-heveydd-luned-brithyll', ...COUPLES.luned, { status: 'ended', end: '1720' }),
    createMarriage('marriage-enfys-rhiwallaun', ...COUPLES.rhiwallaun),
    createMarriage('marriage-gereint-blodeuyn', ...COUPLES.blodeuyn, { status: 'ended', end: '1710' }),
    createMarriage('marriage-aneirin-rhonwen-brithyll', ...COUPLES.aneirin, { status: 'ended', end: '1710' }),
    createMarriage('marriage-pedr-llwyn-brithyll', ...COUPLES.pedr),
    createMarriage('marriage-meical-menna', ...COUPLES.menna, { status: 'ended', end: '1715' }),
    createMarriage('marriage-ifwin-arwen-brithyll', ...COUPLES.ifwin),
    createMarriage('marriage-tomos-lili-brithyll', ...COUPLES.tomos, { status: 'ended', end: '1720' }),
    createMarriage('marriage-llwellyn-wenna-brithyll', ...COUPLES.llwellyn),
    createMarriage('marriage-aneurin-llewella-brithyll', ...COUPLES.llewella),
    createMarriage('marriage-categirn-ranva-brithyll', ...COUPLES.categirn1695),
    createMarriage('marriage-seamus-erin-brithyll', ...COUPLES.erin),
    createMarriage('marriage-ithail-nest-brithyll', ...COUPLES.ithail),
    createMarriage('marriage-lucan-ysbail-brithyll', ...COUPLES.ysbail),
    createMarriage('marriage-efan-maygan-brithyll', ...COUPLES.efan),
    createMarriage('marriage-jenkin-tara-brithyll', ...COUPLES.jenkin),
    createMarriage('marriage-ossian-gwenllian-brithyll', ...COUPLES.gwenllian)
  ],
  parentages: [
    ...childrenOf([
      'custenin-brithyll',
      'hafren-brithyll',
      'gareth-brithyll',
      'rhydian-brithyll',
      'dafyddwen-brithyll'
    ], 'marriage-categirn-marwine', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit diesen fünf Geschwistern.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['cador-brithyll', 'luned-brithyll', 'rhiwallaun-brithyll'], 'marriage-heledd-custenin-tiwna'),
    ...childrenOf(['blodeuyn-brithyll', 'aneirin-brithyll'], 'marriage-rhydian-gwyneth-brithyll'),
    ...childrenOf(['pedr-brithyll', 'menna-brithyll', 'ifwin-brithyll'], 'marriage-cador-gwladus-brithyll'),
    ...childrenOf(['tomos-brithyll'], 'marriage-enfys-rhiwallaun'),
    ...childrenOf(['llwellyn-brithyll', 'llewella-brithyll'], 'marriage-aneirin-rhonwen-brithyll'),
    ...childrenOf(['categirn-1695-brithyll', 'erin-brithyll'], 'marriage-pedr-llwyn-brithyll'),
    ...childrenOf(['ithail-brithyll', 'ysbail-brithyll'], 'marriage-ifwin-arwen-brithyll'),
    ...childrenOf(['efan-brithyll'], 'marriage-tomos-lili-brithyll'),
    ...childrenOf(['jenkin-brithyll', 'gwenllian-brithyll'], 'marriage-llwellyn-wenna-brithyll'),
    ...childrenOf(['aled-brithyll', 'iona-brithyll'], 'marriage-categirn-ranva-brithyll'),
    ...childrenOf(['cai-brithyll', 'una-brithyll'], 'marriage-seamus-erin-brithyll'),
    ...childrenOf(['math-brithyll', 'iola-brithyll'], 'marriage-ithail-nest-brithyll'),
    ...childrenOf(['paddy-brithyll', 'eleri-brithyll'], 'marriage-efan-maygan-brithyll'),
    ...childrenOf(['uri-brithyll', 'undeg-brithyll'], 'marriage-jenkin-tara-brithyll')
  ],
  cadetBranches: [
    marriedAway('married-away-hafren-brithyll-drewi', 'Haus Drewi', 'marriage-murvin-hafren-brithyll', 'house-drewi'),
    marriedAway('married-away-dafyddwen-brithyll-arth', 'Haus Arth', 'marriage-galahad-dafyddwen', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-luned-brithyll-gwenyen', 'Haus Gwenyen', 'marriage-heveydd-luned-brithyll', 'house-gwenyen'),
    marriedAway('married-away-blodeuyn-brithyll-pysgod', 'Haus Pysgod', 'marriage-gereint-blodeuyn', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-menna-brithyll-illewod', 'Haus Illewod', 'marriage-meical-menna', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-llewella-brithyll-morfil', 'Haus Morfil', 'marriage-aneurin-llewella-brithyll', 'house-morfil', HOUSE_EMBLEMS.morfil),
    marriedAway('married-away-ysbail-brithyll-coedwig', 'Haus Coedwig', 'marriage-lucan-ysbail-brithyll', 'house-coedwig', HOUSE_EMBLEMS.coedwig),
    marriedAway('married-away-gwenllian-brithyll-blaidd', "Haus Blaidd O'Tredegar", 'marriage-ossian-gwenllian-brithyll', 'house-blaidd-tredegar', HOUSE_EMBLEMS.blaiddTredegar, {
      targetFamilyId: 'haus-blaidd-tredegar'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-categirn-marwine',
      parentPersonId: '',
      childIds: [
        'custenin-brithyll',
        'hafren-brithyll',
        'gareth-brithyll',
        'rhydian-brithyll',
        'dafyddwen-brithyll'
      ],
      years: 0,
      fromYear: '????',
      toYear: '1628',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach die fünf überlieferten Geschwister.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-categirn-marwine',
    houseId: BRITHYLL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Tredegar · Kadettenzweig der Pysgod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cador-brithyll',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Brithyll O'Tredegar (bereitgestellte Altdaten)",
    sourceNote: 'Categirn Pysgod und Marwine begründen Haus Brithyll. Der Hausknoten und der einzige Zeitsprung stehen strikt seriell vor der Generation Custenins. Gwyneth Coedwig ist eine einzelne Weltperson: Ihre Verlobung mit Gareth endet 1657; danach heiratet sie Rhydian, und nur dieser Ehe werden Blodeuyn und Aneirin zugeordnet. Kinder der wegverheirateten Blodeuyn, Menna, Dafyddwen und weiterer Frauen werden ausschließlich in den jeweiligen Zielhäusern fortgeführt. Die Altquelle widerspricht sich bei Efans Ehefrau in einer Kinderüberschrift; Partnerkarte und Genealogie belegen Maygan Blodeuwedd. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
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
