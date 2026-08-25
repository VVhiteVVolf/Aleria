import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_JAERNBLOD_PORTRAITS } from './house-jaernblod-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const BLUTSTAHL_HOUSE_ID = 'house-blutstahl';
const SOURCE_GAP_ID = 'gap-skalli-fenrir-to-sigurd-arnborg-blutstahl';
const PARENT_PAIR_OVER_CHILD_EXTENSION = 'chartAlignParentPairOverChildPersonId';
const OBSOLETE_PARTNER_ALIGNMENT_EXTENSION = 'chartAlignPartnerOverChildrenPersonId';

const PERSON_PORTRAITS = Object.freeze({
  ...HOUSE_BLUTSTAHL_PORTRAITS,
  ...HOUSE_JAERNBLOD_PORTRAITS,
  ...HOUSE_RAGNULF_PORTRAITS,
  ...HOUSE_KUMMERHERZ_PORTRAITS,
  ...HOUSE_GRAUMAHNE_PORTRAITS,
  ...HOUSE_TODBRAND_PORTRAITS,
  ...HOUSE_SCHATTENHERZ_PORTRAITS,
  ...HOUSE_SCHWARZBLUT_PORTRAITS,
  ...HOUSE_SILBERBLUT_PORTRAITS,
  ...HOUSE_VARANGR_PORTRAITS
});

const HOUSE_EMBLEMS = Object.freeze({
  blutstahl: KRAEHENMOOR_HOUSE_EMBLEMS.blutstahl,
  jaernblod: KRAEHENMOOR_HOUSE_EMBLEMS.jaernblod,
  silberblut: KRAEHENMOOR_HOUSE_EMBLEMS.silberblut,
  schwarzblut: KRAEHENMOOR_HOUSE_EMBLEMS.schwarzblut,
  kaltherz: KRAEHENMOOR_HOUSE_EMBLEMS.kaltherz,
  feuerherz: KRAEHENMOOR_HOUSE_EMBLEMS.feuerherz,
  vragi: KRAEHENMOOR_HOUSE_EMBLEMS.vragi,
  goldglanz: KRAEHENMOOR_HOUSE_EMBLEMS.goldglanz,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  ragnulf: SCHWARZFENN_HOUSE_EMBLEMS.ragnulf,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  todbrand: SCHWARZFENN_HOUSE_EMBLEMS.todbrand,
  feuerhaar: IVARSHEIM_HOUSE_EMBLEMS.feuerhaar
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death', 'portrait',
  'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole', 'tags', 'notes'
]);

const HEAD_IDS = new Set([
  'skalli-jaernblod', 'sigurd-blutstahl', 'raveld-blutstahl',
  'sigrun-blutstahl', 'soren-blutstahl'
]);

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? BLUTSTAHL_HOUSE_ID : options.houseId;
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
    familyRole: options.familyRole || (houseId === BLUTSTAHL_HOUSE_ID ? 'core' : 'married'),
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

function bastard(id, name, sex, birth, death, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    familyRole: 'bastard',
    tags: [...(options.tags || []), 'Bastard']
  });
}

function house(id, name, emblem = '', status = 'active') {
  return {
    id, name, motto: '', emblem, status,
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-fenrir-skalli-jaernblod': ['fenrir', 'skalli-jaernblod'],
  'marriage-sigurd-melka-blutstahl': ['sigurd-blutstahl', 'melka'],
  'marriage-steinar-arnborg-varangr': ['steinar-varangr', 'arnborg-blutstahl'],
  'marriage-estrid-raveld-ragnulf': ['raveld-blutstahl', 'estrid-ragnulf'],
  'marriage-mogunn-audhild-kummerherz': ['mogunn-kummerherz', 'audhild-blutstahl'],
  'marriage-dagfrid-radulfr-todbrand': ['radulfr-blutstahl', 'dagfrid-todbrand'],
  'marriage-joralf-gislaug-blutstahl': ['joralf-blutstahl', 'gislaug'],
  'marriage-arnljot-svaldis-graumahne': ['arnljot-graumahne', 'svaldis-blutstahl'],
  'forced-sigrun-wallmar-blutstahl': ['sigrun-blutstahl', 'wallmar'],
  'marriage-holgr-udveig-blutstahl': ['holgr-blutstahl', 'udveig-gullvig'],
  'marriage-birger-vallborg-blutstahl': ['birger-blutstahl', 'vallborg-sturmgeborene'],
  'marriage-soren-thjora-blutstahl': ['soren-blutstahl', 'thjora'],
  'marriage-alfhild-nottulf-blutstahl': ['nottulf-kaltherz', 'alfhild-blutstahl'],
  'marriage-harald-myrna-blutstahl': ['harald-blutstahl', 'myrna-goldglanz'],
  'marriage-rangrid-vionnan-blutstahl': ['vionnan-culloch', 'rangrid-blutstahl'],
  'marriage-ingjald-unhild-schattenherz': ['ingjald-blutstahl', 'unhild-schattenherz'],
  'marriage-gyda-morskar-blutstahl': ['morskar-vragi', 'gyda-blutstahl'],
  'marriage-sleipnir-kolfrid-blutstahl': ['sleipnir-blutstahl', 'kolfrid'],
  'marriage-kjartan-drifa-blutstahl': ['kjartan-blutstahl', 'drifa'],
  'marriage-eyrun-lythar-blutstahl': ['lythar-feuerherz', 'eyrun-blutstahl'],
  'marriage-hallgrim-ingithora-schattenherz': ['hallgrim-blutstahl', 'ingithora-schattenherz'],
  'marriage-dagfrid-jorvik-blutstahl': ['jorvik-kaltherz', 'dagfrid-blutstahl'],
  'marriage-steinar-bylgja-blutstahl': ['steinar-blutstahl', 'bylgja'],
  'marriage-andor-askla-varangr': ['andor-varangr', 'askla-blutstahl'],
  'marriage-thongvir-fanne-silberblut': ['thongvir-silberblut', 'fanne-blutstahl'],
  'marriage-ragnald-myrla-blutstahl': ['ragnald-blutstahl', 'myrla'],
  'marriage-sindre-hillevi-schwarzblut': ['sindre-schwarzblut', 'hillevi-blutstahl']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignParentPairOverChild(record, childPersonId, removedManagedFields = []) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [PARENT_PAIR_OVER_CHILD_EXTENSION]: childPersonId,
      registryManagedExtensionFields: [
        PARENT_PAIR_OVER_CHILD_EXTENSION,
        ...removedManagedFields
      ]
    }
  };
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'blutstahl-parentage',
    ...options
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

export const HOUSE_BLUTSTAHL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-blutstahl',
    title: 'Clan Blutstahl',
    motto: '',
    description: 'Thanenclan von Silberquell im Thanentum Schimmerküste und Nachfahren des erloschenen Järnblod-Clans. Die Linie geht auf Fenrir und Skalli Järnblod zurück.',
    emblem: HOUSE_EMBLEMS.blutstahl,
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES.blutstahl
  },
  houses: [
    house(BLUTSTAHL_HOUSE_ID, 'Clan Blutstahl', HOUSE_EMBLEMS.blutstahl),
    house('house-jaernblod', 'Clan Järnblod', HOUSE_EMBLEMS.jaernblod, 'extinct'),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-todbrand', 'Clan Todbrand', HOUSE_EMBLEMS.todbrand),
    house('house-kaltherz', 'Clan Kaltherz', HOUSE_EMBLEMS.kaltherz),
    house('house-feuerherz', 'Clan Feuerherz', HOUSE_EMBLEMS.feuerherz),
    house('house-vragi', 'Clan Vragi', HOUSE_EMBLEMS.vragi),
    house('house-goldglanz', 'Clan Goldglanz', HOUSE_EMBLEMS.goldglanz),
    house('house-sturmgeborene', 'Clan Sturmgeborene'),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-culloch', 'Clan Culloch'),
    house('house-silberblut', 'Clan Silberblut', HOUSE_EMBLEMS.silberblut),
    house('house-schwarzblut', 'Clan Schwarzblut', HOUSE_EMBLEMS.schwarzblut),
    house('house-schattenherz', 'Clan Schattenherz', HOUSE_EMBLEMS.schattenherz)
  ],
  persons: [
    person('skalli-jaernblod', 'Skalli Järnblod', 'female', '????', '????', {
      houseId: 'house-jaernblod', familyRole: 'core', title: 'Järnblod-Spross · Gründerin des Clans Blutstahl', tags: ['Gründerin']
    }),
    spouse('fenrir', 'Fenrir', 'male', '????', '????', '', { title: 'Mitbegründer des Clans Blutstahl', tags: ['Gründer'] }),

    person('sigurd-blutstahl', 'Sigurd Blutstahl', 'male', '1561', '1603'),
    awayWoman('arnborg-blutstahl', 'Arnborg Blutstahl', '1563', '1605', 'Clan Varangr'),
    spouse('melka', 'Melka', 'female', '????', '????'),
    spouse('steinar-varangr', 'Steinar Varangr', 'male', '1562', '1605', 'house-varangr'),

    person('raveld-blutstahl', 'Raveld Blutstahl', 'male', '1586', '1628', { title: 'Der Rote Egel · Admiral des Clans Blutstahl' }),
    awayWoman('audhild-blutstahl', 'Audhild Blutstahl', '1599', '1628', 'Clan Kummerherz'),
    person('radulfr-blutstahl', 'Radulfr Blutstahl', 'male', '1600', '1628'),
    spouse('estrid-ragnulf', 'Estrid Ragnulf', 'female', '1588', '1655', 'house-ragnulf'),
    spouse('mogunn-kummerherz', 'Mogunn Kummerherz', 'male', '1596', '1628', 'house-kummerherz'),
    spouse('dagfrid-todbrand', 'Dagfrid Todbrand', 'female', '1599', '1671', 'house-todbrand'),

    person('joralf-blutstahl', 'Joralf Blutstahl', 'male', '1606', '1628'),
    awayWoman('svaldis-blutstahl', 'Svaldis Blutstahl', '1607', '1640', 'Clan Graumähne'),
    person('sigrun-blutstahl', 'Sigrun Blutstahl', 'female', '1610', '1659', {
      title: 'Die Gebrochene · Oberhaupt des Clans Blutstahl',
      notes: 'Sigrun blieb ein legitimes Mitglied des Clans. Wallmar war ihr Schänder; die Verbindung war nicht freiwillig.'
    }),
    person('holgr-blutstahl', 'Holgr Blutstahl', 'male', '1612', '1630'),
    person('birger-blutstahl', 'Birger Blutstahl', 'male', '1620', '1671'),
    spouse('gislaug', 'Gislaug', 'female', '1607', '????'),
    spouse('arnljot-graumahne', 'Arnljöt Graumähne', 'male', '1603', '1665', 'house-graumahne'),
    spouse('wallmar', 'Wallmar', 'male', '????', '????', '', {
      familyRole: 'forced', title: 'Sigruns Schänder · Vater Einars', tags: ['Erzwungene Verbindung']
    }),
    spouse('udveig-gullvig', 'Udveig Gullvig', 'female', '1613', '1670', 'house-gullvig'),
    spouse('vallborg-sturmgeborene', 'Vallborg Sturmgeborene', 'female', '1620', '1659', 'house-sturmgeborene'),

    person('soren-blutstahl', 'Soren Blutstahl', 'male', '1625', '1661'),
    bastard('einar-bastard-blutstahl', 'Einar Blutstahl', 'male', '1640', '1714', { title: 'Bastardsohn Sigruns und ihres Schänders Wallmar' }),
    awayWoman('alfhild-blutstahl', 'Alfhild Blutstahl', '1629', '1704', 'Clan Kaltherz'),
    person('harald-blutstahl', 'Harald Blutstahl', 'male', '1629', '1691'),
    awayWoman('rangrid-blutstahl', 'Rangrid Blutstahl', '1640', '????', 'Clan Culloch'),
    spouse('thjora', 'Thjora', 'female', '????', '????'),
    spouse('nottulf-kaltherz', 'Nottulf Kaltherz', 'male', '1630', '1695', 'house-kaltherz'),
    spouse('myrna-goldglanz', 'Myrna Goldglanz', 'female', '1630', '1679', 'house-goldglanz'),
    spouse('vionnan-culloch', 'Vionnán Culloch', 'male', '????', '????', 'house-culloch'),

    person('ingjald-blutstahl', 'Ingjald Blutstahl', 'male', '1650', '1715'),
    awayWoman('gyda-blutstahl', 'Gyda Blutstahl', '1653', '1694', 'Clan Vragi'),
    person('sleipnir-blutstahl', 'Sleipnir Blutstahl', 'male', '1648', '1704'),
    spouse('unhild-schattenherz', 'Unhild Schattenherz', 'female', '1650', '1733', 'house-schattenherz'),
    spouse('morskar-vragi', 'Morskar Vragi', 'male', '1651', '1699', 'house-vragi'),
    spouse('kolfrid', 'Kolfrid', 'female', '????', '????'),

    person('kjartan-blutstahl', 'Kjartan Blutstahl', 'male', '1670', ''),
    awayWoman('eyrun-blutstahl', 'Eyrún Blutstahl', '1674', '', 'Clan Feuerherz'),
    person('hallgrim-blutstahl', 'Hallgrim Blutstahl', 'male', '1673', ''),
    awayWoman('dagfrid-blutstahl', 'Dagfrid Blutstahl', '1675', '1714', 'Clan Kaltherz'),
    spouse('drifa', 'Drifa', 'female', '????', '????'),
    spouse('lythar-feuerherz', 'Lythar Feuerherz', 'male', '1670', '', 'house-feuerherz'),
    spouse('ingithora-schattenherz', 'Ingithora Schattenherz', 'female', '1678', '1706', 'house-schattenherz'),
    spouse('jorvik-kaltherz', 'Jorvik Kaltherz', 'male', '1670', '', 'house-kaltherz'),

    person('steinar-blutstahl', 'Steinar Blutstahl', 'male', '1692', ''),
    awayWoman('askla-blutstahl', 'Askla Blutstahl', '1695', '', 'Clan Varangr'),
    awayWoman('fanne-blutstahl', 'Fanne Blutstahl', '1698', '', 'Clan Silberblut'),
    person('ragnald-blutstahl', 'Ragnald Blutstahl', 'male', '1696', ''),
    awayWoman('hillevi-blutstahl', 'Hillevi Blutstahl', '1700', '', 'Clan Schwarzblut'),
    spouse('bylgja', 'Bylgja', 'female', '????', ''),
    spouse('andor-varangr', 'Andor Varangr', 'male', '1703', '', 'house-varangr'),
    spouse('thongvir-silberblut', 'Thongvir Silberblut', 'male', '1693', '', 'house-silberblut'),
    spouse('myrla', 'Myrla', 'female', '????', ''),
    spouse('sindre-schwarzblut', 'Sindre Schwarzblut', 'male', '1706', '', 'house-schwarzblut'),

    person('pytur-blutstahl', 'Pytur Blutstahl', 'male', '1718', ''),
    person('grima-blutstahl', 'Grima Blutstahl', 'female', '1722', ''),
    person('nordar-blutstahl', 'Nordar Blutstahl', 'male', '1722', ''),
    person('torben-blutstahl', 'Torben Blutstahl', 'male', '1725', '')
  ],
  partnerships: [
    partnership('marriage-fenrir-skalli-jaernblod', { status: 'ended' }),
    partnership('marriage-sigurd-melka-blutstahl', { status: 'ended', end: '1603' }),
    partnership('marriage-steinar-arnborg-varangr', { status: 'ended', end: '1605' }),
    partnership('marriage-estrid-raveld-ragnulf', { status: 'ended', end: '1628' }),
    partnership('marriage-mogunn-audhild-kummerherz', { status: 'ended', end: '1628' }),
    partnership('marriage-dagfrid-radulfr-todbrand', { status: 'ended', end: '1628' }),
    partnership('marriage-joralf-gislaug-blutstahl', { status: 'ended', end: '1628' }),
    partnership('marriage-arnljot-svaldis-graumahne', { status: 'ended', end: '1640' }),
    alignParentPairOverChild(partnership('forced-sigrun-wallmar-blutstahl', {
      type: 'forced', status: 'ended', end: '1659', visibility: 'restricted',
      notes: 'Wallmar war Sigruns Schänder; diese Verbindung wird ausdrücklich nicht als Affäre oder Ehe geführt.'
    }), 'einar-bastard-blutstahl', [OBSOLETE_PARTNER_ALIGNMENT_EXTENSION]),
    partnership('marriage-holgr-udveig-blutstahl', { status: 'ended', end: '1630' }),
    alignParentPairOverChild(
      partnership('marriage-birger-vallborg-blutstahl', { status: 'ended', end: '1659' }),
      'rangrid-blutstahl'
    ),
    partnership('marriage-soren-thjora-blutstahl', { status: 'ended', end: '1661' }),
    partnership('marriage-alfhild-nottulf-blutstahl', { status: 'ended', end: '1695' }),
    partnership('marriage-harald-myrna-blutstahl', { status: 'ended', end: '1679' }),
    partnership('marriage-rangrid-vionnan-blutstahl', { status: 'ended' }),
    partnership('marriage-ingjald-unhild-schattenherz', { status: 'ended', end: '1715' }),
    partnership('marriage-gyda-morskar-blutstahl', { status: 'ended', end: '1694' }),
    partnership('marriage-sleipnir-kolfrid-blutstahl', { status: 'ended', end: '1704' }),
    partnership('marriage-kjartan-drifa-blutstahl'),
    partnership('marriage-eyrun-lythar-blutstahl'),
    partnership('marriage-hallgrim-ingithora-schattenherz', { status: 'ended', end: '1706' }),
    partnership('marriage-dagfrid-jorvik-blutstahl', { status: 'ended', end: '1714' }),
    partnership('marriage-steinar-bylgja-blutstahl'),
    partnership('marriage-andor-askla-varangr'),
    partnership('marriage-thongvir-fanne-silberblut'),
    partnership('marriage-ragnald-myrla-blutstahl'),
    partnership('marriage-sindre-hillevi-schwarzblut')
  ],
  parentages: [
    ...childrenOf(['sigurd-blutstahl', 'arnborg-blutstahl'], 'marriage-fenrir-skalli-jaernblod', {
      type: 'claimed', legitimacy: 'unknown', certainty: 'probable',
      notes: 'Die Abstammung führt über nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['raveld-blutstahl', 'audhild-blutstahl', 'radulfr-blutstahl'], 'marriage-sigurd-melka-blutstahl'),
    ...childrenOf(['joralf-blutstahl', 'svaldis-blutstahl', 'sigrun-blutstahl', 'holgr-blutstahl', 'birger-blutstahl'], 'marriage-estrid-raveld-ragnulf'),
    ...childrenOf(['soren-blutstahl'], 'marriage-joralf-gislaug-blutstahl'),
    ...childrenOf(['einar-bastard-blutstahl'], 'forced-sigrun-wallmar-blutstahl', {
      legitimacy: 'illegitimate', visibility: 'restricted',
      notes: 'Einar wurde während Sigruns Gefangenschaft aus der erzwungenen Verbindung mit Wallmar geboren.'
    }),
    ...childrenOf(['alfhild-blutstahl', 'harald-blutstahl'], 'marriage-holgr-udveig-blutstahl'),
    ...childrenOf(['rangrid-blutstahl'], 'marriage-birger-vallborg-blutstahl'),
    ...childrenOf(['ingjald-blutstahl', 'gyda-blutstahl'], 'marriage-harald-myrna-blutstahl'),
    ...childrenOf(['sleipnir-blutstahl'], 'marriage-soren-thjora-blutstahl'),
    ...childrenOf(['kjartan-blutstahl', 'eyrun-blutstahl'], 'marriage-ingjald-unhild-schattenherz'),
    ...childrenOf(['hallgrim-blutstahl', 'dagfrid-blutstahl'], 'marriage-sleipnir-kolfrid-blutstahl'),
    ...childrenOf(['steinar-blutstahl', 'askla-blutstahl', 'fanne-blutstahl'], 'marriage-kjartan-drifa-blutstahl'),
    ...childrenOf(['ragnald-blutstahl', 'hillevi-blutstahl'], 'marriage-hallgrim-ingithora-schattenherz'),
    ...childrenOf(['pytur-blutstahl', 'grima-blutstahl'], 'marriage-steinar-bylgja-blutstahl'),
    ...childrenOf(['nordar-blutstahl', 'torben-blutstahl'], 'marriage-ragnald-myrla-blutstahl')
  ],
  cadetBranches: [
    marriedAway('married-away-arnborg-blutstahl-varangr', 'Clan Varangr', 'marriage-steinar-arnborg-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-audhild-blutstahl-kummerherz', 'Clan Kummerherz', 'marriage-mogunn-audhild-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-svaldis-blutstahl-graumahne', 'Clan Graumähne', 'marriage-arnljot-svaldis-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-alfhild-blutstahl-kaltherz', 'Clan Kaltherz', 'marriage-alfhild-nottulf-blutstahl', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-rangrid-blutstahl-culloch', 'Clan Culloch', 'marriage-rangrid-vionnan-blutstahl', 'house-culloch', 'haus-culloch'),
    marriedAway('married-away-gyda-blutstahl-vragi', 'Clan Vragi', 'marriage-gyda-morskar-blutstahl', 'house-vragi', 'haus-vragi', HOUSE_EMBLEMS.vragi),
    marriedAway('married-away-eyrun-blutstahl-feuerherz', 'Clan Feuerherz', 'marriage-eyrun-lythar-blutstahl', 'house-feuerherz', 'haus-feuerherz', HOUSE_EMBLEMS.feuerherz),
    marriedAway('married-away-dagfrid-blutstahl-kaltherz', 'Clan Kaltherz', 'marriage-dagfrid-jorvik-blutstahl', 'house-kaltherz', 'haus-kaltherz', HOUSE_EMBLEMS.kaltherz),
    marriedAway('married-away-askla-blutstahl-varangr', 'Clan Varangr', 'marriage-andor-askla-varangr', 'house-varangr', 'haus-varangr', HOUSE_EMBLEMS.varangr),
    marriedAway('married-away-fanne-blutstahl-silberblut', 'Clan Silberblut', 'marriage-thongvir-fanne-silberblut', 'house-silberblut', 'haus-silberblut', HOUSE_EMBLEMS.silberblut),
    marriedAway('married-away-hillevi-blutstahl-schwarzblut', 'Clan Schwarzblut', 'marriage-sindre-hillevi-schwarzblut', 'house-schwarzblut', 'haus-schwarzblut', HOUSE_EMBLEMS.schwarzblut)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-fenrir-skalli-jaernblod',
    parentPersonId: '',
    childIds: ['sigurd-blutstahl', 'arnborg-blutstahl'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1561',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Absoluter serieller Generationentrenner direkt nach dem Blutstahl-Hausknoten; kein Knoten steht parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-fenrir-skalli-jaernblod',
    houseId: BLUTSTAHL_HOUSE_ID,
    crestSubtitle: 'Thanenclan von Silberquell · Nachfahren der Järnblod',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'jaernblod-origin-blutstahl',
      houseId: 'house-jaernblod',
      name: 'Clan Järnblod',
      subtitle: 'Ausgestorbener Norrnaigh-Ursprungsclan',
      emblem: HOUSE_EMBLEMS.jaernblod,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['skalli-jaernblod'],
      targetFamilyId: 'haus-jaernblod',
      notes: 'Skalli Järnblod und Fenrir begründen die Blutstahl-Linie.',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'skalli-jaernblod', orientation: 'vertical', ancestorDepth: 32,
    descendantDepth: 32, limitGenerations: false, showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: 'Clan Blutstahl (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige überlieferte Blutstahl-Stammbaum wird ohne Personenfokus von Skalli Järnblod und Fenrir bis zur jüngsten Generation des Jahres 1740 gezeigt. Der Hausknoten und genau ein serieller Zeitsprung stehen vor Sigurd und Arnborg. Sigrun bleibt als legitime Blutstahl im roten Hausrahmen; Wallmar ist ihr Schänder und Einar der Bastard aus dieser erzwungenen Verbindung. Birgers früherer Mündelstatus und Sturmgeborenen-Knoten waren Relikte der Altdaten und werden vollständig entfernt. Einar sowie Rangrid stehen als Einzelkinder geradlinig unter der gemeinsamen Mitte ihrer jeweiligen Elternpaare. Kinder wegverheirateter Frauen werden ausschließlich in der fortführenden Gegenakte gezeigt. Die Überschriften „Drista“ und „Myrkla“ werden anhand der eigentlichen Personenzeilen zu Drifa und Myrla normalisiert. Unbenannte Verlobtenfelder werden nicht importiert.',
    sourceFamilyId: 'haus-jaernblod',
    registryTombstones: {
      persons: ['haus-blutstahl-gruender', 'haus-blutstahl-gruenderin'],
      partnerships: ['marriage-haus-blutstahl-founders'],
      cadetBranches: ['ward-away-birger-blutstahl-sturmgeborene']
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
