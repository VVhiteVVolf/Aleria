import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_JAERNBLOD_PORTRAITS } from './house-jaernblod-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const SILBERBLUT_HOUSE_ID = 'house-silberblut';
const SOURCE_GAP_ID = 'gap-freki-skadi-to-einar-vikar-silberblut';

const PERSON_PORTRAITS = Object.freeze({
  ...HOUSE_SILBERBLUT_PORTRAITS,
  ...HOUSE_JAERNBLOD_PORTRAITS,
  ...HOUSE_VARANGR_PORTRAITS,
  ...HOUSE_FEUERHAAR_PORTRAITS,
  ...HOUSE_SCHWARZBLUT_PORTRAITS,
  ...HOUSE_SCHMETTERSCHILD_PORTRAITS,
  ...HOUSE_SCHATTENHERZ_PORTRAITS,
  ...HOUSE_HELGR_PORTRAITS,
  ...HOUSE_BLUTSTAHL_PORTRAITS
});

const HOUSE_EMBLEMS = Object.freeze({
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  jaernblod: KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod,
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  schattenherz: KRAEHENMOOR_HOUSE_EMBLEMS.schattenherz,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar,
  schmetterschild: SCHWARZFENN_HOUSE_EMBLEMS.schmetterschild,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death', 'portrait',
  'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole', 'tags', 'notes'
]);

const HEAD_IDS = new Set([
  'freki-jaernblod', 'einar-silberblut', 'gunnar-silberblut',
  'fodnir-silberblut', 'askold-silberblut', 'thengil-silberblut',
  'thongvar-silberblut', 'thongvir-silberblut'
]);

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SILBERBLUT_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: PERSON_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SILBERBLUT_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
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

function receivedWard(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    houseId,
    familyRole: 'ward',
    lineageRole: 'branch',
    title: options.title || 'Aufgenommenes Mündel Thongvir Silberbluts',
    tags: [...(options.tags || []), 'Mündel', 'Aufgenommen']
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id, name, motto: '', emblem, status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-freki-skadi-jaernblod': ['freki-jaernblod', 'skadi'],
  'marriage-kjellfrid-einar-varangr': ['einar-silberblut', 'kjellfrid-varangr'],
  'marriage-lyngvild-vikar-feuerhaar': ['lyngvild-feuerhaar', 'vikar-silberblut'],
  'marriage-sigrid-wulfgar-silberblut': ['wulfgar-goldglanz', 'sigrid-silberblut'],
  'marriage-borghild-gunnar-schwarzblut': ['gunnar-silberblut', 'borghild-schwarzblut'],
  'marriage-geirfast-ylandis-schwarzblut': ['geirfast-schwarzblut', 'ylandis-silberblut'],
  'marriage-fodnir-filga-silberblut': ['fodnir-silberblut', 'filga'],
  'marriage-ragnar-herka-silberblut': ['ragnar-silberblut', 'herka'],
  'marriage-askold-hekla-silberblut': ['askold-silberblut', 'hekla-goldglanz'],
  'marriage-vanadis-asbjorn-silberblut': ['asbjorn-feuerherz', 'vanadis-silberblut'],
  'marriage-gardar-langdis-silberblut': ['gardar-silberblut', 'langdis'],
  'marriage-thengil-tordis-schmetterschild': ['thengil-silberblut', 'tordis-schmetterschild'],
  'marriage-ivarr-myrna-schwarzblut': ['ivarr-schwarzblut', 'myrna-silberblut'],
  'marriage-fritjof-torhild-schattenherz': ['fritjof-silberblut', 'torhild-schattenherz'],
  'marriage-udveig-egil-silberblut': ['egil-vragi', 'udveig-silberblut'],
  'marriage-thongvar-lysfrid-schattenherz': ['thongvar-silberblut', 'lysfrid-schattenherz'],
  'marriage-svandis-finnur-silberblut': ['finnur-eisenbieger', 'svandis-silberblut'],
  'marriage-undral-pjarga-silberblut': ['undral-silberblut', 'pjarga'],
  'marriage-thongvir-fanne-silberblut': ['thongvir-silberblut', 'fanne-blutstahl'],
  'marriage-brandur-aslaug-varangr': ['brandur-varangr', 'aslaug-silberblut'],
  'marriage-tengir-hafrun-silberblut': ['tengir-silberblut', 'hafrun'],
  'marriage-svanur-telma-schwarzblut': ['svanur-schwarzblut', 'telma-silberblut']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'silberblut-parentage',
    ...options
  });
}

function fosterChildren(childIds, guardianId, notes) {
  return createParentages(childIds, [guardianId], '', {
    idPrefix: 'silberblut-foster-parentage',
    type: 'foster',
    legitimacy: 'unknown',
    notes
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_SILBERBLUT_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-silberblut',
    title: 'Clan Silberblut',
    motto: '',
    description: 'Thanenclan von Silberquell im Thanentum Schimmerküste und Nachfahren des erloschenen Järnblod-Clans. Die Linie geht auf Freki Järnblod und Skadi zurück.',
    emblem: HOUSE_EMBLEMS.silberblut,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.silberblut
  },
  houses: [
    house(SILBERBLUT_HOUSE_ID, 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-jaernblod', 'Clan Järnblod', HOUSE_EMBLEMS.jaernblod, 'extinct'),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-feuerhaar', 'Clan Feuerhaar', HOUSE_EMBLEMS.feuerhaar),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-schmetterschild', 'Clan Schmetterschild', HOUSE_EMBLEMS.schmetterschild),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz),
    house('house-vragi', 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-eisenbieger', 'Clan Eisenbieger'),
    house('house-blutstahl', 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr)
  ],
  persons: [
    person('freki-jaernblod', 'Freki Järnblod', 'male', '????', '????', {
      houseId: 'house-jaernblod', familyRole: 'bastard',
      title: 'Legitimierter Järnblod-Bastard · Gründer des Clans Silberblut',
      tags: ['Bastard', 'Legitimiert', 'Gründer']
    }),
    spouse('skadi', 'Skadi', 'female', '????', '????', '', { title: 'Mitbegründerin des Clans Silberblut', tags: ['Gründerin'] }),

    person('einar-silberblut', 'Einar Silberblut', 'male', '1560', '1601'),
    person('vikar-silberblut', 'Vikar Silberblut', 'male', '1564', '1611'),
    spouse('kjellfrid-varangr', 'Kjellfrid Varangr', 'female', '1563', '????', 'house-varangr'),
    spouse('lyngvild-feuerhaar', 'Lyngvild Feuerhaar', 'female', '1569', '1615', 'house-feuerhaar'),

    awayWoman('sigrid-silberblut', 'Sigrid Silberblut', '1580', '1640', 'Clan Goldglanz', {
      notes: 'Die Quelle nennt 1540 als Todesjahr. Da dieses vierzig Jahre vor ihrer Geburt 1580 läge, wird der offensichtliche Zahlendreher zu 1640 normalisiert.'
    }),
    person('gunnar-silberblut', 'Gunnar Silberblut', 'male', '1582', '1625'),
    awayWoman('ylandis-silberblut', 'Ylandis Silberblut', '1585', '1641', 'Clan Schwarzblut'),
    spouse('wulfgar-goldglanz', 'Wulfgar Goldglanz', 'male', '1587', '1666', 'house-goldglanz'),
    spouse('borghild-schwarzblut', 'Borghild Schwarzblut', 'female', '1583', '1650', 'house-schwarzblut'),
    spouse('geirfast-schwarzblut', 'Geirfast Schwarzblut', 'male', '1586', '1632', 'house-schwarzblut'),

    person('fodnir-silberblut', 'Fodnir Silberblut', 'male', '1601', '1672', { title: 'Thane von Silberquell' }),
    person('ragnar-silberblut', 'Ragnar Silberblut', 'male', '1602', '1628', { title: 'Hesir und Flottenführer des Clans Silberblut' }),
    person('mirmir-silberblut', 'Mirmir Silberblut', 'male', '1610', '1630'),
    spouse('filga', 'Filga', 'female', '????', '????'),
    spouse('herka', 'Herka', 'female', '????', '????'),

    person('askold-silberblut', 'Askold Silberblut', 'male', '1627', '1685'),
    awayWoman('vanadis-silberblut', 'Vanadis Silberblut', '1633', '????', 'Clan Feuerherz'),
    person('trygve-silberblut', 'Trygve Silberblut', 'male', '1622', '1635'),
    person('gardar-silberblut', 'Gardar Silberblut', 'male', '1628', '1659'),
    spouse('hekla-goldglanz', 'Hekla Goldglanz', 'female', '1634', '1694', 'house-goldglanz'),
    spouse('asbjorn-feuerherz', 'Asbjörn Feuerherz', 'male', '1630', '1689', 'house-feuerherz'),
    spouse('langdis', 'Langdis', 'female', '????', '????'),

    person('thengil-silberblut', 'Thengil Silberblut', 'male', '1652', '1698'),
    awayWoman('myrna-silberblut', 'Myrna Silberblut', '1655', '1699', 'Clan Schwarzblut'),
    person('fritjof-silberblut', 'Fritjof Silberblut', 'male', '1650', '1700'),
    awayWoman('udveig-silberblut', 'Udveig Silberblut', '1652', '1709', 'Clan Vragi'),
    spouse('tordis-schmetterschild', 'Tordis Schmetterschild', 'female', '1655', '1712', 'house-schmetterschild'),
    spouse('ivarr-schwarzblut', 'Ivarr Schwarzblut', 'male', '1650', '1711', 'house-schwarzblut'),
    spouse('torhild-schattenherz', 'Torhild Schattenherz', 'female', '1656', '1694', 'house-schattenherz'),
    spouse('egil-vragi', 'Egil Vragi', 'male', '1654', '1728', 'house-vragi'),

    person('thongvar-silberblut', 'Thongvar Silberblut', 'male', '1673', ''),
    awayWoman('svandis-silberblut', 'Svandis Silberblut', '1674', '', 'Clan Eisenbieger'),
    person('undral-silberblut', 'Undral Silberblut', 'male', '1676', ''),
    spouse('lysfrid-schattenherz', 'Lysfrid Schattenherz', 'female', '1677', '1733', 'house-schattenherz'),
    spouse('finnur-eisenbieger', 'Finnur Eisenbieger', 'male', '1668', '', 'house-eisenbieger'),
    spouse('pjarga', 'Pjarga', 'female', '????', '????'),

    person('thongvir-silberblut', 'Thongvir Silberblut', 'male', '1693', ''),
    awayWoman('aslaug-silberblut', 'Aslaug Silberblut', '1698', '', 'Clan Varangr'),
    person('tengir-silberblut', 'Tengir Silberblut', 'male', '1698', ''),
    awayWoman('telma-silberblut', 'Telma Silberblut', '1703', '', 'Clan Schwarzblut'),
    spouse('fanne-blutstahl', 'Fanne Blutstahl', 'female', '1698', '', 'house-blutstahl'),
    spouse('brandur-varangr', 'Brandur Varangr', 'male', '1695', '', 'house-varangr'),
    spouse('hafrun', 'Hafrun', 'female', '????', ''),
    spouse('svanur-schwarzblut', 'Svanur Schwarzblut', 'male', '1698', '', 'house-schwarzblut'),

    person('alrik-silberblut', 'Alrik Silberblut', 'male', '1721', ''),
    person('kjetill-silberblut', 'Kjetill Silberblut', 'male', '1726', ''),
    person('jurgen-silberblut', 'Jurgen Silberblut', 'male', '1727', ''),
    receivedWard('olna-helgr', 'Olna Helgr', 'female', '1730', 'house-helgr', {
      title: 'Aufgenommenes Mündel Thongvir Silberbluts',
      notes: 'Olna bleibt leibliche Tochter Peders und Gyrids im Helgr-Stammbaum; bei Silberblut wird sie ausschließlich als aufgenommenes Mündel geführt.'
    }),
    person('tova-silberblut', 'Tova Silberblut', 'female', '1722', '')
  ],
  partnerships: [
    partnership('marriage-freki-skadi-jaernblod', { status: 'ended' }),
    partnership('marriage-kjellfrid-einar-varangr', { status: 'ended', end: '1601' }),
    partnership('marriage-lyngvild-vikar-feuerhaar', { status: 'ended', end: '1611' }),
    partnership('marriage-sigrid-wulfgar-silberblut', { status: 'ended', end: '1640' }),
    partnership('marriage-borghild-gunnar-schwarzblut', { status: 'ended', end: '1625' }),
    partnership('marriage-geirfast-ylandis-schwarzblut', { status: 'ended', end: '1632' }),
    partnership('marriage-fodnir-filga-silberblut', { status: 'ended', end: '1672' }),
    partnership('marriage-ragnar-herka-silberblut', { status: 'ended', end: '1628' }),
    partnership('marriage-askold-hekla-silberblut', { status: 'ended', end: '1685' }),
    partnership('marriage-vanadis-asbjorn-silberblut', { status: 'ended', end: '1689' }),
    partnership('marriage-gardar-langdis-silberblut', { status: 'ended', end: '1659' }),
    partnership('marriage-thengil-tordis-schmetterschild', { status: 'ended', end: '1698' }),
    partnership('marriage-ivarr-myrna-schwarzblut', { status: 'ended', end: '1699' }),
    partnership('marriage-fritjof-torhild-schattenherz', { status: 'ended', end: '1694' }),
    partnership('marriage-udveig-egil-silberblut', { status: 'ended', end: '1709' }),
    partnership('marriage-thongvar-lysfrid-schattenherz', { status: 'ended', end: '1733' }),
    partnership('marriage-svandis-finnur-silberblut'),
    partnership('marriage-undral-pjarga-silberblut'),
    partnership('marriage-thongvir-fanne-silberblut'),
    partnership('marriage-brandur-aslaug-varangr'),
    partnership('marriage-tengir-hafrun-silberblut'),
    partnership('marriage-svanur-telma-schwarzblut')
  ],
  parentages: [
    ...childrenOf(['einar-silberblut', 'vikar-silberblut'], 'marriage-freki-skadi-jaernblod', {
      type: 'claimed', legitimacy: 'unknown', certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['sigrid-silberblut', 'gunnar-silberblut'], 'marriage-kjellfrid-einar-varangr'),
    ...childrenOf(['ylandis-silberblut'], 'marriage-lyngvild-vikar-feuerhaar'),
    ...childrenOf(['fodnir-silberblut', 'ragnar-silberblut', 'mirmir-silberblut'], 'marriage-borghild-gunnar-schwarzblut'),
    ...childrenOf(['askold-silberblut', 'vanadis-silberblut'], 'marriage-fodnir-filga-silberblut'),
    ...childrenOf(['trygve-silberblut', 'gardar-silberblut'], 'marriage-ragnar-herka-silberblut'),
    ...childrenOf(['thengil-silberblut', 'myrna-silberblut'], 'marriage-askold-hekla-silberblut'),
    ...childrenOf(['fritjof-silberblut', 'udveig-silberblut'], 'marriage-gardar-langdis-silberblut'),
    ...childrenOf(['thongvar-silberblut', 'svandis-silberblut'], 'marriage-thengil-tordis-schmetterschild'),
    ...childrenOf(['undral-silberblut'], 'marriage-fritjof-torhild-schattenherz'),
    ...childrenOf(['thongvir-silberblut', 'aslaug-silberblut'], 'marriage-thongvar-lysfrid-schattenherz'),
    ...childrenOf(['tengir-silberblut', 'telma-silberblut'], 'marriage-undral-pjarga-silberblut'),
    ...childrenOf(['alrik-silberblut', 'kjetill-silberblut', 'jurgen-silberblut'], 'marriage-thongvir-fanne-silberblut'),
    ...childrenOf(['tova-silberblut'], 'marriage-tengir-hafrun-silberblut'),
    ...fosterChildren(['olna-helgr'], 'thongvir-silberblut', 'Olna Helgr ist Thongvirs aufgenommenes Mündel und kein leiblicher Silberblut-Spross.')
  ],
  cadetBranches: [
    marriedAway('married-away-sigrid-silberblut-goldglanz', 'Clan Goldglanz', 'marriage-sigrid-wulfgar-silberblut', 'house-goldglanz', 'haus-goldglanz', HOUSE_EMBLEMS.goldglanz),
    marriedAway('married-away-ylandis-silberblut-schwarzblut', 'Clan Schwarzblut', 'marriage-geirfast-ylandis-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-vanadis-silberblut-feuerherz', 'Clan Feuerherz', 'marriage-vanadis-asbjorn-silberblut', 'house-feuerherz', 'haus-feuerherz', HOUSE_EMBLEMS.feuerherz),
    marriedAway('married-away-myrna-silberblut-schwarzblut', 'Clan Schwarzblut', 'marriage-ivarr-myrna-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    marriedAway('married-away-udveig-silberblut-vragi', 'Clan Vragi', 'marriage-udveig-egil-silberblut', 'house-vragi', 'haus-vragi', HOUSE_EMBLEMS.vragi),
    marriedAway('married-away-svandis-silberblut-eisenbieger', 'Clan Eisenbieger', 'marriage-svandis-finnur-silberblut', 'house-eisenbieger', 'haus-eisenbieger'),
    marriedAway('married-away-aslaug-silberblut-varangr', 'Clan Varangr', 'marriage-brandur-aslaug-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-telma-silberblut-schwarzblut', 'Clan Schwarzblut', 'marriage-svanur-telma-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-freki-skadi-jaernblod',
    parentPersonId: '',
    childIds: ['einar-silberblut', 'vikar-silberblut'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1560',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Silberblut-Hausknoten; kein Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-freki-skadi-jaernblod',
    houseId: SILBERBLUT_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Silberquell · Nachfahren der Järnblod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'jaernblod-origin-silberblut',
      houseId: 'house-jaernblod',
      name: 'Clan Järnblod',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.jaernblod,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['freki-jaernblod'],
      targetFamilyId: 'haus-jaernblod',
      notes: 'Freki Järnblod und Skadi begründen die Silberblut-Linie.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'freki-jaernblod', orientation: 'vertical', ancestorDepth: 32,
    descendantDepth: 32, limitGenerations: false, showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: 'Clan Silberblut (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Silberblut-Stammbaum wird ohne Personenfokus von Freki Järnblod und Skadi bis zur jüngsten Generation des Jahres 1740 gezeigt. Der Hausknoten und genau ein serieller Zeitsprung stehen vor Einar und Vikar. Sigrids unmögliches Quellsterbejahr 1540 wird wegen ihrer Geburt 1580 zu 1640 normalisiert. Olna Helgr bleibt biologisches Kind Peders und Gyrids in ihrer Herkunftsakte, wird hier jedoch ausschließlich im dunkelblauen Mündelrahmen als Thongvirs aufgenommenes Mündel geführt. Kinder wegverheirateter Frauen werden ausschließlich in der fortführenden Gegenakte gezeigt. Unbenannte Verlobtenfelder werden nicht importiert.',
    sourceFamilyId: 'haus-jaernblod',
    registryTombstones: {
      persons: ['haus-silberblut-gruender', 'haus-silberblut-gruenderin'],
      partnerships: ['marriage-haus-silberblut-founders'],
      cadetBranches: []
    },
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'sourceFamilyId'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'liegeHouses', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse']
  }
});
